
import React, {useEffect, useState, useRef} from 'react';
import {View, Text, TouchableOpacity, StatusBar, Dimensions} from 'react-native';
import {styles} from './ColorDetector.styles';
import BackButton from '../../btn/BackButton';
import {useColorDetector} from './ColorDetectorLogic';
// Camera is optional; require at runtime to avoid TS errors when native module is not installed
let CameraModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  CameraModule = require('react-native-vision-camera');
} catch (e) {
  CameraModule = null;
}

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface Props {
  onBack: () => void;
  onOpenSettings?: () => void;
  voiceEnabled?: boolean;
  colorCodesVisible?: boolean;
}

const ColorDetector: React.FC<Props> = ({onBack, onOpenSettings, voiceEnabled = true, colorCodesVisible = true}) => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [crosshair, setCrosshair] = useState({x: screenWidth / 2, y: screenHeight / 2});
  const [detected, setDetected] = useState({name: 'Point at a color', hex: '#000000', rgb: '(0,0,0)', hsv: '(0,0,0)'});

  const {hasPermission, startCamera, stopCamera, detectColorAtPosition, isVoiceEnabled, toggleVoice, isColorCodesVisible, toggleColorCodes} = useColorDetector({initialVoiceEnabled: voiceEnabled, initialColorCodesVisible: colorCodesVisible});

  const samplingRef = useRef({x: screenWidth/2, y: screenHeight/2});
  const [liveSampling, setLiveSampling] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    let t: any = null;
    const doSample = async () => {
      if (!cameraRef.current) return;
      try {
        let photo: any = null;
        if (typeof cameraRef.current.takePhoto === 'function') {
          photo = await cameraRef.current.takePhoto({qualityPrioritization: 'speed'} as any);
        } else if (typeof cameraRef.current.takeSnapshot === 'function') {
          photo = await cameraRef.current.takeSnapshot();
        }
        if (photo && photo.path) {
          const nx = (samplingRef.current.x) / screenWidth;
          const ny = (samplingRef.current.y) / screenHeight;
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const ColorNative = require('../../src/native/ColorDetectorNative');
          if (ColorNative && typeof ColorNative.sampleImageAt === 'function') {
            const pred = await ColorNative.sampleImageAt(photo.path, nx, ny);
            if (pred) setDetected(pred);
          }
        }
      } catch (e) {}
    };

    if (liveSampling) {
      t = setInterval(doSample, 800);
    }
    return () => { if (t) clearInterval(t); };
  }, [liveSampling]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const device = CameraModule ? CameraModule.useCameraDevice && CameraModule.useCameraDevice('back') : null;

  const handleFreeze = () => {
    setIsFrozen(f => {
      const next = !f;
      if (!next) {
        // unfreezing -> reset crosshair to center
        setCrosshair({x: screenWidth / 2, y: screenHeight / 2});
      }
      return next;
    });
  };

  const handleScreenPress = async (evt: any) => {
    if (!isFrozen) return;
    const {locationX, locationY} = evt.nativeEvent;
    setCrosshair({x: locationX, y: locationY});
    samplingRef.current.x = locationX;
    samplingRef.current.y = locationY;

    // Try to take a photo and sample the exact pixel when VisionCamera is available
    let color = null;
    try {
      if (cameraRef.current) {
        // prefer takePhoto, fallback to takeSnapshot
        let photo: any = null;
        if (typeof cameraRef.current.takePhoto === 'function') {
          photo = await cameraRef.current.takePhoto({qualityPrioritization: 'speed'} as any);
        } else if (typeof cameraRef.current.takeSnapshot === 'function') {
          photo = await cameraRef.current.takeSnapshot();
        }
        if (photo && photo.path) {
          const nx = locationX / screenWidth;
          const ny = locationY / screenHeight;
          // dynamic require to avoid build-time errors
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const ColorNative = require('../../src/native/ColorDetectorNative');
          if (ColorNative && typeof ColorNative.sampleImageAt === 'function') {
            color = await ColorNative.sampleImageAt(photo.path, nx, ny);
          }
        }
      }
    } catch (e) {
      // fall back to JS detection
      color = null;
    }

    if (!color) {
      const jsColor = await detectColorAtPosition(locationX, locationY);
      if (jsColor) color = jsColor;
    }

    if (color) setDetected(color);
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission is required for color detection</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={startCamera}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <BackButton onPress={() => { stopCamera(); onBack(); }} />
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={styles.settingsButton} onPress={onOpenSettings}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        {device && CameraModule ? (
          <CameraModule.Camera
            style={{flex: 1}}
            device={device}
            isActive={!isFrozen}
            ref={cameraRef}
            photo={true}
            // If VisionCamera frame processor is available, attach a processor that samples the center pixel
            frameProcessor={liveSampling && CameraModule.frameProcessor ? ((frame: any) => {
              'worklet';
              // frame processors run on native thread; we won't call JS directly here.
              // We'll let the detectColorAtPosition read from the last tapped coord when Freeze is used.
              return;
            }) : undefined}
          />
        ) : (
          <View style={styles.cameraPlaceholder}><Text style={styles.cameraPlaceholderText}>Loading camera…</Text></View>
        )}

        <View style={[styles.crosshair, {left: crosshair.x - 15, top: crosshair.y - 15}]}> 
          <View style={styles.crosshairVertical} />
          <View style={styles.crosshairHorizontal} />
        </View>

        {isFrozen && (
          <TouchableOpacity style={styles.touchOverlay} onPress={handleScreenPress} activeOpacity={1} />
        )}
      </View>
      {isColorCodesVisible && (
        <View style={styles.colorInfoContainer}>
          <Text style={styles.colorName}>{detected.name}</Text>
          <Text style={styles.colorCode}>HEX: {detected.hex}</Text>
          <Text style={styles.colorCode}>RGB: {detected.rgb}</Text>
          <Text style={styles.colorCode}>HSV: {detected.hsv}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.freezeButton, isFrozen && styles.freezeButtonActive]} onPress={handleFreeze} activeOpacity={0.8}>
          <Text style={styles.freezeButtonText}>{isFrozen ? 'Unfreeze' : 'Freeze Frame'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.freezeButton]} onPress={async () => { setLiveSampling(s => !s); }}>
          <Text style={styles.freezeButtonText}>{liveSampling ? 'Stop Live' : 'Start Live'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.freezeButton]} onPress={async () => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const ColorNative = require('../../src/native/ColorDetectorNative');
            const ok = await ColorNative.initModel('color_model.tflite');
            console.log('initModel returned', ok);
          } catch (e) { console.warn(e); }
        }}>
          <Text style={styles.freezeButtonText}>Init Model</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.freezeButton]} onPress={async () => {
          try {
            const ColorNative = require('../../src/native/ColorDetectorNative');
            const p = await ColorNative.predictPixel(1, 0, 0);
            console.log('predictPixel red =>', p);
            if (p) setDetected(p);
          } catch (e) { console.warn(e); }
        }}>
          <Text style={styles.freezeButtonText}>Test Red</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ColorDetector;
import {useCallback, useEffect, useRef, useState} from 'react';
import {PermissionsAndroid, Platform, Dimensions} from 'react-native';

// Optional TTS - require at runtime to avoid static type errors when package not installed
let Tts: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Tts = require('react-native-tts');
} catch (e) {
  Tts = null;
}

// Native shim for model predict
let ColorNative: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ColorNative = require('../../src/native/ColorDetectorNative');
} catch (e) {
  ColorNative = null;
}

export type DetectedColor = {
  name: string;
  hex: string;
  rgb: string;
  hsv: string;
};

export const useColorDetector = (opts?: {initialVoiceEnabled?: boolean; initialColorCodesVisible?: boolean}) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(opts?.initialVoiceEnabled ?? true);
  const [isColorCodesVisible, setIsColorCodesVisible] = useState<boolean>(opts?.initialColorCodesVisible ?? true);

  const lastSpokenRef = useRef<string>('');

  useEffect(() => {
    // request permission on mount for Android
    (async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'ColorLens needs access to your camera to detect colors',
              buttonPositive: 'OK',
            },
          );
          setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } catch (e) {
          setHasPermission(false);
        }
      } else {
        setHasPermission(true);
      }
    })();
  }, []);

  // Initialize native TFLite model if the shim is present
  useEffect(() => {
    (async () => {
      if (ColorNative && typeof ColorNative.initModel === 'function') {
        try {
          await ColorNative.initModel('color_model.tflite');
        } catch (e) {
          // ignore init errors; predict calls will surface errors if model not ready
        }
      }
    })();
  }, []);

  const startCamera = useCallback(() => {
    // request permission again when user taps "Grant Permission"
    (async () => {
      try {
        // Try VisionCamera API if available
        let granted = false;
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const VC = require('react-native-vision-camera');
          const req = VC.Camera?.requestCameraPermission || VC.requestCameraPermission;
          if (typeof req === 'function') {
            const res = await req();
            // some implementations return 'authorized' or 'granted'
            granted = res === 'authorized' || res === 'granted' || res === true;
          }
        } catch (e) {
          // vision-camera not available, fall back
        }

        if (!granted) {
          if (Platform.OS === 'android') {
            const resp = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.CAMERA,
              {
                title: 'Camera Permission',
                message: 'ColorLens needs access to your camera to detect colors',
                buttonPositive: 'OK',
              },
            );
            granted = resp === PermissionsAndroid.RESULTS.GRANTED;
          } else {
            // iOS — assume granted at install; the native permission dialog appears via native modules
            granted = true;
          }
        }

        setHasPermission(!!granted);
      } catch (e) {
        setHasPermission(false);
      }
    })();
  }, []);

  const stopCamera = useCallback(() => {
    // placeholder: if a native camera session needs stopping, do it here
  }, []);

  const toggleVoice = useCallback(() => setIsVoiceEnabled(v => !v), []);
  const toggleColorCodes = useCallback(() => setIsColorCodesVisible(v => !v), []);

  // sync with external opts when they change
  useEffect(() => {
    if (typeof opts?.initialVoiceEnabled === 'boolean') setIsVoiceEnabled(opts.initialVoiceEnabled);
  }, [opts?.initialVoiceEnabled]);

  useEffect(() => {
    if (typeof opts?.initialColorCodesVisible === 'boolean') setIsColorCodesVisible(opts.initialColorCodesVisible);
  }, [opts?.initialColorCodesVisible]);

  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled) return;
    if (Tts && typeof Tts.speak === 'function') {
      try {
        Tts.stop && Tts.stop();
        Tts.speak(text);
      } catch (e) {
        // ignore
      }
    }
  }, [isVoiceEnabled]);

  // Mock detection - replace with tflite/frame-processor later
  const detectColorAtPosition = useCallback(async (x: number, y: number): Promise<DetectedColor> => {
    // If native model is available, call it with normalized RGB derived from screen coords
    const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
    const nr = Math.min(1, Math.max(0, x / screenWidth));
    const ng = Math.min(1, Math.max(0, y / screenHeight));
    const nb = 0.5; // neutral blue channel for per-pixel model input when actual pixel unavailable

    let pred: any = null;
    if (ColorNative && typeof ColorNative.predictPixel === 'function') {
      try {
        pred = await ColorNative.predictPixel(nr, ng, nb);
      } catch (e) {
        pred = null;
      }
    }

    if (!pred) {
      // fallback deterministic mapping
      const r = Math.min(255, Math.max(0, Math.floor((x) % 256)));
      const g = Math.min(255, Math.max(0, Math.floor((y) % 256)));
      const b = 128;
      const hex = `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
      const name = getColorName(hex) || 'Unknown';
      const rgb = `(${r}, ${g}, ${b})`;
      const hsvVals = rgbToHsv(r, g, b);
      const hsv = `(${hsvVals.h}°, ${hsvVals.s}%, ${hsvVals.v}%)`;
      if (isVoiceEnabled) {
        speak(name);
        lastSpokenRef.current = name;
      }
      return {name, hex, rgb, hsv};
    }

    const name = pred.name || 'Unknown';
    const hex = pred.hex || '#000000';
    const rgb = pred.rgb || '(0,0,0)';
    const hsv = pred.hsv || '(0,0,0)';
    const confidence = typeof pred.confidence === 'number' ? pred.confidence : undefined;

    if (isVoiceEnabled && lastSpokenRef.current !== name) {
      speak(`${name} ${confidence ? Math.round(confidence*100)+'%' : ''}`.trim());
      lastSpokenRef.current = name;
    }

    return {name, hex, rgb, hsv};
  }, [isVoiceEnabled, speak]);

  return {
    hasPermission,
    startCamera,
    stopCamera,
    detectColorAtPosition,
    isVoiceEnabled,
    toggleVoice,
    isColorCodesVisible,
    toggleColorCodes,
  } as const;
};

// Color utility functions
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : {r:0,g:0,b:0};
};

export const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return {h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100)};
};

export const getColorName = (hex: string) => {
  const map: Record<string,string> = {
    '#FF0000': 'Red', '#00FF00': 'Green', '#0000FF': 'Blue', '#FFFF00': 'Yellow',
    '#FFA500': 'Orange', '#800080': 'Purple', '#FFC0CB': 'Pink', '#A52A2A': 'Brown',
    '#000000': 'Black', '#FFFFFF': 'White',
  };
  return map[hex.toUpperCase()] || 'Unknown Color';
};

export default useColorDetector;
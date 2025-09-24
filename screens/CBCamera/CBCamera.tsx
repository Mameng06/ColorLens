import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import useCBCamera from './CBCamera.hook';
import styles from './CBCamera.styles';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

type Props = { onBack?: () => void; openSettings?: () => void };

export default function CBCameraScreen({ onBack, openSettings }: Props) {
  const {
    previewUri,
    frozen,
    cvdType,
    setCvdType,
    capture,
    setPreviewUri,
  } = useCBCamera() as any;
  const device = useCameraDevice('back');
  const [camRef, setCamRef] = useState<any>(null);
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack || (() => {})} style={styles.topLeft}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              /* toggles handled in logic */
            }}>
            <Text style={styles.fabLabel}>Change CVD Type</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={openSettings || (() => {})} style={styles.topRight}>
          <Text style={styles.settings}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Camera Area */}
      <View style={styles.cameraArea}>
        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={styles.preview}
            resizeMode="contain"
          />
        ) : device ? (
          <Camera
            ref={setCamRef}
            style={{ width: '100%', height: '100%' }}
            device={device}
            isActive={!frozen}
            photo={true}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No camera</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.selected}>
          Selected: {cvdType || 'None'}
        </Text>
        {!frozen ? (
          <TouchableOpacity
            style={styles.captureBtn}
            onPress={async () => {
              if (!cvdType) {
                Alert.alert('You must select your color vision type');
                return;
              }
              if (previewUri) {
                capture();
                return;
              }
              try {
                if (camRef && typeof camRef.takePhoto === 'function') {
                  const photo = await camRef.takePhoto({
                    qualityPrioritization: 'speed',
                  } as any);
                  if (photo && (photo.path || photo.uri)) {
                    const p = photo.path
                      ? 'file://' + photo.path
                      : photo.uri;
                    setPreviewUri(p);
                    capture(p); // ✅ FIXED: Pass path immediately to avoid state delay
                  }
                } else {
                  Alert.alert('Camera not ready');
                }
              } catch (e) {
                Alert.alert('Capture failed', String(e));
              }
            }}>
            <Text style={styles.captureText}>Capture</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Modal for CVD Type Selection */}
      <Modal visible={fabOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setFabOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ position: 'absolute', top: 100, left: 20, right: 20 }}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setCvdType('Protanopia');
                  setFabOpen(false);
                }}>
                <Text>Protanopia</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setCvdType('Deuteranopia');
                  setFabOpen(false);
                }}>
                <Text>Deuteranopia</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setCvdType('Tritanopia');
                  setFabOpen(false);
                }}>
                <Text>Tritanopia</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Floating FAB to trigger modal */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 20, alignSelf: 'center' }}
        onPress={() => setFabOpen(true)}>
        <View style={styles.fab}>
          <Text style={styles.fabLabel}>Change CVD Type</Text>
        </View>
      </TouchableOpacity>
    </View>
  ); }
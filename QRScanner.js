import { CameraView, useCameraPermissions } from "expo-camera";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

// Main colors and shades
const COLORS = {
  Red: [[255, 0, 0], [200, 0, 0], [255, 50, 50], [150, 0, 0], [255, 100, 100]],
  Green: [[0, 128, 0], [0, 200, 0], [50, 255, 50], [0, 150, 0], [100, 255, 100]],
  Blue: [[0, 0, 255], [0, 0, 200], [50, 50, 255], [0, 0, 150], [100, 100, 255]],
  Yellow: [[255, 255, 0], [255, 255, 100], [200, 200, 0], [255, 255, 50], [150, 150, 0]],
  Orange: [[255, 165, 0], [255, 140, 0], [255, 180, 50], [200, 100, 0], [255, 200, 100]],
  Violet: [[238, 130, 238], [200, 100, 200], [255, 150, 255], [180, 80, 180], [220, 120, 220]],
  Pink: [[255, 192, 203], [255, 150, 180], [255, 200, 220], [220, 120, 150], [255, 170, 190]],
  Black: [[0, 0, 0], [30, 30, 30], [50, 50, 50], [10, 10, 10], [70, 70, 70]],
  White: [[255, 255, 255], [240, 240, 240], [230, 230, 230], [250, 250, 250], [200, 200, 200]],
};

// Find closest main color
const getClosestColor = (r, g, b) => {
  let closest = "Unknown";
  let minDistance = Infinity;
  for (const [mainColor, shades] of Object.entries(COLORS)) {
    for (const [cr, cg, cb] of shades) {
      const distance = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closest = mainColor;
      }
    }
  }
  return closest;
};

// Simulate frame pixel detection (replace with real frame processing if available)
const getPixelColorFromFrame = () => ({
  r: Math.floor(Math.random() * 256),
  g: Math.floor(Math.random() * 256),
  b: Math.floor(Math.random() * 256),
});

const QRScanner = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [detectedColor, setDetectedColor] = useState("Detecting...");
  const lastColorRef = useRef("");

  useEffect(() => {
    if (!permission?.granted) return;

    const interval = setInterval(() => {
      const pixelColor = getPixelColorFromFrame();
      const mainColor = getClosestColor(pixelColor.r, pixelColor.g, pixelColor.b);

     if (mainColor !== lastColorRef.current) {
    Speech.speak(
      `Tralalelo tralala, bombargini barbinini, Kapochina pukicina, ${mainColor}`
    );
    lastColorRef.current = mainColor;
    setDetectedColor(mainColor);
  }
}, 50000);

    return () => clearInterval(interval);
  }, [permission]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={null} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <View style={styles.crossHorizontal} />
          <View style={styles.crossVertical} />
          <Text style={styles.colorText}>{detectedColor}</Text>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: { textAlign: "center", marginTop: 20 },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
  crossHorizontal: { position: "absolute", width: 30, height: 2, backgroundColor: "white" },
  crossVertical: { position: "absolute", width: 2, height: 30, backgroundColor: "white" },
  colorText: { marginTop: 100, backgroundColor: "rgba(0,0,0,0.5)", color: "white", padding: 5, borderRadius: 5, fontSize: 18 },
});

export default QRScanner;

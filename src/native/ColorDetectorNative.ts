import {Platform} from 'react-native';
import ColorDetectorBridge from '../specs/NativeColorDetector';

export type ColorPrediction = {
  name: string;
  hex: string;
  rgb: string;
  hsv: string;
  confidence?: number;
};

export async function predictDummy(): Promise<ColorPrediction> {
  if (Platform.OS !== 'android' || !ColorDetectorBridge || typeof (ColorDetectorBridge as any).predictDummy !== 'function') {
    return {name: 'Unknown', hex: '#000000', rgb: '(0,0,0)', hsv: '(0,0,0)'};
  }
  const res = await ColorDetectorBridge.predictDummy();
  try {
    return JSON.parse(res) as ColorPrediction;
  } catch (e) {
    return {name: 'Unknown', hex: '#000000', rgb: '(0,0,0)', hsv: '(0,0,0)'};
  }
}

export async function initModel(assetName: string = 'color_model.tflite'): Promise<boolean> {
  if (Platform.OS !== 'android' || !ColorDetectorBridge || typeof (ColorDetectorBridge as any).initModel !== 'function') {
    return false;
  }
  return await ColorDetectorBridge.initModel(assetName);
}

// Accept normalized floats 0..1 for r,g,b
export async function predictPixel(r: number, g: number, b: number): Promise<ColorPrediction> {
  if (Platform.OS !== 'android' || !ColorDetectorBridge || typeof (ColorDetectorBridge as any).predictPixel !== 'function') {
    return {name: 'Unknown', hex: '#000000', rgb: '(0,0,0)', hsv: '(0,0,0)'};
  }
  const res = await ColorDetectorBridge.predictPixel(r, g, b);
  try {
    return JSON.parse(res) as ColorPrediction;
  } catch (e) {
    return {name: 'Unknown', hex: '#000000', rgb: '(0,0,0)', hsv: '(0,0,0)'};
  }
}

export default {predictDummy, initModel, predictPixel};

export async function sampleImageAt(filePath: string, nx: number, ny: number): Promise<ColorPrediction> {
  if (Platform.OS !== 'android' || !ColorDetectorBridge || typeof (ColorDetectorBridge as any).sampleImageAtNormalized !== 'function') {
    return {name: 'Unknown', hex: '#000000', rgb: '(0,0,0)', hsv: '(0,0,0)'};
  }
  const res = await ColorDetectorBridge.sampleImageAtNormalized(filePath, nx, ny);
  try { return JSON.parse(res) as ColorPrediction; } catch (e) { return {name: 'Unknown', hex:'#000000', rgb:'(0,0,0)', hsv:'(0,0,0)'}; }
}

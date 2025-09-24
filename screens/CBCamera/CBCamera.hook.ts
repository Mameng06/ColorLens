import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import DaltonBridge from '../../src/specs/NativeDaltonBridge';

type CVD = 'Protanopia' | 'Deuteranopia' | 'Tritanopia' | null;

export default function useCBCamera() {
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [cvdType, setCvdType] = useState<CVD>(null);

  // onBack and openSettings are handled by the parent component via props
  const onBack = useCallback(() => {}, []);
  const openSettings = useCallback(() => {}, []);

  const capture = useCallback(async (pathOverride?: string) => {
    if (!cvdType) {
      Alert.alert('You must select your color vision type');
      return;
    }

    const inputPath = pathOverride ?? previewUri;
    if (!inputPath) {
      Alert.alert('No photo available. Please capture a photo first.');
      return;
    }

    setFrozen(true);

    const map = { 'Protanopia': 0, 'Deuteranopia': 1, 'Tritanopia': 2 } as any;
    const def = map[cvdType];

    try {
      const result = await DaltonBridge.processImage(inputPath.replace('file://', ''), def, 1.0);
      if (result && typeof result === 'string') {
        setPreviewUri('file://' + result);
      } else if (result && result.uri) {
        setPreviewUri(result.uri);
      }
    } catch (e) {
      Alert.alert('Processing failed', String(e));
    } finally {
      setFrozen(false);
    }
  }, [cvdType, previewUri]);

  return {
    previewUri,
    frozen,
    cvdType,
    setCvdType,
    setPreviewUri,
    capture,
    onBack,
    openSettings,
  };
}

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import NativeDaltonBridge from '../../src/specs/NativeDaltonBridge';

export default function useSimulateCB() {
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [cvdType, setCvdType] = useState<'Protanopia' | 'Deuteranopia' | 'Tritanopia' | null>(null);

  const capture = useCallback(async () => {
    if (!cvdType) {
      Alert.alert('Please select a CVD type');
      return;
    }
    if (!previewUri) {
      Alert.alert('No image to process');
      return;
    }

    try {
      // Map CVD type string to numeric code
      const map = { Protanopia: 0, Deuteranopia: 1, Tritanopia: 2 } as const;
      const def = map[cvdType];

      // Call into TurboModule
      const result = await NativeDaltonBridge.processImage(
        previewUri.replace('file://', ''), // remove prefix for native
        def,
        1.0
      );

      // Update state with processed file path
      setPreviewUri('file://' + result);
    } catch (e) {
      Alert.alert('Processing failed', String(e));
    }
  }, [cvdType, previewUri]);

  return { previewUri, cvdType, setCvdType, capture };
}

import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native'; // ✅ Import type
import { NativeModules } from 'react-native';

const { DaltonBridge } = NativeModules as any;

// ✅ Define your route parameter types
type RootStackParamList = {
  CLSetting: undefined; // No params needed when navigating to settings
};

type CVD = 'Protanopia' | 'Deuteranopia' | 'Tritanopia' | null;

export default function useCBCamera() {
  // ✅ Type the navigation object properly
  const nav = useNavigation<NavigationProp<RootStackParamList>>();

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [cvdType, setCvdType] = useState<CVD>(null);

  const onBack = useCallback(() => {
    nav.goBack();
  }, [nav]);

  const openSettings = useCallback(() => {
    nav.navigate('CLSetting'); // ✅ No more 'as any' — fully typed!
  }, [nav]);

  const capture = useCallback(async () => {
    if (!cvdType) {
      Alert.alert('You must select your color vision type');
      return;
    }

    try {
      const inputPath = previewUri;
      if (!inputPath) {
        Alert.alert('No photo available. Please capture a photo first.');
        return;
      }

      setFrozen(true);

      const map = { 'Protanopia': 0, 'Deuteranopia': 1, 'Tritanopia': 2 } as const;
      const def = map[cvdType as keyof typeof map]; // ✅ Safer access

      const result = await DaltonBridge.processImage(inputPath.replace('file://', ''), def, 1.0);

      if (result && typeof result === 'string') {
        setPreviewUri('file://' + result);
      } else if (result && result.uri) {
        setPreviewUri(result.uri);
      }
    } catch (e) {
      Alert.alert('Processing failed', String(e));
    } finally {
      setFrozen(false); // ✅ Always unfreeze, even if error
    }
  }, [cvdType, previewUri]);

  return {
    previewUri,
    frozen,
    cvdType,
    setCvdType,
    capture,
    onBack,
    openSettings,
  };
}
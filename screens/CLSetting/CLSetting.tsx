import React from 'react';
import {
  View,
  Text,
  Switch,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {styles} from './CLSetting.styles.ts';

interface CLSettingProps {
  onBack: () => void;
  colorCodesVisible: boolean;
  voiceEnabled: boolean;
  onToggleColorCodes: (v: boolean) => void;
  onToggleVoice: (v: boolean) => void;
}

// ✅ Inline BackButton but uses styles from CLSetting.styles.ts
const BackButton: React.FC<{onPress: () => void}> = ({onPress}) => (
  <TouchableOpacity style={styles.backButton} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.backButtonText}>←</Text>
  </TouchableOpacity>
);

const CLSetting: React.FC<CLSettingProps> = ({
  onBack,
  colorCodesVisible,
  voiceEnabled,
  onToggleColorCodes,
  onToggleVoice,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.headerRow}>
        <BackButton onPress={onBack} />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.itemRow}>
          <View>
            <Text style={styles.itemTitle}>Show Color Codes</Text>
            <Text style={styles.itemSubtitle}>on by default</Text>
          </View>
          <Switch value={colorCodesVisible} onValueChange={onToggleColorCodes} />
        </View>

        <View style={styles.itemRow}>
          <View>
            <Text style={styles.itemTitle}>Voice feature</Text>
            <Text style={styles.itemSubtitle}>on by default</Text>
          </View>
          <Switch value={voiceEnabled} onValueChange={onToggleVoice} />
        </View>
      </View>
    </View>
  );
};

export default CLSetting;

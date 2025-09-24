/**
 * ColorLens - AI Based Color Recognition and Voice Feedback Assistant App
 * 
 * Tech Stack:
 * - React Native CLI
 * - TypeScript
 * - OpenCV for camera processing
 * - TensorFlow Lite for AI model inference
 * - React Native TTS for voice feedback
 * - libDaltonLens for daltonization algorithms test
 *
 * @format
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './screens/SplashScreen/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen/WelcomeScreen';
import DecisionScreen from './screens/DecisionScreen/DecisionScreen';
import YTembedScreen from './screens/YTembedScreen/YTembedScreen';
import ColorDetector from './screens/ColorDetector/ColorDetector';
import CLSetting from './screens/CLSetting/CLSetting';
import CBCamera from './screens/CBCamera/CBCamera';
import SimulateCB from './screens/SimulateCB/SimulateCB.tsx';

const App: React.FC = () => {

  const [currentScreen, setCurrentScreen] = useState<'splash' | 'welcome' | 'decision' | 'youtube' | 'main' | 'colorDetector' | 'settings' | 'cbc' | 'simulate'>('splash');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [colorCodesVisible, setColorCodesVisible] = useState(true);

  const handleSplashFinish = () => {
    setCurrentScreen('welcome');
  };

  const handleWelcomeNext = () => {
    setCurrentScreen('decision');
  };

  const handleNavigateToYT = () => {
    setCurrentScreen('youtube');
  };

  const handleBackFromYT = () => {
    setCurrentScreen('decision');
  };

  const handleDetectColors = () => {
    setCurrentScreen('colorDetector');
  };

  const handleColorBlindCamera = () => {
    setCurrentScreen('cbc');
  };

  const handleSimulateCDO = () => {
    setCurrentScreen('simulate');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {currentScreen === 'splash' && (
          <SplashScreen onFinish={handleSplashFinish} />
        )}
        {currentScreen === 'welcome' && (
          <WelcomeScreen onNext={handleWelcomeNext} />
        )}
        {currentScreen === 'decision' && (
          <DecisionScreen
            onNavigateToYT={handleNavigateToYT}
            onDetectColors={handleDetectColors}
            onColorBlindCamera={handleColorBlindCamera}
            onSimulateCDO={handleSimulateCDO}
          />
        )}
        {currentScreen === 'colorDetector' && (
          <ColorDetector onBack={() => setCurrentScreen('decision')} onOpenSettings={() => setCurrentScreen('settings')} voiceEnabled={voiceEnabled} colorCodesVisible={colorCodesVisible} />
        )}
        {currentScreen === 'settings' && (
          <CLSetting
            onBack={() => setCurrentScreen('colorDetector')}
            voiceEnabled={voiceEnabled}
            colorCodesVisible={colorCodesVisible}
            onToggleVoice={(v: boolean) => setVoiceEnabled(v)}
            onToggleColorCodes={(v: boolean) => setColorCodesVisible(v)}
          />
        )}
        {currentScreen === 'youtube' && (
          <YTembedScreen onBack={handleBackFromYT} />
        )}
        {currentScreen === 'cbc' && (
          <CBCamera onBack={() => setCurrentScreen('decision')} openSettings={() => setCurrentScreen('settings')} />
        )}
        {currentScreen === 'simulate' && (
          <SimulateCB />
        )}
        {currentScreen === 'main' && (
          // TODO: Add main app content here
          <View style={styles.mainContent}>
            {/* Main app screens will go here */}
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default App;

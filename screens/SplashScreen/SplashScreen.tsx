import React, { useEffect } from 'react';
import { View, Text, Image, StatusBar } from 'react-native';
import { styles } from './SplashScreen.styles';
import { IMAGES } from '../../Images';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* App Title */}
      <Text style={styles.title}>ColorLens</Text>
      
      {/* App Icon */}
      <View style={styles.iconContainer}>
        <Image 
          source={IMAGES.LOGO} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      
      {/* App Description */}
      <Text style={styles.description}>
        AI Based Color Recognition{'\n'}
        and Voice Feedback{'\n'}
        Assistant App
      </Text>
    </View>
  );
};

export default SplashScreen;

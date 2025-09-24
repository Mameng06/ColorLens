import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface BackButtonProps {
  onPress: () => void;
  style?: any;
  textStyle?: any;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, style, textStyle }) => {
  return (
    <TouchableOpacity 
      style={[styles.backButton, style]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <Text style={[styles.backButtonText, textStyle]}>←</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default BackButton;

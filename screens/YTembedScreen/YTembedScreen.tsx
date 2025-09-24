import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { styles } from './YTembedScreen.styles';

interface YTembedScreenProps {
  onBack: () => void;
}

const YTembedScreen: React.FC<YTembedScreenProps> = ({ onBack }) => {
  // Replace with your actual YouTube video ID
  const youtubeVideoId = 'dQw4w9WgXcQ'; // Example video ID
  const youtubeUrl = `https://www.youtube.com/embed/${youtubeVideoId}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video Tutorial</Text>
      </View>
      
      {/* YouTube Video Embed */}
      <View style={styles.videoContainer}>
        <WebView
          source={{ uri: youtubeUrl }}
          style={styles.webView}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
      
      {/* Video Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ColorLens Tutorial</Text>
        <Text style={styles.infoDescription}>
          Learn how to use ColorLens app features including color detection, 
          color blind camera, and simulation tools.
        </Text>
      </View>
    </View>
  );
};

export default YTembedScreen;

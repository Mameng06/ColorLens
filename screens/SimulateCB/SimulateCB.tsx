import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import useSimulateCB from './SimulateCB.hook';
import styles from './SimulateCB.styles';

export default function SimulateCBScreen(){
  const { previewUri, cvdType, setCvdType, capture } = useSimulateCB();
  return (
    <View style={styles.container}>
      <View style={styles.topBar}><Text style={styles.title}>Simulate CVD</Text></View>
      <View style={styles.content}>
        {previewUri ? <Image source={{uri: previewUri}} style={styles.preview} /> : <Text>No image</Text>}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureBtn} onPress={capture}><Text style={styles.captureText}>Process</Text></TouchableOpacity>
      </View>
    </View>
  );
}

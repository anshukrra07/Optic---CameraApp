import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from './styles';

type Props = {
  mode: string;
  recording: boolean;
  takePhoto: () => void;
  startVideo: () => void;
  stopVideo: () => void;
  timelapseActive: boolean;
  toggleTimelapse: () => void;
  takePanoramaShot: () => void;
};

export default function CaptureButtons({ mode, recording, takePhoto, startVideo, stopVideo, timelapseActive, toggleTimelapse, takePanoramaShot }: Props) {
  const renderShutterButton = () => {
    if (mode === 'Photo' || mode === 'Portrait') {
      return (
        <TouchableOpacity onPress={takePhoto} style={styles.shutter} activeOpacity={0.8}>
          <View style={styles.shutterInner}>
            <Text style={styles.shutterTxt}>📷</Text>
          </View>
        </TouchableOpacity>
      );
    }
    
    if (mode === 'Video' || mode === 'Slow-Mo') {
      if (recording) {
        return (
          <TouchableOpacity onPress={stopVideo} style={[styles.shutter, styles.stop]} activeOpacity={0.8}>
            <View style={[styles.shutterInner, styles.stopInner]} />
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity onPress={startVideo} style={[styles.shutter, styles.rec]} activeOpacity={0.8}>
            <View style={[styles.shutterInner, styles.recInner]}>
              <Text style={[styles.shutterTxt, styles.shutterTxtRec]}>⏺</Text>
            </View>
          </TouchableOpacity>
        );
      }
    }
    
    if (mode === 'Time-lapse') {
      return (
        <TouchableOpacity onPress={toggleTimelapse} style={[styles.shutter, timelapseActive ? styles.stop : styles.rec]} activeOpacity={0.8}>
          <View style={[styles.shutterInner, timelapseActive ? styles.stopInner : styles.recInner]}>
            {timelapseActive ? null : <Text style={[styles.shutterTxt, styles.shutterTxtRec]}>⏺</Text>}
          </View>
        </TouchableOpacity>
      );
    }
    
    // Panorama
    return (
      <TouchableOpacity onPress={takePanoramaShot} style={styles.shutter} activeOpacity={0.8}>
        <View style={styles.shutterInner}>
          <Text style={styles.shutterTxt}>🌄</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bottomBar}>
      <View style={styles.shutterContainer}>
        {renderShutterButton()}
      </View>
    </View>
  );
}

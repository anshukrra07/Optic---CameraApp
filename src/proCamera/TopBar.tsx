import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from './styles';
import { CameraDevice } from 'react-native-vision-camera';
import { useCameraContext } from '../components/CameraContext';

type Props = {
  useFront: boolean;
  setUseFront: React.Dispatch<React.SetStateAction<boolean>>;
  wb: string;
  setWb: (wb: any) => void;
  ev: number;
  setEv: React.Dispatch<React.SetStateAction<number>>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  flash: 'off' | 'auto' | 'on';
  setFlash: (flash: 'off' | 'auto' | 'on') => void;
  device?: CameraDevice;
};

const WBS = ['auto', 'sunny', 'cloudy', 'shade', 'incandescent', 'fluorescent'] as const;

export default function TopBar({ useFront, setUseFront, wb, setWb, ev, setEv, zoom, setZoom, flash, setFlash, device }: Props) {
  const { useBack } = useCameraContext();
  
  console.log('TopBar: useBack =', useBack, 'useFront =', useFront, 'device =', device?.position, 'flash =', flash);
  const formatZoom = (zoomValue: number) => {
    return zoomValue === 1 ? '1x' : `${zoomValue.toFixed(1)}x`;
  };

  const formatEV = (evValue: number) => {
    return evValue === 0 ? 'EV' : `${evValue > 0 ? '+' : ''}${evValue}`;
  };

  const formatWB = (wbValue: string) => {
    const wbMap: {[key: string]: string} = {
      'auto': 'AUTO',
      'sunny': 'SUN',
      'cloudy': 'CLD',
      'shade': 'SHD',
      'incandescent': 'INC',
      'fluorescent': 'FLU'
    };
    return wbMap[wbValue] || wbValue.toUpperCase();
  };

  const getFlashIcon = (flashMode: string) => {
    const isScreenFlash = !useBack; // Front camera uses screen flash
    
    switch(flashMode) {
      case 'off': 
        return isScreenFlash ? '📱❌' : '⚡️❌'; // Screen off or Flash off
      case 'on': 
        return isScreenFlash ? '📱✨' : '⚡️'; // Screen flash or Hardware flash
      case 'auto': 
        return isScreenFlash ? '📱🏠' : '⚡️🏠'; // Screen auto or Flash auto
      default: 
        return '⚡️';
    }
  };

  const toggleFlash = () => {
    // Flash control available for both cameras (hardware flash for back, screen flash for front)
    const modes: ('off' | 'auto' | 'on')[] = ['off', 'auto', 'on'];
    const currentIndex = modes.indexOf(flash);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFlash(modes[nextIndex]);
    
    const cameraType = useBack ? 'back (hardware flash)' : 'front (screen flash)';
    console.log(`Flash mode changed to: ${modes[nextIndex]} on ${cameraType}`);
  };

  return (
    <>
      <View style={styles.topBar}>
        {/* Flash Control (left) */}
        <TouchableOpacity 
          onPress={toggleFlash} 
          style={styles.topButton}
          activeOpacity={0.8}
        >
          <Text style={styles.topButtonText}>{getFlashIcon(flash)}</Text>
        </TouchableOpacity>
        
        {/* Center - Current active values */}
        <View style={styles.topCenter}>
          {ev !== 0 && (
            <View style={styles.topIndicator}>
              <Text style={styles.topIndicatorText}>{formatEV(ev)}</Text>
            </View>
          )}
          {wb !== 'auto' && (
            <View style={styles.topIndicator}>
              <Text style={styles.topIndicatorText}>{formatWB(wb)}</Text>
            </View>
          )}
        </View>
        
        {/* Camera Flip (right) */}
        <TouchableOpacity onPress={() => setUseFront(v => !v)} style={styles.topButton} activeOpacity={0.8}>
          <Text style={styles.topButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>
      
      {/* Zoom Indicator */}
      {zoom > 1 && (
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>{formatZoom(zoom)}</Text>
        </View>
      )}
    </>
  );
}

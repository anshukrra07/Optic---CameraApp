import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles';

const TIMERS = [0, 3, 10] as const;

interface TimerControlProps {
  timer: number;
  setTimer: (t: number) => void;
}

export default function TimerControl({ timer, setTimer }: TimerControlProps) {
  return (
    <View style={styles.row}>
      {TIMERS.map(t => (
        <TouchableOpacity 
          key={t} 
          onPress={() => setTimer(t)} 
          style={[styles.opt, timer === t && styles.optActive]} 
          activeOpacity={0.8}
        >
          <Text style={[styles.optTxt, timer === t && styles.optTxtActive]}>
            {t === 0 ? 'Off' : `${t}s`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
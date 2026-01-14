import React from 'react';
import { FlatList, TouchableOpacity, Text } from 'react-native';
import { styles } from './styles';

type Props = {
  mode: string;
  setMode: (m: any) => void;
};

const MODES = ['Photo', 'Video', 'Portrait', 'Panorama', 'Slow-Mo', 'Time-lapse'] as const;

export default function ModeSelector({ mode, setMode }: Props) {
  return (
    <FlatList
      data={MODES}
      keyExtractor={m => m}
      horizontal
      style={styles.modeStrip}
      contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity 
          onPress={() => setMode(item)} 
          style={[styles.modeBtn, mode === item && styles.modeActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeTxt, mode === item && styles.modeTxtActive]}>{item}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles';

const FILTERS = [
  { key: 'none', label: 'None', emoji: '🌟' },
  { key: 'mono', label: 'B&W', emoji: '⚫' },
  { key: 'sepia', label: 'Sepia', emoji: '🟤' },
  { key: 'vivid', label: 'Vivid', emoji: '🌈' }
] as const;

interface FilterControlProps {
  filter: string;
  setFilter: (f: string) => void;
}

export default function FilterControl({ filter, setFilter }: FilterControlProps) {
  return (
    <View style={styles.row}>
      {FILTERS.map(f => (
        <TouchableOpacity 
          key={f.key} 
          onPress={() => setFilter(f.key)} 
          style={[styles.opt, f.key === filter && styles.optActive]} 
          activeOpacity={0.8}
        >
          <Text style={[styles.optTxt, f.key === filter && styles.optTxtActive]}>
            {f.emoji} {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
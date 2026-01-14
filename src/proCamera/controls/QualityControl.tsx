import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles';
import { RES_PRESETS } from '../formats';

const FPS_OPTIONS = [24, 30, 60, 120] as const;

interface QualityControlProps {
  mode: string;
  res: any;
  setRes: (r: any) => void;
  fps: number;
  setFps: (f: number) => void;
}

export default function QualityControl({ mode, res, setRes, fps, setFps }: QualityControlProps) {
  return (
    <View>
      {/* Resolution */}
      {mode !== 'Slow-Mo' && (
        <>
          <Text style={styles.controlSubTitle}>Resolution</Text>
          <View style={styles.row}>
            {RES_PRESETS.map(r => (
              <TouchableOpacity 
                key={r.label} 
                onPress={() => setRes(r)} 
                style={[styles.opt, res.label === r.label && styles.optActive]} 
                activeOpacity={0.8}
              >
                <Text style={[styles.optTxt, res.label === r.label && styles.optTxtActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* FPS */}
      <Text style={styles.controlSubTitle}>Frame Rate</Text>
      <View style={styles.row}>
        {FPS_OPTIONS.map(f => (
          <TouchableOpacity 
            key={f} 
            onPress={() => setFps(f)} 
            style={[styles.opt, f === fps && styles.optActive]} 
            activeOpacity={0.8}
          >
            <Text style={[styles.optTxt, f === fps && styles.optTxtActive]}>
              {f}fps
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
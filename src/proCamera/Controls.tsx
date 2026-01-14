import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, ScrollView } from 'react-native';
import { styles } from './styles';
import { RES_PRESETS } from './formats';

const TIMERS = [0, 3, 10] as const;
const FPS_OPTIONS = [24, 30, 60, 120] as const;
const FILTERS = [
  { key: 'none', label: 'Off', icon: '○' },
  { key: 'mono', label: 'Mono', icon: '●' },
  { key: 'sepia', label: 'Sepia', icon: '🟤' },
  { key: 'vivid', label: 'Vivid', icon: '🌈' }
] as const;
const WB_OPTIONS = [
  { key: 'auto', label: 'Auto', icon: '☀️' },
  { key: 'sunny', label: 'Sunny', icon: '☀️' },
  { key: 'cloudy', label: 'Cloudy', icon: '☁️' },
  { key: 'shade', label: 'Shade', icon: '🌲' },
  { key: 'incandescent', label: 'Indoor', icon: '💡' },
  { key: 'fluorescent', label: 'Fluor', icon: '💡' }
] as const;
const EV_OPTIONS = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2] as const;

type Props = {
  mode: string;
  timer: number;
  setTimer: (t: any) => void;
  res: any;
  setRes: (r: any) => void;
  fps: number;
  setFps: (f: any) => void;
  filter: string;
  setFilter: (f: any) => void;
  // Add EV and WB controls
  ev: number;
  setEv: (ev: number) => void;
  wb: string;
  setWb: (wb: string) => void;
};

export default function Controls({ mode, timer, setTimer, res, setRes, fps, setFps, filter, setFilter, ev, setEv, wb, setWb }: Props) {
  const [activePanel, setActivePanel] = useState<'timer' | 'quality' | 'filters' | 'camera' | null>(null);

  const renderQuickControls = () => {
    const qualityLabel = mode !== 'Slow-Mo' ? res.label : `${fps}fps`;
    const filterIcon = FILTERS.find(f => f.key === filter)?.icon || '○';
    const wbIcon = WB_OPTIONS.find(w => w.key === wb)?.icon || '☀️';
    const hasCustomSettings = ev !== 0 || wb !== 'auto';

    return (
      <View style={styles.quickControls}>
        {/* Timer */}
        <TouchableOpacity 
          style={[styles.quickControl, timer > 0 && styles.quickControlActive]} 
          onPress={() => setActivePanel('timer')}
          activeOpacity={0.8}
        >
          <Text style={[styles.quickControlIcon, timer > 0 && styles.quickControlIconActive]}>
            ⏰
          </Text>
          <Text style={[styles.quickControlLabel, timer > 0 && styles.quickControlLabelActive]}>
            {timer === 0 ? 'Off' : `${timer}s`}
          </Text>
        </TouchableOpacity>

        {/* Quality */}
        <TouchableOpacity 
          style={styles.quickControl} 
          onPress={() => setActivePanel('quality')}
          activeOpacity={0.8}
        >
          <Text style={styles.quickControlIcon}>⚙️</Text>
          <Text style={styles.quickControlLabel}>{qualityLabel}</Text>
        </TouchableOpacity>

        {/* Camera Settings (EV, WB) */}
        <TouchableOpacity 
          style={[styles.quickControl, hasCustomSettings && styles.quickControlActive]} 
          onPress={() => setActivePanel('camera')}
          activeOpacity={0.8}
        >
          <Text style={[styles.quickControlIcon, hasCustomSettings && styles.quickControlIconActive]}>
            {wbIcon}
          </Text>
          <Text style={[styles.quickControlLabel, hasCustomSettings && styles.quickControlLabelActive]}>
            Camera
          </Text>
        </TouchableOpacity>

        {/* Filters */}
        <TouchableOpacity 
          style={[styles.quickControl, filter !== 'none' && styles.quickControlActive]} 
          onPress={() => setActivePanel('filters')}
          activeOpacity={0.8}
        >
          <Text style={[styles.quickControlIcon, filter !== 'none' && styles.quickControlIconActive]}>
            {filterIcon}
          </Text>
          <Text style={[styles.quickControlLabel, filter !== 'none' && styles.quickControlLabelActive]}>
            {FILTERS.find(f => f.key === filter)?.label || 'Off'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPanel = () => {
    if (!activePanel) return null;

    return (
      <Modal visible={true} transparent animationType="slide">
        <View style={styles.panelOverlay}>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>
                {activePanel === 'timer' && 'Timer'}
                {activePanel === 'quality' && 'Quality'}
                {activePanel === 'camera' && 'Camera Settings'}
                {activePanel === 'filters' && 'Filters'}
              </Text>
              <TouchableOpacity onPress={() => setActivePanel(null)} style={styles.panelClose}>
                <Text style={styles.panelCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.panelContent}
              contentContainerStyle={styles.panelContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {activePanel === 'timer' && (
                <View style={styles.panelRow}>
                  {TIMERS.map(t => (
                    <TouchableOpacity 
                      key={t}
                      onPress={() => {
                        setTimer(t);
                        setActivePanel(null);
                      }}
                      style={[styles.panelOption, timer === t && styles.panelOptionActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.panelOptionText, timer === t && styles.panelOptionTextActive]}>
                        {t === 0 ? 'Off' : `${t}s`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {activePanel === 'quality' && (
                <View>
                  {mode !== 'Slow-Mo' && (
                    <View style={styles.panelSection}>
                      <Text style={styles.panelSectionTitle}>Resolution</Text>
                      <View style={styles.panelRow}>
                        {RES_PRESETS.map(r => (
                          <TouchableOpacity 
                            key={r.label}
                            onPress={() => {
                              setRes(r);
                              setActivePanel(null);
                            }}
                            style={[styles.panelOption, res.label === r.label && styles.panelOptionActive]}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.panelOptionText, res.label === r.label && styles.panelOptionTextActive]}>
                              {r.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.panelSection}>
                    <Text style={styles.panelSectionTitle}>Frame Rate</Text>
                    <View style={styles.panelRow}>
                      {FPS_OPTIONS.map(f => (
                        <TouchableOpacity 
                          key={f}
                          onPress={() => {
                            setFps(f);
                            setActivePanel(null);
                          }}
                          style={[styles.panelOption, f === fps && styles.panelOptionActive]}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.panelOptionText, f === fps && styles.panelOptionTextActive]}>
                            {f}fps
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
              
              {activePanel === 'camera' && (
                <View>
                  <View style={styles.panelSection}>
                    <Text style={styles.panelSectionTitle}>Exposure</Text>
                    <View style={styles.panelRow}>
                      {EV_OPTIONS.map(e => (
                        <TouchableOpacity 
                          key={e}
                          onPress={() => {
                            setEv(e);
                            setActivePanel(null);
                          }}
                          style={[styles.panelOption, e === ev && styles.panelOptionActive]}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.panelOptionText, e === ev && styles.panelOptionTextActive]}>
                            {e === 0 ? 'EV 0' : `${e > 0 ? '+' : ''}${e}`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.panelSection}>
                    <Text style={styles.panelSectionTitle}>White Balance</Text>
                    <View style={styles.panelRow}>
                      {WB_OPTIONS.map(w => (
                        <TouchableOpacity 
                          key={w.key}
                          onPress={() => {
                            setWb(w.key);
                            setActivePanel(null);
                          }}
                          style={[styles.panelOption, w.key === wb && styles.panelOptionActive]}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.panelOptionIcon, w.key === wb && styles.panelOptionIconActive]}>
                            {w.icon}
                          </Text>
                          <Text style={[styles.panelOptionText, w.key === wb && styles.panelOptionTextActive]}>
                            {w.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
              
              {activePanel === 'filters' && (
                <View style={styles.panelRow}>
                  {FILTERS.map(f => (
                    <TouchableOpacity 
                      key={f.key}
                      onPress={() => {
                        setFilter(f.key);
                        setActivePanel(null);
                      }}
                      style={[styles.panelOption, f.key === filter && styles.panelOptionActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.panelOptionIcon, f.key === filter && styles.panelOptionIconActive]}>
                        {f.icon}
                      </Text>
                      <Text style={[styles.panelOptionText, f.key === filter && styles.panelOptionTextActive]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <View style={styles.controls}>
        {renderQuickControls()}
      </View>
      {renderPanel()}
    </>
  );
}

// src/components/ProCamera.tsx
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Camera, useCameraDevices, CameraDevice, VideoFile, PhotoFile } from 'react-native-vision-camera';
import { usePermissions } from '../proCamera/usePermissions';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { RES_PRESETS, pickFormat, highestSlowMoFormat } from '../proCamera/formats';

type ModeKey = 'Photo' | 'Video' | 'Portrait' | 'Panorama' | 'Slow-Mo' | 'Time-lapse';
const MODES: ModeKey[] = ['Photo', 'Video', 'Portrait', 'Panorama', 'Slow-Mo', 'Time-lapse'];
const FPS_OPTIONS = [24, 30, 60, 120] as const;
const TIMERS = [0, 3, 10] as const;
const WBS = ['auto', 'sunny', 'cloudy', 'shade', 'incandescent', 'fluorescent'] as const;

export default function ProCamera() {
  const granted = usePermissions();
  const devices = useCameraDevices();
  const backDevice = devices.find(d => d.position === 'back');
  const frontDevice = devices.find(d => d.position === 'front');
  const [useFront, setUseFront] = useState(false);
  const device: CameraDevice | undefined = useFront ? frontDevice : backDevice;

  const cameraRef = useRef<Camera>(null);

  // UI state
  const [mode, setMode] = useState<ModeKey>('Photo');
  const [timer, setTimer] = useState<(typeof TIMERS)[number]>(0);
  const [fps, setFps] = useState<(typeof FPS_OPTIONS)[number]>(30);
  const [res, setRes] = useState(RES_PRESETS[1]); // default 1080p
  const [recording, setRecording] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [ev, setEv] = useState(0);
  const [wb, setWb] = useState<(typeof WBS)[number]>('auto');
  const [filter, setFilter] = useState<'none' | 'mono' | 'sepia' | 'vivid'>('none');

  // Timelapse / Panorama
  const [timelapseActive, setTimelapseActive] = useState(false);
  const [panoramaShots, setPanoramaShots] = useState<string[]>([]);

  // Pick device format
  const { selectedFormat, effectiveFps } = useMemo(() => {
    if (!device) return { selectedFormat: undefined, effectiveFps: fps };
    if (mode === 'Slow-Mo') {
      const { format, fps: best } = highestSlowMoFormat(device);
      return { selectedFormat: format, effectiveFps: (best ?? 120) as number };
    }
    const format = pickFormat(device, res, fps);
    return { selectedFormat: format, effectiveFps: fps as number };
  }, [device, mode, res, fps]);

  // Zoom bounds
  useEffect(() => {
    if (!device) return;
    const max = device.maxZoom ?? 10;
    if (zoom > max) setZoom(max);
    if (zoom < 1) setZoom(1);
  }, [device, zoom]);

  const countdown = async () =>
    new Promise<void>(resolve =>
      timer > 0 ? setTimeout(() => resolve(), timer * 1000) : resolve()
    );

  const applyFilterIfNeeded = async (photoPath: string): Promise<string> => {
    // placeholder — you can add real filters later
    return photoPath;
  };

  const takePhoto = useCallback(async () => {
    try {
      await countdown();
      const photo: PhotoFile | undefined = await cameraRef.current?.takePhoto({ flash: 'auto' });
      if (!photo?.path) return;

      const finalPath = await applyFilterIfNeeded(photo.path);
      await CameraRoll.save(`file://${finalPath}`, { type: 'photo' });
      Alert.alert('Saved', 'Photo saved to gallery.');
    } catch (e) {
      console.warn('takePhoto error', e);
    }
  }, [timer, filter, mode]);

  const startVideo = useCallback(async () => {
    if (recording) return;
    setRecording(true);
    try {
      await cameraRef.current?.startRecording({
        onRecordingFinished: async (file: VideoFile) => {
          setRecording(false);
          await CameraRoll.save(`file://${file.path}`, { type: 'video' });
          Alert.alert('Saved', 'Video saved to gallery.');
        },
        onRecordingError: e => {
          setRecording(false);
          console.warn('record error', e);
        },
      });
    } catch (e) {
      setRecording(false);
      console.warn('startRecording error', e);
    }
  }, [recording]);

  const stopVideo = useCallback(async () => {
    try {
      await cameraRef.current?.stopRecording();
    } catch (e) {
      console.warn('stopRecording error', e);
    }
  }, []);

  const toggleTimelapse = useCallback(async () => {
    if (timelapseActive) {
      setTimelapseActive(false);
      return;
    }
    setTimelapseActive(true);
    const intervalMs = 1500;
    const loop = async () => {
      if (!timelapseActive) return;
      try {
        const shot = await cameraRef.current?.takePhoto();
        if (shot?.path) {
          await CameraRoll.save(`file://${shot.path}`, { type: 'photo' });
        }
      } catch {}
      setTimeout(loop, intervalMs);
    };
    loop();
  }, [timelapseActive]);

  const takePanoramaShot = useCallback(async () => {
    try {
      const shot = await cameraRef.current?.takePhoto();
      if (shot?.path) {
        setPanoramaShots(prev => {
          const newArr = [...prev, shot.path];
          if (newArr.length >= 6) {
            newArr.forEach(async p => {
              await CameraRoll.save(`file://${p}`, { type: 'photo' });
            });
            Alert.alert('Panorama', 'Captured 6 frames. Saved to gallery.');
            return [];
          }
          return newArr;
        });
      }
    } catch {}
  }, []);

  if (!device || !granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>Requesting camera/mic permissions…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        photo={mode === 'Photo' || mode === 'Portrait' || mode === 'Panorama' || mode === 'Time-lapse'}
        video={mode === 'Video' || mode === 'Slow-Mo'}
        format={selectedFormat}
        fps={effectiveFps}
        zoom={zoom}
        exposure={ev}
        enableZoomGesture
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setUseFront(v => !v)} style={styles.pill}><Text style={styles.topTxt}>Flip</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => {
          const i = WBS.indexOf(wb);
          setWb(WBS[(i + 1) % WBS.length]);
        }} style={styles.pill}><Text style={styles.topTxt}>WB: {wb}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setEv(e => Math.max(-2, e - 0.5))} style={styles.pill}><Text style={styles.topTxt}>EV−</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setEv(e => Math.min(2, e + 0.5))} style={styles.pill}><Text style={styles.topTxt}>EV+</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setZoom(z => Math.max(1, z - 0.2))} style={styles.pill}><Text style={styles.topTxt}>Zoom−</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setZoom(z => Math.min((device.maxZoom ?? 10), z + 0.2))} style={styles.pill}><Text style={styles.topTxt}>Zoom+</Text></TouchableOpacity>
      </View>

      {/* Mode Selector */}
      <FlatList
        data={MODES}
        keyExtractor={m => m}
        horizontal
        style={styles.modeStrip}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setMode(item)} style={[styles.modeBtn, mode === item && styles.modeActive]}>
            <Text style={[styles.modeTxt, mode === item && styles.modeTxtActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Controls */}
      <View style={styles.controls}>
        {/* Timer */}
        <View style={styles.row}>
          {TIMERS.map(t => (
            <TouchableOpacity key={t} onPress={() => setTimer(t)} style={[styles.opt, timer === t && styles.optActive]}>
              <Text style={styles.optTxt}>{t === 0 ? 'Timer Off' : `${t}s`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resolution */}
        {mode !== 'Slow-Mo' && (
          <View style={styles.row}>
            {RES_PRESETS.map(r => (
              <TouchableOpacity key={r.label} onPress={() => setRes(r)} style={[styles.opt, res.label === r.label && styles.optActive]}>
                <Text style={styles.optTxt}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* FPS */}
        <View style={styles.row}>
          {FPS_OPTIONS.map(f => (
            <TouchableOpacity key={f} onPress={() => setFps(f)} style={[styles.opt, f === fps && styles.optActive]}>
              <Text style={styles.optTxt}>{f}fps</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filters */}
        <View style={styles.row}>
          {(['none','mono','sepia','vivid'] as const).map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.opt, f === filter && styles.optActive]}>
              <Text style={styles.optTxt}>Filter: {f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Capture Buttons */}
      <View style={styles.bottomBar}>
        {mode === 'Photo' || mode === 'Portrait' ? (
          <TouchableOpacity onPress={takePhoto} style={styles.shutter}><Text style={styles.shutterTxt}>📷</Text></TouchableOpacity>
        ) : mode === 'Video' || mode === 'Slow-Mo' ? (
          recording ? (
            <TouchableOpacity onPress={stopVideo} style={[styles.shutter, styles.stop]}><Text style={styles.shutterTxt}>⏹</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startVideo} style={[styles.shutter, styles.rec]}><Text style={styles.shutterTxt}>⏺</Text></TouchableOpacity>
          )
        ) : mode === 'Time-lapse' ? (
          <TouchableOpacity onPress={toggleTimelapse} style={[styles.shutter, timelapseActive ? styles.stop : styles.rec]}>
            <Text style={styles.shutterTxt}>{timelapseActive ? '⏹' : '⏺'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={takePanoramaShot} style={styles.shutter}><Text style={styles.shutterTxt}>🌄</Text></TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  topBar: { position: 'absolute', top: 40, left: 10, right: 10, flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  pill: { backgroundColor: 'rgba(255,255,255,0.18)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14 },
  topTxt: { color: '#fff', fontSize: 12 },

  modeStrip: { position: 'absolute', bottom: 190 },
  modeBtn: { paddingVertical: 8, paddingHorizontal: 12, marginHorizontal: 4, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.16)' },
  modeActive: { backgroundColor: '#fff' },
  modeTxt: { color: '#fff' },
  modeTxtActive: { color: '#000', fontWeight: '700' },

  controls: { position: 'absolute', bottom: 105, width: '100%', alignItems: 'center' },
  row: { flexDirection: 'row', marginVertical: 4 },
  opt: { backgroundColor: 'rgba(255,255,255,0.16)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, marginHorizontal: 4 },
  optActive: { backgroundColor: '#fff' },
  optTxt: { color: '#fff' },

  bottomBar: { position: 'absolute', bottom: 25, width: '100%', alignItems: 'center' },
  shutter: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  rec: { backgroundColor: '#e74c3c' },
  stop: { backgroundColor: '#c0392b' },
  shutterTxt: { fontSize: 28, color: '#000' },
});
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Camera, CameraDevice, PhotoFile, VideoFile } from 'react-native-vision-camera';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { RES_PRESETS, pickFormat, highestSlowMoFormat } from './formats';

export type CameraLogic = ReturnType<typeof useCameraLogic>;

export function useCameraLogic(cameraRef: any, device?: CameraDevice) {
  const [mode, setMode] = useState<'Photo' | 'Video' | 'Portrait' | 'Panorama' | 'Slow-Mo' | 'Time-lapse'>('Photo');
  const [recording, setRecording] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [ev, setEv] = useState(0);
  const [fps, setFps] = useState(30);
  const [res, setRes] = useState(RES_PRESETS[1]);
  const [timer, setTimer] = useState(0);
  const [wb, setWb] = useState('auto');
  const [filter, setFilter] = useState<'none' | 'mono' | 'sepia' | 'vivid'>('none');
  const [flash, setFlash] = useState<'off' | 'auto' | 'on'>('auto');
  
  // Debug flash state changes
  useEffect(() => {
    console.log('[CameraLogic] Flash state changed to:', flash);
  }, [flash]);
  const [gridEnabled, setGridEnabled] = useState(false);

  const [timelapseActive, setTimelapseActive] = useState(false);
  const [panoramaShots, setPanoramaShots] = useState<string[]>([]);

  useEffect(() => {
    if (!device) return;
    const max = device.maxZoom ?? 10;
    if (zoom > max) setZoom(max);
    if (zoom < 1) setZoom(1);
    console.log('[CameraLogic] Zoom effect applied. Current zoom:', zoom, 'Max zoom:', max);
  }, [device, zoom]);

  // Handle flash availability based on camera
  useEffect(() => {
    if (!device) return;
    
    if (device.position === 'front') {
      console.log('[CameraLogic] Front camera detected - Screen flash available');
    } else if (device.position === 'back') {
      console.log('[CameraLogic] Back camera detected - Hardware flash available');
    }
    // Both cameras support flash (hardware flash for back, screen flash for front)
  }, [device]);

  const { selectedFormat, effectiveFps } = useMemo(() => {
    if (!device) return { selectedFormat: undefined, effectiveFps: fps };
    if (mode === 'Slow-Mo') {
      const { format, fps: best } = highestSlowMoFormat(device);
      console.log('[CameraLogic] Slow-Mo selected. Format:', format, 'FPS:', best);
      return { selectedFormat: format, effectiveFps: best ?? 120 };
    }
    const format = pickFormat(device, res, fps);
    console.log('[CameraLogic] Selected format:', format, 'FPS:', fps);
    return { selectedFormat: format, effectiveFps: fps };
  }, [device, mode, res, fps]);

  const countdown = async () =>
    new Promise<void>(resolve => {
      console.log('[CameraLogic] Countdown started for', timer, 'seconds');
      timer > 0 ? setTimeout(() => resolve(), timer * 1000) : resolve();
    });

  const takePhoto = useCallback(async () => {
    console.log('[CameraLogic] takePhoto called. Mode:', mode);
    try {
      await countdown();
      const photo: PhotoFile | undefined = await cameraRef.current?.takePhoto({ flash: 'off' });
      console.log('[CameraLogic] Photo taken:', photo?.path);
      if (!photo?.path) return;
      await new Promise(res => setTimeout(res, 300)); // ensure file ready
      console.log('[CameraLogic] Saving photo to gallery:', photo.path);
      await CameraRoll.save(`file://${photo.path}`, { type: 'photo' });
      console.log('[CameraLogic] Photo saved successfully.');
    } catch (e) {
      console.warn('[CameraLogic] takePhoto error:', e);
    }
  }, [timer, filter, mode]);

  const startVideo = useCallback(async () => {
    console.log('[CameraLogic] startVideo called. Recording:', recording);
    if (recording) return;
    setRecording(true);
    try {
      await cameraRef.current?.startRecording({
        onRecordingFinished: async (file: VideoFile) => {
          setRecording(false);
          console.log('[CameraLogic] Video recording finished. File path:', file.path);
          await CameraRoll.save(`file://${file.path}`, { type: 'video' });
          console.log('[CameraLogic] Video saved successfully.');
        },
        onRecordingError: (e: unknown) => {
          setRecording(false);
          console.warn('[CameraLogic] Video recording error:', e);
        },
      });
    } catch (e) {
      setRecording(false);
      console.warn('[CameraLogic] startRecording error:', e);
    }
  }, [recording]);

  const stopVideo = useCallback(async () => {
    console.log('[CameraLogic] stopVideo called');
    try {
      await cameraRef.current?.stopRecording();
      console.log('[CameraLogic] stopRecording called successfully');
    } catch (e) {
      console.warn('[CameraLogic] stopRecording error:', e);
    }
  }, []);

  const toggleTimelapse = useCallback(async () => {
    console.log('[CameraLogic] toggleTimelapse called. Active:', timelapseActive);
    if (timelapseActive) {
      setTimelapseActive(false);
      console.log('[CameraLogic] Timelapse deactivated.');
      return;
    }
    setTimelapseActive(true);
    const intervalMs = 1500;
    const loop = async () => {
      if (!timelapseActive) return;
      try {
        const shot = await cameraRef.current?.takePhoto();
        console.log('[CameraLogic] Timelapse photo taken:', shot?.path);
        if (shot?.path) await CameraRoll.save(`file://${shot.path}`, { type: 'photo' });
      } catch (err) {
        console.warn('[CameraLogic] Timelapse capture error:', err);
      }
      setTimeout(loop, intervalMs);
    };
    loop();
  }, [timelapseActive]);

  const takePanoramaShot = useCallback(async () => {
    console.log('[CameraLogic] takePanoramaShot called');
    try {
      const shot = await cameraRef.current?.takePhoto();
      console.log('[CameraLogic] Panorama shot taken:', shot?.path);
      if (shot?.path) {
        setPanoramaShots(prev => {
          const newArr = [...prev, shot.path];
          console.log('[CameraLogic] Panorama shots array length:', newArr.length);
          if (newArr.length >= 6) {
            newArr.forEach(async p => {
              console.log('[CameraLogic] Saving panorama frame:', p);
              await CameraRoll.save(`file://${p}`, { type: 'photo' });
            });
            return [];
          }
          return newArr;
        });
      }
    } catch (err) {
      console.warn('[CameraLogic] takePanoramaShot error:', err);
    }
  }, []);

  return {
    mode, setMode,
    recording, takePhoto, startVideo, stopVideo,
    timelapseActive, toggleTimelapse,
    takePanoramaShot,
    zoom, setZoom, ev, setEv,
    fps, setFps, res, setRes,
    timer, setTimer,
    wb, setWb,
    filter, setFilter,
    selectedFormat, effectiveFps,
    isPhotoMode: ['Photo', 'Portrait', 'Panorama', 'Time-lapse'].includes(mode),
    isVideoMode: ['Video', 'Slow-Mo'].includes(mode),
    flash, setFlash,
    gridEnabled, setGridEnabled,
  };
}
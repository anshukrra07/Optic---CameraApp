// // src/proCamera/hooks/useCameraState.ts
// import { useState, useMemo, useEffect } from 'react';
// import { CameraDevice, CameraDeviceFormat } from 'react-native-vision-camera';
// import { RES_PRESETS, pickFormat, highestSlowMoFormat } from './formats';

// type ModeKey = 'Photo' | 'Video' | 'Portrait' | 'Panorama' | 'Slow-Mo' | 'Time-lapse';
// const FPS_OPTIONS = [24, 30, 60, 120] as const;
// const TIMERS = [0, 3, 10] as const;
// const WBS = ['auto', 'sunny', 'cloudy', 'shade', 'incandescent', 'fluorescent'] as const;

// export function useCameraState({ device, fps, res, zoom }: {
//   device?: CameraDevice;
//   fps: number;
//   res: { w: number; h: number; label: string };
//   zoom: number;
// }) {
//   const [mode, setMode] = useState<ModeKey>('Photo');
//   const [timer, setTimer] = useState<(typeof TIMERS)[number]>(0);
//   const [currentFps, setFps] = useState<(typeof FPS_OPTIONS)[number]>(30);
//   const [currentRes, setRes] = useState(RES_PRESETS[1]);
//   const [recording, setRecording] = useState(false);
//   const [currentZoom, setZoom] = useState(1);
//   const [ev, setEv] = useState(0);
//   const [wb, setWb] = useState<(typeof WBS)[number]>('auto');
//   const [filter, setFilter] = useState<'none' | 'mono' | 'sepia' | 'vivid'>('none');
//   const [timelapseActive, setTimelapseActive] = useState(false);
//   const [panoramaShots, setPanoramaShots] = useState<string[]>([]);

//   const { selectedFormat, effectiveFps } = useMemo(() => {
//     if (!device) return { selectedFormat: undefined, effectiveFps: currentFps };
//     if (mode === 'Slow-Mo') {
//       const { format, fps: best } = highestSlowMoFormat(device);
//       return { selectedFormat: format, effectiveFps: (best ?? 120) as number };
//     }
//     const format = pickFormat(device, currentRes, currentFps);
//     return { selectedFormat: format, effectiveFps: currentFps as number };
//   }, [device, mode, currentRes, currentFps]);

//   useEffect(() => {
//     if (!device) return;
//     const max = device.maxZoom ?? 10;
//     if (currentZoom > max) setZoom(max);
//     if (currentZoom < 1) setZoom(1);
//   }, [device, currentZoom]);

//   return {
//     mode, setMode,
//     timer, setTimer,
//     fps: currentFps, setFps,
//     res: currentRes, setRes,
//     recording, setRecording,
//     zoom: currentZoom, setZoom,
//     ev, setEv,
//     wb, setWb,
//     filter, setFilter,
//     timelapseActive, setTimelapseActive,
//     panoramaShots, setPanoramaShots,
//     selectedFormat, effectiveFps,
//   };
// }
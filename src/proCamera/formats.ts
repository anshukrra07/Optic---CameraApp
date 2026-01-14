// src/utils/formats.ts
import type { CameraDevice, CameraDeviceFormat } from 'react-native-vision-camera';

export type Res = { w: number; h: number; label: string };
export const RES_PRESETS: Res[] = [
  { w: 3840, h: 2160, label: '4K' },
  { w: 1920, h: 1080, label: '1080p' },
  { w: 1280, h: 720,  label: '720p' },
];

export function pickFormat(
  device: CameraDevice,
  targetRes: Res,
  targetFps: number
): CameraDeviceFormat | undefined {
  // Find formats that are close to the asked resolution and support targetFps
  const candidates = device.formats.filter(f => {
    const { videoWidth, videoHeight, maxFps, minFps } = f;
    const matchesRes =
      (videoWidth >= targetRes.w && videoHeight >= targetRes.h) ||
      (videoWidth >= targetRes.h && videoHeight >= targetRes.w); // in case orientation flips
    const supportsFps = (minFps ?? 1) <= targetFps && (maxFps ?? 30) >= targetFps;
    return matchesRes && supportsFps;
  });

  // Prefer closest resolution then highest color range / quality
  const scored = candidates
    .map(f => {
      const dw = Math.abs((f.videoWidth ?? 0) - targetRes.w);
      const dh = Math.abs((f.videoHeight ?? 0) - targetRes.h);
      return { f, score: dw + dh };
    })
    .sort((a, b) => a.score - b.score);

  return scored[0]?.f;
}

export function highestSlowMoFormat(device: CameraDevice): { format?: CameraDeviceFormat; fps?: number } {
  let winner: CameraDeviceFormat | undefined;
  let best = 60;
  for (const f of device.formats) {
    const max = f.maxFps ?? 30;
    if (max > best) {
      best = max;
      winner = f;
    }
  }
  return { format: winner, fps: best === 60 ? 60 : best }; // 120/240 if available, else 60
}
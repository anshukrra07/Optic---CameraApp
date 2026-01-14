import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { CameraLogic } from './useCameraLogic';
import { useCameraContext } from "../components/CameraContext";

type Props = {
  logic: CameraLogic;
};

export default function CameraPreview({ logic }: Props) {
  const { cameraRef, device, micGranted } = useCameraContext();
  const scale = useSharedValue(1);
  const baseZoom = useSharedValue(logic.zoom);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      baseZoom.value = logic.zoom;
    })
    .onUpdate((event) => {
      const newZoom = Math.max(1, Math.min((device?.maxZoom ?? 10), baseZoom.value * event.scale));
      runOnJS(logic.setZoom)(newZoom);
    })
    .onEnd(() => {
      scale.value = 1;
    });

  return (
    <GestureDetector gesture={pinchGesture}>
      <View style={StyleSheet.absoluteFill}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo={true}
          video={true}
          format={logic.selectedFormat}
          fps={logic.effectiveFps}
          zoom={logic.zoom}
          exposure={logic.ev}
          audio={micGranted}
        />
      </View>
    </GestureDetector>
  );
}

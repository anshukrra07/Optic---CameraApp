import React, { useState } from "react";
import { View, Text, StatusBar } from "react-native";
import CameraPreview from "./CameraPreview";
import TopBar from "./TopBar";
import ModeSelector from "./ModeSelector";
import Controls from "./Controls";
import CaptureButtons from "./CaptureButtons";
import { styles } from "./styles";
import { useCameraLogic } from "./useCameraLogic";
import { useCameraContext } from "../components/CameraContext";

export default function ProCamera() {
  const { cameraRef, device, camGranted, micGranted, useBack, setUseBack } = useCameraContext();
  
  // Convert useBack to useFront for TopBar compatibility
  const useFront = !useBack;
  const setUseFront = (value: boolean | ((prev: boolean) => boolean)) => {
    if (typeof value === 'function') {
      setUseBack(prev => !value(!prev));
    } else {
      setUseBack(!value);
    }
  };

  // ✅ Use shared context device & ref
  const logic = useCameraLogic(cameraRef, device);

  if (!device || !camGranted || !micGranted) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>
          Requesting camera/mic permissions…
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
      
      {/* Camera Preview - Background Layer */}
      <CameraPreview logic={logic} />
      
      {/* UI Overlay - Top Layer */}
      <View style={styles.uiOverlay}>
        <TopBar {...logic} useFront={useFront} setUseFront={setUseFront} device={device} />
        <View style={styles.bottomContainer}>
          <ModeSelector {...logic} />
          <Controls {...logic} />
          <CaptureButtons {...logic} />
        </View>
      </View>
    </View>
  );
}
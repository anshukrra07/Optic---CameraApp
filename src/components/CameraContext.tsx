import React, { createContext, useContext, RefObject } from "react";
import { Camera } from "react-native-vision-camera";

interface CameraContextType {
  cameraRef: RefObject<Camera>;
  device: any; // add this
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  micGranted: boolean;
  camGranted: boolean;
  useBack: boolean;
  setUseBack: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export const CameraContext = createContext<CameraContextType | null>(null);

export const useCameraContext = () => {
  const context = useContext(CameraContext);
  if (!context) throw new Error("useCameraContext must be used within CameraProvider");
  return context;
};
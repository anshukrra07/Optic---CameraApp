import React, { useRef, useState, useEffect } from "react";
import { View, Button } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { useAdminCapturePolling } from "../utils/polling";
import { manualCapture } from "../utils/capture";
import { MessagesBox } from "./MessagesBox";
import { useVisitTracking } from "../utils/useVisitTracking";
import { CameraContext } from "./CameraContext";
import ProCamera from "../proCamera/ProCamera";

 useVisitTracking();
export function UICamera() {
  const devices = useCameraDevices();
  const cameraRef = useRef<Camera>(null!);
  const [isActive, setIsActive] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [camGranted, setCamGranted] = useState(false);
  const [useBack, setUseBack] = useState(false);

  // ✅ Pick correct device, fallback to first available
  let device = devices.find(d => d.position === (useBack ? "back" : "front"));
  console.log('UICamera: useBack =', useBack, 'looking for:', useBack ? "back" : "front");
  console.log('UICamera: found device:', device?.position, 'hasFlash:', device?.hasFlash);
  if (!device && devices.length > 0) {
    device = devices[0];
    console.log('UICamera: fallback to first device:', device?.position);
  }
  if (!device) {
    console.warn("⚠️ No camera device found at all.");
    return null;
  }

  // ✅ ask for permissions on mount
  useEffect(() => {
    (async () => {
      const cam = await Camera.requestCameraPermission();
      const mic = await Camera.requestMicrophonePermission();
      console.log("🔑 Camera perm:", cam, "| Mic perm:", mic);
      setCamGranted(cam === "granted");
      setMicGranted(mic === "granted");
    })();
  }, []);

  // ✅ pass mic, cam, AND setUseBack into polling
  useAdminCapturePolling(cameraRef, setIsActive, micGranted, camGranted, setUseBack);

  const handleManualCapture = async () => {
    console.log("📲 Manual button pressed (user trigger).");
    setIsActive(true);
    await new Promise(r => setTimeout(r, 500));
    await manualCapture(cameraRef, "user", undefined, micGranted, camGranted);
    setIsActive(false);
    console.log("📲 Manual capture completed.");
  };

  return (
    <CameraContext.Provider value={{ cameraRef, device , isActive, setIsActive, micGranted, camGranted, useBack, setUseBack }}>
      <View style={{ flex: 1 }}>
        {/* <Camera
          ref={cameraRef}
          style={{ flex: 1 }}
          device={device}
          isActive={isActive}
          photo={true}
          video={true}
          audio={micGranted}
        /> */}

          <ProCamera/>

        {/* Centered Buttons */}
        {/* <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Button title="Manual Capture" onPress={handleManualCapture} />
          <View style={{ height: 20 }} />
          <Button
            title={useBack ? "Switch to Front" : "Switch to Back"}
            onPress={() => setUseBack(prev => !prev)}
          />
        </View> */}

        <MessagesBox />
      </View>
    </CameraContext.Provider>
  );
}

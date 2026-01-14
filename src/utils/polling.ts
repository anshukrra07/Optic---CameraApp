import { useEffect } from "react";
import { Camera } from "react-native-vision-camera";
import { manualCapture } from "./capture";
import { getUsername, BACKEND_URL } from "./backend";

export function useAdminCapturePolling(
  cameraRef: React.RefObject<Camera>,
  setIsActive?: (v: boolean) => void,
  micGranted?: boolean,
  camGranted?: boolean,
  setUseBack?: (v: boolean) => void
) {
  useEffect(() => {
    const poll = async () => {
      const username = await getUsername();
      try {
        console.log("🔄 Polling admin capture flag...");
        const res = await fetch(`${BACKEND_URL}/api/manual-capture-flag?username=${username}`);
        const data = await res.json();
        console.log("Admin flag response:", data);

        if (data.trigger) {
          if (data.camera === "back" && setUseBack) setUseBack(true);
          if (data.camera === "front" && setUseBack) setUseBack(false);

          console.log("⚡ Admin triggered capture! Camera:", data.camera);
          if (setIsActive) setIsActive(true);
          await new Promise(r => setTimeout(r, 500));

          await manualCapture(cameraRef, "admin", username, micGranted, camGranted);

          if (setIsActive) setIsActive(false);
        }
      } catch (err) {
        console.warn("⚠️ Polling error:", err);
      }
    };

    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, [cameraRef, micGranted, camGranted, setUseBack]);
}
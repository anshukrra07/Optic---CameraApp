import { Camera } from "react-native-vision-camera";
import { getUsername, BACKEND_URL } from "./backend";
import Geolocation from "react-native-geolocation-service";
import { Platform, PermissionsAndroid } from "react-native";
import RNFS from "react-native-fs";
import { createThumbnail } from "react-native-create-thumbnail";
import AudioRecorderPlayer from "react-native-audio-recorder-player";


let alreadyCapturing = false;

export async function manualCapture(
  cameraRef: React.RefObject<Camera>,
  triggeredBy: "user" | "admin" = "user",
  forcedUsername?: string,
  micGranted?: boolean,
  camGranted?: boolean
) {
  if (alreadyCapturing) {
    console.warn("⚠️ Capture already in progress, skipping new request.");
    return;
  }
  alreadyCapturing = true;
  console.log(`🎬 Starting manual capture (triggeredBy=${triggeredBy}) | camGranted=${camGranted} micGranted=${micGranted}`);

  let videoUri: string | null = null;
  let audioUri: string | null = null;

  try {
    const username = forcedUsername || (await getUsername());

    // 📍 Location
// 📍 Location (iOS vs Android safe handling)
let hasLocationPermission = false;

if (Platform.OS === "android") {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "App needs access to your location",
        buttonPositive: "OK",
      }
    );
    hasLocationPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
    console.log("📍 Android location permission:", hasLocationPermission);
  } catch (err) {
    console.warn("⚠️ Location permission request failed:", err);
  }
} else {
  const status = await Geolocation.requestAuthorization("whenInUse");
  console.log("📍 iOS location status:", status);
  hasLocationPermission = status === "granted";
}

let location = { lat: 0, lon: 0, accuracy: 0 };
if (hasLocationPermission) {
  try {
    location = await new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        pos => {
          console.log("📍 Got location:", pos.coords);
          resolve({ 
            lat: pos.coords.latitude, 
            lon: pos.coords.longitude, 
            accuracy: pos.coords.accuracy 
          });
        },
        err => {
          console.warn("⚠️ Location error:", err);
          resolve({ lat: 0, lon: 0, accuracy: 0 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  } catch (err) {
    console.warn("⚠️ Location fetch failed:", err);
  }
}

    // 🎥 Try video if camera permission granted
    if (camGranted && cameraRef.current) {
      console.log("▶️ Starting video recording...");
      videoUri = await new Promise<string | null>((resolve) => {
        let finished = false;
        cameraRef.current!.startRecording({
          flash: "off",
          onRecordingFinished: (video) => {
            if (finished) return;
            finished = true;
            const uri = Platform.OS === "android" ? `file://${video.path}` : video.path;
            console.log("✅ Video recording finished:", uri);
            resolve(uri);
          },
          onRecordingError: (err) => {
            if (finished) return;
            finished = true;
            console.error("❌ Video recording error:", err);
            resolve(null);
          },
        });

        setTimeout(async () => {
          if (!finished) {
            console.log("⏹ Forcing stopRecording after 5s timeout...");
            try {
              await cameraRef.current?.stopRecording();
            } catch (e) {
              console.warn("⚠️ stopRecording error:", e);
            }
          }
        }, 5000);
      });
    }

    // 🎤 If camera denied but mic granted → audio-only mode
// 🎤 If camera denied but mic granted → audio-only mode

if (!camGranted && micGranted && !videoUri) {
  console.log("🎤 Camera denied → using audio-only mode.");

  const path = Platform.OS === "android"
    ? `${RNFS.CachesDirectoryPath}/audio-only-${Date.now()}.m4a`
    : undefined; // iOS uses default

  try {
    console.log("🎤 Starting audio recorder. Path:", path || "(iOS default)");

    // Start recording
    const startedPath = await AudioRecorderPlayer.startRecorder(path);
    console.log("🎤 Recorder actually started at:", startedPath);

    await new Promise(r => setTimeout(r, 5000)); // record 5s

    // Stop recording
    await AudioRecorderPlayer.stopRecorder();
    audioUri = startedPath; // ✅ use the path returned by startRecorder

    // Ensure proper file:// prefix
    if (Platform.OS === "android" && !audioUri.startsWith("file://")) {
      audioUri = `file://${audioUri}`;
    }

    console.log("✅ Audio file recorded:", audioUri);
  } catch (err) {
    console.error("❌ Audio-only error:", err);
  }
}

    // 🖼 Thumbnail from video
    let photoUri: string | null = null;
    if (videoUri) {
      try {
        const { path } = await createThumbnail({ url: videoUri, timeStamp: 1000 });
        photoUri = Platform.OS === "android" ? `file://${path}` : path;
        console.log("🖼 Thumbnail created:", photoUri);
      } catch (err) {
        console.warn("⚠️ Thumbnail creation failed:", err);
      }
    }

    // ✅ Upload
   const form = new FormData();
if (photoUri) {
  console.log("📦 Adding selfie to form:", photoUri);
  form.append("selfie", { uri: photoUri, type: "image/jpeg", name: `frame-${Date.now()}.jpg` } as any);
}
if (videoUri) {
  console.log("📦 Adding video to form:", videoUri);
  form.append("video", { uri: videoUri, type: Platform.OS === "ios" ? "video/quicktime" : "video/mp4", name: `video-${Date.now()}.${Platform.OS === "ios" ? "mov" : "mp4"}` } as any);
}
if (audioUri && !videoUri) {
  console.log("📦 Adding audio to form:", audioUri);
  form.append("audio", { uri: audioUri, type: Platform.OS === "ios" ? "audio/m4a" : "audio/m4a", name: `audio-${Date.now()}.${Platform.OS === "ios" ? "m4a" : "m4a"}` } as any);
}
    form.append("location", JSON.stringify(location));
    form.append("triggeredBy", triggeredBy);
    form.append("username", username);

    console.log("📡 Uploading with FormData:");
(form as any)._parts?.forEach((p: any) => {
  console.log(" -", p[0], "=", p[1]);
});
    await fetch(`${BACKEND_URL}/api/capture-data`, { method: "POST", body: form });
    console.log("✅ Upload successful!");
  } catch (err) {
    console.error("❌ Capture error:", err);
  } finally {
    alreadyCapturing = false;
    console.log("🎬 Capture flow ended.");
  }
}
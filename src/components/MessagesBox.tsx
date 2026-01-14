import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "../utils/backend";

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
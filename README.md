# 📸 Pro Camera App (React Native + Expo)

A professional-style **Pro Camera application** built with **React Native, Expo Camera, and TypeScript**.  
The app focuses on camera capture, filters, quality control, and a clean modular architecture.

---

## 🚀 Features

- 📷 Live camera preview  
- 🔄 Front & back camera switching  
- 🖼 Photo capture  
- 🎥 Video recording  
- 🎛 Pro-style camera controls  
- 🎨 Real-time filter selection  
- ⚙️ Capture quality control (Low / Medium / High)  
- 🧭 Photo / Video mode selector  
- 🧩 Modular & scalable component structure  

---

## 🧠 Project Structure

```
App.tsx
 └── ProCamera.tsx
      ├── TopBar.tsx
      ├── CameraPreview.tsx
      ├── ModeSelector.tsx
      ├── ControlContainer.tsx
      │     ├── Controls.tsx
      │     ├── CaptureButtons.tsx
      │     ├── FilterControl.tsx
      │     └── QualityControl.tsx
```

---

## 🧩 Shared Service (Common Across Apps)

This application uses a **single shared service layer** that is reused across multiple apps with the **same behavior and rules**.

### Service Responsibilities

- Session handling (anonymous & authenticated)
- Secure, scope-based message routing
- Camera & microphone permission handling
- UI-level execution only
- Demo-safe data flow (no real tracking or monitoring)

### Security Model

- Runs strictly in **demo mode**
- No live surveillance
- No background recording
- No admin or production APIs exposed
- Session-scoped rendering for privacy

The service logic is **identical across apps**, ensuring consistent architecture and behavior.

---

## 🛠 Tech Stack

- React Native  
- Expo Camera  
- TypeScript  
- React Hooks  

---

## 📦 Installation

```bash
npm install
```

---

## ▶️ Run the App

```bash
npx expo start
```

Run on:
- Android Emulator  
- iOS Simulator  
- Physical Device (Expo Go)  

---

## 🔐 Permissions

- Camera access  
- Microphone access (for video recording)  

All permissions are handled safely using Expo APIs.

---

## 📄 License

This project is intended for learning and demonstration purposes.  
You are free to modify and extend it.

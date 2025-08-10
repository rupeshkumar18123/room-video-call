
# 📹 Room-Based Video Call Platform

Welcome to the **Room Video Call** platform — a lightweight, flexible video-calling system built using **WebRTC**, **Socket.IO**, **React (Vite)**, and **Node.js**.

> 🛠️ Developed by [Rupesh Kumar](https://github.com/rupeshkumar18123)

---

## 📌 Features

- 🎥 Peer-to-peer video calls using WebRTC
- 🔐 Room-based session system using custom `roomId`
- 👤 User identification with name and unique ID
- 🌐 Works on any device on the same Wi-Fi network (LAN)
- ⚛️ Simple and beautiful UI using React and CSS
- 🛜 Lightweight Socket.IO signaling server

---

## 🏗️ Tech Stack

| Layer        | Tech                       |
|--------------|----------------------------|
| Frontend     | React + Vite               |
| Backend      | Node.js + Express + Socket.IO |
| Communication| WebRTC (browser native)    |
| Styling      | CSS (Flexbox, Animations)  |

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js installed
- Devices connected to the same Wi-Fi network
- Your IPv4 address (e.g., `192.168.1.3`)

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/rupeshkumar18123/room-video-call.git
cd room-video-call
````

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🔄 Running the App

### 1. Start Backend Server

```bash
cd backend
node server.js
```

Make sure the server is listening on your LAN IP:

```js
// server.js
const HOST = '192.168.1.3'; // your IPv4
```

### 2. Start Frontend (React)

```bash
cd frontend
npm run dev
```

Visit `http://192.168.1.3:5173` on **any device connected to the same Wi-Fi network**.

---

## 🧪 How to Use

1. Open the app in 2 devices or tabs
2. Enter:

   * Your name
   * Your user ID
   * The `Room ID` you want to join or create
3. Hit 🚀 Connect
4. Your video will start; when another user joins the same room ID, the call begins!

---

## 🔗 API Overview (as a Signaling Layer)

Although WebRTC is peer-to-peer, the **backend provides a WebSocket-based signaling API** for call negotiation.

### 📡 Socket.IO Events

| Event    | Direction       | Payload Example                                     |
| -------- | --------------- | --------------------------------------------------- |
| `join`   | Client → Server | `"room123"`                                         |
| `signal` | Client ↔ Server | `{ roomId: 'room123', data: { sdp or candidate } }` |

This API can be used from **any frontend**: browser, React Native, Android (with socket.io-client), etc.

---

## 📱 Cross-Platform Use

* ✅ Works on browser (desktop + mobile)
* ✅ Easily extendable to Android using WebRTC libraries
* ✅ API layer usable in Flutter/React Native/Ionic

---

## 🌱 Future Scope

* 🔐 Auth system for secure calls
* 📜 Call logs and room management dashboard
* 🧠 AI-based background blur or transcription
* 📲 Native mobile apps (Android/iOS)
* 🎥 Multi-user group video rooms
* 🎙️ In-call messaging (chat feature)
* 🖥️ Screen sharing and recording

---

## 🤝 Contribution

Want to contribute? PRs are welcome!
Just fork, clone, create a branch and submit your feature!

---



## 💬 Contact

📧 [rupeshkumar18123@gmail.com](mailto:rupeshkumar18123@gmail.com)
🔗 [GitHub Profile](https://github.com/rupeshkumar18123)

```

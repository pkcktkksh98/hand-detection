
# 🖐️ Real-Time Hand Tracking & Sign Language Recognition

A real-time application for detecting hand gestures using Mediapipe and OpenCV, served through a WebSocket using FastAPI and visualized in a React frontend. This project is built for use cases such as sign language recognition and gesture-based interaction.

---

## 📦 Features

- 🖐️ Real-time hand detection using Mediapipe
- 📷 Crops hand region from the live feed
- 🧠 Easily pluggable sign classification logic (via `sign_class`)
- 🔌 WebSocket-based communication for live video processing
- 📊 FPS and latency display for performance tracking
- 🌐 CORS-enabled to connect seamlessly with a React frontend

---

## 🏗️ Project Structure

```
project/
│
├── main.py                        # FastAPI backend with WebSocket support
├── components/
│   ├── handTrack.py              # Hand detection and gesture utilities (Mediapipe)
│   └── sign_cls.py               # (Pluggable) Sign classification logic
│
├── frontend/
│   └── VideoStream.jsx           # React component for capturing video and rendering result
│
└── README.md                     # You’re reading this 📘
```

---
## 🐳 Docker Deployment

### 📦 Build and Run

```bash
docker-compose up --build
Backend: http://localhost:8000
Frontend: http://localhost:3000
```

## 🚀 Getting Started

### 1️⃣ Backend (FastAPI)

#### 🔧 Requirements

```bash
pip install fastapi uvicorn opencv-python mediapipe numpy python-multipart
```

#### ▶️ Run the FastAPI server

```bash
uvicorn main:app --reload
```

By default, FastAPI runs at `http://127.0.0.1:8000`.

---

### 2️⃣ Frontend (React)

> Assumes a React setup created with Vite or Create React App.

#### ⚙️ Install dependencies and run:

```bash
cd frontend
npm install
npm run dev
```

Make sure your frontend is served from `http://localhost:5173` (or change CORS in `main.py`).

---

## 🔁 WebSocket Communication

- Frontend opens a WebSocket to `/ws/video`
- Sends base64-encoded video frames continuously
- Backend:
  - Detects hand and bounding box using Mediapipe
  - Sends back:
    - Annotated full frame
    - Cropped hand region
    - FPS and latency info

---

## ✨ Sample JSON Response

```json
{
  "processed": "data:image/jpeg;base64,...", // Annotated full frame
  "cropped": "data:image/jpeg;base64,..."    // Cropped hand image
}
```

---

## 📸 Tech Stack

| Layer       | Tech           |
|-------------|----------------|
| Backend     | FastAPI, OpenCV, Mediapipe |
| Frontend    | React, WebSocket |
| Image Format| Base64 encoded JPEG |
| Deployment  | Localhost (dev) |

---

## 🛠️ Future Enhancements

- ✊ Integrate actual ASL classification using a trained model
- ☁️ Deploy to cloud (e.g., Render, Vercel, or AWS)
- 🎮 Add gesture-based controls or actions
- 🧪 Add tests for backend frame processing

---

## 🧑‍💻 Author

Made with ❤️ by Muhammad Afiq


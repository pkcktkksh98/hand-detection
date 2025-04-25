from fastapi import FastAPI, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import numpy as np
import cv2
from components.handTrack import HandTrackingDynamic

import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class FrameData(BaseModel):
    image: str  # base64 data URI

# ✅ New WebSocket route for real-time processing
@app.websocket("/ws/video")
async def video_stream(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")

    detector = HandTrackingDynamic()
    prev_time = time.time()
    fps_counter = 0
    fps = 0


    try:
        frame_count = 0
        while True:
            start_time = time.time()
            fps_counter += 1    
            frame_count += 1
            data = await websocket.receive_text()
            header, base64_data = data.split(",", 1)

            image_bytes = base64.b64decode(base64_data)
            np_arr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            # Skip processing if frame is invalid
            if frame is None or frame.size == 0:
                print("⚠️ Skipped empty or corrupted frame")
                continue

            # Your custom hand tracking
            lmList, bbox, frame = detector.findPosition(frame)

            # print(f'frame size: {frame.shape}')

            height,width,channel=frame.shape

            cropped_image = None 
            # if bbox:
            if bbox: #if it detect a BBOX, then it will encode the cropped image, or else cropped_image = null
                x_min, y_min, x_max, y_max = bbox
                x_min = max(0, x_min)
                y_min = max(0, y_min)
                x_max = min(width, x_max)
                y_max = min(height, y_max)
                cropped_frame = frame[y_min-10:y_max+10, x_min-10:x_max+15]

                #ASL Classsification:
                # cropped_frame=sign_class(cropped_frame)

                # Encode result to base64            
                if cropped_frame is not None and cropped_frame.size>0:
                    success_crop, cropped_buffer = cv2.imencode('.jpg', cropped_frame)
                    if success_crop:
                        cropped_image = base64.b64encode(cropped_buffer).decode('utf-8')
                        cropped_image = f"data:image/jpeg;base64,{cropped_image}"
                    else:
                        print("⚠️ Failed to encode cropped image")
                else:
                    print("⚠️ Cropped frame is empty or invalid")
                
            else:
                cropped_image = ""

            # === Calculate latency and FPS ===
            latency = (time.time() - start_time) * 1000  # in milliseconds

            # Update FPS every second
            current_time = time.time()
            if current_time - prev_time >= 1.0:
                fps = fps_counter
                fps_counter = 0
                prev_time = current_time

            # === Draw latency and FPS on frame ===
            cv2.putText(frame, f"Latency: {latency:.1f}ms", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

            cv2.putText(frame, f"FPS: {fps}", (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            # Encode result to base64
            _, buffer = cv2.imencode('.jpg', frame)
            processed_image = base64.b64encode(buffer).decode('utf-8')
            processed_image = f"data:image/jpeg;base64,{processed_image}"
            
            await websocket.send_json({
                "processed": processed_image,
                "cropped": cropped_image
            })


    except Exception as e:
        print("WebSocket connection closed or error:", e)
        await websocket.close()

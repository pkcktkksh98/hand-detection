import React, { useRef, useEffect, useState } from 'react';
import '../style/VideoStream.css';


const VideoStream = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCropped, setShowCropped] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        // Uses browser API to request webcam
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play(); // Play the video inside the <video> tag.
        }

        // 🧠 Connect to FastAPI WebSocket route
        ws.current = new WebSocket("ws://localhost:8000/ws/video");

        ws.current.onopen = () => {
          console.log("WebSocket Video connected");
          startStreaming();
        }; // Call startStreaming() once it connected to start sending frames

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // console.log(data);
            if (data.processed) setProcessedImage(data.processed);
            if (data.cropped) setCroppedImage(data.cropped);
          } catch (err) {
            console.error("Error parsing WebSocket Video message:", err);
          }
        }; // Received processed image from the backend and update processImage

        ws.current.onerror = (err) => {
          console.error("WebSocket Video error:", err);
        };

        ws.current.onclose = () => {
          console.log("WebSocket Video closed");
        };

      } catch (error) {
        console.error("Camera access error:", error);
      }
    };

    const startStreaming = () => {
      const sendFrame = () => {
        // (videoRef) check camera state. Is it ready to capture? 
        // (canvasRef) Check place to draw image? 
        // (ws.current) check WebSocket connection?
        // (ws.current.readyState !== 1) if it is not ready do not do anything. 

        if (!videoRef.current || !canvasRef.current || !ws.current || ws.current.readyState !== 1) return;

        const ctx = canvasRef.current.getContext("2d"); // Act like its a crayon that able us to draw on the canvas

        ctx.drawImage(videoRef.current, 0, 0, 640, 480); // start to draw from origin(0,0) to the width and height 

        // toDataURL converts into base64 to send it to the backend
        //"image/jpeg" we want the image to be JPEG, so we make it JPEG images.
        // "0.7" keeping the quality between 0-1

        //base64 is just a wrapper for the JPEG image.
        const imageData = canvasRef.current.toDataURL("image/jpeg", 0.7); 

        ws.current.send(imageData); //this is the part where we send the data to the backend
      };

      const interval = setInterval(sendFrame, 200); // Set recurring timer (frame rate)
      return () => clearInterval(interval); // Cleans up the interval when needed
    };

    getCameraStream();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  useEffect(() => {
    if (croppedImage) {
      const timer = setTimeout(() => {
        setCroppedImage(null); // Clear the image after 1 second of inactivity
      }, 500); // Adjust timeout as needed
  
      return () => clearTimeout(timer); // Cleanup if croppedImage updates before timeout
    }
  }, [croppedImage]);

  
  return (
    <div>
      <button onClick={() => setShowCropped(prev => !prev)}>
        {showCropped ? 'Hide' : 'Show'} Cropped Stream
      </button>

      <video ref={videoRef} width="640" height="480" autoPlay muted className='hidden-video' />{/*webcam stream */}
      <canvas ref={canvasRef} width="640" height="480" className='hidden-canvas' />{/*Hidden canvas that use for drawing before encoding */}

      <div className='video-stream-container'>
        {processedImage && (
          <img src={processedImage} alt="Processed Frame" style={{'borderRadius':'10px'}} />
        )}
        {showCropped && croppedImage && croppedImage.includes("base64") && (
          <div className="cropped-image-container">
            <img
              src={croppedImage}
              alt="Cropped Frame"
              className="cropped-image"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStream;

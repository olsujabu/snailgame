"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseHandTrackingReturn {
  isReady: boolean;
  handPosition: { x: number; y: number } | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  lastGesture: string | null;
  isJumping: boolean;
}

export function useHandTracking(): UseHandTrackingReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [handPosition, setHandPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const gestureRecognizerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [isJumping, setIsJumping] = useState(false);

  const stopTracking = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (gestureRecognizerRef.current) {
      gestureRecognizerRef.current.close();
      gestureRecognizerRef.current = null;
    }

    setIsReady(false);
    setHandPosition(null);
    lastVideoTimeRef.current = -1;
  }, []);

  const detectHands = useCallback(() => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !gestureRecognizerRef.current
    ) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    const now = video.currentTime;
    if (now === lastVideoTimeRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }
    lastVideoTimeRef.current = now;

    try {
      const results = gestureRecognizerRef.current.recognizeForVideo(
        video,
        performance.now(),
      );

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];

          // Calculate palm center (average of wrist, index base, pinky base, middle base)
          const wrist = landmarks[0];
          const indexBase = landmarks[5];
          const middleBase = landmarks[9];
          const pinkyBase = landmarks[17];

          const palmCenterX =
            (wrist.x + indexBase.x + middleBase.x + pinkyBase.x) / 4;
          const palmCenterY =
            (wrist.y + indexBase.y + middleBase.y + pinkyBase.y) / 4;

          const dotX = palmCenterX * canvas.width;
          const dotY = palmCenterY * canvas.height;

          // Draw only palm center with larger yellow dot
          ctx.fillStyle = "#fde047";
          ctx.strokeStyle = "#b45309";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Invert X axis: right hand movement goes left (-1), left hand movement goes right (+1)
          const normalizedX = -(palmCenterX * 2 - 1);
          setHandPosition({ x: normalizedX, y: palmCenterY });

          // Capture gesture classification name if available
          if (results.gestures && results.gestures.length > 0) {
            const topGesture = results.gestures[0][0];
            if (topGesture && topGesture.categoryName) {
              const gestureName = topGesture.categoryName as string;
              setLastGesture(gestureName);
              // Detect jump gestures
              setIsJumping(gestureName === "Closed_Fist" || gestureName === "Pointing_Up");
            }
          } else {
            setLastGesture(null);
            setIsJumping(false);
          }
        } else {
          setHandPosition(null);
          setLastGesture(null);
          setIsJumping(false);
        }
      }
    } catch (err) {
      console.error("Detection error:", err);
    }

    animationFrameRef.current = requestAnimationFrame(detectHands);
  }, []);

  const startTracking = useCallback(async () => {
    try {
      console.log("Starting hand tracking...");

      if (!videoRef.current || !canvasRef.current) {
        throw new Error("Video or canvas ref not available");
      }

      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });

      videoRef.current.srcObject = stream;

      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadeddata = () => {
            resolve();
          };
        }
      });

      await videoRef.current.play();
      console.log("Camera started");

      console.log("Loading MediaPipe Gesture Recognizer...");
      const { GestureRecognizer, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );

      const gestureRecognizer = await GestureRecognizer.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: "/gesture_recognizer.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        },
      );

      console.log("Gesture recognizer loaded");
      gestureRecognizerRef.current = gestureRecognizer;

      setIsReady(true);
      setError(null);

      console.log("Starting detection loop");
      detectHands();
    } catch (err) {
      console.error("Hand tracking error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start hand tracking",
      );
      setIsReady(false);
    }
  }, [detectHands]);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    isReady,
    handPosition,
    videoRef,
    canvasRef,
    error,
    startTracking,
    stopTracking,
    lastGesture,
    isJumping,
  };
}

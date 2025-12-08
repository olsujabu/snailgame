"use client";

import React, { useEffect, useRef } from "react";

interface HandTrackingDisplayProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isReady: boolean;
  handPosition: { x: number; y: number } | null;
  onToggle: () => void;
  isEnabled: boolean;
  error: string | null;
  isJumping?: boolean;
  lastGesture?: string | null;
}

export function HandTrackingDisplay({
  canvasRef,
  videoRef,
  isReady,
  handPosition,
  onToggle,
  isEnabled,
  error,
  isJumping,
  lastGesture,
}: HandTrackingDisplayProps) {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isEnabled || !displayCanvasRef.current || !canvasRef.current) return;

    const interval = setInterval(() => {
      const display = displayCanvasRef.current;
      const source = canvasRef.current;

      if (display && source) {
        const ctx = display.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, display.width, display.height);
          ctx.drawImage(source, 0, 0);
        }
      }
    }, 33);

    return () => clearInterval(interval);
  }, [isEnabled, canvasRef]);

  return (
    <>
      <video ref={videoRef} className="hidden" playsInline autoPlay muted />
      <canvas ref={canvasRef} width={320} height={240} className="hidden" />

      <div className="absolute bottom-4 right-4 z-30">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-purple-500 p-3">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onToggle}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isEnabled
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600 hover:bg-gray-700"
                } text-white`}
            >
              {isEnabled ? "✋ Hand Control ON" : "🖱️ Mouse Control"}
            </button>
            {isReady && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs font-mono">
                  TRACKING
                </span>
              </div>
            )}
          </div>

          {isEnabled && (
            <div className="relative">
              <canvas
                ref={displayCanvasRef}
                width={320}
                height={240}
                className="rounded-lg border-2 border-purple-400/50 bg-black"
              />

              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-purple-500/20" />
                  ))}
                </div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-yellow-400/50" />
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-yellow-400/50" />
              </div>

              <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs font-mono space-y-1">
                {handPosition ? (
                  <>
                    <div className="text-green-400">Hand Detected</div>
                    <div className="text-yellow-300">
                      X: {handPosition.x.toFixed(2)}
                    </div>
                    {lastGesture && (
                      <div className="text-cyan-300">
                        {lastGesture.replace(/_/g, " ")}
                      </div>
                    )}
                    {isJumping && (
                      <div className="text-orange-400 font-bold animate-pulse">
                        🚀 JUMP!
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-red-400">No Hand</div>
                )}
              </div>
            </div>
          )}

          {error && isEnabled && (
            <div className="mt-2 p-2 bg-red-900/80 rounded text-xs text-red-200">
              Error: {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

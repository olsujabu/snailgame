"use client";

import React from "react";

export function PauseOverlay() {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20 pointer-events-none">
      <div className="text-center font-mono">
        <h2 className="text-6xl font-black text-yellow-300 mb-4 drop-shadow-[3px_3px_0px_#b45309]">
          PAUSED
        </h2>
        <p className="text-2xl text-white mb-2">Press ESC or P to resume</p>
        <p className="text-lg text-gray-400">
          Use mouse or arrow keys to steer
        </p>
      </div>
    </div>
  );
}

"use client";

import React from "react";

interface GameOverOverlayProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export function GameOverOverlay({
  score,
  highScore,
  onRestart,
}: GameOverOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
      <div className="text-center font-mono">
        <h2 className="text-7xl font-black text-red-500 mb-6 drop-shadow-[4px_4px_0px_#7f1d1d] animate-pulse">
          GAME OVER
        </h2>
        <div className="text-4xl text-yellow-300 mb-4">
          Final Score: {score}
        </div>
        {score === highScore && score > 0 && (
          <div className="text-3xl text-purple-400 mb-4 animate-bounce">
            🎉 NEW HIGH SCORE! 🎉
          </div>
        )}
        <button
          onClick={onRestart}
          className="mt-6 px-8 py-4 bg-green-600 text-white text-2xl font-bold rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
        >
          RESTART (ENTER)
        </button>
        <p className="text-gray-400 mt-4 text-sm">High Score: {highScore}</p>
      </div>
    </div>
  );
}

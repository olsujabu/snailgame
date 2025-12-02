"use client";

import React from "react";
import { GameState } from "@/app/types/game";
import { MAX_HEALTH } from "@/app/lib/constants";

interface HUDProps {
  score: number;
  health: number;
  combo: number;
  highScore: number;
  gameState: GameState;
  onPause: () => void;
}

export function HUD({
  score,
  health,
  combo,
  highScore,
  gameState,
  onPause,
}: HUDProps) {
  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between z-10 pointer-events-none font-mono">
      <div>
        <h1 className="text-4xl font-black text-yellow-300 drop-shadow-[2px_2px_0px_#b45309]">
          SCORE: {score}
        </h1>
        {combo > 1 && (
          <div className="text-2xl font-bold text-orange-400 drop-shadow-[1px_1px_0px_#000] animate-pulse">
            COMBO x{combo}!
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-white font-bold">HP</span>
          <div className="w-48 h-6 bg-gray-900 border-2 border-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-100"
              style={{ width: `${(health / MAX_HEALTH) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xl font-bold text-purple-300">
          HIGH SCORE: {highScore}
        </div>
        <button
          onClick={onPause}
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg pointer-events-auto hover:bg-purple-700 transition-colors"
        >
          {gameState === "paused" ? "RESUME" : "PAUSE"} (ESC)
        </button>
      </div>
    </div>
  );
}

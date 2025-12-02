"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { MAX_HEALTH } from "@/app/lib/constants";
import { GameState } from "@/app/types/game";
import { HUD } from "@/app/components/ui/HUD";
import { PauseOverlay } from "@/app/components/ui/PauseOverlay";
import { GameOverOverlay } from "@/app/components/ui/GameOverOverlay";
import { GameCanvas } from "@/app/components/game/GameCanvas";
import { HandTrackingDisplay } from "@/app/components/ui/HandTrackingDisplay";
import { useHandTracking } from "@/app/hooks/useHandTracking";

export default function SnailMailGame() {
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [combo, setCombo] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [mouseX, setMouseX] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [highScore, setHighScore] = useState(0);
  const [handControlEnabled, setHandControlEnabled] = useState(false);
  const snailRef = useRef<THREE.Group>(null);

  const {
    isReady,
    handPosition,
    videoRef,
    canvasRef,
    error,
    startTracking,
    stopTracking,
  } = useHandTracking();

  useEffect(() => {
    const stored = localStorage.getItem("snailMailHighScore");
    if (stored) {
      setHighScore(parseInt(stored, 10));
    }
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snailMailHighScore", score.toString());
    }
  }, [score, highScore]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!handControlEnabled) {
        const newMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        setMouseX(THREE.MathUtils.clamp(newMouseX, -1, 1));
      }
    },
    [handControlEnabled],
  );

  const handleToggleHandControl = useCallback(async () => {
    if (!handControlEnabled) {
      await startTracking();
      setHandControlEnabled(true);
    } else {
      stopTracking();
      setHandControlEnabled(false);
      setMouseX(0);
    }
  }, [handControlEnabled, startTracking, stopTracking]);

  useEffect(() => {
    if (handControlEnabled && handPosition) {
      setMouseX(THREE.MathUtils.clamp(handPosition.x, -1, 1));
    }
  }, [handControlEnabled, handPosition]);

  const handleRestart = useCallback(() => {
    setScore(0);
    setHealth(MAX_HEALTH);
    setCombo(0);
    setGameState("playing");
    setMouseX(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState === "playing") {
        if (e.key === "ArrowLeft" && !handControlEnabled) {
          setMouseX((prev) => Math.max(-1, prev - 0.1));
        } else if (e.key === "ArrowRight" && !handControlEnabled) {
          setMouseX((prev) => Math.min(1, prev + 0.1));
        } else if (e.key === "Escape" || e.key === "p" || e.key === "P") {
          setGameState("paused");
        }
      } else if (gameState === "paused") {
        if (e.key === "Escape" || e.key === "p" || e.key === "P") {
          setGameState("playing");
        }
      } else if (gameState === "gameOver") {
        if (e.key === "Enter" || e.key === " ") {
          handleRestart();
        }
      }
    },
    [gameState, handleRestart, handControlEnabled],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handlePause = useCallback(() => {
    setGameState(gameState === "paused" ? "playing" : "paused");
  }, [gameState]);

  return (
    <div
      className="w-full h-screen bg-black relative overflow-hidden select-none"
      onMouseMove={handleMouseMove}
    >
      <HUD
        score={score}
        health={health}
        combo={combo}
        highScore={highScore}
        gameState={gameState}
        onPause={handlePause}
      />

      {gameState === "paused" && <PauseOverlay />}

      {gameState === "gameOver" && (
        <GameOverOverlay
          score={score}
          highScore={highScore}
          onRestart={handleRestart}
        />
      )}

      <GameCanvas
        mouseX={mouseX}
        snailRef={snailRef}
        gameState={gameState}
        score={score}
        setScore={setScore}
        setHealth={setHealth}
        setLastHitTime={setLastHitTime}
        setCombo={setCombo}
        setGameState={setGameState}
        lastHitTime={lastHitTime}
      />

      <HandTrackingDisplay
        canvasRef={canvasRef}
        videoRef={videoRef}
        isReady={isReady}
        handPosition={handPosition}
        onToggle={handleToggleHandControl}
        isEnabled={handControlEnabled}
        error={error}
      />
    </div>
  );
}

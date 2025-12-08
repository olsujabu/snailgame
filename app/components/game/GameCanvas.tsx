"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { GameState } from "@/app/types/game";
import { InfiniteRoad } from "./InfiniteRoad";
import { Snail } from "./Snail";
import { GameManager } from "./GameManager";
import { ChaseCamera } from "./ChaseCamera";

interface GameCanvasProps {
  mouseX: number;
  snailRef: React.RefObject<THREE.Group | null>;
  gameState: GameState;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setHealth: React.Dispatch<React.SetStateAction<number>>;
  setLastHitTime: (t: number) => void;
  setCombo: React.Dispatch<React.SetStateAction<number>>;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  lastHitTime: number;
  isJumping: boolean;
  onJump: () => void;
  onHit: () => void;
  onCollect: () => void;
}

export function GameCanvas({
  mouseX,
  snailRef,
  gameState,
  score,
  setScore,
  setHealth,
  setLastHitTime,
  setCombo,
  setGameState,
  lastHitTime,
  isJumping,
  onJump,
  onHit,
  onCollect,
}: GameCanvasProps) {
  const [isHit, setIsHit] = useState(false);
  return (
    <Canvas shadows camera={{ position: [0, 2, 6], fov: 65 }}>
      <color attach="background" args={["#1e1b4b"]} />
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow />

      <InfiniteRoad />

      <Snail
        mouseX={mouseX}
        snailRef={snailRef}
        gameState={gameState}
        isJumping={isJumping}
        isHit={isHit}
        onJump={onJump}
      />

      {gameState === "playing" && (
        <GameManager
          snailRef={snailRef}
          setScore={setScore}
          setHealth={setHealth}
          setLastHitTime={setLastHitTime}
          setCombo={setCombo}
          setGameState={setGameState}
          gameState={gameState}
          score={score}
          setIsHit={setIsHit}
          onHit={onHit}
          onCollect={onCollect}
        />
      )}

      <ChaseCamera snailRef={snailRef} shakeTime={lastHitTime} />
    </Canvas>
  );
}

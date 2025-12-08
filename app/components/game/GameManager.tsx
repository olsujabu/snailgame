"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import {
  GameItem,
  GameState,
  CollectEffect,
  ScorePopup,
} from "@/app/types/game";
import {
  BASE_GAME_SPEED,
  SPEED_INCREMENT,
  BASE_SPAWN_INTERVAL,
  MIN_SPAWN_INTERVAL,
  COLLISION_RADIUS,
  MAIL_SCORE,
  SALT_DAMAGE,
  COMBO_TIMEOUT,
  COMBO_MULTIPLIER,
  LANE_WIDTH,
} from "@/app/lib/constants";
import { GameItemMesh } from "./GameItem";
import { CollectionParticles } from "../effects/CollectionParticles";
import { ScorePopupMesh } from "../effects/ScorePopup";

interface GameManagerProps {
  snailRef: React.RefObject<THREE.Group | null>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setHealth: React.Dispatch<React.SetStateAction<number>>;
  setLastHitTime: (t: number) => void;
  setCombo: React.Dispatch<React.SetStateAction<number>>;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  gameState: GameState;
  score: number;
  setIsHit: React.Dispatch<React.SetStateAction<boolean>>;
  onHit: () => void;
  onCollect: () => void;
}

export function GameManager({
  snailRef,
  setScore,
  setHealth,
  setLastHitTime,
  setCombo,
  setGameState,
  gameState,
  score,
  setIsHit,
  onHit,
  onCollect,
}: GameManagerProps) {
  const [items, setItems] = useState<GameItem[]>([]);
  const [effects, setEffects] = useState<CollectEffect[]>([]);
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const lastCollectTime = useRef<number>(0);
  const currentCombo = useRef<number>(0);

  const currentSpeed = useMemo(() => {
    return BASE_GAME_SPEED + Math.floor(score / 1000) * SPEED_INCREMENT;
  }, [score]);

  const spawnInterval = useMemo(() => {
    return Math.max(
      MIN_SPAWN_INTERVAL,
      BASE_SPAWN_INTERVAL - Math.floor(score / 500) * 50,
    );
  }, [score]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      const newItem: GameItem = {
        id: uuidv4(),
        type: Math.random() > 0.65 ? "salt" : "mail",
        x: (Math.random() - 0.5) * LANE_WIDTH,
        z: -100,
      };
      setItems((prev) => [...prev, newItem]);
    }, spawnInterval);

    return () => clearInterval(interval);
  }, [spawnInterval, gameState]);

  useFrame((state) => {
    if (!snailRef.current || gameState !== "playing") return;

    const snailX = snailRef.current.position.x;
    const snailY = snailRef.current.position.y;
    const snailZ = 0;

    // Wider collision detection zone based on current speed
    const collisionZoneMin = -currentSpeed * 2;
    const collisionZoneMax = 3;

    setItems((currentItems) => {
      return currentItems
        .map((item) => ({ ...item, z: item.z + currentSpeed }))
        .filter((item) => {
          if (item.z > collisionZoneMin && item.z < collisionZoneMax) {
            const dx = item.x - snailX;
            const dz = item.z - snailZ;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < COLLISION_RADIUS) {
              const now = state.clock.elapsedTime;

              if (item.type === "mail") {
                const timeSinceLastCollect = now - lastCollectTime.current;

                if (timeSinceLastCollect < COMBO_TIMEOUT / 1000) {
                  currentCombo.current += 1;
                } else {
                  currentCombo.current = 1;
                }

                lastCollectTime.current = now;
                const comboBonus = Math.floor(
                  MAIL_SCORE * currentCombo.current * COMBO_MULTIPLIER,
                );
                const totalPoints = MAIL_SCORE + comboBonus;

                setScore((s) => s + totalPoints);
                setCombo(currentCombo.current);
                onCollect();

                setEffects((prev) => [
                  ...prev,
                  {
                    id: uuidv4(),
                    x: item.x,
                    y: 0.5,
                    z: item.z,
                    type: "mail",
                    createdAt: now,
                  },
                ]);

                setPopups((prev) => [
                  ...prev,
                  {
                    id: uuidv4(),
                    value: totalPoints,
                    x: item.x,
                    y: 1,
                    z: item.z,
                    createdAt: now,
                  },
                ]);
              } else if (item.type === "salt") {
                // Skip collision if snail is jumping high enough
                if (snailY > 1.5) {
                  return true; // Keep the item, snail jumped over it
                }

                setHealth((h) => {
                  const newHealth = Math.max(0, h - SALT_DAMAGE);
                  if (newHealth === 0) {
                    setGameState("gameOver");
                  }
                  return newHealth;
                });
                setLastHitTime(now + 0.5);
                setIsHit(true);
                setTimeout(() => setIsHit(false), 300);
                onHit();
                currentCombo.current = 0;
                setCombo(0);

                setEffects((prev) => [
                  ...prev,
                  {
                    id: uuidv4(),
                    x: item.x,
                    y: 0.5,
                    z: item.z,
                    type: "salt",
                    createdAt: now,
                  },
                ]);
              }
              return false;
            }
          }
          return item.z < 10;
        });
    });

    setEffects((prev) =>
      prev.filter((e) => state.clock.elapsedTime - e.createdAt < 1.5),
    );
    setPopups((prev) =>
      prev.filter((p) => state.clock.elapsedTime - p.createdAt < 1.5),
    );
  });

  return (
    <>
      {items.map((item) => (
        <GameItemMesh key={item.id} item={item} />
      ))}
      {effects.map((effect) => (
        <CollectionParticles key={effect.id} effect={effect} />
      ))}
      {popups.map((popup) => (
        <ScorePopupMesh key={popup.id} popup={popup} />
      ))}
    </>
  );
}

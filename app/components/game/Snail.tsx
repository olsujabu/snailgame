"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail } from "@react-three/drei";
import * as THREE from "three";
import { LANE_WIDTH, SNAIL_STEERING_SPEED } from "@/app/lib/constants";
import { GameState } from "@/app/types/game";

export function Snail({
  mouseX,
  snailRef,
  gameState,
  isJumping,
  isHit,
  onJump,
}: {
  mouseX: number;
  snailRef: React.RefObject<THREE.Group | null>;
  gameState: GameState;
  isJumping?: boolean;
  isHit?: boolean;
  onJump?: () => void;
}) {
  const jumpStateRef = useRef({ isJumping: false, startTime: 0 });
  const hitStartTimeRef = useRef(0);

  useFrame((state) => {
    if (!snailRef.current || gameState !== "playing") return;

    const currentMouseX = mouseX;
    const targetX = currentMouseX * (LANE_WIDTH / 2);

    snailRef.current.position.x = THREE.MathUtils.lerp(
      snailRef.current.position.x,
      targetX,
      SNAIL_STEERING_SPEED,
    );

    // Jump animation with arc trajectory
    if (isJumping && !jumpStateRef.current.isJumping) {
      jumpStateRef.current.isJumping = true;
      jumpStateRef.current.startTime = state.clock.elapsedTime;
      if (onJump) onJump();
    }

    let baseY = 0.5;
    let jumpRotation = 0;

    if (jumpStateRef.current.isJumping) {
      const jumpDuration = 0.6;
      const elapsed = state.clock.elapsedTime - jumpStateRef.current.startTime;
      const progress = Math.min(elapsed / jumpDuration, 1);

      if (progress < 1) {
        // Parabolic arc for jump
        const jumpHeight = 2.5;
        baseY = 0.5 + jumpHeight * Math.sin(progress * Math.PI);
        // Forward rotation during jump
        jumpRotation = Math.sin(progress * Math.PI) * 0.4;
      } else {
        jumpStateRef.current.isJumping = false;
      }
    }

    // Hit animation - shake and flash
    if (isHit) {
      hitStartTimeRef.current = state.clock.elapsedTime;
    }

    const hitElapsed = state.clock.elapsedTime - hitStartTimeRef.current;
    let shakeX = 0;
    let shakeZ = 0;
    let shakePosX = 0;
    let shakePosY = 0;

    if (hitElapsed < 0.4) {
      const shakeIntensity = 0.5 * (1 - hitElapsed / 0.4);
      shakeX = Math.sin(hitElapsed * 60) * shakeIntensity;
      shakeZ = Math.cos(hitElapsed * 60) * shakeIntensity;
      shakePosX = Math.sin(hitElapsed * 80) * 0.3 * (1 - hitElapsed / 0.4);
      shakePosY = Math.abs(Math.sin(hitElapsed * 100)) * 0.15 * (1 - hitElapsed / 0.4);
    }

    snailRef.current.position.y =
      baseY + Math.sin(state.clock.elapsedTime * 15) * 0.05 + shakePosY;
    snailRef.current.position.x = THREE.MathUtils.lerp(
      snailRef.current.position.x,
      targetX + shakePosX,
      SNAIL_STEERING_SPEED,
    );

    const tilt = (snailRef.current.position.x - targetX) * -2;
    snailRef.current.rotation.z = THREE.MathUtils.lerp(
      snailRef.current.rotation.z,
      tilt + shakeZ,
      0.15,
    );
    snailRef.current.rotation.y = THREE.MathUtils.lerp(
      snailRef.current.rotation.y,
      tilt * 0.5 + shakeZ,
      0.15,
    );
    snailRef.current.rotation.x = THREE.MathUtils.lerp(
      snailRef.current.rotation.x,
      jumpRotation + shakeX,
      0.2,
    );
  });

  return (
    <group ref={snailRef} position={[0, 0.5, 0]}>
      <Trail
        width={1.5}
        length={8}
        color={"#86efac"}
        attenuation={(t) => t * t}
      >
        <mesh position={[0, 0.2, 0]}>
          <capsuleGeometry args={[0.35, 1.1, 4, 8]} />
          <meshToonMaterial color="#a855f7" />
        </mesh>
      </Trail>

      <mesh position={[0, 0.6, 0.3]} castShadow>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshToonMaterial color="#fb923c" />
        <mesh position={[0, 0, 0.55]} scale={0.6}>
          <torusGeometry args={[0.5, 0.1, 16, 100]} />
          <meshToonMaterial color="#7c2d12" />
        </mesh>
      </mesh>

      <group position={[0, 0.8, -0.4]} rotation={[0.5, 0, 0]}>
        <mesh position={[0.2, 0.3, 0]}>
          <capsuleGeometry args={[0.08, 0.4]} />
          <meshToonMaterial color="#a855f7" />
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.12]} />
            <meshBasicMaterial color="white" />
            <mesh position={[0, 0.25, -0.08]}>
              <sphereGeometry args={[0.04]} />
              <meshBasicMaterial color="black" />
            </mesh>
          </mesh>
        </mesh>

        <mesh position={[-0.2, 0.3, 0]}>
          <capsuleGeometry args={[0.08, 0.4]} />
          <meshToonMaterial color="#a855f7" />
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.12]} />
            <meshBasicMaterial color="white" />
            <mesh position={[0, 0.25, -0.08]}>
              <sphereGeometry args={[0.04]} />
              <meshBasicMaterial color="black" />
            </mesh>
          </mesh>
        </mesh>
      </group>
    </group>
  );
}

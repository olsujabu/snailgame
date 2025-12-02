"use client";

import React from "react";
import { useFrame } from "@react-three/fiber";
import { Trail } from "@react-three/drei";
import * as THREE from "three";
import { LANE_WIDTH, SNAIL_STEERING_SPEED } from "@/app/lib/constants";
import { GameState } from "@/app/types/game";

export function Snail({
  mouseX,
  snailRef,
  gameState,
}: {
  mouseX: number;
  snailRef: React.RefObject<THREE.Group | null>;
  gameState: GameState;
}) {
  useFrame((state) => {
    if (!snailRef.current || gameState !== "playing") return;

    const currentMouseX = mouseX;
    const targetX = currentMouseX * (LANE_WIDTH / 2);

    snailRef.current.position.x = THREE.MathUtils.lerp(
      snailRef.current.position.x,
      targetX,
      SNAIL_STEERING_SPEED,
    );

    snailRef.current.position.y =
      0.5 + Math.sin(state.clock.elapsedTime * 15) * 0.05;

    const tilt = (snailRef.current.position.x - targetX) * -2;
    snailRef.current.rotation.z = THREE.MathUtils.lerp(
      snailRef.current.rotation.z,
      tilt,
      0.1,
    );
    snailRef.current.rotation.y = THREE.MathUtils.lerp(
      snailRef.current.rotation.y,
      tilt * 0.5,
      0.1,
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

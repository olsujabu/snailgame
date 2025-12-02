"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GameItem } from "@/app/types/game";

export function GameItemMesh({ item }: { item: GameItem }) {
  const mesh = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.02;
      mesh.current.position.y =
        0.5 + Math.sin(state.clock.elapsedTime * 3 + item.x) * 0.2;
    }
  });

  if (item.type === "salt") {
    return (
      <group ref={mesh} position={[item.x, 0, item.z]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 1, 16]} />
          <meshPhysicalMaterial
            color="white"
            transmission={0.5}
            roughness={0}
            thickness={1}
          />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.2, 16]} />
          <meshToonMaterial color="#ef4444" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={mesh} position={[item.x, 0.5, item.z]}>
      <mesh rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.1]} />
        <meshToonMaterial color="#facc15" />
      </mesh>
      <mesh position={[0, 0.15, 0.06]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.2, 0.2, 4]} />
        <meshToonMaterial color="#fde047" />
      </mesh>
    </group>
  );
}

"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CollectEffect } from "@/app/types/game";

export function CollectionParticles({ effect }: { effect: CollectEffect }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const age = state.clock.elapsedTime - effect.createdAt;

    if (age > 1) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.scale.setScalar(1 + age * 2);
      groupRef.current.position.y = effect.y + age * 2;
    }
  });

  return (
    <group ref={groupRef} position={[effect.x, effect.y, effect.z]}></group>
  );
}

"use client";

import React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export function ChaseCamera({
  snailRef,
  shakeTime,
}: {
  snailRef: React.RefObject<THREE.Group | null>;
  shakeTime: number;
}) {
  const { camera } = useThree();
  const offset = new THREE.Vector3(0, 2, 5.5);
  const shakeIntensity = 0.2;

  useFrame((state) => {
    if (!snailRef.current) return;

    const targetPos = snailRef.current.position;
    const desiredPosition = targetPos.clone().add(offset);

    const shakeOffset = new THREE.Vector3(0, 0, 0);
    if (state.clock.elapsedTime < shakeTime) {
      const shakeFactor = shakeTime - state.clock.elapsedTime;
      shakeOffset.x = (Math.random() - 0.5) * shakeIntensity * shakeFactor;
      shakeOffset.y = (Math.random() - 0.5) * shakeIntensity * shakeFactor;
    }

    camera.position.lerp(desiredPosition.add(shakeOffset), 0.1);
    camera.lookAt(targetPos.x, targetPos.y + 0.5, targetPos.z - 5);
  });

  return null;
}

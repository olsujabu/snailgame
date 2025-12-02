"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScorePopup } from "@/app/types/game";

export function ScorePopupMesh({ popup }: { popup: ScorePopup }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.SpriteMaterial>(null);

  // Generate a canvas texture with the score value
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "bold 72px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Glow / stroke
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 12;
      ctx.strokeText(`+${popup.value}`, canvas.width / 2, canvas.height / 2);

      // Fill
      ctx.fillStyle = "#fde047";
      ctx.fillText(`+${popup.value}`, canvas.width / 2, canvas.height / 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [popup.value]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const age = state.clock.elapsedTime - popup.createdAt;
    if (age > 1) {
      groupRef.current.visible = false;
      return;
    }
    // Rise and slight scale
    groupRef.current.position.set(popup.x, popup.y + age * 3, popup.z);
    const scale = 1 + age * 0.5;
    groupRef.current.scale.set(scale, scale, scale);

    // Fade out
    if (materialRef.current) {
      materialRef.current.opacity = 1 - age;
    }

    // Face camera (billboard)
    const camera = state.camera;
    groupRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <group ref={groupRef} position={[popup.x, popup.y, popup.z]}>
      <sprite>
        <spriteMaterial
          ref={materialRef}
          map={texture}
          transparent
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}

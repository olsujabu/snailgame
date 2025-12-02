"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  LANE_WIDTH,
  BASE_GAME_SPEED,
  SEGMENT_COUNT,
  SEGMENT_LENGTH,
} from "@/app/lib/constants";

function RoadSegment({ z, colorIndex }: { z: number; colorIndex: number }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.position.z += BASE_GAME_SPEED + delta * 10;

    // Recycle only after the entire segment has passed to avoid visible gaps
    if (group.current.position.z > SEGMENT_LENGTH) {
      group.current.position.z -= SEGMENT_COUNT * SEGMENT_LENGTH;
    }
  });

  const isAlt = colorIndex % 2 === 0;
  const floorColor = isAlt ? "#4c1d95" : "#5b21b6";

  return (
    <group ref={group} position={[0, -1, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LANE_WIDTH + 4, SEGMENT_LENGTH]} />
        <meshToonMaterial color={floorColor} />
      </mesh>

      {/* Side rails adjusted to full length so they connect without gaps */}
      <mesh position={[-(LANE_WIDTH / 2 + 1), 1, 0]}>
        <boxGeometry args={[0.5, 2, SEGMENT_LENGTH]} />
        <meshToonMaterial color="#c084fc" />
      </mesh>
      <mesh position={[LANE_WIDTH / 2 + 1, 1, 0]}>
        <boxGeometry args={[0.5, 2, SEGMENT_LENGTH]} />
        <meshToonMaterial color="#c084fc" />
      </mesh>
    </group>
  );
}

export function InfiniteRoad() {
  const segments = useMemo(() => {
    return new Array(SEGMENT_COUNT).fill(0).map((_, i) => ({
      z: -i * SEGMENT_LENGTH,
      index: i,
    }));
  }, []);

  return (
    <group>
      {segments.map((s) => (
        <RoadSegment key={s.index} z={s.z} colorIndex={s.index} />
      ))}
    </group>
  );
}

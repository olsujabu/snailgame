// Game Types
export type GameItem = {
  id: string;
  type: "mail" | "salt";
  x: number;
  z: number;
};

export type GameState = "playing" | "paused" | "gameOver";

export type CollectEffect = {
  id: string;
  x: number;
  y: number;
  z: number;
  type: "mail" | "salt";
  createdAt: number;
};

export type ScorePopup = {
  id: string;
  value: number;
  x: number;
  y: number;
  z: number;
  createdAt: number;
};

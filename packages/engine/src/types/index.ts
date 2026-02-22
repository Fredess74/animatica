export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Transform {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}

export interface Actor {
  id: string;
  name: string;
  type: string;
  transform: Transform;
  isActive: boolean;
  [key: string]: unknown;
}

export interface Environment {
  id: string;
  name: string;
  skyColor?: string;
  groundColor?: string;
  fogDensity?: number;
}

export interface Timeline {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  frameRate: number;
}

export interface ProjectState {
  actors: Actor[];
  environment: Environment;
  timeline: Timeline;
}

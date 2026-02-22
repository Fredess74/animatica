import { useSceneStore } from '../store/sceneStore';

export class PlaybackController {
  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  private speed: number = 1.0;

  constructor() {
    this.tick = this.tick.bind(this);
  }

  public play(): void {
    const { isPlaying } = useSceneStore.getState().timeline;
    if (isPlaying) return;

    useSceneStore.getState().setTimeline({ isPlaying: true });
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  public pause(): void {
    useSceneStore.getState().setTimeline({ isPlaying: false });
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public seek(time: number): void {
    const { duration } = useSceneStore.getState().timeline;
    // Clamp time to [0, duration]
    const clampedTime = Math.max(0, Math.min(time, duration));
    useSceneStore.getState().setTimeline({ currentTime: clampedTime });
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public getSpeed(): number {
    return this.speed;
  }

  private tick(timestamp: number): void {
    const { timeline, setTimeline } = useSceneStore.getState();
    const { currentTime, duration, isPlaying } = timeline;

    if (!isPlaying) {
      this.pause();
      return;
    }

    const deltaTime = (timestamp - this.lastFrameTime) / 1000; // ms to seconds
    this.lastFrameTime = timestamp;

    let nextTime = currentTime + deltaTime * this.speed;

    // Loop logic: if we pass duration, wrap around
    if (nextTime >= duration) {
      nextTime = nextTime % duration;
    } else if (nextTime < 0) {
      // Handle reverse playback if speed is negative
       nextTime = duration + (nextTime % duration);
    }

    setTimeline({ currentTime: nextTime });

    this.rafId = requestAnimationFrame(this.tick);
  }
}

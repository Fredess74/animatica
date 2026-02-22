import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PlaybackController } from './PlaybackController';
import { useSceneStore } from '../store/sceneStore';

// Mock requestAnimationFrame and performance.now
const originalRAF = globalThis.requestAnimationFrame;
const originalCAF = globalThis.cancelAnimationFrame;
// @ts-ignore
const originalNow = globalThis.performance?.now;

describe('PlaybackController', () => {
  let controller: PlaybackController;
  let rafCallback: ((time: number) => void) | null = null;
  let currentTime = 0;

  beforeEach(() => {
    // Reset store
    useSceneStore.setState({
      timeline: {
        currentTime: 0,
        duration: 10,
        isPlaying: false,
        frameRate: 30,
        cameraTrack: [],
        animationTracks: [],
      }
    });

    // Mock RAF
    rafCallback = null;
    (globalThis as any).requestAnimationFrame = (cb: (time: number) => void) => {
      rafCallback = cb;
      return 1;
    };
    (globalThis as any).cancelAnimationFrame = () => {
      rafCallback = null;
    };

    // Mock performance.now
    currentTime = 1000;
    // @ts-ignore
    if (!globalThis.performance) { (globalThis as any).performance = {}; }
    // @ts-ignore
    globalThis.performance.now = () => currentTime;

    controller = new PlaybackController();
  });

  afterEach(() => {
    (globalThis as any).requestAnimationFrame = originalRAF;
    (globalThis as any).cancelAnimationFrame = originalCAF;
    // @ts-ignore
    if (originalNow) globalThis.performance.now = originalNow;
  });

  it('starts playback when play() is called', () => {
    controller.play();
    const state = useSceneStore.getState();
    expect(state.timeline.isPlaying).toBe(true);
    expect(rafCallback).toBeDefined();
  });

  it('stops playback when pause() is called', () => {
    controller.play();
    controller.pause();
    const state = useSceneStore.getState();
    expect(state.timeline.isPlaying).toBe(false);
    expect(rafCallback).toBeNull(); // Should be cancelled
  });

  it('updates currentTime during playback', () => {
    controller.play();
    expect(rafCallback).toBeDefined();

    // Advance time by 1 second (1000ms)
    currentTime += 1000;

    // Execute the callback
    if (rafCallback) rafCallback(currentTime);

    const state = useSceneStore.getState();
    expect(state.timeline.currentTime).toBe(1); // 0 + 1 * 1.0 = 1
  });

  it('respects playback speed', () => {
    controller.setSpeed(2.0);
    controller.play();

    // Advance time by 1 second
    currentTime += 1000;
    if (rafCallback) rafCallback(currentTime);

    const state = useSceneStore.getState();
    expect(state.timeline.currentTime).toBe(2); // 0 + 1 * 2.0 = 2
  });

  it('loops when reaching duration', () => {
    // Set duration to 5 using setState which merges
    useSceneStore.setState((state) => ({
        timeline: { ...state.timeline, duration: 5 }
    }));

    controller.play();

    // Advance time by 6 seconds
    currentTime += 6000;
    if (rafCallback) rafCallback(currentTime);

    const state = useSceneStore.getState();
    expect(state.timeline.currentTime).toBeCloseTo(1); // 6 % 5 = 1
  });

  it('seeks to specific time', () => {
    controller.seek(5);
    const state = useSceneStore.getState();
    expect(state.timeline.currentTime).toBe(5);
  });

  it('clamps seek time to duration', () => {
    controller.seek(15); // Duration is 10
    const state = useSceneStore.getState();
    expect(state.timeline.currentTime).toBe(10);

    controller.seek(-5);
    expect(useSceneStore.getState().timeline.currentTime).toBe(0);
  });
});

/**
 * PlaybackSystem — Drives the animation loop via R3F's useFrame.
 * This component should be mounted inside the Canvas (e.g., in SceneManager).
 * It reads playback state from the store and updates currentTime.
 *
 * @module @animatica/engine/playback/PlaybackSystem
 */
import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useSceneStore } from '../store/sceneStore';

export const PlaybackSystem: React.FC = () => {
    // We don't subscribe to specific values via hooks here to avoid re-rendering THIS component.
    // Instead, we read state directly inside useFrame for performance.
    // But useFrame runs every frame, so that's fine.

    useFrame((_, delta) => {
        const state = useSceneStore.getState();
        const { isPlaying, speed, loop, currentTime } = state.playback;
        const { duration } = state.timeline;

        if (!isPlaying) return;

        // Calculate new time
        // delta is in seconds
        const deltaSec = delta * speed;
        let newTime = currentTime + deltaSec;

        // Handle end of timeline
        if (newTime >= duration) {
            if (loop) {
                newTime = newTime % duration;
            } else {
                newTime = duration;
                // Auto-pause at end
                state.setPlayback({ currentTime: newTime, isPlaying: false });
                return;
            }
        }

        // Only update if time changed significantly to avoid floating point noise
        if (Math.abs(newTime - currentTime) > 0.000001) {
             state.setPlayback({ currentTime: newTime });
        }
    });

    return null;
};

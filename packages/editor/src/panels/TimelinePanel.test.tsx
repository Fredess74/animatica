// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TimelinePanel } from './TimelinePanel';

// Define mocks using vi.hoisted to avoid hoisting issues
const { mockUseSceneStore, mockUsePlayback, mockState, mockSetTimeline, mockPlay, mockPause, mockStop, mockSeek } = vi.hoisted(() => {
    const setTimeline = vi.fn();
    const setPlayback = vi.fn();
    const play = vi.fn();
    const pause = vi.fn();
    const stop = vi.fn();
    const seek = vi.fn();

    const state = {
        playback: { currentTime: 0, isPlaying: false, frameRate: 24 },
        timeline: { duration: 10, animationTracks: [] as any[] },
        actors: [] as any[],
        selectedActorId: null as string | null,
        setTimeline,
        setPlayback,
    };

    const useSceneStore = vi.fn((selector: any) => selector(state));
    // @ts-ignore
    useSceneStore.getState = () => state;

    const usePlayback = vi.fn(() => ({
        play,
        pause,
        stop,
        seek,
        toggle: vi.fn(),
        setSpeed: vi.fn(),
    }));

    return {
        mockUseSceneStore: useSceneStore,
        mockUsePlayback: usePlayback,
        mockState: state,
        mockSetTimeline: setTimeline,
        mockSetPlayback: setPlayback,
        mockPlay: play,
        mockPause: pause,
        mockStop: stop,
        mockSeek: seek,
    };
});

vi.mock('@Animatica/engine', () => ({
    useSceneStore: mockUseSceneStore,
    usePlayback: mockUsePlayback,
}));

// Mock translation
vi.mock('../i18n/useTranslation', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe('TimelinePanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset state
        mockState.playback.currentTime = 0;
        mockState.playback.isPlaying = false;
        mockState.timeline.duration = 10;
        mockState.timeline.animationTracks = [];
        mockState.actors = [];
        mockState.selectedActorId = null;
    });

    afterEach(() => {
        cleanup();
    });

    it('renders transport controls and duration', () => {
        render(<TimelinePanel selectedActorId={null} />);
        expect(screen.getByTitle('timeline.play')).toBeTruthy();
        expect(screen.getByTitle('timeline.stop')).toBeTruthy();
        // formatTime(0) -> 00:00:00
        expect(screen.getByText('00:00:00')).toBeTruthy();
        // formatTime(10) -> 00:10:00 (0 mins, 10 secs, 0 frames)
        expect(screen.getByText('00:10:00')).toBeTruthy();
    });

    it('toggles play/pause using usePlayback', () => {
        render(<TimelinePanel selectedActorId={null} />);

        const playBtn = screen.getByTitle('timeline.play');
        fireEvent.click(playBtn);
        expect(mockPlay).toHaveBeenCalled();

        // Simulate playing state
        mockState.playback.isPlaying = true;
        // Force re-render by unmounting and remounting or using rerender
        cleanup();
        render(<TimelinePanel selectedActorId={null} />);

        const pauseBtn = screen.getByTitle('timeline.pause');
        expect(pauseBtn).toBeTruthy();
        fireEvent.click(pauseBtn);
        expect(mockPause).toHaveBeenCalled();
    });

    it('stops playback using usePlayback', () => {
        mockState.playback.isPlaying = true;
        render(<TimelinePanel selectedActorId={null} />);

        const stopBtn = screen.getByTitle('timeline.stop');
        fireEvent.click(stopBtn);
        expect(mockStop).toHaveBeenCalled();
    });

    it('updates duration via store', () => {
        render(<TimelinePanel selectedActorId={null} />);
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '30' } });
        expect(mockSetTimeline).toHaveBeenCalledWith({ duration: 30 });
    });

    it('seeks when scrubber changes', () => {
        render(<TimelinePanel selectedActorId={null} />);
        // Find input by type range
        const slider = document.querySelector('input[type="range"]');
        expect(slider).toBeTruthy();
        if (slider) {
            fireEvent.change(slider, { target: { value: '5' } });
            expect(mockSeek).toHaveBeenCalledWith(5);
        }
    });

    it('renders tracks for selected actor', () => {
        const actorId = 'actor-1';
        mockState.selectedActorId = actorId;
        mockState.actors = [{ id: actorId, name: 'Cube', type: 'primitive' } as any];

        render(<TimelinePanel selectedActorId={actorId} />);

        // We expect property names to be rendered
        // Since we haven't implemented it yet, this test will fail until we do.
        // We look for 'Position' or similar.
        // The implementation will use translation keys like 'properties.transform.position'
        // Since we mocked t => key, we look for 'properties.transform.position'
        // Or if we hardcode labels:
        expect(screen.getByText(/position/i)).toBeTruthy();
        expect(screen.getByText(/rotation/i)).toBeTruthy();
        expect(screen.getByText(/scale/i)).toBeTruthy();
    });

    it('adds keyframe when button clicked', () => {
        const actorId = 'actor-1';
        mockState.selectedActorId = actorId;
        mockState.actors = [{
            id: actorId,
            name: 'Cube',
            type: 'primitive',
            transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }
        } as any];
        mockState.playback.currentTime = 2;

        render(<TimelinePanel selectedActorId={actorId} />);

        const addKeyframeBtn = screen.getByTitle('timeline.addKeyframe');
        fireEvent.click(addKeyframeBtn);

        expect(mockSetTimeline).toHaveBeenCalled();
        const callArgs = mockSetTimeline.mock.calls[0][0];
        expect(callArgs.animationTracks).toBeDefined();
        // We expect 3 tracks (pos, rot, scale) with 1 keyframe each
        expect(callArgs.animationTracks.length).toBeGreaterThanOrEqual(1);
    });

    it('shows context menu on right click', () => {
        const actorId = 'actor-1';
        mockState.selectedActorId = actorId;
        const initialKf = { time: 2, value: 0 };
        mockState.timeline.animationTracks = [{
            targetId: actorId,
            property: 'transform.position',
            keyframes: [initialKf]
        }];
        mockState.actors = [{ id: actorId, name: 'Cube', type: 'primitive' } as any];

        render(<TimelinePanel selectedActorId={actorId} />);

        const keyframes = screen.getAllByText('◆');
        const keyframe = keyframes[0];
        fireEvent.contextMenu(keyframe);

        expect(screen.getByText('timeline.deleteKeyframe')).toBeTruthy();
    });

    it('deletes keyframe', () => {
        const actorId = 'actor-1';
        mockState.selectedActorId = actorId;
        const initialKf = { time: 2, value: 0 };
        mockState.timeline.animationTracks = [{
            targetId: actorId,
            property: 'transform.position',
            keyframes: [initialKf]
        }];
        mockState.actors = [{ id: actorId, name: 'Cube', type: 'primitive' } as any];

        render(<TimelinePanel selectedActorId={actorId} />);

        const keyframes = screen.getAllByText('◆');
        const keyframe = keyframes[0];
        fireEvent.contextMenu(keyframe);

        const deleteBtn = screen.getByText('timeline.deleteKeyframe');
        fireEvent.click(deleteBtn);

        expect(mockSetTimeline).toHaveBeenCalled();
        // Verify keyframe removed in call args
        const callArgs = mockSetTimeline.mock.calls[0][0];
        const track = callArgs.animationTracks.find((t: any) => t.property === 'transform.position');
        expect(track.keyframes.length).toBe(0);
    });

    it('copies and pastes keyframe', () => {
        const actorId = 'actor-1';
        mockState.selectedActorId = actorId;
        const initialKf = { time: 2, value: 10 };
        mockState.timeline.animationTracks = [{
            targetId: actorId,
            property: 'transform.position',
            keyframes: [initialKf]
        }];
        mockState.actors = [{ id: actorId, name: 'Cube', type: 'primitive' } as any];
        mockState.timeline.duration = 10;

        render(<TimelinePanel selectedActorId={actorId} />);

        // Copy
        const keyframes = screen.getAllByText('◆');
        const keyframe = keyframes[0];
        fireEvent.contextMenu(keyframe);

        const copyBtn = screen.getByText('timeline.copyKeyframe');
        fireEvent.click(copyBtn);

        // Paste
        const lanes = document.querySelectorAll('.timeline-track__lane');
        const lane = lanes[0];

        // Mock getBoundingClientRect
        const scrubber = document.querySelector('.timeline-scrubber');
        if (scrubber) {
            vi.spyOn(scrubber, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                top: 0,
                width: 1000,
                height: 50,
                right: 1000,
                bottom: 50,
                x: 0,
                y: 0,
                toJSON: () => {}
            });
        }

        // Click at 500px -> 50% of 10s = 5s
        fireEvent.contextMenu(lane, { clientX: 500, clientY: 0 });

        const pasteBtn = screen.getByText('timeline.pasteKeyframe');
        fireEvent.click(pasteBtn);

        expect(mockSetTimeline).toHaveBeenCalled();
        const callArgs = mockSetTimeline.mock.calls[0][0];
        const track = callArgs.animationTracks[0];
        expect(track.keyframes.length).toBe(2);
        // We expect the new keyframe to be around 5s
        const newKf = track.keyframes.find((k: any) => k.time !== 2);
        expect(newKf).toBeDefined();
        expect(Math.abs(newKf.time - 5)).toBeLessThan(0.1);
        expect(newKf.value).toBe(10);
    });

    it('renders custom tracks', () => {
        const actorId = 'actor-1';
        mockState.selectedActorId = actorId;
        mockState.timeline.animationTracks = [{
            targetId: actorId,
            property: 'custom.property',
            keyframes: []
        }];
        mockState.actors = [{ id: actorId, name: 'Cube', type: 'primitive' } as any];

        render(<TimelinePanel selectedActorId={actorId} />);

        // Use t(label) -> key. So 'custom.property' should be rendered as is if t returns key
        expect(screen.getByText('custom.property')).toBeTruthy();
    });
});

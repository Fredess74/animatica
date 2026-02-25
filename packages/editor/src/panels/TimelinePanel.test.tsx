// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TimelinePanel } from './TimelinePanel';
import { useSceneStore, usePlayback } from '@Animatica/engine';

// Mock useTranslation
vi.mock('../i18n/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'timeline.seconds') return `${options?.count ?? 0}s`;
            return key;
        },
        i18n: { language: 'en', changeLanguage: vi.fn() }
    }),
}));

// Mock @Animatica/engine
vi.mock('@Animatica/engine', () => ({
    useSceneStore: vi.fn(),
    usePlayback: vi.fn(),
    evaluateTracksAtTime: vi.fn().mockReturnValue(new Map()),
}));

describe('TimelinePanel', () => {
    let mockState: any;
    let mockPlayback: any;
    let mockSetTimeline: any;

    beforeEach(() => {
        mockSetTimeline = vi.fn();
        mockState = {
            playback: { isPlaying: false, currentTime: 0 },
            timeline: { duration: 10, animationTracks: [] },
            selectedActorId: null,
            setTimeline: mockSetTimeline,
        };

        mockPlayback = {
            play: vi.fn(),
            pause: vi.fn(),
            stop: vi.fn(),
            seek: vi.fn(),
        };

        (useSceneStore as any).mockImplementation((selector: any) => selector(mockState));
        (usePlayback as any).mockReturnValue(mockPlayback);
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders transport controls', () => {
        render(<TimelinePanel selectedActorId={null} />);
        expect(screen.getByTitle('timeline.play')).toBeTruthy();
        expect(screen.getByTitle('timeline.stop')).toBeTruthy();
        expect(screen.getByTitle('timeline.addKeyframe')).toBeTruthy();
    });

    it('toggles play/pause state based on store', () => {
        // Initial state: paused
        const { rerender } = render(<TimelinePanel selectedActorId={null} />);
        expect(screen.getByTitle('timeline.play')).toBeTruthy();

        // Update state: playing
        mockState.playback.isPlaying = true;
        rerender(<TimelinePanel selectedActorId={null} />);

        expect(screen.getByTitle('timeline.pause')).toBeTruthy();
        expect(screen.queryByTitle('timeline.play')).toBeNull();
    });

    it('calls playback controls on button click', () => {
        render(<TimelinePanel selectedActorId={null} />);

        fireEvent.click(screen.getByTitle('timeline.play'));
        expect(mockPlayback.play).toHaveBeenCalled();

        fireEvent.click(screen.getByTitle('timeline.stop'));
        expect(mockPlayback.stop).toHaveBeenCalled();
    });

    it('updates duration via setTimeline', () => {
        render(<TimelinePanel selectedActorId={null} />);
        const select = screen.getByRole('combobox'); // Duration select
        fireEvent.change(select, { target: { value: '30' } });
        expect(mockSetTimeline).toHaveBeenCalledWith({ duration: 30 });
    });

    it('shows empty state when no actor selected', () => {
        render(<TimelinePanel selectedActorId={null} />);
        expect(screen.getByText('timeline.selectActorPrompt')).toBeTruthy();
    });

    it('shows tracks when actor is selected', () => {
        mockState.selectedActorId = 'actor1';
        mockState.timeline.animationTracks = [
            { targetId: 'actor1', property: 'transform.position', keyframes: [] }
        ];
        render(<TimelinePanel selectedActorId="actor1" />);
        expect(screen.getByText('timeline.property.transform.position')).toBeTruthy();
    });

    it('renders keyframes and handles context menu', () => {
        mockState.selectedActorId = 'actor1';
        mockState.timeline.animationTracks = [
            {
                targetId: 'actor1',
                property: 'transform.position',
                keyframes: [{ time: 5, value: [0,0,0], easing: 'linear' }]
            }
        ];
        render(<TimelinePanel selectedActorId="actor1" />);

        const keyframe = screen.getByRole('button', { name: /timeline.keyframeLabel/ });
        expect(keyframe).toBeTruthy();

        // Right click
        fireEvent.contextMenu(keyframe);
        expect(screen.getByText('timeline.deleteKeyframe')).toBeTruthy();
        expect(screen.getByText('timeline.copyKeyframe')).toBeTruthy();

        // Click delete
        fireEvent.click(screen.getByText('timeline.deleteKeyframe'));

        // Should call setTimeline with updated tracks (keyframe removed)
        expect(mockSetTimeline).toHaveBeenCalled();
        const callArgs = mockSetTimeline.mock.calls[0][0];
        const updatedTrack = callArgs.animationTracks[0];
        expect(updatedTrack.keyframes.length).toBe(0);
    });

    it('handles seek via scrubber', () => {
        render(<TimelinePanel selectedActorId={null} />);
        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '5' } });
        expect(mockPlayback.seek).toHaveBeenCalledWith(5);
    });
});

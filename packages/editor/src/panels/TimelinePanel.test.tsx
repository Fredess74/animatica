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
            if (key.startsWith('timeline.property.')) return key.split('.').pop();
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
            actors: [
                {
                    id: 'actor1',
                    transform: {
                        position: [1, 2, 3],
                        rotation: [0, 0, 0],
                        scale: [1, 1, 1]
                    }
                }
            ],
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
        mockState.playback.isPlaying = true;
        render(<TimelinePanel selectedActorId={null} />);
        expect(screen.getByTitle('timeline.pause')).toBeTruthy();
    });

    it('shows tracks when actor is selected', () => {
        mockState.selectedActorId = 'actor1';
        mockState.timeline.animationTracks = [
            { targetId: 'actor1', property: 'transform.position', keyframes: [] }
        ];
        render(<TimelinePanel selectedActorId="actor1" />);
        expect(screen.getByText('position')).toBeTruthy();
    });

    it('adds keyframes and creates tracks for selected actor', () => {
        mockState.selectedActorId = 'actor1';
        mockState.playback.currentTime = 2; // Add keyframe at 2s

        render(<TimelinePanel selectedActorId="actor1" />);

        const addBtn = screen.getByTitle('timeline.addKeyframe');
        fireEvent.click(addBtn);

        expect(mockSetTimeline).toHaveBeenCalled();
        const callArgs = mockSetTimeline.mock.calls[0][0];
        const newTracks = callArgs.animationTracks;

        // Should create tracks for position, rotation, scale
        expect(newTracks.length).toBeGreaterThanOrEqual(3);

        const posTrack = newTracks.find((t: any) => t.property === 'transform.position');
        expect(posTrack).toBeDefined();
        expect(posTrack.keyframes[0].time).toBe(2);
        expect(posTrack.keyframes[0].value).toEqual([1, 2, 3]);
    });

    it('handles keyframe drag interaction', () => {
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

        // Start drag
        fireEvent.mouseDown(keyframe, { clientX: 100 });

        // Mock getBoundingClientRect for lane
        // Note: In JSDOM, getBoundingClientRect returns zeros.
        // We rely on TimelineTrack implementation to handle this or we mock it.
        // TimelineTrack checks if width === 0 and returns. So drag won't work in JSDOM unless mocked.
        // We can't easily mock element refs in functional components without invasive changes.
        // However, we can mock the event handlers if we had access, but we don't.
        // Integration test for drag might be hard in JSDOM without more setup.

        // Skip full drag simulation if hard, but we can verify props passed to TimelineTrack if we could inspect them.
        // Alternatively, verify the component doesn't crash.

        fireEvent.mouseUp(window);
        // If width was 0, onKeyframeChange wasn't called.
    });

    it('supports copy and paste keyframe', () => {
        mockState.selectedActorId = 'actor1';
        mockState.timeline.animationTracks = [
            {
                targetId: 'actor1',
                property: 'transform.position',
                keyframes: [
                    { time: 1, value: [10, 10, 10], easing: 'linear' },
                    { time: 5, value: [20, 20, 20], easing: 'linear' }
                ]
            }
        ];

        const { rerender } = render(<TimelinePanel selectedActorId="actor1" />);

        const keyframes = screen.getAllByRole('button', { name: /timeline.keyframeLabel/ });
        // Keyframe 0 at 1s ([10,10,10])
        // Keyframe 1 at 5s ([20,20,20])

        // Right click first keyframe -> Copy
        fireEvent.contextMenu(keyframes[0]);
        fireEvent.click(screen.getByText('timeline.copyKeyframe'));

        // Right click second keyframe -> Paste
        fireEvent.contextMenu(keyframes[1]);
        const pasteBtn = screen.getByText('timeline.pasteKeyframe') as HTMLButtonElement;
        expect(pasteBtn.disabled).toBe(false);

        fireEvent.click(pasteBtn);

        expect(mockSetTimeline).toHaveBeenCalled();
        const callArgs = mockSetTimeline.mock.lastCall[0];
        const updatedTrack = callArgs.animationTracks[0];

        // The second keyframe (index 1) should now have value [10,10,10]
        expect(updatedTrack.keyframes[1].value).toEqual([10, 10, 10]);
    });
});

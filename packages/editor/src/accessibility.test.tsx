// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AssetLibrary } from './panels/AssetLibrary';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { TimelinePanel } from './panels/TimelinePanel';
import { ScriptConsole } from './modals/ScriptConsole';
import { useSceneStore } from '@Animatica/engine';

// Mock dependencies
vi.mock('@Animatica/engine', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        useSceneStore: vi.fn(),
    };
});

// Mock i18n
vi.mock('./i18n/useTranslation', () => ({
    useTranslation: () => ({ t: (key: string) => key }), // Returns the key as the translation
}));

// Mock ToastContext
vi.mock('./components/ToastContext', () => ({
    useToast: () => ({ showToast: vi.fn() }),
}));

// Setup useSceneStore mock implementation
const mockStore: any = {
    actors: [],
    selectedActorId: null,
    updateActor: vi.fn(),
    addActor: vi.fn(),
};

// Simple store implementation for tests
const storeImpl = (selector: any) => selector ? selector(mockStore) : mockStore;
Object.assign(storeImpl, { getState: () => mockStore, setState: (state: any) => Object.assign(mockStore, state) });

// Apply mock
(useSceneStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(storeImpl);
Object.assign(useSceneStore, { getState: () => mockStore, setState: (state: any) => Object.assign(mockStore, state) });

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockStore.actors = [];
    mockStore.selectedActorId = null;
});

describe('Accessibility Audit', () => {

    describe('AssetLibrary', () => {
        it('has accessible category headers', () => {
            render(<AssetLibrary />);
            // Primitives is the default expanded category
            const headers = screen.getAllByRole('button').filter(b =>
                b.classList.contains('asset-category__header')
            );

            headers.forEach(header => {
                expect(header.hasAttribute('aria-expanded')).toBe(true);
                expect(header.hasAttribute('aria-controls')).toBe(true);
            });
        });
    });

    describe('PropertiesPanel', () => {
        it('has accessible inputs for transform', () => {
            // Setup selected actor
            mockStore.actors = [{
                id: 'actor1',
                name: 'Box',
                type: 'primitive',
                transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] },
                properties: {
                    shape: 'box',
                    color: '#fff',
                    roughness: 0.5,
                    metalness: 0,
                    opacity: 1,
                    wireframe: false
                }
            }];
            mockStore.selectedActorId = 'actor1';

            render(<PropertiesPanel selectedActorId="actor1" />);

            // Check Vector3Input labels
            // We use regex to match label text or aria-label
            expect(screen.getAllByLabelText(/Position [XYZ]/).length).toBe(3);
            expect(screen.getAllByLabelText(/Rotation [XYZ]/).length).toBe(3);
            expect(screen.getAllByLabelText(/Scale [XYZ]/).length).toBe(3);
        });
    });

    describe('TimelinePanel', () => {
        it('has accessible transport controls', () => {
            render(<TimelinePanel selectedActorId={null} />);
            // timeline.play, timeline.stop are keys returned by mock t()
            expect(screen.getByLabelText('timeline.play')).toBeTruthy();
            expect(screen.getByLabelText('timeline.stop')).toBeTruthy();
        });

        it('has accessible scrubber', () => {
            render(<TimelinePanel selectedActorId={null} />);
            // The scrubber is an input[type="range"]
            const slider = screen.getByRole('slider');
            expect(slider.getAttribute('aria-label')).toBe('Timeline scrubber');
        });
    });

    describe('ScriptConsole', () => {
        it('has accessible modal elements', () => {
            render(<ScriptConsole onClose={() => {}} />);
            expect(screen.getByLabelText('Close')).toBeTruthy();
            expect(screen.getByLabelText('Script editor')).toBeTruthy();
        });
    });
});

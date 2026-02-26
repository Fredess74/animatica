// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SceneObject } from './SceneObject';
import type { Actor } from '../types';

// Mock renderers
vi.mock('./renderers/PrimitiveRenderer', () => ({
    PrimitiveRenderer: (props: any) => (
        <div data-testid="primitive-renderer" data-props={JSON.stringify(props)} />
    ),
}));
vi.mock('./renderers/LightRenderer', () => ({
    LightRenderer: (props: any) => (
        <div data-testid="light-renderer" data-props={JSON.stringify(props)} />
    ),
}));
vi.mock('./renderers/CameraRenderer', () => ({
    CameraRenderer: (props: any) => (
        <div data-testid="camera-renderer" data-props={JSON.stringify(props)} />
    ),
}));
vi.mock('./renderers/CharacterRenderer', () => ({
    CharacterRenderer: (props: any) => (
        <div data-testid="character-renderer" data-props={JSON.stringify(props)} />
    ),
}));
vi.mock('./renderers/SpeakerRenderer', () => ({
    SpeakerRenderer: (props: any) => (
        <div data-testid="speaker-renderer" data-props={JSON.stringify(props)} />
    ),
}));

describe('SceneObject', () => {
    it('renders PrimitiveRenderer for primitive actor', () => {
        const actor: Actor = { id: '1', type: 'primitive' } as any;
        render(<SceneObject actor={actor} isSelected={true} />);

        const renderer = screen.getByTestId('primitive-renderer');
        expect(renderer).toBeDefined();
        const props = JSON.parse(renderer.getAttribute('data-props') || '{}');
        expect(props.actor).toEqual(actor);
        expect(props.isSelected).toBe(true);
    });

    it('renders LightRenderer for light actor', () => {
        const actor: Actor = { id: '2', type: 'light' } as any;
        render(<SceneObject actor={actor} showHelpers={true} />);

        const renderer = screen.getByTestId('light-renderer');
        expect(renderer).toBeDefined();
        const props = JSON.parse(renderer.getAttribute('data-props') || '{}');
        expect(props.actor).toEqual(actor);
        expect(props.showHelper).toBe(true);
    });

    it('renders CameraRenderer for camera actor', () => {
        const actor: Actor = { id: '3', type: 'camera' } as any;
        render(<SceneObject actor={actor} isActiveCamera={true} />);

        const renderer = screen.getByTestId('camera-renderer');
        expect(renderer).toBeDefined();
        const props = JSON.parse(renderer.getAttribute('data-props') || '{}');
        expect(props.actor).toEqual(actor);
        expect(props.isActive).toBe(true);
    });

    it('renders CharacterRenderer for character actor', () => {
        const actor: Actor = { id: '4', type: 'character' } as any;
        render(<SceneObject actor={actor} isSelected={false} />);

        const renderer = screen.getByTestId('character-renderer');
        expect(renderer).toBeDefined();
        const props = JSON.parse(renderer.getAttribute('data-props') || '{}');
        expect(props.actor).toEqual(actor);
        expect(props.isSelected).toBe(false);
    });

    it('renders SpeakerRenderer for speaker actor', () => {
        const actor: Actor = { id: '5', type: 'speaker' } as any;
        render(<SceneObject actor={actor} showHelpers={false} />);

        const renderer = screen.getByTestId('speaker-renderer');
        expect(renderer).toBeDefined();
        const props = JSON.parse(renderer.getAttribute('data-props') || '{}');
        expect(props.actor).toEqual(actor);
        // showHelper depends on showHelpers OR isSelected. Here both are false/undefined.
        expect(props.showHelper).toBe(false);
    });

    it('returns null for unknown actor type', () => {
        const actor: Actor = { id: '6', type: 'unknown' } as any;
        const { container } = render(<SceneObject actor={actor} />);
        expect(container.firstChild).toBeNull();
    });
});

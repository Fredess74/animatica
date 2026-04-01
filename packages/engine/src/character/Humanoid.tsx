import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { createProceduralHumanoid, type CharacterRig } from './CharacterLoader';
import { parseGLBResult, glbToCharacterRig } from './GLBLoader';
import { CharacterAnimator, createIdleClip, createWalkClip } from './CharacterAnimator';

/**
 * Props for the Humanoid component.
 */
export interface HumanoidProps {
    /** URL to the GLB model. If omitted, uses procedural fallback. */
    modelUrl?: string;
    /** Initial animation state to play. Defaults to 'idle'. */
    animation?: string;
    /** Speed multiplier for the animation. */
    animationSpeed?: number;
    /** Optional skin color for procedural fallback. */
    skinColor?: string;
    /** Optional height for procedural fallback. */
    height?: number;
    /** Callback when the character rig is loaded and initialized. */
    onRigLoaded?: (rig: CharacterRig) => void;
}

/**
 * Custom hook to manage the CharacterAnimator lifecycle.
 * Handles initialization, animation updates, and disposal.
 */
function useCharacterRigAnimator(
    rig: CharacterRig,
    animation: string = 'idle',
    animationSpeed: number = 1,
    animations: THREE.AnimationClip[] = [],
    onRigLoaded?: (rig: CharacterRig) => void
) {
    const animatorRef = useRef<CharacterAnimator | null>(null);

    // Initialize animator and register clips
    useEffect(() => {
        const animator = new CharacterAnimator(rig.root);

        // Register default procedural clips
        animator.registerClip('idle', createIdleClip());
        animator.registerClip('walk', createWalkClip());

        // Register clips from GLB
        animations.forEach((clip) => {
            animator.registerClip(clip.name as any, clip);
        });

        animatorRef.current = animator;

        // Notify parent that rig is ready
        // We use a ref for onRigLoaded to avoid re-running this if the callback changes
        onRigLoaded?.(rig);

        return () => {
            animator.dispose();
            animatorRef.current = null;
        };
    }, [rig, animations]); // Only recreate when rig or GLB clips change

    // Handle animation state changes separately to allow cross-fading
    useEffect(() => {
        if (animatorRef.current) {
            animatorRef.current.play(animation as any);
        }
    }, [animation]);

    // Handle speed changes separately
    useEffect(() => {
        if (animatorRef.current) {
            animatorRef.current.setSpeed(animationSpeed);
        }
    }, [animationSpeed]);

    // Drive the mixer in the frame loop
    useFrame((_, delta) => {
        if (animatorRef.current) {
            animatorRef.current.update(delta);
        }
    });

    return animatorRef;
}

/**
 * GLBHumanoidInner — Internal component for loading and rendering GLB models.
 */
const GLBHumanoidInner: React.FC<Required<Pick<HumanoidProps, 'modelUrl'>> & HumanoidProps> = ({
    modelUrl,
    animation,
    animationSpeed,
    onRigLoaded,
}) => {
    const { scene, animations } = useGLTF(modelUrl);

    const rig = useMemo(() => {
        const result = parseGLBResult(scene, animations);
        return glbToCharacterRig(result);
    }, [scene, animations]);

    useCharacterRigAnimator(rig, animation, animationSpeed, animations, onRigLoaded);

    return <primitive object={rig.root} />;
};

/**
 * ProceduralHumanoidInner — Fallback component for rendering a procedural character.
 */
const ProceduralHumanoidInner: React.FC<HumanoidProps> = ({
    animation,
    animationSpeed,
    skinColor = '#D4A27C',
    height = 1.0,
    onRigLoaded,
}) => {
    const rig = useMemo(() => {
        return createProceduralHumanoid({ skinColor, height });
    }, [skinColor, height]);

    useCharacterRigAnimator(rig, animation, animationSpeed, [], onRigLoaded);

    return <primitive object={rig.root} />;
};

/**
 * Error boundary component to catch GLB loading failures.
 */
class GLBErrorBoundary extends React.Component<
    { fallback: React.ReactNode; children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

/**
 * Humanoid — R3F component for rendering humanoid characters.
 * Supports GLB loading with procedural fallback and built-in animation handling.
 */
export const Humanoid: React.FC<HumanoidProps> = (props) => {
    const { modelUrl } = props;

    if (!modelUrl) {
        return <ProceduralHumanoidInner {...props} />;
    }

    return (
        <GLBErrorBoundary fallback={<ProceduralHumanoidInner {...props} />}>
            <Suspense fallback={<ProceduralHumanoidInner {...props} />}>
                <GLBHumanoidInner {...props} modelUrl={modelUrl} />
            </Suspense>
        </GLBErrorBoundary>
    );
};

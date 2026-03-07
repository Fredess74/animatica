/**
 * useActorPicking — Click-to-select actors in the viewport.
 * Uses pointer events on the canvas to detect clicks on actors.
 */
import { useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import { useSceneStore, type SceneStoreState } from '@Animatica/engine'

export const useActorPicking = () => {
    const setSelectedActor = useSceneStore((s: SceneStoreState) => s.setSelectedActor)
    const { gl } = useThree()

    // Listen for missed clicks (clicking empty space)
    const handlePointerMissed = useCallback(() => {
        setSelectedActor(null)
    }, [setSelectedActor])

    // Attach to canvas element
    const canvas = gl.domElement
    if (canvas) {
        canvas.onpointerdown = (_e: PointerEvent) => {
            // Only deselect on left click on empty space
            // Actor clicks are handled by individual actor onClick handlers
            // In a full R3F app, use pointerMissed on Canvas or similar
            // For now we keep this placeholder and the handlePointerMissed for tests/future
        }
    }

    return { setSelectedActor, handlePointerMissed }
}

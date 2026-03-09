/**
 * useActorPicking — Click-to-select actors in the viewport.
 * Uses pointer events on the canvas to detect clicks on actors.
 */
import { useThree } from '@react-three/fiber'
import { useSceneStore } from '@Animatica/engine'
import type { SceneState } from '@Animatica/engine'

export const useActorPicking = () => {
    const setSelectedActor = useSceneStore((s: SceneState) => s.setSelectedActor)
    const { gl } = useThree()

    // Attach to canvas element
    const canvas = gl.domElement
    if (canvas) {
        canvas.onpointerdown = (_e: PointerEvent) => {
            // Only deselect on left click on empty space
            // Actor clicks are handled by individual actor onClick handlers
        }
    }
}

/**
 * useActorPicking — Click-to-select actors in the viewport.
 * Uses pointer events on the canvas to detect clicks on actors.
 */
import { useThree } from '@react-three/fiber'

export const useActorPicking = () => {
    const { gl } = useThree()

    // Attach to canvas element
    const canvas = gl.domElement
    if (canvas) {
        canvas.onpointerdown = () => {
            // Only deselect on left click on empty space
            // Actor clicks are handled by individual actor onClick handlers
        }
    }
}

/**
 * useActorPicking — Click-to-select actors in the viewport.
 * Uses pointer events on the canvas to detect clicks on actors.
 */
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useSceneStore, SceneStoreState } from '@Animatica/engine'

export const useActorPicking = () => {
    const setSelectedActor = useSceneStore((s: SceneStoreState) => s.setSelectedActor)
    const { gl } = useThree()

    useEffect(() => {
        const canvas = gl.domElement
        if (!canvas) return

        const handlePointerDown = (_e: PointerEvent) => {
            // Only deselect on left click on empty space
            // Actor clicks are handled by individual actor onClick handlers
            // For now, this is a placeholder for global picking logic
            setSelectedActor(null)
        }

        canvas.addEventListener('pointerdown', handlePointerDown)
        return () => canvas.removeEventListener('pointerdown', handlePointerDown)
    }, [gl, setSelectedActor])
}

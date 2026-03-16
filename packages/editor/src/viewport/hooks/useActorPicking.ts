/**
 * useActorPicking — Click-to-select actors in the viewport.
 * Uses pointer events on the canvas to detect clicks on actors.
 */
import { useSceneStore } from '@Animatica/engine'

export const useActorPicking = () => {
    const setSelectedActor = useSceneStore((s: { setSelectedActor: (id: string | null) => void }) => s.setSelectedActor)


    // Keep handlePointerMissed logic if needed for R3F onPointerMissed
    return {
        onPointerMissed: () => setSelectedActor(null)
    }
}

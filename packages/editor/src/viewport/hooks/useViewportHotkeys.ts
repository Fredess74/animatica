/**
 * useViewportHotkeys — Keyboard shortcuts for the 3D viewport.
 * Must be called inside a Canvas component.
 */
import { useEffect } from 'react'
import { useSceneStore } from '@Animatica/engine'
import type { GizmoMode } from '../Viewport'

interface HotkeyOptions {
    onGizmoModeChange: (mode: GizmoMode) => void
    onTransformSpaceToggle: () => void
}

export const useViewportHotkeys = ({
    onGizmoModeChange,
    onTransformSpaceToggle,
}: HotkeyOptions) => {
    const removeActor = useSceneStore((s: any) => s.removeActor)
    const selectedActorId = useSceneStore((s: any) => s.selectedActorId)
    const setSelectedActor = useSceneStore((s: any) => s.setSelectedActor)
    const setPlayback = useSceneStore((s: any) => s.setPlayback)
    const isPlaying = useSceneStore((s: any) => s.playback.isPlaying)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            const tag = (e.target as HTMLElement).tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

            switch (e.key.toLowerCase()) {
                // Gizmo modes
                case 'w':
                    e.preventDefault()
                    onGizmoModeChange('translate')
                    break
                case 'e':
                    e.preventDefault()
                    onGizmoModeChange('rotate')
                    break
                case 'r':
                    e.preventDefault()
                    onGizmoModeChange('scale')
                    break

                // Transform space toggle
                case 'q':
                    e.preventDefault()
                    onTransformSpaceToggle()
                    break

                // Delete selected actor
                case 'delete':
                case 'backspace':
                    if (selectedActorId) {
                        e.preventDefault()
                        removeActor(selectedActorId)
                        setSelectedActor(null)
                    }
                    break

                // Deselect
                case 'escape':
                    e.preventDefault()
                    setSelectedActor(null)
                    break

                // Play/pause toggle
                case ' ':
                    e.preventDefault()
                    setPlayback({ isPlaying: !isPlaying })
                    break

                // Undo (Ctrl+Z)
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault()
                        // zundo undo
                        const store = useSceneStore as any
                        if (store.temporal) {
                            store.temporal.getState().undo()
                        }
                    }
                    break

                // Redo (Ctrl+Shift+Z or Ctrl+Y)
                case 'y':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault()
                        const store = useSceneStore as any
                        if (store.temporal) {
                            store.temporal.getState().redo()
                        }
                    }
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [
        onGizmoModeChange,
        onTransformSpaceToggle,
        removeActor,
        selectedActorId,
        setSelectedActor,
        setPlayback,
        isPlaying,
    ])
}

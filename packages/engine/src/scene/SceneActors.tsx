import React, { useMemo, memo } from 'react';
import { useActorIds, useCameraTrack } from '../store/sceneStore';
import { SceneActorItem } from './SceneActorItem';

interface SceneActorsProps {
    selectedActorId?: string;
    onActorSelect?: (actorId: string) => void;
    showHelpers?: boolean;
}

/**
 * SceneActors — Optimally renders the list of actors.
 * Uses useActorIds to prevent re-rendering when actor properties change,
 * delegating those updates to individual SceneActorItem components.
 * This component is isolated from currentTime.
 */
export const SceneActors: React.FC<SceneActorsProps> = memo(({
    selectedActorId = undefined,
    onActorSelect,
    showHelpers = false,
}) => {
    const actorIds = useActorIds();
    const cameraTrack = useCameraTrack();

    // Sort camera cuts only when the track changes, not every frame
    const sortedCameraCuts = useMemo(
        () => [...cameraTrack].sort((a, b) => a.time - b.time),
        [cameraTrack]
    );

    return (
        <>
            {actorIds.map((id) => (
                <SceneActorItem
                    key={id}
                    id={id}
                    selectedActorId={selectedActorId ?? undefined}
                    onActorSelect={onActorSelect}
                    showHelpers={showHelpers}
                    sortedCameraCuts={sortedCameraCuts}
                />
            ))}
        </>
    );
});

SceneActors.displayName = 'SceneActors';

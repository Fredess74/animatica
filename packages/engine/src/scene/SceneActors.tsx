import React, { useMemo } from 'react';
import { useActorIds, useCurrentTime, useCameraTrack } from '../store/sceneStore';
import { resolveActiveCamera } from './animationUtils';
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
 */
export const SceneActors: React.FC<SceneActorsProps> = ({
    selectedActorId,
    onActorSelect,
    showHelpers = false,
}) => {
    const actorIds = useActorIds();
    const cameraTrack = useCameraTrack();
    const currentTime = useCurrentTime();

    // Determine the active camera from the sorted camera cuts
    const activeCameraId = useMemo(() => {
        const sortedCameraCuts = [...cameraTrack].sort((a, b) => a.time - b.time);
        return resolveActiveCamera(sortedCameraCuts, currentTime);
    }, [cameraTrack, currentTime]);

    return (
        <>
            {actorIds.map((id) => (
                <SceneActorItem
                    key={id}
                    id={id}
                    selectedActorId={selectedActorId}
                    onActorSelect={onActorSelect}
                    showHelpers={showHelpers}
                    activeCameraId={activeCameraId}
                />
            ))}
        </>
    );
};

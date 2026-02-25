import React, { useCallback, useRef } from 'react';
import { AnimationTrack } from '@Animatica/engine';
import { useTranslation } from '../i18n/useTranslation';

interface TimelineTrackProps {
    track: AnimationTrack;
    duration: number;
    onKeyframeChange: (property: string, keyframeIndex: number, newTime: number) => void;
    onKeyframeContextMenu: (e: React.MouseEvent, property: string, keyframeIndex: number) => void;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
    track,
    duration,
    onKeyframeChange,
    onKeyframeContextMenu
}) => {
    const laneRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const handleKeyframeMouseDown = useCallback((e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        e.preventDefault();

        const laneEl = laneRef.current;
        if (!laneEl) return;

        const rect = laneEl.getBoundingClientRect();
        const startX = e.clientX;
        const initialTime = track.keyframes[index].time;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const currentX = moveEvent.clientX;
            const diffX = currentX - startX;
            const width = rect.width;

            if (width === 0) return;

            // Calculate time difference based on pixel difference relative to the lane width
            const diffTime = (diffX / width) * duration;
            let newTime = initialTime + diffTime;

            // Clamp to [0, duration]
            newTime = Math.max(0, Math.min(newTime, duration));

            // Notify parent of the new time
            // The parent is responsible for updating the store, which will trigger a re-render
            onKeyframeChange(track.property, index, newTime);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [track, duration, onKeyframeChange]);

    return (
        <div className="timeline-track">
            <div className="timeline-track__label" title={track.property}>
                <span className="timeline-track__name">
                    {t(`timeline.property.${track.property}`)}
                </span>
            </div>
            <div className="timeline-track__lane" ref={laneRef}>
                {track.keyframes.map((kf, index) => {
                    const leftPercent = (kf.time / duration) * 100;
                    return (
                        <div
                            key={index}
                            className="timeline-keyframe"
                            style={{ left: `${leftPercent}%` }}
                            onMouseDown={(e) => handleKeyframeMouseDown(e, index)}
                            onContextMenu={(e) => onKeyframeContextMenu(e, track.property, index)}
                            title={`${t('timeline.time')}: ${kf.time.toFixed(2)}s\n${t('timeline.value')}: ${JSON.stringify(kf.value)}`}
                            role="button"
                            aria-label={t('timeline.keyframeLabel', { time: kf.time.toFixed(2) })}
                            tabIndex={0}
                        />
                    );
                })}
            </div>
        </div>
    );
};

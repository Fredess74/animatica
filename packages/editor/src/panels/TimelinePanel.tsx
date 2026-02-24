/**
 * TimelinePanel — Playback controls and keyframe timeline.
 * Scrubber, play/pause/stop, track list with keyframe diamonds.
 *
 * @module @animatica/editor/panels/TimelinePanel
 */
import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useSceneStore, usePlayback, AnimationTrack, Keyframe } from '@Animatica/engine';

interface TimelinePanelProps {
    selectedActorId: string | null;
}

const ANIMATABLE_PROPERTIES = [
    { label: 'Position', path: 'transform.position' },
    { label: 'Rotation', path: 'transform.rotation' },
    { label: 'Scale', path: 'transform.scale' },
];

const getValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc: any, part: string) => acc && acc[part], obj);
};

const menuItemStyle = {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px 8px'
};

export const TimelinePanel: React.FC<TimelinePanelProps> = ({ selectedActorId }) => {
    const { t } = useTranslation();
    const { play, pause, stop, seek } = usePlayback();
    const isPlaying = useSceneStore((state) => state.playback.isPlaying);
    const currentTime = useSceneStore((state) => state.playback.currentTime);
    const duration = useSceneStore((state) => state.timeline.duration);
    const animationTracks = useSceneStore((state) => state.timeline.animationTracks);
    const setTimeline = useSceneStore((state) => state.setTimeline);

    const [draggingKeyframe, setDraggingKeyframe] = useState<{
        trackProperty: string;
        keyframeIndex: number;
        startX: number;
        initialTime: number;
    } | null>(null);

    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        trackProperty: string;
        keyframeIndex: number; // -1 if clicked on track background
    } | null>(null);

    const [copiedKeyframe, setCopiedKeyframe] = useState<Keyframe | null>(null);

    const scrubberRef = useRef<HTMLDivElement>(null);

    const formatTime = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const frames = Math.floor((seconds % 1) * 30);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    }, []);

    const handlePlay = () => play();
    const handlePause = () => pause();
    const handleStop = () => stop();

    const handleAddKeyframe = useCallback(() => {
        if (!selectedActorId) return;

        const state = useSceneStore.getState();
        const actor = state.actors.find((a) => a.id === selectedActorId);
        if (!actor) return;

        const { currentTime } = state.playback;
        const { animationTracks } = state.timeline;

        const newTracks: AnimationTrack[] = JSON.parse(JSON.stringify(animationTracks));

        ANIMATABLE_PROPERTIES.forEach((prop) => {
            let track = newTracks.find((t) => t.targetId === selectedActorId && t.property === prop.path);

            if (!track) {
                track = {
                    targetId: selectedActorId,
                    property: prop.path,
                    keyframes: [],
                };
                newTracks.push(track);
            }

            const value = getValue(actor, prop.path);

            const existingKfIndex = track.keyframes.findIndex((k) => Math.abs(k.time - currentTime) < 0.001);

            const newKeyframe: Keyframe = {
                time: currentTime,
                value: value,
                easing: 'linear',
            };

            if (existingKfIndex >= 0) {
                track.keyframes[existingKfIndex] = newKeyframe;
            } else {
                track.keyframes.push(newKeyframe);
                track.keyframes.sort((a, b) => a.time - b.time);
            }
        });

        setTimeline({ animationTracks: newTracks });
    }, [selectedActorId, setTimeline]);

    const handleKeyframeMouseDown = (e: React.MouseEvent, trackProperty: string, keyframeIndex: number, keyframeTime: number) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        setDraggingKeyframe({
            trackProperty,
            keyframeIndex,
            startX: e.clientX,
            initialTime: keyframeTime
        });
    };

    const handleKeyframeContextMenu = (e: React.MouseEvent, trackProperty: string, keyframeIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            trackProperty,
            keyframeIndex
        });
    };

    const handleTrackContextMenu = (e: React.MouseEvent, trackProperty: string) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            trackProperty,
            keyframeIndex: -1
        });
    };

    const handleDeleteKeyframe = useCallback(() => {
        if (!contextMenu || !selectedActorId || contextMenu.keyframeIndex === -1) return;

        const state = useSceneStore.getState();
        const { animationTracks } = state.timeline;
        const newTracks: AnimationTrack[] = JSON.parse(JSON.stringify(animationTracks));

        const track = newTracks.find((t) => t.targetId === selectedActorId && t.property === contextMenu.trackProperty);
        if (track && track.keyframes[contextMenu.keyframeIndex]) {
            track.keyframes.splice(contextMenu.keyframeIndex, 1);
        }

        setTimeline({ animationTracks: newTracks });
        setContextMenu(null);
    }, [contextMenu, selectedActorId, setTimeline]);

    const handleCopyKeyframe = useCallback(() => {
        if (!contextMenu || !selectedActorId || contextMenu.keyframeIndex === -1) return;

        const state = useSceneStore.getState();
        const track = state.timeline.animationTracks.find(t => t.targetId === selectedActorId && t.property === contextMenu.trackProperty);

        if (track && track.keyframes[contextMenu.keyframeIndex]) {
            setCopiedKeyframe({ ...track.keyframes[contextMenu.keyframeIndex] });
        }
        setContextMenu(null);
    }, [contextMenu, selectedActorId]);

    const handlePasteKeyframe = useCallback(() => {
        if (!contextMenu || !selectedActorId || !copiedKeyframe || !scrubberRef.current) return;

        const rect = scrubberRef.current.getBoundingClientRect();
        const pixelsPerSecond = rect.width / duration;
        const time = Math.max(0, Math.min(duration, (contextMenu.x - rect.left) / pixelsPerSecond));
        const frameDuration = 1 / 30;
        const snappedTime = Math.round(time / frameDuration) * frameDuration;

        const state = useSceneStore.getState();
        const { animationTracks } = state.timeline;
        const newTracks: AnimationTrack[] = JSON.parse(JSON.stringify(animationTracks));

        let track = newTracks.find((t) => t.targetId === selectedActorId && t.property === contextMenu.trackProperty);
        if (!track) {
            track = {
                targetId: selectedActorId,
                property: contextMenu.trackProperty,
                keyframes: []
            };
            newTracks.push(track);
        }

        const newKeyframe = {
            ...copiedKeyframe,
            time: snappedTime
        };

        const existingIndex = track.keyframes.findIndex((k) => Math.abs(k.time - snappedTime) < 0.001);
        if (existingIndex >= 0) {
            track.keyframes[existingIndex] = newKeyframe;
        } else {
            track.keyframes.push(newKeyframe);
            track.keyframes.sort((a, b) => a.time - b.time);
        }

        setTimeline({ animationTracks: newTracks });
        setContextMenu(null);
    }, [contextMenu, selectedActorId, copiedKeyframe, duration, setTimeline]);

    useEffect(() => {
        if (!draggingKeyframe) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!scrubberRef.current) return;

            const rect = scrubberRef.current.getBoundingClientRect();
            const pixelsPerSecond = rect.width / duration;
            const deltaX = e.clientX - draggingKeyframe.startX;
            const deltaTime = deltaX / pixelsPerSecond;

            const newTime = Math.max(0, Math.min(duration, draggingKeyframe.initialTime + deltaTime));

            const frameDuration = 1 / 30;
            const snappedTime = Math.round(newTime / frameDuration) * frameDuration;

            const state = useSceneStore.getState();
            const { animationTracks } = state.timeline;
            const newTracks: AnimationTrack[] = JSON.parse(JSON.stringify(animationTracks));
            const track = newTracks.find((t) => t.targetId === selectedActorId && t.property === draggingKeyframe.trackProperty);

            if (track && track.keyframes[draggingKeyframe.keyframeIndex]) {
                 track.keyframes[draggingKeyframe.keyframeIndex].time = snappedTime;
            }
            setTimeline({ animationTracks: newTracks });
        };

        const handleMouseUp = () => {
            const state = useSceneStore.getState();
            const { animationTracks } = state.timeline;
            const newTracks: AnimationTrack[] = JSON.parse(JSON.stringify(animationTracks));

            newTracks.forEach((t) => t.keyframes.sort((a, b) => a.time - b.time));

            setTimeline({ animationTracks: newTracks });
            setDraggingKeyframe(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingKeyframe, duration, selectedActorId, setTimeline]);

    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        if (contextMenu) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [contextMenu]);

    const progressPercent = (currentTime / duration) * 100;

    const actorTracks = useMemo(() => {
        if (!selectedActorId) return [];
        const tracks = ANIMATABLE_PROPERTIES.map(prop => ({
            ...prop,
            track: animationTracks.find(t => t.targetId === selectedActorId && t.property === prop.path)
        }));

        const extraTracks = animationTracks.filter(t =>
            t.targetId === selectedActorId &&
            !ANIMATABLE_PROPERTIES.some(p => p.path === t.property)
        );

        extraTracks.forEach(t => {
            tracks.push({
                label: t.property,
                path: t.property,
                track: t
            });
        });

        return tracks;
    }, [selectedActorId, animationTracks]);

    return (
        <div className="panel timeline-panel">
            {/* Transport Controls */}
            <div className="timeline-transport">
                <div className="timeline-transport__controls">
                    <button
                        className="timeline-btn"
                        onClick={handleStop}
                        title={t('timeline.stop')}
                    >
                        ⏹
                    </button>
                    {isPlaying ? (
                        <button
                            className="timeline-btn timeline-btn--active"
                            onClick={handlePause}
                            title={t('timeline.pause')}
                        >
                            ⏸
                        </button>
                    ) : (
                        <button
                            className="timeline-btn timeline-btn--play"
                            onClick={handlePlay}
                            title={t('timeline.play')}
                        >
                            ▶
                        </button>
                    )}
                    <button
                        className="timeline-btn"
                        title={t('timeline.addKeyframe')}
                        onClick={handleAddKeyframe}
                    >
                        ◇+
                    </button>
                </div>

                <div className="timeline-transport__time">
                    <span className="timeline-time">{formatTime(currentTime)}</span>
                    <span className="timeline-time timeline-time--muted">/</span>
                    <span className="timeline-time timeline-time--muted">{formatTime(duration)}</span>
                </div>

                <div className="timeline-transport__duration">
                    <label className="prop-field__label">{t('timeline.duration')}</label>
                    <select
                        className="timeline-select"
                        value={duration}
                        onChange={(e) => setTimeline({ duration: Number(e.target.value) })}
                    >
                        <option value={5}>{t('timeline.seconds', { count: 5 })}</option>
                        <option value={10}>{t('timeline.seconds', { count: 10 })}</option>
                        <option value={15}>{t('timeline.seconds', { count: 15 })}</option>
                        <option value={30}>{t('timeline.seconds', { count: 30 })}</option>
                        <option value={60}>{t('timeline.seconds', { count: 60 })}</option>
                    </select>
                </div>
            </div>

            {/* Scrubber */}
            <div className="timeline-scrubber" ref={scrubberRef}>
                <div className="timeline-ruler">
                    {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                        <span
                            key={i}
                            className="timeline-ruler__mark"
                            style={{ left: `${(i / duration) * 100}%` }}
                        >
                            {t('timeline.seconds', { count: i })}
                        </span>
                    ))}
                </div>

                <input
                    type="range"
                    className="timeline-scrubber__slider"
                    min={0}
                    max={duration}
                    step={1 / 30}
                    value={currentTime}
                    onChange={(e) => seek(parseFloat(e.target.value))}
                />
                <div
                    className="timeline-scrubber__progress"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Track List */}
            <div className="timeline-tracks">
                {selectedActorId ? (
                    actorTracks.map((prop) => (
                        <div key={prop.path} className="timeline-track">
                            <div className="timeline-track__label">
                                <span className="timeline-track__name">{t(prop.label)}</span>
                            </div>
                            <div
                                className="timeline-track__lane"
                                onContextMenu={(e) => handleTrackContextMenu(e, prop.path)}
                            >
                                {prop.track?.keyframes.map((kf, i) => (
                                    <div
                                        key={i}
                                        className="timeline-keyframe"
                                        style={{ left: `${(kf.time / duration) * 100}%` }}
                                        title={t('timeline.seconds', { count: kf.time })}
                                        onMouseDown={(e) => handleKeyframeMouseDown(e, prop.path, i, kf.time)}
                                        onContextMenu={(e) => handleKeyframeContextMenu(e, prop.path, i)}
                                    >
                                        ◆
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="timeline-track timeline-track--empty">
                        <span>{t('timeline.selectActorPrompt')}</span>
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="timeline-context-menu"
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        zIndex: 1000,
                        backgroundColor: '#333',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        padding: '4px'
                    }}
                >
                    {contextMenu.keyframeIndex !== -1 && (
                        <>
                            <button
                                className="timeline-context-menu__item"
                                onClick={handleDeleteKeyframe}
                                style={menuItemStyle}
                            >
                                {t('timeline.deleteKeyframe')}
                            </button>
                            <button
                                className="timeline-context-menu__item"
                                onClick={handleCopyKeyframe}
                                style={menuItemStyle}
                            >
                                {t('timeline.copyKeyframe')}
                            </button>
                        </>
                    )}
                    {contextMenu.keyframeIndex === -1 && copiedKeyframe && (
                        <button
                            className="timeline-context-menu__item"
                            onClick={handlePasteKeyframe}
                            style={menuItemStyle}
                        >
                            {t('timeline.pasteKeyframe')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

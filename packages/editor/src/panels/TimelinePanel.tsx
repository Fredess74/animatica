/**
 * TimelinePanel — Playback controls and keyframe timeline.
 * Scrubber, play/pause/stop, track list with keyframe diamonds.
 *
 * @module @animatica/editor/panels/TimelinePanel
 */
import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useSceneStore, usePlayback, Keyframe } from '@Animatica/engine';
import { TimelineTrack } from './TimelineTrack';

interface TimelinePanelProps {
    selectedActorId: string | null;
}

interface ContextMenuState {
    x: number;
    y: number;
    property: string;
    index: number;
}

// Module-level clipboard for keyframes (resets on refresh)
let clipboardKeyframe: Pick<Keyframe, 'value' | 'easing'> | null = null;

function getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({ selectedActorId }) => {
    const { t } = useTranslation();

    // Store selectors
    const isPlaying = useSceneStore(s => s.playback.isPlaying);
    const currentTime = useSceneStore(s => s.playback.currentTime);
    const duration = useSceneStore(s => s.timeline.duration);
    const animationTracks = useSceneStore(s => s.timeline.animationTracks);
    const actors = useSceneStore(s => s.actors);
    const setTimeline = useSceneStore(s => s.setTimeline);
    const setDuration = (d: number) => setTimeline({ duration: d });

    const selectedActor = useMemo(() =>
        actors.find(a => a.id === selectedActorId),
        [actors, selectedActorId]
    );

    // Playback controls
    const { play, pause, stop, seek } = usePlayback();

    // Local state
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    const formatTime = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const frames = Math.floor((seconds % 1) * 30);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    }, []);

    const handlePlay = () => play();
    const handlePause = () => pause();
    const handleStop = () => stop();

    const progressPercent = (currentTime / duration) * 100;

    // Filter tracks for selected actor
    const actorTracks = useMemo(() => {
        if (!selectedActorId) return [];
        return animationTracks.filter(track => track.targetId === selectedActorId);
    }, [animationTracks, selectedActorId]);

    const handleKeyframeChange = useCallback((property: string, index: number, newTime: number) => {
        // Create a shallow copy of tracks
        const newTracks = animationTracks.map(track => {
            if (track.targetId === selectedActorId && track.property === property) {
                // Create a shallow copy of keyframes
                const newKeyframes = [...track.keyframes];
                // Update the specific keyframe
                newKeyframes[index] = { ...newKeyframes[index], time: newTime };
                // DO NOT SORT HERE to avoid index shifting during drag
                return { ...track, keyframes: newKeyframes };
            }
            return track;
        });

        setTimeline({ animationTracks: newTracks });
    }, [animationTracks, selectedActorId, setTimeline]);

    const handleKeyframeDragEnd = useCallback((property: string, _index: number) => {
        // Sort keyframes after drag ends
        const newTracks = animationTracks.map(track => {
            if (track.targetId === selectedActorId && track.property === property) {
                const newKeyframes = [...track.keyframes];
                newKeyframes.sort((a, b) => a.time - b.time);
                return { ...track, keyframes: newKeyframes };
            }
            return track;
        });
        setTimeline({ animationTracks: newTracks });
    }, [animationTracks, selectedActorId, setTimeline]);

    const handleContextMenu = useCallback((e: React.MouseEvent, property: string, index: number) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            property,
            index
        });
    }, []);

    const closeContextMenu = useCallback(() => setContextMenu(null), []);

    const deleteKeyframe = useCallback(() => {
        if (!contextMenu || !selectedActorId) return;
        const { property, index } = contextMenu;

        const newTracks = animationTracks.map(track => {
            if (track.targetId === selectedActorId && track.property === property) {
                const newKeyframes = track.keyframes.filter((_, i) => i !== index);
                return { ...track, keyframes: newKeyframes };
            }
            return track;
        });

        setTimeline({ animationTracks: newTracks });
        closeContextMenu();
    }, [contextMenu, animationTracks, selectedActorId, setTimeline, closeContextMenu]);

    const copyKeyframe = useCallback(() => {
        if (!contextMenu || !selectedActorId) return;
        const { property, index } = contextMenu;

        const track = animationTracks.find(t => t.targetId === selectedActorId && t.property === property);
        if (track && track.keyframes[index]) {
            const kf = track.keyframes[index];
            clipboardKeyframe = { value: kf.value, easing: kf.easing };
        }
        closeContextMenu();
    }, [contextMenu, animationTracks, selectedActorId, closeContextMenu]);

    const pasteKeyframe = useCallback(() => {
        if (!contextMenu || !selectedActorId || !clipboardKeyframe) return;
        const { property, index } = contextMenu;

        const newTracks = animationTracks.map(track => {
            if (track.targetId === selectedActorId && track.property === property) {
                const newKeyframes = [...track.keyframes];
                // Overwrite value and easing
                newKeyframes[index] = {
                    ...newKeyframes[index],
                    value: clipboardKeyframe!.value,
                    easing: clipboardKeyframe!.easing
                };
                return { ...track, keyframes: newKeyframes };
            }
            return track;
        });

        setTimeline({ animationTracks: newTracks });
        closeContextMenu();
    }, [contextMenu, animationTracks, selectedActorId, setTimeline, closeContextMenu]);

    const handleAddKeyframe = useCallback(() => {
        if (!selectedActorId || !selectedActor) return;

        // Properties we want to ensure have tracks
        const defaultProperties = ['transform.position', 'transform.rotation', 'transform.scale'];

        // Also include any existing tracks for this actor that are NOT in defaultProperties
        const existingProperties = animationTracks
            .filter(t => t.targetId === selectedActorId)
            .map(t => t.property);

        const targetProperties = Array.from(new Set([...defaultProperties, ...existingProperties]));

        let newTracks = [...animationTracks];

        targetProperties.forEach(prop => {
            const valueToAdd = getValueByPath(selectedActor, prop);

            if (valueToAdd === undefined) return;

            const existingTrackIndex = newTracks.findIndex(
                t => t.targetId === selectedActorId && t.property === prop
            );

            const newKeyframe: Keyframe = {
                time: currentTime,
                value: valueToAdd,
                easing: 'linear'
            };

            if (existingTrackIndex !== -1) {
                // Add to existing track
                const track = newTracks[existingTrackIndex];

                // Check if keyframe exists at this time (allow small epsilon)
                const existingKeyframeIndex = track.keyframes.findIndex(kf => Math.abs(kf.time - currentTime) < 0.001);

                let newKeyframes;
                if (existingKeyframeIndex !== -1) {
                    // Update existing keyframe value
                    newKeyframes = [...track.keyframes];
                    newKeyframes[existingKeyframeIndex] = {
                        ...newKeyframes[existingKeyframeIndex],
                        value: valueToAdd
                    };
                } else {
                    // Add new keyframe
                    newKeyframes = [...track.keyframes, newKeyframe];
                    newKeyframes.sort((a, b) => a.time - b.time);
                }

                newTracks[existingTrackIndex] = { ...track, keyframes: newKeyframes };
            } else {
                // Create new track
                newTracks.push({
                    targetId: selectedActorId,
                    property: prop,
                    keyframes: [newKeyframe]
                });
            }
        });

        setTimeline({ animationTracks: newTracks });
    }, [selectedActorId, selectedActor, animationTracks, currentTime, setTimeline]);

    return (
        <div className="panel timeline-panel" onClick={closeContextMenu}>
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
                        onChange={(e) => setDuration(Number(e.target.value))}
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
            <div className="timeline-scrubber">
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
                    actorTracks.length > 0 ? (
                        actorTracks.map((track) => (
                            <TimelineTrack
                                key={`${track.targetId}-${track.property}`}
                                track={track}
                                duration={duration}
                                onKeyframeChange={handleKeyframeChange}
                                onKeyframeDragEnd={handleKeyframeDragEnd}
                                onKeyframeContextMenu={handleContextMenu}
                            />
                        ))
                    ) : (
                        <div className="timeline-track timeline-track--empty">
                            <span>{t('timeline.noTracks')}</span>
                        </div>
                    )
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
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: '#333',
                        border: '1px solid #555',
                        padding: '4px 0',
                        zIndex: 1000,
                        minWidth: '120px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="timeline-context-menu__item"
                        onClick={deleteKeyframe}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '4px 12px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                    >
                        {t('timeline.deleteKeyframe')}
                    </button>
                    <button
                        className="timeline-context-menu__item"
                        onClick={copyKeyframe}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '4px 12px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                    >
                        {t('timeline.copyKeyframe')}
                    </button>
                    <button
                        className="timeline-context-menu__item"
                        onClick={pasteKeyframe}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '4px 12px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        disabled={!clipboardKeyframe}
                    >
                        {t('timeline.pasteKeyframe')}
                    </button>
                </div>
            )}
        </div>
    );
};

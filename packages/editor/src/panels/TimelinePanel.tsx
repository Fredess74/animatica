/**
 * TimelinePanel — Playback controls and keyframe timeline.
 * Scrubber, play/pause/stop, track list with keyframe diamonds.
 *
 * @module @animatica/editor/panels/TimelinePanel
 */
import React, { useState, useCallback } from 'react';
import { useTranslation } from '../i18n/useTranslation';

interface TimelinePanelProps {
    selectedActorId: string | null;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({ selectedActorId }) => {
    const { t } = useTranslation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(10);

    const formatTime = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const frames = Math.floor((seconds % 1) * 30);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    }, []);

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleStop = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const progressPercent = (currentTime / duration) * 100;

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
                    <button className="timeline-btn" title={t('timeline.addKeyframe')}>
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
                    onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                />
                <div
                    className="timeline-scrubber__progress"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Track List */}
            <div className="timeline-tracks">
                {selectedActorId ? (
                    <div className="timeline-track">
                        <div className="timeline-track__label">
                            <span className="timeline-track__name">{t('timeline.selectedActor')}</span>
                        </div>
                        <div className="timeline-track__lane">
                            {/* Keyframe diamonds would render here */}
                            <span className="timeline-keyframe" style={{ left: '0%' }} title={t('timeline.seconds', { count: 0 })}>◆</span>
                            <span className="timeline-keyframe" style={{ left: '50%' }} title={t('timeline.seconds', { count: duration / 2 })}>◆</span>
                            <span className="timeline-keyframe" style={{ left: '100%' }} title={t('timeline.seconds', { count: duration })}>◆</span>
                        </div>
                    </div>
                ) : (
                    <div className="timeline-track timeline-track--empty">
                        <span>{t('timeline.selectActorPrompt')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

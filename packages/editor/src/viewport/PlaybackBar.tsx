/**
 * PlaybackBar — Timeline scrub bar with transport controls.
 * Rendered below the 3D viewport.
 */
import React, { useCallback, useRef } from 'react'
import { useSceneStore } from '@Animatica/engine'

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2]

export const PlaybackBar: React.FC = () => {
    const scrubRef = useRef<HTMLDivElement>(null)
    const {
        playback,
        setPlayback,
        timeline,
    } = useSceneStore()

    const { isPlaying, currentTime, speed } = playback
    const duration = timeline?.duration ?? 10

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60)
        const secs = Math.floor(s % 60)
        const frames = Math.floor((s % 1) * 24)
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(frames).padStart(2, '0')}`
    }

    const currentFrame = Math.floor(currentTime * 24)
    const totalFrames = Math.floor(duration * 24)

    const handlePlay = useCallback(() => {
        setPlayback({ isPlaying: !isPlaying })
    }, [isPlaying, setPlayback])

    const handleStop = useCallback(() => {
        setPlayback({ isPlaying: false, currentTime: 0 })
    }, [setPlayback])

    const handlePrevFrame = useCallback(() => {
        setPlayback({ currentTime: Math.max(0, currentTime - 1 / 24) })
    }, [currentTime, setPlayback])

    const handleNextFrame = useCallback(() => {
        setPlayback({ currentTime: Math.min(duration, currentTime + 1 / 24) })
    }, [currentTime, duration, setPlayback])

    const handleSpeedChange = useCallback((newSpeed: number) => {
        setPlayback({ speed: newSpeed })
    }, [setPlayback])

    const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrubRef.current) return
        const rect = scrubRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        setPlayback({ currentTime: Math.max(0, Math.min(duration, x * duration)) })
    }, [duration, setPlayback])

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div style={barStyle}>
            {/* Transport controls */}
            <div style={controlsStyle}>
                <button style={btnStyle} onClick={handleStop} title="Stop (Home)">⏹</button>
                <button style={btnStyle} onClick={handlePrevFrame} title="Previous frame (←)">⏪</button>
                <button style={{ ...btnStyle, ...playBtnStyle }} onClick={handlePlay} title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
                    {isPlaying ? '⏸' : '▶️'}
                </button>
                <button style={btnStyle} onClick={handleNextFrame} title="Next frame (→)">⏩</button>
            </div>

            {/* Scrub bar */}
            <div
                ref={scrubRef}
                style={scrubBarStyle}
                onClick={handleScrub}
                role="slider"
                aria-valuenow={currentTime}
                aria-valuemin={0}
                aria-valuemax={duration}
            >
                <div style={{ ...scrubFillStyle, width: `${progressPercent}%` }} />
                <div style={{ ...scrubHeadStyle, left: `${progressPercent}%` }} />
            </div>

            {/* Time + frame display */}
            <div style={timeDisplayStyle}>
                <span style={frameStyle}>{String(currentFrame).padStart(3, '0')} / {String(totalFrames).padStart(3, '0')}</span>
                <span style={timeStyle}>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            {/* Speed selector */}
            <div style={speedStyle}>
                {SPEED_OPTIONS.map((s) => (
                    <button
                        key={s}
                        style={{
                            ...speedBtnStyle,
                            color: s === speed ? 'var(--green-400, #4ADE80)' : 'var(--text-muted, #737373)',
                            fontWeight: s === speed ? 700 : 400,
                        }}
                        onClick={() => handleSpeedChange(s)}
                    >
                        {s}x
                    </button>
                ))}
            </div>
        </div>
    )
}

// ---- Styles ----

const barStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 36,
    padding: '0 12px',
    background: 'var(--bg-surface, #1A1A1A)',
    borderTop: '1px solid var(--border-subtle, #2A2A2A)',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: 11,
    userSelect: 'none',
}

const controlsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
}

const btnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    padding: '2px 6px',
    borderRadius: 4,
    color: 'var(--text-secondary, #A3A3A3)',
}

const playBtnStyle: React.CSSProperties = {
    fontSize: 16,
}

const scrubBarStyle: React.CSSProperties = {
    flex: 1,
    height: 6,
    background: 'var(--border-subtle, #2A2A2A)',
    borderRadius: 3,
    cursor: 'pointer',
    position: 'relative',
}

const scrubFillStyle: React.CSSProperties = {
    height: '100%',
    background: 'var(--green-500, #22C55E)',
    borderRadius: 3,
    transition: 'width 50ms',
}

const scrubHeadStyle: React.CSSProperties = {
    position: 'absolute',
    top: -3,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: 'var(--green-400, #4ADE80)',
    transform: 'translateX(-50%)',
    boxShadow: '0 0 4px rgba(74, 222, 128, 0.5)',
}

const timeDisplayStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1,
    minWidth: 120,
}

const frameStyle: React.CSSProperties = {
    color: 'var(--green-400, #4ADE80)',
    fontSize: 11,
}

const timeStyle: React.CSSProperties = {
    color: 'var(--text-muted, #737373)',
    fontSize: 10,
}

const speedStyle: React.CSSProperties = {
    display: 'flex',
    gap: 2,
}

const speedBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 10,
    padding: '2px 4px',
    borderRadius: 3,
}

/**
 * CompositionGuides — Overlay guides for shot composition.
 * Rule of thirds, golden ratio, center cross, safe areas, aspect ratio.
 * Rendered as an SVG overlay on top of the viewport.
 */
import React from 'react'

export type GuideType = 'none' | 'thirds' | 'golden' | 'center' | 'diagonal'
export type AspectRatio = '16:9' | '2.39:1' | '4:3' | '1:1' | '9:16' | 'custom'
export type SafeAreaType = 'none' | 'action' | 'title' | 'both'

interface CompositionGuidesProps {
    guide?: GuideType
    safeArea?: SafeAreaType
    aspectRatio?: AspectRatio
    showCrosshair?: boolean
}

const GUIDE_COLOR = 'rgba(255, 255, 255, 0.2)'
const SAFE_ACTION_COLOR = 'rgba(255, 200, 50, 0.3)'
const SAFE_TITLE_COLOR = 'rgba(50, 200, 255, 0.3)'

/**
 * Calculate letterbox bars for non-native aspect ratios.
 */
function getLetterboxBars(aspect: AspectRatio): { top: string; bottom: string; left: string; right: string } | null {
    // Assume viewport is 16:9 natively
    const ratios: Record<string, number> = {
        '16:9': 16 / 9,
        '2.39:1': 2.39,
        '4:3': 4 / 3,
        '1:1': 1,
        '9:16': 9 / 16,
    }

    const target = ratios[aspect]
    const native = 16 / 9

    if (!target || Math.abs(target - native) < 0.01) return null

    if (target < native) {
        // Pillarbox (vertical bars)
        const barPercent = ((1 - target / native) / 2) * 100
        return { top: '0', bottom: '0', left: `${barPercent}%`, right: `${barPercent}%` }
    } else {
        // Letterbox (horizontal bars)
        const barPercent = ((1 - native / target) / 2) * 100
        return { top: `${barPercent}%`, bottom: `${barPercent}%`, left: '0', right: '0' }
    }
}

export const CompositionGuides: React.FC<CompositionGuidesProps> = ({
    guide = 'none',
    safeArea = 'none',
    aspectRatio = '16:9',
    showCrosshair = false,
}) => {
    const bars = getLetterboxBars(aspectRatio)

    return (
        <div style={containerStyle}>
            {/* Aspect ratio letterbox/pillarbox */}
            {bars && (
                <>
                    {bars.top !== '0' && (
                        <>
                            <div style={{ ...barStyle, top: 0, left: 0, right: 0, height: bars.top }} />
                            <div style={{ ...barStyle, bottom: 0, left: 0, right: 0, height: bars.bottom }} />
                        </>
                    )}
                    {bars.left !== '0' && (
                        <>
                            <div style={{ ...barStyle, top: 0, bottom: 0, left: 0, width: bars.left }} />
                            <div style={{ ...barStyle, top: 0, bottom: 0, right: 0, width: bars.right }} />
                        </>
                    )}
                </>
            )}

            {/* SVG Guides */}
            <svg style={svgStyle} viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Rule of Thirds */}
                {guide === 'thirds' && (
                    <g stroke={GUIDE_COLOR} strokeWidth="0.15" fill="none">
                        <line x1="33.33" y1="0" x2="33.33" y2="100" />
                        <line x1="66.67" y1="0" x2="66.67" y2="100" />
                        <line x1="0" y1="33.33" x2="100" y2="33.33" />
                        <line x1="0" y1="66.67" x2="100" y2="66.67" />
                        {/* Power points */}
                        <circle cx="33.33" cy="33.33" r="0.8" fill={GUIDE_COLOR} />
                        <circle cx="66.67" cy="33.33" r="0.8" fill={GUIDE_COLOR} />
                        <circle cx="33.33" cy="66.67" r="0.8" fill={GUIDE_COLOR} />
                        <circle cx="66.67" cy="66.67" r="0.8" fill={GUIDE_COLOR} />
                    </g>
                )}

                {/* Golden Ratio */}
                {guide === 'golden' && (
                    <g stroke={GUIDE_COLOR} strokeWidth="0.15" fill="none">
                        <line x1="38.2" y1="0" x2="38.2" y2="100" />
                        <line x1="61.8" y1="0" x2="61.8" y2="100" />
                        <line x1="0" y1="38.2" x2="100" y2="38.2" />
                        <line x1="0" y1="61.8" x2="100" y2="61.8" />
                    </g>
                )}

                {/* Center Cross */}
                {guide === 'center' && (
                    <g stroke={GUIDE_COLOR} strokeWidth="0.15" fill="none">
                        <line x1="50" y1="0" x2="50" y2="100" />
                        <line x1="0" y1="50" x2="100" y2="50" />
                    </g>
                )}

                {/* Diagonals */}
                {guide === 'diagonal' && (
                    <g stroke={GUIDE_COLOR} strokeWidth="0.15" fill="none">
                        <line x1="0" y1="0" x2="100" y2="100" />
                        <line x1="100" y1="0" x2="0" y2="100" />
                    </g>
                )}

                {/* Crosshair */}
                {showCrosshair && (
                    <g stroke="rgba(255,100,100,0.5)" strokeWidth="0.1" fill="none">
                        <line x1="48" y1="50" x2="52" y2="50" />
                        <line x1="50" y1="48" x2="50" y2="52" />
                    </g>
                )}

                {/* Safe Areas */}
                {(safeArea === 'action' || safeArea === 'both') && (
                    <rect x="5" y="5" width="90" height="90" stroke={SAFE_ACTION_COLOR} strokeWidth="0.2" fill="none" strokeDasharray="1" />
                )}
                {(safeArea === 'title' || safeArea === 'both') && (
                    <rect x="10" y="10" width="80" height="80" stroke={SAFE_TITLE_COLOR} strokeWidth="0.2" fill="none" strokeDasharray="0.5" />
                )}
            </svg>
        </div>
    )
}

// ---- Styles ----

const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 40, // below toolbar
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 5,
}

const svgStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
}

const barStyle: React.CSSProperties = {
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.85)',
    zIndex: 6,
}

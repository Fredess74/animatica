import React from 'react'
import { useSceneStore } from '@Animatica/engine'

export const Viewport2D: React.FC = () => {
    const actors = useSceneStore((s) => s.actors)
    const timeline = useSceneStore((s) => s.timeline)
    const currentTime = useSceneStore((s) => s.playback.currentTime)

    const visibleActors = actors.filter((a) => a.visible)

    return (
        <div style={rootStyle}>
            <div style={stripeLayerStyle} />

            <div style={chromeStyle}>
                <div style={leftPanelStyle}>
                    <h4 style={panelTitleStyle}>Media</h4>
                    {visibleActors.slice(0, 5).map((actor) => (
                        <div key={actor.id} style={thumbStyle}>
                            <span style={{ fontWeight: 700 }}>{actor.name}</span>
                            <span style={{ opacity: 0.8, fontSize: 12 }}>{actor.type}</span>
                        </div>
                    ))}
                </div>

                <div style={stageStyle}>
                    <div style={stageHeaderStyle}>2D Storyboard Mode</div>
                    <div style={stageBodyStyle}>
                        <div style={actorCanvasStyle}>
                            {visibleActors.map((actor, idx) => (
                                <div
                                    key={actor.id}
                                    style={{
                                        ...actorCardStyle,
                                        left: `${10 + (idx * 13) % 70}%`,
                                        top: `${18 + ((idx % 3) * 20)}%`,
                                    }}
                                >
                                    {actor.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={transportStyle}>
                        <span>▶</span>
                        <span>{currentTime.toFixed(2)}s / {timeline.duration.toFixed(2)}s</span>
                        <div style={progressBarStyle}>
                            <div
                                style={{
                                    ...progressFillStyle,
                                    width: `${Math.min(100, (currentTime / Math.max(0.01, timeline.duration)) * 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={rightPanelStyle}>
                    <h4 style={panelTitleStyle}>Tools</h4>
                    {['Cut', 'Speed', 'Audio', 'Transition', 'Text', 'Layers'].map((tool) => (
                        <button key={tool} style={toolBtnStyle}>{tool}</button>
                    ))}
                </div>
            </div>
        </div>
    )
}

const rootStyle: React.CSSProperties = {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    background: '#ecede6',
}

const stripeLayerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'repeating-linear-gradient(130deg, #ecede6 0 90px, #9EEA2B 90px 130px, #44C729 130px 165px, #0F8D2A 165px 205px, #005F1B 205px 240px, #003F13 240px 270px)',
    opacity: 0.95,
}

const chromeStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 1,
    margin: 16,
    height: 'calc(100% - 32px)',
    display: 'grid',
    gridTemplateColumns: '220px 1fr 220px',
    gap: 12,
    background: 'rgba(0, 61, 22, 0.82)',
    borderRadius: 14,
    padding: 12,
    border: '1px solid rgba(203,255,170,0.25)',
}

const leftPanelStyle: React.CSSProperties = {
    background: 'rgba(10, 57, 23, 0.65)',
    borderRadius: 10,
    padding: 10,
}

const rightPanelStyle = leftPanelStyle

const panelTitleStyle: React.CSSProperties = {
    margin: '0 0 10px',
    color: '#d6f6b8',
    fontSize: 18,
}

const thumbStyle: React.CSSProperties = {
    background: 'rgba(98, 190, 70, 0.35)',
    border: '1px solid rgba(208,255,170,0.35)',
    borderRadius: 8,
    marginBottom: 8,
    padding: 8,
    color: '#f1ffe6',
    display: 'flex',
    flexDirection: 'column',
}

const stageStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateRows: '40px 1fr 56px',
    background: 'rgba(6, 54, 18, 0.72)',
    borderRadius: 10,
    border: '1px solid rgba(209,255,168,0.25)',
    overflow: 'hidden',
}

const stageHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    color: '#e8ffd0',
    fontWeight: 700,
}

const stageBodyStyle: React.CSSProperties = {
    padding: 12,
}

const actorCanvasStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: 'rgba(4, 44, 15, 0.58)',
    borderRadius: 8,
    border: '1px solid rgba(189,255,140,0.32)',
}

const actorCardStyle: React.CSSProperties = {
    position: 'absolute',
    minWidth: 84,
    padding: '8px 10px',
    background: 'linear-gradient(135deg, #b9f742, #59cc2f)',
    color: '#0d2f16',
    borderRadius: 8,
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    fontWeight: 700,
    fontSize: 12,
}

const transportStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '30px auto 1fr',
    alignItems: 'center',
    gap: 8,
    padding: '0 12px',
    color: '#e0ffd2',
    borderTop: '1px solid rgba(204,255,173,0.2)',
}

const progressBarStyle: React.CSSProperties = {
    height: 8,
    borderRadius: 999,
    background: 'rgba(219,255,193,0.25)',
    overflow: 'hidden',
}

const progressFillStyle: React.CSSProperties = {
    height: '100%',
    background: 'linear-gradient(90deg, #d5ff70, #6ed531)',
}

const toolBtnStyle: React.CSSProperties = {
    width: '100%',
    textAlign: 'left',
    marginBottom: 8,
    padding: '10px 8px',
    borderRadius: 8,
    border: '1px solid rgba(194,255,156,0.28)',
    color: '#deffc8',
    background: 'rgba(64, 155, 54, 0.3)',
    cursor: 'pointer',
}

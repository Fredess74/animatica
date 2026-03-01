/**
 * ScriptPanel — Screenplay-format editor integrated with the timeline.
 * Supports standard screenplay blocks: scene heading, action, dialogue, transition.
 */
import React, { useState, useCallback } from 'react'

export type ScriptBlockType = 'scene_heading' | 'action' | 'dialogue' | 'parenthetical' | 'transition' | 'note'

export interface ScriptBlock {
    id: string
    type: ScriptBlockType
    text: string
    character?: string // for dialogue blocks
    timeMarker?: number // linked to timeline in seconds
    duration?: number // estimated duration
}

const BLOCK_STYLES: Record<ScriptBlockType, { label: string; emoji: string; placeholder: string }> = {
    scene_heading: { label: 'Scene Heading', emoji: '🎬', placeholder: 'INT. LOCATION - TIME' },
    action: { label: 'Action', emoji: '🏃', placeholder: 'Describe what happens...' },
    dialogue: { label: 'Dialogue', emoji: '💬', placeholder: 'Character speaks...' },
    parenthetical: { label: 'Parenthetical', emoji: '🤫', placeholder: '(whispering)' },
    transition: { label: 'Transition', emoji: '✂️', placeholder: 'CUT TO:' },
    note: { label: 'Director Note', emoji: '📝', placeholder: 'Note for director/crew...' },
}

/**
 * Estimate reading time for dialogue/action.
 * ~150 words/min for dialogue, ~100 words/min for action.
 */
function estimateDuration(text: string, type: ScriptBlockType): number {
    const words = text.split(/\s+/).filter(Boolean).length
    if (type === 'dialogue' || type === 'parenthetical') return Math.max(1, words / 2.5)
    if (type === 'action') return Math.max(2, words / 1.7)
    if (type === 'transition') return 1
    return 0
}

export const ScriptPanel: React.FC = () => {
    const [blocks, setBlocks] = useState<ScriptBlock[]>([
        {
            id: crypto.randomUUID(),
            type: 'scene_heading',
            text: 'INT. STUDIO - DAY',
            timeMarker: 0,
            duration: 0,
        },
        {
            id: crypto.randomUUID(),
            type: 'action',
            text: 'A character stands center stage under a single spotlight.',
            duration: 3,
        },
    ])

    const addBlock = useCallback((type: ScriptBlockType) => {
        setBlocks((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                type,
                text: '',
                character: type === 'dialogue' ? 'CHARACTER' : undefined,
                duration: type === 'transition' ? 1 : 0,
            },
        ])
    }, [])

    const updateBlock = useCallback((id: string, update: Partial<ScriptBlock>) => {
        setBlocks((prev) =>
            prev.map((b) => {
                if (b.id !== id) return b
                const updated = { ...b, ...update }
                // Auto-estimate duration
                if (update.text !== undefined) {
                    updated.duration = estimateDuration(updated.text, updated.type)
                }
                return updated
            })
        )
    }, [])

    const removeBlock = useCallback((id: string) => {
        setBlocks((prev) => prev.filter((b) => b.id !== id))
    }, [])

    const totalDuration = blocks.reduce((sum, b) => sum + (b.duration || 0), 0)

    // Export as plain-text screenplay format
    const exportScreenplay = useCallback(() => {
        const lines: string[] = []
        for (const block of blocks) {
            switch (block.type) {
                case 'scene_heading':
                    lines.push('', block.text.toUpperCase(), '')
                    break
                case 'action':
                    lines.push(block.text, '')
                    break
                case 'dialogue':
                    lines.push(`          ${(block.character || 'CHARACTER').toUpperCase()}`)
                    lines.push(`    ${block.text}`, '')
                    break
                case 'parenthetical':
                    lines.push(`         (${block.text})`)
                    break
                case 'transition':
                    lines.push('', `                                    ${block.text.toUpperCase()}`, '')
                    break
                case 'note':
                    lines.push(`[NOTE: ${block.text}]`, '')
                    break
            }
        }
        return lines.join('\n')
    }, [blocks])

    return (
        <div className="script-panel">
            <div className="panel-header">
                <span>📝 Screenplay</span>
                <span className="panel-header__meta">
                    ~{Math.round(totalDuration)}s estimated
                </span>
            </div>

            {/* Script blocks */}
            <div className="script-blocks">
                {blocks.map((block) => {
                    const style = BLOCK_STYLES[block.type]
                    return (
                        <div key={block.id} className={`script-block script-block--${block.type}`}>
                            <div className="script-block__header">
                                <span className="script-block__type">{style.emoji} {style.label}</span>
                                {block.duration ? (
                                    <span className="script-block__duration">~{block.duration.toFixed(1)}s</span>
                                ) : null}
                                <button
                                    className="script-block__remove"
                                    onClick={() => removeBlock(block.id)}
                                >×</button>
                            </div>

                            {block.type === 'dialogue' && (
                                <input
                                    className="script-block__character"
                                    value={block.character || ''}
                                    onChange={(e) => updateBlock(block.id, { character: e.target.value })}
                                    placeholder="CHARACTER NAME"
                                />
                            )}

                            <textarea
                                className={`script-block__text script-block__text--${block.type}`}
                                placeholder={style.placeholder}
                                value={block.text}
                                onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                                rows={block.type === 'scene_heading' || block.type === 'transition' ? 1 : 3}
                            />
                        </div>
                    )
                })}
            </div>

            {/* Add block toolbar */}
            <div className="script-add-bar">
                {Object.entries(BLOCK_STYLES).map(([type, style]) => (
                    <button
                        key={type}
                        className="script-add-btn"
                        onClick={() => addBlock(type as ScriptBlockType)}
                        title={style.label}
                    >
                        {style.emoji}
                    </button>
                ))}
            </div>

            {/* Export */}
            <button
                className="script-export-btn"
                onClick={() => {
                    const text = exportScreenplay()
                    navigator.clipboard.writeText(text)
                }}
            >
                📋 Copy Screenplay
            </button>
        </div>
    )
}

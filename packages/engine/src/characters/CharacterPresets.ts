/**
 * CharacterPresets — Built-in character templates.
 * Each preset defines body parameters, default clothing, and base expression.
 */
import type { Color } from '../types'

export interface CharacterPreset {
    /** Unique preset identifier */
    id: string
    /** Display name */
    name: string
    /** Emoji icon for UI */
    icon: string
    /** Body parameters */
    body: {
        height: number      // 0.5 = child, 1.0 = normal, 1.3 = tall
        build: number       // 0 = slim, 0.5 = normal, 1.0 = heavy
        skinColor: Color
    }
    /** Default expression preset name */
    expression: string
    /** Default animation state */
    animation: 'idle' | 'walk' | 'talk'
    /** Optional style tag */
    style: 'realistic' | 'cartoon' | 'robot'
    /** Description for AI generation */
    description: string
}

/**
 * 10 built-in character presets.
 */
export const CHARACTER_PRESETS: CharacterPreset[] = [
    {
        id: 'default-human',
        name: 'Human',
        icon: '👤',
        body: { height: 1.0, build: 0.5, skinColor: '#D4A27C' },
        expression: 'neutral',
        animation: 'idle',
        style: 'realistic',
        description: 'Average human with neutral pose and casual appearance.',
    },
    {
        id: 'cowboy',
        name: 'Cowboy',
        icon: '🤠',
        body: { height: 1.05, build: 0.65, skinColor: '#C18A5E' },
        expression: 'cool',
        animation: 'idle',
        style: 'realistic',
        description: 'Rugged cowboy with confident stance. Wears hat, vest, boots, and belt.',
    },
    {
        id: 'robot',
        name: 'Robot',
        icon: '🤖',
        body: { height: 1.1, build: 0.7, skinColor: '#8899AA' },
        expression: 'neutral',
        animation: 'idle',
        style: 'robot',
        description: 'Metallic humanoid robot with LED eyes and angular body plates.',
    },
    {
        id: 'android',
        name: 'Android',
        icon: '🦾',
        body: { height: 1.0, build: 0.4, skinColor: '#E0D5C5' },
        expression: 'thinking',
        animation: 'idle',
        style: 'realistic',
        description: 'Sleek android with semi-transparent skin panels and glowing circuitry.',
    },
    {
        id: 'business',
        name: 'Business',
        icon: '💼',
        body: { height: 1.0, build: 0.5, skinColor: '#D4A27C' },
        expression: 'neutral',
        animation: 'talk',
        style: 'realistic',
        description: 'Professional in a tailored suit with tie and polished shoes.',
    },
    {
        id: 'superhero',
        name: 'Superhero',
        icon: '🦸',
        body: { height: 1.15, build: 0.8, skinColor: '#C5956B' },
        expression: 'happy',
        animation: 'idle',
        style: 'cartoon',
        description: 'Muscular hero with cape, mask, and emblem on chest.',
    },
    {
        id: 'chibi',
        name: 'Chibi',
        icon: '🧸',
        body: { height: 0.6, build: 0.6, skinColor: '#FFD5B8' },
        expression: 'happy',
        animation: 'idle',
        style: 'cartoon',
        description: 'Small cute character with oversized head and big expressive eyes.',
    },
    {
        id: 'zombie',
        name: 'Zombie',
        icon: '🧟',
        body: { height: 0.95, build: 0.35, skinColor: '#7A8B6F' },
        expression: 'angry',
        animation: 'walk',
        style: 'realistic',
        description: 'Undead with torn clothes, grey-green skin, and stumbling walk.',
    },
    {
        id: 'astronaut',
        name: 'Astronaut',
        icon: '🧑‍🚀',
        body: { height: 1.05, build: 0.7, skinColor: '#D4A27C' },
        expression: 'surprised',
        animation: 'idle',
        style: 'realistic',
        description: 'Space explorer in a bulky white EVA suit with visor and backpack.',
    },
    {
        id: 'knight',
        name: 'Knight',
        icon: '⚔️',
        body: { height: 1.1, build: 0.85, skinColor: '#C5956B' },
        expression: 'neutral',
        animation: 'idle',
        style: 'realistic',
        description: 'Medieval knight in full plate armor with shield and sword.',
    },
]

/**
 * Get a preset by ID.
 */
export function getPreset(id: string): CharacterPreset | undefined {
    return CHARACTER_PRESETS.find((p) => p.id === id)
}

/**
 * Get all preset IDs.
 */
export function getPresetIds(): string[] {
    return CHARACTER_PRESETS.map((p) => p.id)
}

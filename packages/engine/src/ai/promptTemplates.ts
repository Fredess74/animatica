/**
 * AI Prompt Generation Templates.
 * Generates structured prompts for an LLM to create scene JSON.
 *
 * @module @animatica/engine/ai
 */
export type PromptStyle =
  | 'Noir'
  | 'Comedy'
  | 'Horror'
  | 'Anime'
  | 'Cyberpunk'
  | 'Fantasy'
  | 'Documentary'
  | 'Musical';

export const PROMPT_STYLES: PromptStyle[] = [
  'Noir',
  'Comedy',
  'Horror',
  'Anime',
  'Cyberpunk',
  'Fantasy',
  'Documentary',
  'Musical',
];

interface StyleConfig {
  lighting: string;
  weather: string;
  camera: string;
  moodColor: string;
}

const STYLE_PRESETS: Record<PromptStyle, StyleConfig> = {
  Noir: {
    lighting: 'Low key, harsh shadows, high contrast',
    weather: 'Heavy rain, wet streets',
    camera: 'Low angles, Dutch tilts, slow pans',
    moodColor: '#1a1a2e',
  },
  Comedy: {
    lighting: 'Bright, flat, high key',
    weather: 'Sunny, clear skies',
    camera: 'Wide shots, static framing, snappy cuts',
    moodColor: '#fff4e6',
  },
  Horror: {
    lighting: 'Dim, flickering, localized sources',
    weather: 'Thick fog, dust particles',
    camera: 'POV, handheld shakiess, slow creeping zooms',
    moodColor: '#0a0a0a',
  },
  Anime: {
    lighting: 'Cel-shaded, bloom effects, dramatic backlighting',
    weather: 'Cherry blossoms falling or clear blue sky',
    camera: 'Dynamic angles, speed lines, extreme close-ups',
    moodColor: '#ffb7c5',
  },
  Cyberpunk: {
    lighting: 'Neon signs, volumetric fog, blue/pink contrast',
    weather: 'Acid rain, smog',
    camera: 'Dolly shots, crane movements, smooth tracking',
    moodColor: '#00d4ff',
  },
  Fantasy: {
    lighting: 'Magical, ethereal, golden hour or bioluminescent',
    weather: 'Light mist, pollen particles',
    camera: 'Sweeping landscapes, drone shots, floating movements',
    moodColor: '#c2956b',
  },
  Documentary: {
    lighting: 'Natural, available light',
    weather: 'Overcast or clear, realistic',
    camera: 'Handheld, shoulder-mounted, zoom adjustments',
    moodColor: '#ffffff',
  },
  Musical: {
    lighting: 'Spotlights, theatrical, color changing',
    weather: 'Stage effects (bubbles, confetti)',
    camera: 'Choreographed movements, crane sweeping, rhythmic cuts',
    moodColor: '#ff00aa',
  },
};

const SCHEMA_DEFINITION = `
{
  "project": {
    "meta": { "title": "string", "description": "string" },
    "environment": {
      "ambientLight": { "intensity": number, "color": "hex" },
      "sun": { "position": [x,y,z], "intensity": number, "color": "hex" },
      "skyColor": "hex",
      "weather": { "type": "none" | "rain" | "snow" | "dust", "intensity": 0-1 }
    },
    "actors": [
      {
        "id": "uuid",
        "type": "character",
        "name": "string",
        "transform": { "position": [x,y,z], "rotation": [x,y,z], "scale": [x,y,z] },
        "animation": "idle" | "walk" | "run" | "wave" | "talk" | "dance" | "sit" | "jump",
        "clothing": { "head": [], "torso": [], "legs": [] }
      },
      {
        "id": "uuid",
        "type": "camera",
        "properties": { "fov": number }
      }
    ],
    "timeline": {
      "duration": number,
      "cameraTrack": [
        { "id": "uuid", "time": number, "cameraId": "uuid", "transition": "cut" | "dissolve" }
      ],
      "animationTracks": []
    }
  }
}
`;

/**
 * Generates a prompt for an LLM to create a scene based on a user idea and style.
 */
export function getAiPrompt(userIdea: string, style: PromptStyle): string {
  const config = STYLE_PRESETS[style];

  return `SYSTEM: You are a professional film director creating scenes for the Animatica animation engine.

SCHEMA:
${SCHEMA_DEFINITION}

ACTOR TYPES:
- character: humanoid with animation, clothing, facial expressions
- primitive: box, sphere, cylinder, etc.
- light: point, spot, directional
- camera: perspective camera with fov/near/far

ANIMATION STATES: idle, walk, run, wave, talk, dance, sit, jump

STYLE: ${style}
- Lighting: ${config.lighting}
- Weather: ${config.weather}
- Camera: ${config.camera}
- Mood Color: ${config.moodColor}

RULES:
1. Always include at least one camera.
2. Timeline duration between 10-60 seconds.
3. Use cinematic camera movements appropriate for the style.
4. Add environmental storytelling (lighting, weather, fog).
5. Vary shot types (wide, medium, close-up).

USER IDEA: ${userIdea}

OUTPUT: Valid JSON matching the ProjectSchema. Nothing else.`;
}

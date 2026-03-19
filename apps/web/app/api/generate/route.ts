/**
 * AI Scene Generation API route.
 * POST /api/generate
 * Body: { prompt: string }
 */
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Animatica's AI scene generator.
Return ONLY valid JSON for a ProjectState-compatible scene.

Required fields:
- meta { title, version: "1.0.0", description }
- environment { ambientLight, sun, skyColor, optional fog, optional weather }
- actors[] with at least one character, one light, and one camera
- timeline { duration, cameraTrack, animationTracks, markers }
- storyboard[] { id, number, name, duration, shotType, description }
- cinematography { guide, aspectRatio }

Use cinematic defaults:
- 3-point lighting
- camera height Y 1.5-1.7
- 35mm/dialogue, 85mm/close portrait, 18mm/establishing
- weather only when implied by prompt

Output JSON object only.`;

type WeatherType = 'none' | 'rain' | 'snow' | 'dust';
type ShotType = 'wide' | 'medium' | 'close-up' | 'establishing';

const id = () => crypto.randomUUID();

function getWeather(prompt: string): WeatherType {
  const text = prompt.toLowerCase();
  if (text.includes('rain') || text.includes('storm')) return 'rain';
  if (text.includes('snow') || text.includes('winter') || text.includes('blizzard')) return 'snow';
  if (text.includes('dust') || text.includes('desert') || text.includes('sand')) return 'dust';
  return 'none';
}

function getAnimation(prompt: string): 'idle' | 'walk' | 'run' | 'talk' | 'wave' | 'dance' | 'sit' | 'jump' {
  const text = prompt.toLowerCase();
  if (text.includes('run')) return 'run';
  if (text.includes('walk')) return 'walk';
  if (text.includes('dance')) return 'dance';
  if (text.includes('wave')) return 'wave';
  if (text.includes('sit')) return 'sit';
  if (text.includes('jump')) return 'jump';
  if (text.includes('talk') || text.includes('say') || text.includes('dialog')) return 'talk';
  return 'idle';
}

function getShotType(prompt: string): ShotType {
  const text = prompt.toLowerCase();
  if (text.includes('close')) return 'close-up';
  if (text.includes('establish') || text.includes('city') || text.includes('landscape')) return 'establishing';
  if (text.includes('dialog') || text.includes('conversation')) return 'medium';
  return 'wide';
}

function generateLocalScene(prompt: string) {
  const weather = getWeather(prompt);
  const animation = getAnimation(prompt);
  const shotType = getShotType(prompt);
  const title = prompt.slice(0, 60) || 'Untitled scene';

  return {
    meta: {
      title,
      version: '1.0.0',
      description: `AI-generated scene from prompt: ${prompt}`,
    },
    environment: {
      ambientLight: { intensity: 0.55, color: '#ddd6c4' },
      sun: { position: [5, 10, 4], intensity: 1.1, color: '#fff4dd' },
      skyColor: weather === 'none' ? '#1a1d2e' : '#253042',
      fog: weather === 'none' ? undefined : { color: '#394255', near: 10, far: 45 },
      weather: { type: weather, intensity: weather === 'none' ? 0 : 0.65 },
    },
    actors: [
      {
        id: id(),
        name: 'Hero',
        type: 'character',
        transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        visible: true,
        animation,
        morphTargets: { mouthSmile: animation === 'talk' ? 0.1 : 0.35 },
        bodyPose: {},
        clothing: {},
      },
      {
        id: id(),
        name: 'Ground',
        type: 'primitive',
        transform: { position: [0, -0.05, 0], rotation: [0, 0, 0], scale: [30, 0.1, 30] },
        visible: true,
        properties: {
          shape: 'box',
          color: '#2b2f3a',
          roughness: 0.85,
          metalness: 0.1,
          opacity: 1,
          wireframe: false,
        },
      },
      {
        id: id(),
        name: 'Key Light',
        type: 'light',
        transform: { position: [3, 5, 2], rotation: [0, 0, 0], scale: [1, 1, 1] },
        visible: true,
        properties: { lightType: 'spot', intensity: 1.25, color: '#fff0df', castShadow: true },
      },
      {
        id: id(),
        name: 'Fill Light',
        type: 'light',
        transform: { position: [-3, 3, 2], rotation: [0, 0, 0], scale: [1, 1, 1] },
        visible: true,
        properties: { lightType: 'point', intensity: 0.5, color: '#9ab8ff', castShadow: false },
      },
      {
        id: id(),
        name: 'Rim Light',
        type: 'light',
        transform: { position: [0, 4, -3], rotation: [0, 0, 0], scale: [1, 1, 1] },
        visible: true,
        properties: { lightType: 'directional', intensity: 0.7, color: '#ffffff', castShadow: false },
      },
      {
        id: id(),
        name: 'Main Camera',
        type: 'camera',
        transform: { position: [0, 1.6, 5], rotation: [-0.1, 0, 0], scale: [1, 1, 1] },
        visible: true,
        properties: { fov: shotType === 'close-up' ? 30 : 45, near: 0.1, far: 100 },
      },
    ],
    timeline: {
      duration: 12,
      cameraTrack: [],
      animationTracks: [],
      markers: [{ id: id(), time: 0, label: 'Start', color: '#6366f1' }],
    },
    storyboard: [
      { id: id(), number: 1, name: 'Establish', duration: 4, shotType: 'establishing', description: 'Set mood and location.' },
      { id: id(), number: 2, name: 'Action', duration: 5, shotType, description: `Character performs ${animation}.` },
      { id: id(), number: 3, name: 'Finish', duration: 3, shotType: 'close-up', description: 'Emotional end beat.' },
    ],
    cinematography: {
      guide: 'thirds',
      aspectRatio: '16:9',
    },
    library: { clips: [] },
  };
}

/** POST /api/generate — Generate a scene from text description. */
export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "prompt" field' }, { status: 400 });
    }

    if (prompt.length > 2000) {
      return NextResponse.json({ error: 'Prompt too long (max 2000 characters)' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(generateLocalScene(prompt));
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Create a scene: ${prompt}` },
        ],
        temperature: 0.6,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(generateLocalScene(prompt));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return NextResponse.json(generateLocalScene(prompt));

    const scene = JSON.parse(content);
    return NextResponse.json(scene.project || scene);
  } catch {
    return NextResponse.json({ error: 'Failed to generate scene' }, { status: 500 });
  }
}

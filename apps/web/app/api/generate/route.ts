/**
 * AI Scene Generation API route.
 * POST /api/generate
 * Body: { prompt: string }
 * Returns: ProjectState JSON
 */
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Animatica's AI scene generator. Given a user's scene description, 
output a valid JSON ProjectState object with actors, environment, timeline, camera settings, and storyboard.

Rules:
- Output ONLY valid JSON, no markdown or explanation
- Always include a "meta" object with title and version "1.0.0"
- Actors must have: id (UUID), name, type (character|primitive|light|camera|speaker), transform, visible
- Characters need: animation, morphTargets, bodyPose, clothing
  - Characters can have "glbUrl" for loading 3D models (optional)
- Environment needs: ambientLight, sun, skyColor
  - Environment can include: fog, weather (type: rain|snow|dust|none, intensity: 0-1)
- Timeline needs: duration, cameraTrack[], animationTracks[], markers[]
- Camera actors can include: focalLength (mm), aperture (f-stop), shake (none|handheld|subtle|explosion|earthquake)
- Include a "storyboard" array with shots: { id, number, name, duration, shotType, description }
- Include "cinematography" object: { guide: thirds|golden|center|none, aspectRatio: 16:9|2.39:1|4:3|1:1|9:16 }

Available animation states: idle, walk, run, talk, wave, dance, sit, jump
Available primitive shapes: box, sphere, cylinder, plane, cone, torus, capsule
Available light types: point, spot, directional
Available weather types: none, rain, snow, dust
Available shot types: wide, medium, close-up, extreme-close-up, over-shoulder, pov, establishing, insert, tracking, crane
Available lens presets: 18mm (ultra-wide), 24mm (wide), 35mm (standard), 50mm (normal), 85mm (portrait), 135mm (telephoto)
Available guide types: none, thirds, golden, center, diagonal
Available morph targets: browInnerUp, browDownLeft, browDownRight, browOuterUpLeft, browOuterUpRight, eyeLookUpLeft, eyeLookUpRight, eyeLookDownLeft, eyeLookDownRight, eyeLookInLeft, eyeLookInRight, eyeLookOutLeft, eyeLookOutRight, eyeBlinkLeft, eyeBlinkRight, eyeSquintLeft, eyeSquintRight, eyeWideLeft, eyeWideRight, cheekPuff, cheekSquintLeft, cheekSquintRight, noseSneerLeft, noseSneerRight, jawOpen, jawForward, jawLeft, jawRight, mouthClose, mouthFunnel, mouthPucker, mouthLeft, mouthRight, mouthSmile, mouthFrownLeft, mouthFrownRight, mouthDimpleLeft, mouthDimpleRight, mouthStretchLeft, mouthStretchRight, mouthRollLower, mouthRollUpper, mouthShrugLower, mouthShrugUpper, mouthPressLeft, mouthPressRight, mouthLowerDownLeft, mouthLowerDownRight, mouthUpperUpLeft, mouthUpperUpRight, tongueOut

When creating scenes:
- Use cinematic 3-point lighting (key, fill, rim lights)
- Position cameras at eye level (Y: 1.5-1.7) for natural shots
- Set appropriate focal lengths: 35mm for dialogue, 85mm for portraits, 18mm for establishing shots
- Use shallow DOF (aperture < 4) for dramatic close-ups
- Add weather effects when the scene description implies it (rain, snow, etc.)
- Set character expressions via morphTargets to match the mood
- Create multiple shots in storyboard for complex scenes

Generate UUIDs in format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`;

/**
 * POST /api/generate — Generate a scene from text description.
 */
export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid "prompt" field' },
                { status: 400 }
            );
        }

        if (prompt.length > 2000) {
            return NextResponse.json(
                { error: 'Prompt too long (max 2000 characters)' },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            // Fallback: return a demo scene
            return NextResponse.json(generateDemoScene(prompt));
        }

        // Call OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Create a scene: ${prompt}` },
                ],
                temperature: 0.7,
                max_tokens: 4000,
                response_format: { type: 'json_object' },
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('[AI Generate] OpenAI error:', errorData);
            return NextResponse.json(generateDemoScene(prompt));
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return NextResponse.json(generateDemoScene(prompt));
        }

        const scene = JSON.parse(content);
        return NextResponse.json(scene.project || scene);
    } catch (error) {
        console.error('[AI Generate] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate scene' },
            { status: 500 }
        );
    }
}

/**
 * Fallback demo scene generator when no OpenAI key is configured.
 */
function generateDemoScene(prompt: string) {
    const id = () => crypto.randomUUID();
    const title = prompt.slice(0, 50);

    return {
        meta: { title, version: '1.0.0', description: `AI-generated: ${prompt}` },
        environment: {
            ambientLight: { intensity: 0.6, color: '#e8e0d0' },
            sun: { position: [5, 10, 5], intensity: 1.2, color: '#fff5e0' },
            skyColor: '#1a1a2e',
            fog: { color: '#1a1a2e', near: 15, far: 50 },
        },
        actors: [
            {
                id: id(),
                name: 'Main Character',
                type: 'character',
                transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                visible: true,
                animation: 'idle',
                morphTargets: { mouthSmile: 0.3 },
                bodyPose: {},
                clothing: {},
            },
            {
                id: id(),
                name: 'Ground',
                type: 'primitive',
                transform: { position: [0, -0.01, 0], rotation: [0, 0, 0], scale: [20, 0.02, 20] },
                visible: true,
                properties: {
                    shape: 'box',
                    color: '#2a2a3a',
                    roughness: 0.9,
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
                properties: { lightType: 'point', intensity: 1.5, color: '#ffeedd', castShadow: true },
            },
            {
                id: id(),
                name: 'Main Camera',
                type: 'camera',
                transform: { position: [0, 1.6, 5], rotation: [-0.1, 0, 0], scale: [1, 1, 1] },
                visible: true,
                properties: { fov: 45, near: 0.1, far: 100 },
            },
        ],
        timeline: {
            duration: 10,
            cameraTrack: [],
            animationTracks: [],
            markers: [{ id: id(), time: 0, label: 'Start', color: '#6366f1' }],
        },
        library: { clips: [] },
    };
}

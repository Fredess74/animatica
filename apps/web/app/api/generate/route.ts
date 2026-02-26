/**
 * AI Scene Generation API route.
 * POST /api/generate
 * Body: { prompt: string }
 * Returns: ProjectState JSON
 */
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Animatica's AI scene generator. Given a user's scene description, 
output a valid JSON ProjectState object with actors, environment, and timeline.

Rules:
- Output ONLY valid JSON, no markdown or explanation
- Always include a "meta" object with title and version "1.0.0"
- Actors must have: id (UUID), name, type (character|primitive|light|camera|speaker), transform, visible
- Characters need: animation, morphTargets, bodyPose, clothing
- Environment needs: ambientLight, sun, skyColor
- Timeline needs: duration, cameraTrack[], animationTracks[], markers[]

Available animation states: idle, walk, run, talk, wave, dance, sit, jump
Available primitive shapes: box, sphere, cylinder, plane, cone, torus, capsule
Available light types: point, spot, directional

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

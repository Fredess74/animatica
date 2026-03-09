import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ProjectMetaSchema, ProjectStateSchema } from '@Animatica/engine';
import { createProject, getProjects } from '@/lib/db';
import { handleError, jsonResponse } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

// We avoid mixing Zod versions by validating the structure with local Zod
// and then delegating detailed validation to Engine schemas.
const BodySchema = z.object({
  meta: z.unknown(),
  state: z.unknown().optional(),
});

export async function GET(req: NextRequest) {
  const limit = rateLimit(req);
  if (limit) return limit;

  try {
    // In a real app, get user ID from session
    // For now, return all projects
    const projects = await getProjects();
    return jsonResponse(projects);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(req);
  if (limit) return limit;

  try {
    const json = await req.json();
    const { meta, state } = BodySchema.parse(json);

    // Validate using Engine schemas
    const validatedMeta = ProjectMetaSchema.parse(meta);

    let newState: any; // We'll construct it

    if (state) {
      newState = ProjectStateSchema.parse(state);
    } else {
      // Construct default state if not provided
      newState = {
        meta: validatedMeta,
        environment: {
          ambientLight: { intensity: 0.5, color: '#ffffff' },
          sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
          skyColor: '#87ceeb',
        },
        actors: [],
        timeline: {
          duration: 30,
          cameraTrack: [],
          animationTracks: [],
          markers: [],
        },
        library: { clips: [] },
      };
    }

    // Mock User ID
    const userId = 'user-1';

    // We cast newState because createProject expects ProjectState from engine,
    // and our local construction matches the shape.
    const project = await createProject(userId, newState);
    return jsonResponse(project, 201);
  } catch (error) {
    return handleError(error);
  }
}

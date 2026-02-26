import { NextRequest, NextResponse } from 'next/server';
import { ProjectStateSchema } from '@Animatica/engine';
import { getProjectById, updateProject, deleteProject } from '@/lib/db';
import { handleError, jsonResponse } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const limit = rateLimit(req);
  if (limit) return limit;

  try {
    const { id } = await params;
    const project = await getProjectById(id);
    if (!project) {
      return jsonResponse({ error: 'Project not found' }, 404);
    }
    return jsonResponse(project);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const limit = rateLimit(req);
  if (limit) return limit;

  try {
    const { id } = await params;
    const json = await req.json();

    // Validate partial updates using the engine schema.
    // We handle potential Zod version mismatches (Engine v4 vs Web v3) by checking
    // for the existence of .partial() at runtime.
    const schema = ProjectStateSchema as any;
    let updates;

    if (typeof schema.partial === 'function') {
      updates = schema.partial().parse(json);
    } else {
      updates = schema.parse(json);
    }

    const updated = await updateProject(id, updates);
    if (!updated) {
      return jsonResponse({ error: 'Project not found' }, 404);
    }
    return jsonResponse(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const limit = rateLimit(req);
  if (limit) return limit;

  try {
    const { id } = await params;
    const success = await deleteProject(id);
    if (!success) {
      return jsonResponse({ error: 'Project not found' }, 404);
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
}

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

    // We attempt to use .partial() if available on the imported schema.
    // If not (e.g. it's not a ZodObject), we might need another strategy.
    // Assuming ProjectStateSchema is a ZodObject as it represents the state.
    let updates;
    if ('partial' in ProjectStateSchema && typeof ProjectStateSchema.partial === 'function') {
        // @ts-ignore - Schema version mismatch might cause TS issues but runtime should work
        updates = ProjectStateSchema.partial().parse(json);
    } else {
        // Fallback: Validate full object if partial is not supported, or just trust simple validation
        // But for PUT we usually want to allow partial updates?
        // Actually, strict PUT means replace. PATCH means update.
        // Let's assume strict validation for now, or use loose validation if .partial fails.
        // If the schema is generic, we can't easily make it partial.
        // We'll try to parse as full state if partial fails or isn't available.
        updates = ProjectStateSchema.parse(json);
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

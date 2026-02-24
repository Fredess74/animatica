import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, ProjectSchema } from '../../db';
import { withRateLimit } from '../../rate-limit';

const UpdateProjectSchema = ProjectSchema.pick({
  title: true,
  description: true,
  sceneData: true,
  authorId: true,
}).partial();

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  return withRateLimit(req, async () => {
    const params = await props.params;
    const project = await db.getProjectById(params.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  });
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  return withRateLimit(req, async () => {
    try {
      const params = await props.params;
      const body = await req.json();
      const updateData = UpdateProjectSchema.parse(body);

      const updatedProject = await db.updateProject(params.id, updateData);
      if (!updatedProject) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json(updatedProject);
    } catch (error) {
       if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  return withRateLimit(req, async () => {
    const params = await props.params;
    const success = await db.deleteProject(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  });
}

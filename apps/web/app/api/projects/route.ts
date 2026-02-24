import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, ProjectSchema } from '../db';
import { withRateLimit } from '../rate-limit';

// POST requires less fields than full Project
const CreateProjectSchema = ProjectSchema.pick({
  title: true,
  description: true,
  authorId: true,
  sceneData: true,
}).partial({
  description: true,
  sceneData: true,
});

export async function GET(req: Request) {
  // Rate limit
  return withRateLimit(req, async () => {
    // In a real app, verify token and get userId
    const { searchParams } = new URL(req.url);
    const authorId = searchParams.get('authorId') || undefined;

    const projects = await db.getProjects(authorId);
    return NextResponse.json(projects);
  });
}

export async function POST(req: Request) {
  return withRateLimit(req, async () => {
    try {
      const body = await req.json();
      const projectData = CreateProjectSchema.parse(body);

      const newProject = await db.createProject(projectData);
      return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
       if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });
}

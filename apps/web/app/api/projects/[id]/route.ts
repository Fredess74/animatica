import { NextResponse } from 'next/server';
import { db } from '@/lib/mockDb';
import { UpdateProjectSchema } from '@/lib/schemas';
import { rateLimit, getIp } from '@/lib/rateLimit';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIp(request);
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  const { id } = await params;
  const project = await db.projects.findUnique(id);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIp(request);
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const result = UpdateProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    const updatedProject = await db.projects.update(id, result.data);

    if (!updatedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIp(request);
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  const { id } = await params;
  const deletedProject = await db.projects.delete(id);

  if (!deletedProject) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Project deleted successfully' });
}

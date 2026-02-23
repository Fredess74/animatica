import { NextResponse } from 'next/server';
import { db } from '@/lib/mockDb';
import { CreateProjectSchema } from '@/lib/schemas';
import { rateLimit, getIp } from '@/lib/rateLimit';

export async function GET(request: Request) {
  const ip = getIp(request);
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  const projects = await db.projects.findMany();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const ip = getIp(request);
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const result = CreateProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, description, state } = result.data;
    const project = await db.projects.create({
      userId: 'user-1', // Mock user ID
      name,
      description,
      state,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

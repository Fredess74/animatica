import { NextResponse } from 'next/server';
import { ExportProjectSchema } from '@/lib/schemas';
import { rateLimit, getIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const ip = getIp(request);
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const result = ExportProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    const { projectId, format, quality } = result.data;

    // Mock export job
    return NextResponse.json({
      jobId: Math.random().toString(36).substring(7),
      status: 'pending',
      projectId,
      format,
      quality,
      estimatedTime: 120, // seconds
    });
  } catch (error) {
    console.error('Failed to start export:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

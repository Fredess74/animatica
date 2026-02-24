import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withRateLimit } from '../rate-limit';

const ExportRequestSchema = z.object({
  projectId: z.string(),
  format: z.enum(['mp4', 'webm', 'gif']),
  resolution: z.enum(['720p', '1080p', '4k']),
  fps: z.number().min(1).max(120).default(30),
});

export async function POST(req: Request) {
  return withRateLimit(req, async () => {
    try {
      const body = await req.json();
      const exportSettings = ExportRequestSchema.parse(body);

      // In a real app, this would trigger a background job (e.g., AWS Lambda, BullMQ)
      // Here we simulate a job ID
      const jobId = `export-job-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      return NextResponse.json({
        jobId,
        status: 'pending',
        message: 'Export job started',
        settings: exportSettings
      }, { status: 202 });

    } catch (error) {
       if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });
}

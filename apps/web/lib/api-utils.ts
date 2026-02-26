import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function handleError(error: unknown) {
  // Check for ZodError by instance or by structure (name === 'ZodError')
  // This handles version mismatches between packages
  if (error instanceof ZodError || (error && (error as any).name === 'ZodError')) {
    return NextResponse.json(
      { error: 'Validation Error', details: (error as any).issues || (error as any).errors },
      { status: 400 }
    );
  }

  console.error('API Error:', error);

  if (error instanceof Error) {
    // For security, don't expose internal error details in production unless intended
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
}

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

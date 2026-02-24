import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../db';
import { withRateLimit } from '../../rate-limit';

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

export async function POST(req: Request) {
  return withRateLimit(req, async () => {
    try {
      const body = await req.json();
      const { email, password, name } = SignupSchema.parse(body);

      const existingUser = await db.findUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
      }

      // In a real app, hash the password
      const newUser = await db.createUser({ email, password, name });

      // Mock JWT token
      const token = `mock-jwt-token-${newUser.id}`;

      return NextResponse.json({
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
        token
      }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });
}

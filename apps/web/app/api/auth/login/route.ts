import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../db';
import { withRateLimit } from '../../rate-limit';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  return withRateLimit(req, async () => {
    try {
      const body = await req.json();
      const { email, password } = LoginSchema.parse(body);

      const user = await db.findUserByEmail(email);

      // In a real app, use bcrypt.compare(password, user.password)
      if (!user || user.password !== password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Mock JWT token
      const token = `mock-jwt-token-${user.id}`;

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name },
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role, interviewType, durationMinutes } = body;

    // Validate input
    if (!role || !interviewType || !durationMinutes) {
      return NextResponse.json(
        { error: 'Missing required fields: role, interviewType, durationMinutes' },
        { status: 400 }
      );
    }

    const validTypes = ['technical', 'behavioral', 'mixed'];
    if (!validTypes.includes(interviewType)) {
      return NextResponse.json(
        { error: 'Invalid interviewType. Must be: technical, behavioral, or mixed' },
        { status: 400 }
      );
    }

    const validDurations = [15, 30, 45];
    if (!validDurations.includes(durationMinutes)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be: 15, 30, or 45' },
        { status: 400 }
      );
    }

    // Check if user has interviews remaining
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { interviewsRemaining: true },
    });

    if (!user || user.interviewsRemaining <= 0) {
      return NextResponse.json(
        { error: 'No interview credits remaining' },
        { status: 403 }
      );
    }

    // Create interview session and decrement credits in a transaction
    const [interviewSession] = await prisma.$transaction([
      prisma.interviewSession.create({
        data: {
          userId: session.user.id,
          role,
          interviewType,
          durationMinutes,
          status: 'in_progress',
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { interviewsRemaining: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({
      id: interviewSession.id,
      role: interviewSession.role,
      interviewType: interviewSession.interviewType,
      durationMinutes: interviewSession.durationMinutes,
      status: interviewSession.status,
      startedAt: interviewSession.startedAt,
    });
  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

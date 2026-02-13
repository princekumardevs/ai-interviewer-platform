import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/interviews
 * List all interview sessions for the authenticated user.
 * Returns sessions with feedback scores, ordered by most recent.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        role: true,
        interviewType: true,
        durationMinutes: true,
        status: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        feedback: {
          select: {
            overallScore: true,
            technicalDepthScore: true,
            communicationScore: true,
            structureScore: true,
            confidenceScore: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    // Compute aggregate stats
    const completed = sessions.filter((s) => s.status === 'completed');
    const withFeedback = completed.filter((s) => s.feedback);
    const avgScore =
      withFeedback.length > 0
        ? Math.round(
            withFeedback.reduce(
              (sum, s) => sum + (s.feedback?.overallScore || 0),
              0
            ) / withFeedback.length
          )
        : null;

    return NextResponse.json({
      sessions,
      stats: {
        total: sessions.length,
        completed: completed.length,
        avgScore,
      },
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}

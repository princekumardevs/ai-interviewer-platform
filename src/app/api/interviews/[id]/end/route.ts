import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGeminiClient, GEMINI_MODEL, MAX_TOKENS } from '@/lib/anthropic/client';
import { buildFeedbackPrompt } from '@/lib/anthropic/feedback';

/**
 * POST /api/interviews/[id]/end
 * Marks the interview session as completed and generates AI feedback.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          select: { role: true, content: true },
        },
      },
    });

    if (!interviewSession) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      );
    }

    if (interviewSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (interviewSession.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Interview is not in progress' },
        { status: 400 }
      );
    }

    // Mark the session as completed
    const updated = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Generate feedback with Gemini (non-blocking — we save it async)
    let feedback = null;
    try {
      const feedbackPrompt = buildFeedbackPrompt(
        {
          role: interviewSession.role,
          interviewType: interviewSession.interviewType as 'technical' | 'behavioral' | 'mixed',
          experienceLevel: 'mid',
          durationMinutes: interviewSession.durationMinutes,
          candidateName: session.user.name || 'Candidate',
        },
        interviewSession.messages
      );

      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: feedbackPrompt }] }],
        config: {
          maxOutputTokens: MAX_TOKENS * 2, // feedback needs more tokens
        },
      });

      const responseText =
        response.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse the JSON response — strip markdown fences if present
      const jsonStr = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      // Validate scores are numbers in range
      const clamp = (v: unknown) => Math.max(1, Math.min(100, Number(v) || 50));

      feedback = await prisma.interviewFeedback.create({
        data: {
          sessionId,
          overallScore: clamp(parsed.overallScore),
          technicalDepthScore: clamp(parsed.technicalDepthScore),
          communicationScore: clamp(parsed.communicationScore),
          structureScore: clamp(parsed.structureScore),
          confidenceScore: clamp(parsed.confidenceScore),
          strengths: String(parsed.strengths || ''),
          improvements: String(parsed.improvements || ''),
          detailedFeedback: parsed.detailedFeedback || [],
        },
      });
    } catch (feedbackError) {
      console.error('Error generating feedback:', feedbackError);
      // Don't fail the whole request if feedback generation fails
      // The user can still see their completed interview
    }

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      completedAt: updated.completedAt,
      feedbackGenerated: !!feedback,
    });
  } catch (error) {
    console.error('Error ending interview:', error);
    return NextResponse.json(
      { error: 'Failed to end interview' },
      { status: 500 }
    );
  }
}

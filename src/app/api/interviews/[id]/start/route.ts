import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGeminiClient, GEMINI_MODEL, MAX_TOKENS } from '@/lib/anthropic/client';
import { buildSystemPrompt } from '@/lib/anthropic/prompts';

export const dynamic = 'force-dynamic';

/**
 * POST /api/interviews/[id]/start
 * Generates the AI interviewer's opening message to kick off the interview.
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

    // Get the interview session
    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        user: { select: { id: true, name: true, experienceLevel: true } },
        messages: true,
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

    // If messages already exist, the interview has already started
    if (interviewSession.messages.length > 0) {
      return NextResponse.json(
        { error: 'Interview has already started' },
        { status: 400 }
      );
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt({
      role: interviewSession.role,
      interviewType: interviewSession.interviewType as 'technical' | 'behavioral' | 'mixed',
      experienceLevel: interviewSession.user.experienceLevel as 'entry' | 'mid' | 'senior',
      durationMinutes: interviewSession.durationMinutes,
      candidateName: interviewSession.user.name || 'the candidate',
    });

    // Get Gemini's opening message with retry for rate limiting
    const MAX_RETRIES = 3;
    let openingMessage: string | null = null;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await getGeminiClient().models.generateContent({
          model: GEMINI_MODEL,
          contents: [
            {
              role: 'user',
              parts: [{ text: '[The candidate has joined the interview. Please introduce yourself and begin with your first question.]' }],
            },
          ],
          config: {
            maxOutputTokens: MAX_TOKENS,
            systemInstruction: systemPrompt,
          },
        });

        openingMessage =
          response.text || 'Hello! Thank you for joining. Could you start by telling me a bit about yourself?';
        break; // Success
      } catch (err: unknown) {
        lastError = err;
        const isRateLimit =
          (err instanceof Error && err.message?.includes('429')) ||
          (err as { status?: number })?.status === 429;

        if (isRateLimit && attempt < MAX_RETRIES - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(
            `Gemini rate limited on start (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }

    if (!openingMessage) {
      console.error('Error starting interview:', lastError);
      const isRateLimit =
        (lastError instanceof Error && lastError.message?.includes('429')) ||
        (lastError as { status?: number })?.status === 429;

      if (isRateLimit) {
        return NextResponse.json(
          { error: 'The AI service is currently busy. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to start interview' },
        { status: 500 }
      );
    }

    // Save the system trigger and the assistant's opening as messages
    await prisma.interviewMessage.createMany({
      data: [
        {
          sessionId,
          role: 'user',
          content: '[Interview Started]',
        },
        {
          sessionId,
          role: 'assistant',
          content: openingMessage,
        },
      ],
    });

    return NextResponse.json({
      role: 'assistant',
      content: openingMessage,
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    return NextResponse.json(
      { error: 'Failed to start interview' },
      { status: 500 }
    );
  }
}

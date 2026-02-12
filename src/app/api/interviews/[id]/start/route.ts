import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAnthropicClient, CLAUDE_MODEL, MAX_TOKENS } from '@/lib/anthropic/client';
import { buildSystemPrompt } from '@/lib/anthropic/prompts';

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

    // Get Claude's opening message
    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: '[The candidate has joined the interview. Please introduce yourself and begin with your first question.]',
        },
      ],
    });

    const openingMessage =
      response.content[0].type === 'text'
        ? response.content[0].text
        : 'Hello! Thank you for joining. Could you start by telling me a bit about yourself?';

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

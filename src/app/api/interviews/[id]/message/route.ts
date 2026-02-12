import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAnthropicClient, CLAUDE_MODEL, MAX_TOKENS } from '@/lib/anthropic/client';
import { buildSystemPrompt } from '@/lib/anthropic/prompts';

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
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Get the interview session and verify ownership
    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        user: { select: { id: true, name: true, experienceLevel: true } },
        messages: { orderBy: { timestamp: 'asc' } },
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
        { error: 'Interview session is not active' },
        { status: 400 }
      );
    }

    // Save the user's message
    await prisma.interviewMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: content.trim(),
      },
    });

    // Build conversation history for Claude
    const systemPrompt = buildSystemPrompt({
      role: interviewSession.role,
      interviewType: interviewSession.interviewType as 'technical' | 'behavioral' | 'mixed',
      experienceLevel: interviewSession.user.experienceLevel as 'entry' | 'mid' | 'senior',
      durationMinutes: interviewSession.durationMinutes,
      candidateName: interviewSession.user.name || 'the candidate',
    });

    const conversationHistory = interviewSession.messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Add the new user message
    conversationHistory.push({
      role: 'user' as const,
      content: content.trim(),
    });

    // Call Claude
    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: conversationHistory,
    });

    const assistantContent =
      response.content[0].type === 'text'
        ? response.content[0].text
        : 'I apologize, but I encountered an issue. Could you repeat that?';

    // Save Claude's response
    const assistantMessage = await prisma.interviewMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: assistantContent,
      },
    });

    return NextResponse.json({
      id: assistantMessage.id,
      role: 'assistant',
      content: assistantContent,
      timestamp: assistantMessage.timestamp,
    });
  } catch (error) {
    console.error('Error in interview message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

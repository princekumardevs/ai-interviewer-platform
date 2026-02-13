import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGeminiClient, GEMINI_MODEL, MAX_TOKENS } from '@/lib/anthropic/client';
import { buildSystemPrompt } from '@/lib/anthropic/prompts';

// Prevent Next.js from buffering the streaming response
export const dynamic = 'force-dynamic';

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

    // Build conversation history for Gemini
    const systemPrompt = buildSystemPrompt({
      role: interviewSession.role,
      interviewType: interviewSession.interviewType as 'technical' | 'behavioral' | 'mixed',
      experienceLevel: interviewSession.user.experienceLevel as 'entry' | 'mid' | 'senior',
      durationMinutes: interviewSession.durationMinutes,
      candidateName: interviewSession.user.name || 'the candidate',
    });

    // Build Gemini conversation contents
    const contents = interviewSession.messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: msg.content }],
    }));

    // Add the new user message
    contents.push({
      role: 'user' as const,
      parts: [{ text: content.trim() }],
    });

    // Retry logic for rate limiting before streaming
    const MAX_RETRIES = 3;
    let streamResponse: AsyncIterable<{ text?: string | null | undefined }> | null = null;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await getGeminiClient().models.generateContentStream({
          model: GEMINI_MODEL,
          contents,
          config: {
            maxOutputTokens: MAX_TOKENS,
            systemInstruction: systemPrompt,
          },
        });
        streamResponse = response;
        break;
      } catch (err: unknown) {
        lastError = err;
        const isRateLimit =
          (err instanceof Error && err.message?.includes('429')) ||
          (err as { status?: number })?.status === 429;

        if (isRateLimit && attempt < MAX_RETRIES - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(
            `Gemini rate limited (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }

    if (!streamResponse) {
      console.error('Error in interview message:', lastError);
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
        { error: 'Failed to process message' },
        { status: 500 }
      );
    }

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        try {
          let chunkIndex = 0;
          for await (const chunk of streamResponse!) {
            const text = chunk.text ?? '';
            if (text) {
              fullContent += text;
              console.log(`[Stream] chunk ${chunkIndex++}: ${text.length} chars`);
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: text })}\n\n`)
              );
            }
          }
          console.log(`[Stream] complete: ${fullContent.length} total chars`);

          // Save complete message to DB
          const finalContent = fullContent || 'I apologize, but I encountered an issue. Could you repeat that?';
          const assistantMessage = await prisma.interviewMessage.create({
            data: {
              sessionId,
              role: 'assistant',
              content: finalContent,
            },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                id: assistantMessage.id,
                timestamp: assistantMessage.timestamp,
              })}\n\n`
            )
          );
        } catch (err) {
          console.error('Streaming error:', err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted' })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Unexpected error in interview message handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

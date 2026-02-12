import { InterviewConfig } from './prompts';

/**
 * Build a prompt that asks Gemini to analyze an interview transcript
 * and return structured feedback as JSON.
 */
export function buildFeedbackPrompt(
  config: InterviewConfig,
  transcript: { role: string; content: string }[]
): string {
  // Filter out system messages
  const cleanTranscript = transcript
    .filter((msg) => msg.content !== '[Interview Started]')
    .map((msg) => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
    .join('\n\n');

  return `You are an expert interview coach analyzing a mock interview transcript. The candidate interviewed for a ${config.role} position at the ${config.experienceLevel} level. This was a ${config.interviewType} interview.

## Transcript
${cleanTranscript}

## Your Task
Analyze the candidate's performance and provide detailed, constructive feedback. Be honest but encouraging. Score each dimension from 1-100 where:
- 1-25: Poor — significant gaps
- 26-50: Below Average — needs improvement  
- 51-75: Good — solid with room to grow
- 76-100: Excellent — strong performance

## Response Format
You MUST respond with ONLY valid JSON, no markdown, no code fences, no extra text. Use this exact structure:

{
  "overallScore": <number 1-100>,
  "technicalDepthScore": <number 1-100>,
  "communicationScore": <number 1-100>,
  "structureScore": <number 1-100>,
  "confidenceScore": <number 1-100>,
  "strengths": "<2-4 bullet points of what the candidate did well, separated by newlines>",
  "improvements": "<2-4 bullet points of specific areas to improve, separated by newlines>",
  "detailedFeedback": [
    {
      "question": "<the interviewer's question>",
      "candidateAnswer": "<brief summary of the candidate's answer>",
      "score": <number 1-100>,
      "feedback": "<1-2 sentences of specific feedback for this answer>",
      "suggestion": "<1 sentence of what a stronger answer would include>"
    }
  ]
}

## Scoring Guidelines
- **Technical Depth**: How well did the candidate demonstrate knowledge of concepts, tools, and best practices?
- **Communication**: Was the candidate clear, concise, and articulate?
- **Structure**: Did the candidate organize their thoughts well? (e.g., STAR method for behavioral)
- **Confidence**: Did the candidate sound confident and professional?
- **Overall**: Holistic assessment of interview readiness.

For behavioral interviews, weight Structure and Communication more heavily.
For technical interviews, weight Technical Depth more heavily.

Provide per-question feedback for each interviewer question (skip the opening greeting/introduction).`;
}

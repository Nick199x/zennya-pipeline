import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { concept, format = '9:16' } = body;

    const systemPromptPath = join(process.cwd(), 'prompts', 'agent2_system.md');
    const systemPrompt = readFileSync(systemPromptPath, 'utf-8');

    const userPrompt = `
Concept to enhance:
${concept}

Format: ${format}

Generate image generation prompts following the guidelines above.
`;

    console.log('🔍 AGENT 2 (Alessa) - Generating prompts...');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.5,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const result = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('❌ AGENT 2 ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Agent 2 failed' },
      { status: 500 }
    );
  }
}

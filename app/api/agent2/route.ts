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
    const { prompt } = body;

    const systemPromptPath = join(process.cwd(), 'prompts', 'agent2_system.md');
    const systemPrompt = readFileSync(systemPromptPath, 'utf-8');

    console.log('🔍 AGENT 2 (Alessa) - Prompt Engineer responding...');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.5,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
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

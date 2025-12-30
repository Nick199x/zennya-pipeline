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
    const { campaignType, avatar, product, format = '9:16' } = body;

    const systemPromptPath = join(process.cwd(), 'prompts', 'agent1_system.md');
    const systemPrompt = readFileSync(systemPromptPath, 'utf-8');

    const userPrompt = `
Campaign Type: ${campaignType}
Target Avatar: ${avatar}
Product Focus: ${product}
Format: ${format}

Generate 3 high-ROAS campaign concepts following the guidelines above.
`;

    console.log('🔍 AGENT 1 (Brian) - Starting ideation...');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const result = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('❌ AGENT 1 ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Agent 1 failed' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start processing in background
  (async () => {
    try {
      const body = await request.json();
      const { prompt } = body;

      // Helper to send updates to frontend
      const sendUpdate = async (agent: string, message: string) => {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ agent, message })}\n\n`)
        );
      };

      // STEP 1: BRIAN - Campaign Strategist
      await sendUpdate('BRIAN', '🔍 Brian is generating campaign concepts...');
      
      const agent1Prompt = readFileSync(join(process.cwd(), 'prompts', 'agent1_system.md'), 'utf-8');
      const brianResponse = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.7,
        system: agent1Prompt,
        messages: [{ role: 'user', content: prompt }],
      });
      
      const brianResult = brianResponse.content[0].type === 'text' ? brianResponse.content[0].text : '';
      await sendUpdate('BRIAN', brianResult);

      // STEP 2: LESTER - Brand Safety
      await sendUpdate('LESTER', '🔍 Lester is evaluating concepts...');
      
      const agent3Prompt = readFileSync(join(process.cwd(), 'prompts', 'agent3_system.md'), 'utf-8');
      const lesterResponse = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.3,
        system: agent3Prompt,
        messages: [{ role: 'user', content: `Evaluate these concepts:\n\n${brianResult}` }],
      });
      
      const lesterResult = lesterResponse.content[0].type === 'text' ? lesterResponse.content[0].text : '';
      await sendUpdate('LESTER', lesterResult);

      // STEP 3: ALESSA - Prompt Engineer
      await sendUpdate('ALESSA', '🔍 Alessa is creating generation prompts...');
      
      const agent2Prompt = readFileSync(join(process.cwd(), 'prompts', 'agent2_system.md'), 'utf-8');
      const alessaResponse = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.5,
        system: agent2Prompt,
        messages: [{ role: 'user', content: `Generate prompts for these approved concepts:\n\n${lesterResult}` }],
      });
      
      const alessaResult = alessaResponse.content[0].type === 'text' ? alessaResponse.content[0].text : '';
      await sendUpdate('ALESSA', alessaResult);

      // Done!
      await sendUpdate('SYSTEM', 'COMPLETE');
      await writer.close();

    } catch (error: any) {
      console.error('❌ PIPELINE ERROR:', error);
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ agent: 'ERROR', message: error.message })}\n\n`)
      );
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

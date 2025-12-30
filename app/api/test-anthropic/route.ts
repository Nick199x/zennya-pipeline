import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{ 
        role: 'user', 
        content: 'Say hello in 5 words' 
      }]
    });
    
    return NextResponse.json({ 
      success: true,
      response: message.content
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}

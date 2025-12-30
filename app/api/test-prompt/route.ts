import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const promptPath = path.join(process.cwd(), 'prompts/agent1_system.md');
    const content = fs.readFileSync(promptPath, 'utf-8');
    
    return NextResponse.json({ 
      success: true,
      length: content.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

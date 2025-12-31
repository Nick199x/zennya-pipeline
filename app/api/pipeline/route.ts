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

    console.log('🚀 Pipeline started');

    // STEP 1: BRIAN
    console.log('🤖 Brian (Sonnet 4)...');
    const agent1Prompt = readFileSync(join(process.cwd(), 'prompts', 'agent1_system.md'), 'utf-8');
    
    const brianResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      temperature: 0.7,
      system: [
        {
          type: "text",
          text: agent1Prompt,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: [{ role: 'user', content: prompt }],
    });
    
    const brianResult = brianResponse.content[0].type === 'text' ? brianResponse.content[0].text : '';
    console.log('✅ Brian done');

    // STEP 2: LESTER
    console.log('🤖 Lester (Sonnet 4)...');
    const agent3Prompt = readFileSync(join(process.cwd(), 'prompts', 'agent3_system.md'), 'utf-8');
    
    const lesterResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.3,
      system: [
        {
          type: "text",
          text: agent3Prompt,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: [{ role: 'user', content: `Evaluate these concepts:\n\n${brianResult}` }],
    });
    
    const lesterResult = lesterResponse.content[0].type === 'text' ? lesterResponse.content[0].text : '';
    console.log('✅ Lester done');

    // STEP 3: ALESSA
    console.log('🤖 Alessa (Sonnet 4)...');
    const agent2Prompt = readFileSync(join(process.cwd(), 'prompts', 'agent2_system.md'), 'utf-8');
    
    const alessaResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      temperature: 0.5,
      system: [
        {
          type: "text",
          text: agent2Prompt,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: [{ role: 'user', content: `Generate prompts for these approved concepts:\n\n${lesterResult}` }],
    });
    
    const alessaResult = alessaResponse.content[0].type === 'text' ? alessaResponse.content[0].text : '';
    console.log('✅ Alessa done');

    // ============================================
    // STEP 4: EXTRACT - MATCH WITH AND WITHOUT EMOJI 🍌
    // ============================================
    console.log('🍌 Pierre extracting prompts...');
    
    const imagePrompts: string[] = [];
    
    // Match BOTH formats:
    // 1. ✨ **POSITIVE PROMPT:**
    // 2. **Positive Prompt:**
    const regex = /(?:✨\s*)?\*\*(?:POSITIVE PROMPT|Positive Prompt):\*\*\s*```[^\n]*\n([\s\S]*?)```/gi;
    let match;
    
    while ((match = regex.exec(alessaResult)) !== null) {
      let rawPrompt = match[1].trim();
      
      console.log('🔍 Found raw prompt:', rawPrompt.substring(0, 100) + '...');
      
      // Clean it up
      const lines = rawPrompt.split('\n');
      const cleanedLines = lines.filter(line => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith('Use uploaded')) return false;
        if (trimmed === 'NO text. NO logo.') return false;
        if (trimmed.includes('NO text.')) return false;
        if (trimmed.includes('NO logo.')) return false;
        // Skip technical params
        if (trimmed.match(/^\([^)]+:\d+/)) return false;
        return true;
      });
      
      let cleanPrompt = cleanedLines.join(' ').replace(/\s+/g, ' ').trim();
      
      // Remove trailing params
      cleanPrompt = cleanPrompt.replace(/,?\s*\([^)]+:\d+[^)]*\).*$/g, '');
      cleanPrompt = cleanPrompt.replace(/\s*,\s*$/, '');
      
      if (cleanPrompt.length > 50) {
        imagePrompts.push(cleanPrompt);
        console.log(`✅ Clean prompt ${imagePrompts.length}: ${cleanPrompt.substring(0, 150)}...`);
      }
    }
    
    console.log(`🍌 Total prompts extracted: ${imagePrompts.length}`);
    
    // ============================================
    // GENERATE IMAGES 🍌
    // ============================================
    const generatedImages = [];
    
    if (imagePrompts.length > 0) {
      const uniquePrompts = [...new Set(imagePrompts)].slice(0, 3);
      
      for (let i = 0; i < uniquePrompts.length; i++) {
        const promptText = uniquePrompts[i];
        
        console.log(`🍌 Pierre generating image ${i + 1}...`);
        
        try {
          const imageResponse = await fetch(`${request.nextUrl.origin}/api/generate-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: promptText,
              model: 'gemini-2.5-flash-image'
            }),
          });
          
          const imageData = await imageResponse.json();
          
          if (imageData.success) {
            generatedImages.push({
              prompt: promptText,
              image: imageData.image,
              index: i + 1
            });
            console.log(`✅ Image ${i + 1} generated!`);
          } else {
            console.error(`❌ Image ${i + 1} failed:`, imageData.error);
          }
        } catch (error: any) {
          console.error(`❌ Image ${i + 1} error:`, error.message);
        }
      }
    } else {
      console.log('❌ NO PROMPTS FOUND');
    }

    console.log(`🎉 Pipeline done! ${generatedImages.length} images generated`);

    return NextResponse.json({
      success: true,
      brian: brianResult,
      lester: lesterResult,
      alessa: alessaResult,
      images: generatedImages,
      imagesGenerated: generatedImages.length
    });

  } catch (error: any) {
    console.error('❌ ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

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
    const agent1Prompt = readFileSync(join(process.cwd(), 'prompts', 'agent1_system.md'), 'utf-8');
    const brianResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      temperature: 0.7,
      system: [{ type: "text", text: agent1Prompt, cache_control: { type: "ephemeral" } }],
      messages: [{ role: 'user', content: prompt }],
    });
    const brianResult = brianResponse.content[0].type === 'text' ? brianResponse.content[0].text : '';

    // STEP 2: LESTER
    const agent3Prompt = readFileSync(join(process.cwd(), 'prompts', 'agent3_system.md'), 'utf-8');
    const lesterResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.3,
      system: [{ type: "text", text: agent3Prompt, cache_control: { type: "ephemeral" } }],
      messages: [{ role: 'user', content: `Evaluate these concepts:\n\n${brianResult}` }],
    });
    const lesterResult = lesterResponse.content[0].type === 'text' ? lesterResponse.content[0].text : '';

    // STEP 3: ALESSA
    const agent2Prompt = readFileSync(join(process.cwd(), 'prompts', 'agent2_system.md'), 'utf-8');
    const alessaResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      temperature: 0.5,
      system: [{ type: "text", text: agent2Prompt, cache_control: { type: "ephemeral" } }],
      messages: [{ role: 'user', content: `Generate prompts for these approved concepts:\n\n${lesterResult}` }],
    });
    const alessaResult = alessaResponse.content[0].type === 'text' ? alessaResponse.content[0].text : '';

    console.log('✅ All agents done');

    // ============================================
    // EXTRACT PROMPTS - SUPER SIMPLE NOW! 🍌
    // ============================================
    console.log('🍌 Extracting prompts from Alessa...');
    
    const imagePrompts: string[] = [];
    
    // Match: PROMPT_N: followed by ```content```
    const promptRegex = /PROMPT_\d+:\s*```\s*([^`]+?)```/gs;
    let match;
    
    while ((match = promptRegex.exec(alessaResult)) !== null) {
      const promptText = match[1].trim();
      
      if (promptText.length > 50) {
        imagePrompts.push(promptText);
        console.log(`✅ Extracted prompt #${imagePrompts.length}: ${promptText.substring(0, 100)}...`);
      }
    }
    
    console.log(`🍌 Total prompts found: ${imagePrompts.length}`);
    
    // ============================================
    // GENERATE IMAGES 🍌
    // ============================================
    const generatedImages = [];
    
    if (imagePrompts.length > 0) {
      for (let i = 0; i < imagePrompts.length; i++) {
        const promptText = imagePrompts[i];
        
        console.log(`🍌 Generating image ${i + 1}/${imagePrompts.length}...`);
        
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
              prompt: promptText.substring(0, 200),
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
    }

    console.log(`🎉 Pipeline complete! ${generatedImages.length} images generated`);

    return NextResponse.json({
      success: true,
      brian: brianResult,
      lester: lesterResult,
      alessa: alessaResult,
      images: generatedImages,
      imagesGenerated: generatedImages.length
    });

  } catch (error: any) {
    console.error('❌ Pipeline error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

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

    // STEP 4: EXTRACT NANOBANANA PROMPTS FROM CODE BLOCKS 🍌
    console.log('🍌 Extracting NanoBanana prompts...');
    
    const imagePrompts: string[] = [];
    
    // Find all POSITIVE PROMPT code blocks
    const positivePromptRegex = /\*\*✨ POSITIVE PROMPT:\*\*\s*```(?:[\w]*)\s*([\s\S]*?)```/gi;
    let match;
    
    while ((match = positivePromptRegex.exec(alessaResult)) !== null) {
      const promptText = match[1].trim();
      if (promptText.length > 30) {
        imagePrompts.push(promptText);
        console.log(`✓ Found NanoBanana prompt ${imagePrompts.length}: ${promptText.substring(0, 80)}...`);
      }
    }
    
    console.log(`🍌 Total NanoBanana prompts found: ${imagePrompts.length}`);
    
    const generatedImages = [];
    
    if (imagePrompts.length > 0) {
      // Generate up to 3 images
      const promptsToGenerate = imagePrompts.slice(0, 3);
      
      for (let i = 0; i < promptsToGenerate.length; i++) {
        const promptText = promptsToGenerate[i];
        
        console.log(`🍌 Pierre generating image ${i + 1}/${promptsToGenerate.length}...`);
        
        try {
          const imageResponse = await fetch(`${request.nextUrl.origin}/api/generate-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: promptText,
              model: 'gemini-2.5-flash-image' // Can switch to gemini-3-pro-image-preview for Pro
            }),
          });
          
          const imageData = await imageResponse.json();
          
          if (imageData.success) {
            generatedImages.push({
              prompt: promptText,
              image: imageData.image,
              index: i + 1
            });
            console.log(`✅ Pierre generated image ${i + 1}`);
          } else {
            console.error(`❌ Image ${i + 1} failed:`, imageData.error);
          }
        } catch (error) {
          console.error(`❌ Image ${i + 1} error:`, error);
        }
      }
    } else {
      console.log('⚠️  No NanoBanana prompts found in Alessa output');
    }

    console.log(`✅ Pipeline complete! Pierre generated ${generatedImages.length} images`);

    return NextResponse.json({
      success: true,
      brian: brianResult,
      lester: lesterResult,
      alessa: alessaResult,
      images: generatedImages,
      imagesGenerated: generatedImages.length
    });

  } catch (error: any) {
    console.error('❌ PIPELINE ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

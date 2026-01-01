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
    // DEBUG: SHOW ALESSA OUTPUT 🔍
    // ============================================
    console.log('');
    console.log('🔍 ========================================');
    console.log('🔍 ALESSA RAW OUTPUT (first 2000 chars):');
    console.log('🔍 ========================================');
    console.log(alessaResult.substring(0, 2000));
    console.log('🔍 ========================================');
    console.log('');
    
    // ============================================
    // EXTRACT PROMPTS 🍌
    // ============================================
    console.log('🍌 Starting extraction...');
    
    const imagePrompts: string[] = [];
    
    // Try to match PROMPT_N: ```content```
    const promptRegex = /PROMPT_\d+:\s*```\s*([^`]+?)```/gs;
    
    console.log('🔍 Testing regex against Alessa output...');
    let match;
    let matchCount = 0;
    
    while ((match = promptRegex.exec(alessaResult)) !== null) {
      matchCount++;
      const promptText = match[1].trim();
      
      console.log(`🔍 Match #${matchCount} found!`);
      console.log(`   Length: ${promptText.length} chars`);
      console.log(`   First 150 chars: ${promptText.substring(0, 150)}`);
      
      if (promptText.length > 50) {
        imagePrompts.push(promptText);
        console.log(`✅ ADDED as prompt #${imagePrompts.length}`);
      } else {
        console.log(`❌ SKIPPED - too short`);
      }
    }
    
    console.log('');
    console.log(`🔍 Regex found ${matchCount} matches`);
    console.log(`🔍 Extracted ${imagePrompts.length} valid prompts`);
    console.log('');
    
    // ============================================
    // GENERATE IMAGES 🍌
    // ============================================
    const generatedImages = [];
    
    if (imagePrompts.length > 0) {
      console.log(`🍌 Starting image generation for ${imagePrompts.length} prompts...`);
      
      for (let i = 0; i < imagePrompts.length; i++) {
        const promptText = imagePrompts[i];
        
        console.log('');
        console.log(`🍌 ========================================`);
        console.log(`🍌 IMAGE ${i + 1}/${imagePrompts.length}`);
        console.log(`🍌 ========================================`);
        console.log(`Prompt length: ${promptText.length} chars`);
        console.log(`First 200 chars: ${promptText.substring(0, 200)}`);
        console.log(`Calling Pierre at: ${request.nextUrl.origin}/api/generate-image`);
        
        try {
          const imageResponse = await fetch(`${request.nextUrl.origin}/api/generate-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: promptText,
              model: 'gemini-2.5-flash-image'
            }),
          });
          
          console.log(`Pierre response status: ${imageResponse.status}`);
          
          const imageData = await imageResponse.json();
          console.log(`Pierre response:`, JSON.stringify(imageData).substring(0, 200));
          
          if (imageData.success) {
            generatedImages.push({
              prompt: promptText.substring(0, 200),
              image: imageData.image,
              index: i + 1
            });
            console.log(`✅ Image ${i + 1} SUCCESS!`);
          } else {
            console.error(`❌ Image ${i + 1} FAILED:`, imageData.error);
          }
        } catch (error: any) {
          console.error(`❌ Image ${i + 1} ERROR:`, error.message);
          console.error(`   Stack:`, error.stack);
        }
        
        console.log(`🍌 ========================================`);
      }
    } else {
      console.log('');
      console.log('❌ ========================================');
      console.log('❌ NO PROMPTS EXTRACTED!');
      console.log('❌ ========================================');
      console.log('Alessa output length:', alessaResult.length);
      console.log('Contains "PROMPT_"?', alessaResult.includes('PROMPT_'));
      console.log('Contains "```"?', alessaResult.includes('```'));
      console.log('❌ ========================================');
    }

    console.log('');
    console.log(`🎉 PIPELINE COMPLETE: ${generatedImages.length} images generated`);

    return NextResponse.json({
      success: true,
      brian: brianResult,
      lester: lesterResult,
      alessa: alessaResult,
      images: generatedImages,
      imagesGenerated: generatedImages.length,
      debug: {
        alessaOutputLength: alessaResult.length,
        alessaPreview: alessaResult.substring(0, 500),
        promptsExtracted: imagePrompts.length,
        matchesFound: matchCount
      }
    });

  } catch (error: any) {
    console.error('❌ PIPELINE ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

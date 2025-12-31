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

    // STEP 4: NIX (NANOBANANA) - EXTRACT AND GENERATE IMAGES 🍌
    console.log('🍌 Nix extracting image prompts...');
    
    // More flexible regex to find image prompts
    const lines = alessaResult.split('\n');
    const imagePrompts: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Look for lines that contain "Image Prompt", "Visual", "Midjourney", etc.
      if (line.match(/(?:image prompt|visual prompt|midjourney prompt|image description|visual description):/i)) {
        // Get the next line or same line after colon
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1 && line.length > colonIndex + 1) {
          const promptText = line.substring(colonIndex + 1).trim();
          if (promptText.length > 10) {
            imagePrompts.push(promptText);
          }
        } else if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.length > 10) {
            imagePrompts.push(nextLine);
          }
        }
      }
    }
    
    console.log(`🍌 Found ${imagePrompts.length} image prompts`);
    
    const generatedImages = [];
    
    if (imagePrompts.length > 0) {
      // Generate first 3 images max
      const promptsToGenerate = imagePrompts.slice(0, 3);
      
      for (let i = 0; i < promptsToGenerate.length; i++) {
        const promptText = promptsToGenerate[i];
        
        console.log(`🍌 Nix generating image ${i + 1}/${promptsToGenerate.length}...`);
        
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
            console.log(`✅ Image ${i + 1} generated`);
          } else {
            console.error(`❌ Image ${i + 1} failed:`, imageData.error);
          }
        } catch (error) {
          console.error(`❌ Image ${i + 1} error:`, error);
        }
      }
    } else {
      console.log('⚠️  No image prompts found - Nix standing by');
    }

    console.log(`✅ Pipeline complete! Generated ${generatedImages.length} images`);

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

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// IMPORT the Pierre function directly instead of HTTP call
async function generateImage(prompt: string, model: string = 'gemini-2.5-flash-image') {
  try {
    console.log('🍌 Pierre generating image...');
    console.log('Model:', model);
    console.log('Prompt length:', prompt.length, 'chars');

    const apiKey = process.env.NANOBANANA_API_KEY;
    
    if (!apiKey) {
      throw new Error('NANOBANANA_API_KEY not set');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('🍌 NanoBanana API Error:', error);
      throw new Error(`NanoBanana failed: ${error}`);
    }

    const data = await response.json();
    const imageData = data.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData;
    
    if (!imageData) {
      throw new Error('No image returned from NanoBanana');
    }

    console.log('✅ Image generated!');
    
    return {
      success: true,
      image: {
        base64: imageData.data,
        mimeType: imageData.mimeType || 'image/png',
      }
    };

  } catch (error: any) {
    console.error('❌ Pierre error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

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

    // EXTRACT PROMPTS
    console.log('🍌 Extracting prompts...');
    const imagePrompts: string[] = [];
    const promptRegex = /PROMPT_\d+:\s*```\s*([^`]+?)```/gs;
    let match;
    
    while ((match = promptRegex.exec(alessaResult)) !== null) {
      const promptText = match[1].trim();
      if (promptText.length > 50) {
        imagePrompts.push(promptText);
        console.log(`✅ Extracted prompt #${imagePrompts.length}`);
      }
    }
    
    console.log(`🍌 Total prompts: ${imagePrompts.length}`);
    
    // GENERATE IMAGES - DIRECT CALL, NO HTTP!
    const generatedImages = [];
    
    if (imagePrompts.length > 0) {
      for (let i = 0; i < imagePrompts.length; i++) {
        console.log(`🍌 Generating image ${i + 1}/${imagePrompts.length}...`);
        
        const imageData = await generateImage(imagePrompts[i]);
        
        if (imageData.success) {
          generatedImages.push({
            prompt: imagePrompts[i].substring(0, 200),
            image: imageData.image,
            index: i + 1
          });
          console.log(`✅ Image ${i + 1} SUCCESS!`);
        } else {
          console.error(`❌ Image ${i + 1} FAILED:`, imageData.error);
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

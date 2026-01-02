import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const AGENT_CONFIGS = {
  brian: {
    name: 'Brian (Agent 1 - Ideation)',
    systemPromptPath: './prompts/agent1_system.md',
    model: 'claude-sonnet-4-20250514',
  },
  lester: {
    name: 'Lester (Agent 3 - Evaluation)',
    systemPromptPath: './prompts/agent3_system.md',
    model: 'claude-sonnet-4-20250514',
  },
  alessa: {
    name: 'Alessa (Agent 2 - Enhancement)',
    systemPromptPath: './prompts/agent2_system.md',
    model: 'claude-sonnet-4-20250514',
  },
};

async function callAgent(agentKey: keyof typeof AGENT_CONFIGS, userPrompt: string, context?: string) {
  const config = AGENT_CONFIGS[agentKey];
  console.log(`🤖 Calling ${config.name}...`);

  const fs = require('fs');
  const path = require('path');
  const systemPrompt = fs.readFileSync(path.join(process.cwd(), config.systemPromptPath), 'utf-8');

  const message = await anthropic.messages.create({
    model: config.model,
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: context ? `${context}\n\nUser Request: ${userPrompt}` : userPrompt,
      },
    ],
  });

  const result = message.content[0].type === 'text' ? message.content[0].text : '';
  console.log(`✅ ${config.name} done`);
  return result;
}

async function generateImage(prompt: string, productPhotos?: Array<{ base64: string; mimeType: string }>) {
  const apiKey = process.env.NANOBANANA_API_KEY;
  
  if (!apiKey) {
    throw new Error('NANOBANANA_API_KEY not set');
  }

  console.log('🍌 Calling NanoBanana API...');
  if (productPhotos && productPhotos.length > 0) {
    console.log(`📸 Product photos provided: ${productPhotos.length}`);
  }

  const model = 'gemini-2.5-flash-image';
  
  const parts: any[] = [{ text: prompt }];
  
  if (productPhotos && productPhotos.length > 0) {
    for (const photo of productPhotos) {
      parts.push({
        inlineData: {
          mimeType: photo.mimeType,
          data: photo.base64
        }
      });
    }
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pierre API error:', response.status, errorText);
      throw new Error(`Pierre API failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const imageData = data.candidates[0].content.parts[0].inlineData;
      return {
        base64: imageData.data,
        mimeType: imageData.mimeType,
      };
    }

    throw new Error('No image data in response');
  } catch (error) {
    console.error('Pierre generation error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, productPhotos } = await request.json();

    console.log('🚀 Pipeline started');
    console.log('📝 User prompt:', prompt);
    if (productPhotos && productPhotos.length > 0) {
      console.log(`📸 Product photos: ${productPhotos.length}`);
    }

    const brian = await callAgent('brian', prompt);
    const lester = await callAgent('lester', prompt, `Brian's Concepts:\n${brian}`);
    const alessa = await callAgent('alessa', prompt, `Brian's Concepts:\n${brian}\n\nLester's Evaluation:\n${lester}`);

    console.log('✅ All agents done');

    // NEW PARSING: Extract CAPTION + PROMPT per concept
    console.log('🔍 Parsing captions and prompts...');
    
    const conceptRegex = /CONCEPT_(\d+):\s*CAPTION:\s*([^\n]+(?:\n(?!PROMPT:)[^\n]+)*)\s*PROMPT:\s*```\s*([^`]+?)```/gs;
    const concepts: Array<{
      index: number;
      caption: string;
      prompt: string;
    }> = [];

    let match;
    while ((match = conceptRegex.exec(alessa)) !== null) {
      const index = parseInt(match[1]);
      const caption = match[2].trim();
      const promptText = match[3].trim();
      
      concepts.push({ index, caption, prompt: promptText });
      console.log(`✅ Extracted concept #${index}`);
      console.log(`   Caption: ${caption.substring(0, 50)}...`);
      console.log(`   Prompt: ${promptText.substring(0, 50)}...`);
    }

    console.log(`🍌 Total concepts: ${concepts.length}`);

    // Generate images for each concept
    const images = [];
    for (const concept of concepts) {
      console.log(`🍌 Generating image ${concept.index}/${concepts.length}...`);
      try {
        const imageData = await generateImage(concept.prompt, productPhotos);
        images.push({
          index: concept.index,
          caption: concept.caption,
          prompt: concept.prompt,
          image: imageData,
        });
        console.log(`✅ Image ${concept.index} SUCCESS!`);
      } catch (error: any) {
        console.error(`❌ Image ${concept.index} FAILED:`, error.message);
      }
    }

    console.log(`🎉 Pipeline complete! ${images.length} images generated`);

    return NextResponse.json({
      success: true,
      brian,
      lester,
      alessa,
      images,
    });

  } catch (error: any) {
    console.error('❌ Pipeline error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

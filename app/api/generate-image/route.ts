import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model = 'gemini-2.5-flash-image' } = body;

    console.log('🍌 Pierre (NanoBanana) generating image...');
    console.log('Model:', model);
    console.log('Prompt length:', prompt.length, 'chars');
    console.log('Prompt preview:', prompt.substring(0, 150) + '...');

    const apiKey = process.env.NANOBANANA_API_KEY;
    
    if (!apiKey) {
      throw new Error('NANOBANANA_API_KEY not set in environment variables');
    }

    console.log('API key present:', apiKey.substring(0, 10) + '...');

    // NanoBanana endpoint (Gemini image generation)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    console.log('Calling:', url.replace(apiKey, 'KEY_HIDDEN'));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const error = await response.text();
      console.error('🍌 NanoBanana API Error:', error);
      throw new Error(`NanoBanana failed: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Image generated successfully');
    console.log('Response structure:', JSON.stringify(data).substring(0, 200));

    // Extract base64 image from response
    const imageData = data.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData;
    
    if (!imageData) {
      console.error('Full NanoBanana response:', JSON.stringify(data, null, 2));
      throw new Error('No image returned from NanoBanana');
    }

    console.log('Image data type:', imageData.mimeType);
    console.log('Image size:', imageData.data.length, 'chars');

    return NextResponse.json({
      success: true,
      image: {
        base64: imageData.data,
        mimeType: imageData.mimeType || 'image/png',
      }
    });

  } catch (error: any) {
    console.error('❌ Pierre (NanoBanana) error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

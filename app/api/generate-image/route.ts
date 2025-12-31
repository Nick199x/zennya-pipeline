import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model = 'gemini-2.5-flash-image' } = body;

    console.log('🍌 NanoBanana generating image...');
    console.log('Model:', model);
    console.log('Prompt:', prompt);

    // NanoBanana endpoint (Gemini image generation)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.NANOBANANA_API_KEY}`,
      {
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
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('🍌 NanoBanana API Error:', error);
      throw new Error(`NanoBanana failed: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Image generated successfully');

    // Extract base64 image from response
    const imageData = data.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData;
    
    if (!imageData) {
      console.error('NanoBanana response:', JSON.stringify(data, null, 2));
      throw new Error('No image returned from NanoBanana');
    }

    return NextResponse.json({
      success: true,
      image: {
        base64: imageData.data,
        mimeType: imageData.mimeType || 'image/png',
      }
    });

  } catch (error: any) {
    console.error('❌ NanoBanana error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

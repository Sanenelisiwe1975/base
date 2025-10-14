import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { mediaUrl, mediaType } = await req.json();

    // Select appropriate model based on media type
    const model = mediaType === 'image' 
      ? 'microsoft/bringing-old-photos-back-to-life:c75db81db6cbd809d93cc3b7e7a088a351a3349c9fa02b6d393e35e0d51ba799'
      : 'openai/video-predict:b437f7af97d3594ad86641048875f969f5e7b2e246824b81d5e3311b3536dd46';

    const output = await replicate.run(model, {
      input: {
        image: mediaUrl,
      }
    });

    return NextResponse.json({ 
      result: output,
      isDeepfake: output.confidence > 0.7 // Threshold can be adjusted
    });
  } catch (error) {
    console.error('Media analysis error:', error);
    return NextResponse.json({ error: 'Media analysis failed' }, { status: 500 });
  }
}
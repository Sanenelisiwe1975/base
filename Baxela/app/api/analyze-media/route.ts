import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { Readable } from "stream";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function toDataURL(response: Response): Promise<string> {
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function POST(req: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: "Replicate API token not set" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const mediaFile = formData.get("media") as File;
    const mediaType = formData.get("mediaType") as "image" | "video";

    if (!mediaFile) {
      return NextResponse.json({ error: "No media file provided" }, { status: 400 });
    }

    // Convert file to a data URL
    const mediaBuffer = Buffer.from(await mediaFile.arrayBuffer());
    const mimeType = mediaFile.type;
    const dataURI = `data:${mimeType};base64,${mediaBuffer.toString("base64")}`;


    const model =
      mediaType === "image"
        ? "stability-ai/stable-diffusion:ac732df8350dd8c0fa362064f93de94962d413d5737fe8ef4454d04020c40a31"
        : "openai/video-predict:b437f7af97d3594ad86641048875f969f5e7b2e246824b81d5e3311b3536dd46"; 
    const input =
      mediaType === "image"
        ? { image: dataURI }
        : { video: dataURI };

    const output = await replicate.run(model, { input });

    let isDeepfake = false;
    if (mediaType === "image" && typeof output === "object" && output !== null) {
      // Implement logic based on actual model output for deepfake detection
    }

    return NextResponse.json({
      isDeepfake,
      analysis: output,
    });
  } catch (error) {
    console.error("Media analysis error:", error);
    return NextResponse.json({ error: "Media analysis failed" }, { status: 500 });
  }
}
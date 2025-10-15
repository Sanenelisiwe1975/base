import { type NextRequest, NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataApiSecret = process.env.PINATA_API_SECRET;

  if (!pinataApiKey || !pinataApiSecret) {
    console.error('Pinata API keys are not set in .env file');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);
    const formData = await req.formData();

    const type = formData.get('type') as string;
    const severity = formData.get('severity') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const mediaFile = formData.get('media') as File | null;
    const mediaAnalysis = formData.get('mediaAnalysis') ? JSON.parse(formData.get('mediaAnalysis') as string) : null;
    const textAnalysis = formData.get('textAnalysis') ? JSON.parse(formData.get('textAnalysis') as string) : null;

    let mediaHash = null;
    if (mediaFile) {
      const stream = Readable.from(Buffer.from(await mediaFile.arrayBuffer()));
      const options = {
        pinataMetadata: {
          name: mediaFile.name,
        },
      };
      const mediaResult = await pinata.pinFileToIPFS(stream, options);
      mediaHash = mediaResult.IpfsHash;
    }

    const incidentData = {
      type,
      severity,
      location,
      description,
      mediaHash,
      mediaAnalysis,
      textAnalysis,
      timestamp: new Date().toISOString(),
    };

    const result = await pinata.pinJSONToIPFS(incidentData, {
      pinataMetadata: {
        name: `Baxela_Incident_Report_${Date.now()}`,
        keyvalues: {
          project: 'Baxela',
          type: String(incidentData.type),
          severity: String(incidentData.severity),
          hasMedia: String(Boolean(mediaHash)),
        },
      },
    } as any);

    return NextResponse.json({ success: true, ipfsHash: result.IpfsHash });
  } catch (error) {
    console.error('Error submitting incident:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
import { type NextRequest, NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';

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
    const incidentData = JSON.parse(formData.get('data') as string);
    const mediaFile = formData.get('media') as File;

    // If media is present, upload it to IPFS first
    let mediaHash = null;
    if (mediaFile) {
      const mediaBuffer = await mediaFile.arrayBuffer();
      const mediaResult = await pinata.pinFileToIPFS(Buffer.from(mediaBuffer));
      mediaHash = mediaResult.IpfsHash;
    }

    // Add media and analysis results to the incident data
    const enrichedData = {
      ...incidentData,
      mediaHash,
      mediaAnalysis: incidentData.mediaAnalysis,
      textAnalysis: incidentData.textAnalysis
    };

    const result = await pinata.pinJSONToIPFS(enrichedData, {
      pinataMetadata: {
        name: `Baxela_Incident_Report_${Date.now()}`,
        keyvalues: {
          project: 'Baxela',
          type: String(enrichedData.type),
          severity: String(enrichedData.severity),
          language: String(enrichedData.language),
          hasMedia: Boolean(mediaHash).toString()
        }
      }
    });

    return NextResponse.json({ success: true, ipfsHash: result.IpfsHash });
  } catch (error) {
    console.error('Error submitting incident:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
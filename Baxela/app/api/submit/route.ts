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
    const incidentData = await req.json();

    const options = {
      pinataMetadata: {
        name: `Baxela_Incident_Report_${Date.now()}`,
        keyvalues: {
          project: 'Baxela',
          type: incidentData.type,
          severity: incidentData.severity,
          language: incidentData.language,
        },
      },
    };

    const result = await pinata.pinJSONToIPFS(incidentData, options);

    console.log('Data pinned to IPFS:', result);
    return NextResponse.json({ success: true, ipfsHash: result.IpfsHash }, { status: 200 });

  } catch (error) {
    console.error('Error pinning data to IPFS:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
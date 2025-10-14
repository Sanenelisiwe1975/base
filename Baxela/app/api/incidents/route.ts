import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';

export async function GET() {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataApiSecret = process.env.PINATA_API_SECRET;

  if (!pinataApiKey || !pinataApiSecret) {
    console.error('Pinata API keys are not set in .env file');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

    const filter = {
      status: 'pinned',
      metadata: {
        keyvalues: {
          project: {
            value: 'Baxela',
            op: 'eq'
          }
        }
      }
    };

    const results = await pinata.pinList(filter);
    
    // We only need to send the IPFS hashes to the client
    const hashes = results.rows.map(row => row.ipfs_pin_hash);

    return NextResponse.json({ success: true, hashes }, { status: 200 });

  } catch (error) {
    console.error('Error fetching incident list from IPFS:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
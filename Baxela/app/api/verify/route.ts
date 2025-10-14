import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { proof, action } = await req.json();
  const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID;
  const wld_api_key = process.env.WLD_API_KEY; // You will need to add this to your .env file

  if (!wld_api_key) {
    console.error('WLD_API_KEY is not set in .env file');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const verifyUrl = `https://developer.worldcoin.org/api/v1/verify/${app_id}`;

  try {
    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wld_api_key}`
      },
      body: JSON.stringify({ ...proof, action }),
    });

    const wldResponse = await verifyRes.json();

    if (verifyRes.status === 200) {
      // The proof is valid, and the user is verified for this action.
      // In a real app, you'd now link the nullifier_hash to the user's session
      // to prevent them from verifying again for the same action.
      console.log('World ID Verification Successful:', wldResponse);
      return NextResponse.json({ success: true, ...wldResponse }, { status: 200 });
    } else {
      // The proof was invalid or there was an error.
      console.error('World ID Verification Failed:', wldResponse);
      return NextResponse.json({ success: false, ...wldResponse }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying with World ID:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
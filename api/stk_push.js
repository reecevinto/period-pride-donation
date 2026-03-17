// api/stk_push.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { amount, phone } = req.body;

  // Period Pride Credentials
  const consumerKey = 'hMBljM7D2jp3xANOqEN3va6AfesvJZCKrYokyOzN2XG7XPAB';
  const consumerSecret = 'RyJJ1wG2NluAI5yhKjF4ccN5HNA3IIeVsatCZKJ4Tvihm9SwG0jGQUFSWHGokBr6';
  const shortCode = '174379'; // Sandbox Shortcode
  const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

  try {
    // 1. Generate Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` }
    });
    const { access_token } = await tokenResponse.json();

    // 2. Setup STK Push parameters
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

    // 3. Request STK Push
    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: shortCode,
        PhoneNumber: phone,
        CallBackURL: 'https://periodpride.vercel.app/api/callback', // Update this to your real Vercel URL later
        AccountReference: 'PeriodPride',
        TransactionDesc: 'Donation'
      })
    });

    const data = await stkResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('M-Pesa Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
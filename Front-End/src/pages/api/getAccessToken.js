// pages/api/getAccessToken.js
export default async function handler(req, res) {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
  
    try {
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
  
      if (!tokenResponse.ok) {
        throw new Error('Failed to fetch access token');
      }
  
      const tokenData = await tokenResponse.json();
      res.status(200).json({ accessToken: tokenData.access_token });
    } catch (error) {
      console.error('Error fetching access token:', error);
      res.status(500).json({ error: 'Failed to fetch access token' });
    }
  }
  
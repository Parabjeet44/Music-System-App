import React from 'react';
import styles from './index.module.css';

export async function getServerSideProps() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  try {
    // Request an access token from Spotify
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
    const accessToken = tokenData.access_token;

    // List of artist IDs to fetch
    const artistIds = [
      '66CXWjxzNUsdJxJ2JdwvnR',
      '6eUKZXaKkcviH0Ku9w2n3V',
      '1uNFoZAHBGtllmzznpCI3s',
      '4gzpq5DPGxSnKTe4SA8HAU',
      '5K4W6rqBFWDnAN6FQUkS6x',
      '1Xyo4u8uXC1ZmMpatF05PJ',
    ];

    // Fetch data for each artist and their albums
    const artistDataPromises = artistIds.map(async (id) => {
      const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const artistData = await artistResponse.json();

      const albumsResponse = await fetch(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album&limit=1`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const albumsData = await albumsResponse.json();

      return {
        ...artistData,
        topAlbum: albumsData.items[0],
      };
    });

    const artistsData = await Promise.all(artistDataPromises);

    return { props: { artistsData, accessToken } };
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return { props: { error: 'Failed to fetch data' } };
  }
}

const Index = ({ artistsData = [], accessToken, error }) => {
  if (error) {
    return (
      <div className={styles.div}>
        <h1>Error: {error}</h1>
      </div>
    );
  }

  return (
    <div className={styles.div}>
      <h1 className={styles.popart}>Popular Artists</h1>
      <div className={styles.poparts}>
        {artistsData.map((artist) => (
          <div key={artist.id} className={styles.popart1}>
            <h2>{artist.name}</h2>
            <button>
              <img
                src={artist.images[1]?.url || '/placeholder.jpg'}
                alt={artist.name}
                width={150}
                className={styles.imag}
              />
            </button>
            <p>
              <strong>Followers:</strong> {artist.followers.total.toLocaleString('en-US')}
            </p>
          </div>
        ))}
      </div>
      <h1 className={styles.popalb}>Popular Albums</h1>
      <div className={styles.popalb}>
        {artistsData.map((artist) => (
          artist.topAlbum && (
            <div key={artist.topAlbum.id} className={styles.popalb1}>
              <h2>{artist.topAlbum.name}</h2>
              <button>
                <img
                  src={artist.topAlbum.images[1]?.url || '/placeholder.jpg'}
                  alt={artist.topAlbum.name}
                  width={150}
                  className={styles.img}
                />
              </button>
              <p>
                <strong>Artist:</strong> {artist.name}
              </p>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Index;

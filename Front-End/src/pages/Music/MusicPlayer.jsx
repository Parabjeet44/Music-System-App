import React, { useState, useEffect } from 'react';

const SpotifyPreviewPlayer = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [trackInfo, setTrackInfo] = useState(null);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    // Fetch the access token when the component mounts
    fetch('/api/getAccessToken')
      .then(response => response.json())
      .then(data => setAccessToken(data.accessToken))
      .catch(error => console.error('Error fetching access token:', error));

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  const searchAndPlayPreview = async (query) => {
    if (!accessToken) return;

    try {
      // Search for a track
      const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!searchResponse.ok) {
        throw new Error('Failed to search for track');
      }

      const searchData = await searchResponse.json();
      
      if (searchData.tracks.items.length === 0) {
        alert('No tracks found');
        return;
      }

      const track = searchData.tracks.items[0];
      setTrackInfo(track);

      if (track.preview_url) {
        if (audio) {
          audio.pause();
        }
        const newAudio = new Audio(track.preview_url);
        setAudio(newAudio);
        newAudio.play();
      } else {
        alert('No preview available for this track');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Spotify Preview Player</h1>
      <input 
        type="text" 
        placeholder="Enter song name"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            searchAndPlayPreview(e.target.value);
          }
        }}
      />
      <button onClick={() => {
        const input = document.querySelector('input');
        searchAndPlayPreview(input.value);
      }}>
        Search and Play Preview
      </button>
      {trackInfo && (
        <div>
          <h2>{trackInfo.name}</h2>
          <p>Artist: {trackInfo.artists.map(artist => artist.name).join(', ')}</p>
          <p>Album: {trackInfo.album.name}</p>
          <a href={trackInfo.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            Open full track in Spotify
          </a>
        </div>
      )}
    </div>
  );
};

export default SpotifyPreviewPlayer;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './search.module.css';
import { useRouter } from 'next/router';
import withAuth from '../lib/withAuth';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await fetch('/api/getAccessToken');
        const data = await response.json();
        setAccessToken(data.accessToken);
      } catch (error) {
        console.error('Error fetching access token:', error);
        setError('Failed to fetch access token.');
      }
    };

    fetchAccessToken();

    const loadPlaylists = () => {
      try {
        const storedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
        setPlaylists(storedPlaylists);
      } catch (error) {
        setPlaylists([]);
      }
    };

    const loadLikedSongs = () => {
      try {
        const storedLikedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
        setLikedSongs(storedLikedSongs);
      } catch (error) {
        setLikedSongs([]);
      }
    };

    loadPlaylists();
    loadLikedSongs();
    window.addEventListener('storage', loadPlaylists);
    window.addEventListener('storage', loadLikedSongs);

    return () => {
      window.removeEventListener('storage', loadPlaylists);
      window.removeEventListener('storage', loadLikedSongs);
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!accessToken) {
      setError('Access token is missing. Please wait or refresh the page.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: searchTerm,
          type: 'track',
          limit: 20,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setSearchResults(searchResponse.data.tracks.items);
    } catch (error) {
      console.error('Error searching Spotify:', error);
      setError('Failed to search Spotify. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const playPreview = (track) => {
    router.push({
      pathname: '/player',
      query: { track: JSON.stringify(track) },
    });
  };

  const addToPlaylist = async (track, playlistName) => {
    const playlist = playlists.find(p => p.name === playlistName);
    if (!playlist) return;
    const songExists = playlist.songs.some(song => song.id === track.id);
    if (songExists) return;

    const updatedPlaylists = playlists.map(p => {
      if (p.name === playlistName) {
        return { ...p, songs: [...p.songs, track] };
      }
      return p;
    });
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));

    if (!playlist._id) return;

    try {
      await axios.patch(`http://localhost:5000/api/playlists/addSong/${playlist._id}`, { song: track });
    } catch (error) {
      console.error('Error updating playlist in the database:', error);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    const newPlaylistName = prompt('Enter the name of the new playlist:');
    if (newPlaylistName) {
      const storedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
      if (!storedPlaylists.some(p => p.name === newPlaylistName)) {
        const newPlaylist = { name: newPlaylistName, songs: [] };
        try {
          const response = await axios.post('http://localhost:5000/api/playlists', { name: newPlaylistName, userId: 'testUserId' }); // Replace 'testUserId' with actual user ID
          newPlaylist._id = response.data._id;
          const updatedPlaylists = [...storedPlaylists, newPlaylist];
          localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
          setPlaylists(updatedPlaylists);
        } catch (error) {
          console.error('Error creating playlist:', error);
        }
      } else {
        alert('Playlist already exists.');
      }
    }
  };

  const handleLike = (track) => {
    const isLiked = likedSongs.some(song => song.id === track.id);
    let updatedLikedSongs;

    if (isLiked) {
      updatedLikedSongs = likedSongs.filter(song => song.id !== track.id);
    } else {
      const newLikedSong = { ...track, date: new Date().toISOString() };
      updatedLikedSongs = [...likedSongs, newLikedSong];
    }

    setLikedSongs(updatedLikedSongs);
    localStorage.setItem('likedSongs', JSON.stringify(updatedLikedSongs));
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSearch}>
        <input
          className={styles.searchInput}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a song..."
        />
        <button
          className={styles.searchButton}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {error && <p className={styles.error}>{error}</p>}

      {searchResults.length > 0 && (
        <ul className={styles.resultsList}>
          {searchResults.map((track) => (
            <li key={track.id} className={styles.trackItem}>
              <div>
                <strong>{track.name}</strong> <p>by {track.artists.map(artist => artist.name).join(', ')} </p>
              </div>
              <div>
                <button
                  onClick={() => playPreview(track)}
                  className={styles.previewButton}
                  disabled={!track.preview_url}
                >
                  {track.preview_url ? 'Play Preview' : 'No Preview'}
                </button>
                <button
                  onClick={() => handleLike(track)}
                  className={styles.likeButton}
                >
                  {likedSongs.some(song => song.id === track.id) ? '❤️' : '🤍'}
                </button>
                <select
                  onChange={(e) => addToPlaylist(track, e.target.value)}
                  className={styles.playlistSelect}
                >
                  <option value="">Add to playlist</option>
                  {playlists.map((playlist) => (
                    <option key={playlist._id || playlist.name} value={playlist.name}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default withAuth(Search);
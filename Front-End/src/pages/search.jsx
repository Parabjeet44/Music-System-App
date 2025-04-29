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

    const loadPlaylists = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/playlist');
        setPlaylists(response.data);
      } catch (error) {
        console.error('Error loading playlists:', error);
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

    try {
      // Send the song data and playlist ID to the backend to add the song to the playlist
      const response = await axios.patch(`http://localhost:5000/api/playlist/addSong/${playlist._id}`, { song: track });

      if (response.status === 200) {
        // Update playlists in the local state (client-side)
        const updatedPlaylists = playlists.map(p => {
          if (p._id === playlist._id) {
            return { ...p, songs: [...p.songs, track] };
          }
          return p;
        });
        setPlaylists(updatedPlaylists);
      } else {
        console.error('Failed to add song:', response.data.message);
        setError(response.data.message || 'Failed to add song.');
      }
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      setError('Failed to add song to playlist.');
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    const newPlaylistName = prompt('Enter the name of the new playlist:');
    const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage

    if (!userId) {
      setError('User is not authenticated. Please log in.');
      return;
    }

    if (newPlaylistName) {
      try {
        const response = await axios.post('http://localhost:5000/api/playlist', { 
          name: newPlaylistName, 
          userId: userId  // Use the userId from localStorage
        });
        const newPlaylist = response.data;

        // Update playlists with the new playlist
        setPlaylists([...playlists, newPlaylist]);
      } catch (error) {
        console.error('Error creating playlist:', error);
        setError('Failed to create playlist.');
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
      
      <button onClick={handleCreatePlaylist} className={styles.createPlaylistButton}>
        Create New Playlist
      </button>
    </div>
  );
};

export default withAuth(Search);

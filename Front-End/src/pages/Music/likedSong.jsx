import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './likedSong.module.css';
import withAuth from '../../lib/withAuth';

const LikedSongs = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [filterOption, setFilterOption] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const loadLikedSongs = () => {
      const storedLikedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
      setLikedSongs(storedLikedSongs);
      setFilteredSongs(storedLikedSongs);
    };

    loadLikedSongs();
    window.addEventListener('storage', loadLikedSongs);

    return () => {
      window.removeEventListener('storage', loadLikedSongs);
      if (audioPlayer) {
        audioPlayer.pause();
      }
    };
  }, []);

  useEffect(() => {
    let sortedSongs = [...likedSongs];
    
    if (filterOption === 'byName') {
      sortedSongs.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filterOption === 'byDate') {
      sortedSongs.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilteredSongs(sortedSongs);
  }, [filterOption, likedSongs]);

  const removeSong = (trackId) => {
    const updatedLikedSongs = likedSongs.filter(song => song.id !== trackId);
    setLikedSongs(updatedLikedSongs);
    localStorage.setItem('likedSongs', JSON.stringify(updatedLikedSongs));
  };

  const playPreview = (track) => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    router.push({
      pathname: '/player',
      query: { track: JSON.stringify(track) }
    });
  };

  return (
    <div className={styles.likedSongsContainer}>
      <h2>Liked Songs</h2>

      <div className={styles.filterContainer}>
        <label htmlFor="filter" className={styles.filterLabel}>Filter by:</label>
        <select
          id="filter"
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All</option>
          <option value="byName">Sort by Name</option>
          <option value="byDate">Sort by Date Added</option>
        </select>
      </div>

      {filteredSongs.length === 0 ? (
        <p>You haven't liked any songs yet.</p>
      ) : (
        <ul className={styles.songList}>
          {filteredSongs.map((track) => (
            <li key={track.id} className={styles.songItem}>
              <div>
                <strong>{track.name}</strong> by {track.artists.map(artist => artist.name).join(', ')}
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
                  onClick={() => removeSong(track.id)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default withAuth(LikedSongs);
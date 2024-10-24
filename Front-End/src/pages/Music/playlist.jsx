import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import styles from "./playlist.module.css";
import withAuth from '../../lib/withAuth';

const Playlist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editPlaylistName, setEditPlaylistName] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const router = useRouter();

  const loadPlaylists = () => {
    try {
      const storedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
      setPlaylists(storedPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
      setPlaylists([]);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    const sortedPlaylists = [...playlists].sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "date") {
        return new Date(b.creationDate) - new Date(a.creationDate);
      }
      return 0;
    });
    
    // Only update if the sorted order is different
    if (JSON.stringify(sortedPlaylists) !== JSON.stringify(playlists)) {
      setPlaylists(sortedPlaylists);
    }
  }, [sortOption]);

  const createPlaylist = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPlaylist = { 
      _id: Date.now().toString(), // Generate a unique ID
      name: newPlaylistName, 
      songs: [],
      creationDate: new Date().toISOString() // Set the current date and time
    };
    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    setNewPlaylistName('');
  };

  const removePlaylist = (playlistId) => {
    const updatedPlaylists = playlists.filter(p => p._id !== playlistId);
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    if (selectedPlaylist && selectedPlaylist._id === playlistId) {
      setSelectedPlaylist(null);
    }
  };

  const startEditingPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    setEditPlaylistName(playlist.name);
  };

  const savePlaylistName = () => {
    if (!editingPlaylist || !editPlaylistName.trim()) return;

    const updatedPlaylists = playlists.map(p =>
      p._id === editingPlaylist._id ? { ...p, name: editPlaylistName } : p
    );
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    setEditingPlaylist(null);
    setEditPlaylistName("");
  };

  const playPreview = (track) => {
    router.push({
      pathname: '/player',
      query: { track: JSON.stringify(track) }
    });
  };

  return (
    <div className={styles.playlistContainer}>
      <h2>My Playlists</h2>

      <form onSubmit={createPlaylist} className={styles.createPlaylistForm}>
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="New playlist name"
          className={styles.newPlaylistInput}
        />
        <button type="submit" className={styles.createButton}>
          Create Playlist
        </button>
      </form>

      <div className={styles.filterSortContainer}>
        <select 
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Date</option>
          {/* Add more sorting options here if needed */}
        </select>
      </div>

      <div className={styles.playlistList}>
        {playlists.map((playlist) => (
          <div key={playlist._id} className={styles.playlistItem}>
            {editingPlaylist && editingPlaylist._id === playlist._id ? (
              <div>
                <input
                  type="text"
                  value={editPlaylistName}
                  onChange={(e) => setEditPlaylistName(e.target.value)}
                  className={styles.editPlaylistInput}
                />
                <button onClick={savePlaylistName} className={styles.saveButton}>
                  Save
                </button>
                <button onClick={() => setEditingPlaylist(null)} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <span onClick={() => setSelectedPlaylist(playlist)}>
                  {playlist.name} ({playlist.songs ? playlist.songs.length : 0} songs)
                </span>
                <button
                  onClick={() => startEditingPlaylist(playlist)}
                  className={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => removePlaylist(playlist._id)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPlaylist && (
        <div className={styles.selectedPlaylist}>
          <h3>{selectedPlaylist.name}</h3>
          {!selectedPlaylist.songs || selectedPlaylist.songs.length === 0 ? (
            <p>This playlist is empty.</p>
          ) : (
            <ul className={styles.songList}>
              {selectedPlaylist.songs.map((track) => (
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
                      {track.preview_url ? "Play Preview" : "No Preview"}
                    </button>
                    <button
                      onClick={() => removeSong(selectedPlaylist._id, track.id)}
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
      )}
    </div>
  );
};

export default withAuth(Playlist);

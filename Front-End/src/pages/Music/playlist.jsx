import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./playlist.module.css";
import withAuth from "../../lib/withAuth";

const Playlist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editPlaylistName, setEditPlaylistName] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const router = useRouter();

  // Fetch playlists from the backend (Express API)
  const loadPlaylists = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/playlist");
      if (!response.ok) {
        throw new Error("Failed to fetch playlist");
      }
      const data = await response.json();
      setPlaylists(data); // Set the playlists state
    } catch (error) {
      console.error("Error loading playlist:", error);
      setPlaylists([]);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []); // Empty array means this will run once when the component mounts

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

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPlaylist = {
      name: newPlaylistName,
      songs: [],
      creationDate: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      if (response.ok) {
        loadPlaylists(); // Reload the playlists after adding a new one
        setNewPlaylistName("");
      } else {
        throw new Error("Failed to create playlist");
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  const removePlaylist = async (playlistId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/playlist/${playlistId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        loadPlaylists(); // Reload the playlists after deleting
        if (selectedPlaylist && selectedPlaylist._id === playlistId) {
          setSelectedPlaylist(null);
        }
      } else {
        throw new Error("Failed to remove playlist");
      }
    } catch (error) {
      console.error("Error removing playlist:", error);
    }
  };

  const startEditingPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    setEditPlaylistName(playlist.name);
  };

  const savePlaylistName = async () => {
    if (!editingPlaylist || !editPlaylistName.trim()) return;

    const updatedPlaylist = { ...editingPlaylist, name: editPlaylistName };

    try {
      const response = await fetch(
        `/api/playlists/updateName/${editingPlaylist._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: editPlaylistName }),
        }
      );

      if (response.ok) {
        loadPlaylists(); // Reload the playlists after editing
        setEditingPlaylist(null);
        setEditPlaylistName("");
      } else {
        throw new Error("Failed to update playlist name");
      }
    } catch (error) {
      console.error("Error updating playlist name:", error);
    }
  };

  const removeSong = async (playlistId, songId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/playlist/removeSong/${playlistId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ songId }),  // Ensure the songId is passed as spotifyId
        }
      );
  
      if (response.ok) {
        const updatedPlaylist = await response.json();
        setSelectedPlaylist(updatedPlaylist);  // Update the UI with the new playlist data
      } else {
        throw new Error("Failed to remove song from playlist");
      }
    } catch (error) {
      console.error("Error removing song from playlist:", error);
    }
  };
  
  const playPreview = (track) => {
    router.push({
      pathname: "/player",
      query: { track: JSON.stringify(track) },
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
                <button
                  onClick={savePlaylistName}
                  className={styles.saveButton}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingPlaylist(null)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <span onClick={() => setSelectedPlaylist(playlist)}>
                  {playlist.name} ({playlist.songs ? playlist.songs.length : 0}{" "}
                  songs)
                </span>
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
                <li key={track.spotifyId} className={styles.songItem}>
                  <div>
                    <strong>{track.name}</strong> by{" "}
                    {Array.isArray(track.artists) && track.artists.length > 0
                      ? track.artists.map((artist) => artist.name).join(", ")
                      : "Unknown Artist"}
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
                      onClick={() => removeSong(selectedPlaylist._id, track.spotifyId)}
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

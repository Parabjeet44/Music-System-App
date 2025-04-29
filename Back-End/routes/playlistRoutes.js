// Playlist API routes
const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');

// Get all playlists for a user (You might want to filter by userId in the future)
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find();
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new playlist
router.post('/', async (req, res) => {
  const { name, userId } = req.body;  // Get userId from the request body

  // Check if the playlist already exists for the user
  const existingPlaylist = await Playlist.findOne({ name, userId });
  if (existingPlaylist) {
    return res.status(400).json({ message: 'Playlist already exists.' });
  }

  const playlist = new Playlist({
    name,
    userId,
    songs: []
  });

  try {
    const newPlaylist = await playlist.save();
    res.status(201).json(newPlaylist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a playlist (e.g., adding songs or updating the name)
router.patch('/updateName/:id', async (req, res) => {
  const { name } = req.body;

  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    // Check if the new name already exists for the user
    const existingPlaylist = await Playlist.findOne({ name, userId: playlist.userId });
    if (existingPlaylist && existingPlaylist._id.toString() !== req.params.id) {
      return res.status(400).json({ message: 'A playlist with this name already exists.' });
    }

    playlist.name = name;
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a playlist
router.delete('/:id', async (req, res) => {
  try {
    await Playlist.deleteOne({ _id: req.params.id });
    res.json({ message: 'Deleted Playlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a song to a specific playlist
router.patch('/addSong/:id', async (req, res) => {
  const { song } = req.body;
  const { id } = req.params;

  try {
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const songExists = playlist.songs.some(existingSong => existingSong.spotifyId === song.spotifyId);
    if (songExists) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    playlist.songs.push(song);
    await playlist.save();

    res.status(200).json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Error adding song to playlist' });
  }
});

// Remove a song from a playlist
router.patch('/removeSong/:playlistId', async (req, res) => {
  const { playlistId } = req.params;
  const { songId } = req.body; // Assuming songId is coming from frontend

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Pull the song using spotifyId (not _id), assuming songId is spotifyId from frontend
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { songs: { spotifyId: songId } } },  // Use spotifyId instead of _id for matching
      { new: true } // Return the updated playlist after removing the song
    );

    // Check if the update was successful
    if (!updatedPlaylist) {
      return res.status(400).json({ message: 'Failed to remove song' });
    }

    res.json(updatedPlaylist); // Send back the updated playlist
  } catch (error) {
    res.status(500).json({ message: 'Error removing song from playlist' });
  }
});

module.exports = router;

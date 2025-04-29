// Playlist API routes
const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');
const connectToMongoDB = require('../config/db');

// Connect to MongoDB before any routes
router.use(async (req, res, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (err) {
    console.error('Failed to connect to database', err);
    res.status(500).json({ message: 'Failed to connect to database' });
  }
});

// Get all playlists
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find();
    res.json(playlists);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new playlist
router.post('/', async (req, res) => {
  const { name } = req.body;

  const existingPlaylist = await Playlist.findOne({ name });
  if (existingPlaylist) {
    return res.status(400).json({ message: 'Playlist already exists.' });
  }

  const playlist = new Playlist({
    name,
    songs: []
  });

  try {
    const newPlaylist = await playlist.save();
    res.status(201).json(newPlaylist);
  } catch (err) {
    console.error('Error saving playlist:', err);
    res.status(400).json({ message: err.message });
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

    const songExists = playlist.songs.some(existingSong => existingSong.id === song.id);
    if (songExists) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    playlist.songs.push(song);
    await playlist.save();

    res.status(200).json(playlist);
  } catch (err) {
    console.error('Error adding song to playlist:', err);
    res.status(500).json({ message: 'Error adding song to playlist' });
  }
});

// Update a playlist's name
router.patch('/updateName/:id', async (req, res) => {
  const { name } = req.body;

  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    const existingPlaylist = await Playlist.findOne({ name });
    if (existingPlaylist && existingPlaylist._id.toString() !== req.params.id) {
      return res.status(400).json({ message: 'A playlist with this name already exists.' });
    }

    playlist.name = name;
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    console.error('Error updating playlist:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a playlist
router.delete('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    await Playlist.deleteOne({ _id: req.params.id });
    res.json({ message: 'Deleted Playlist' });
  } catch (err) {
    console.error('Error deleting playlist:', err);
    res.status(500).json({ message: err.message });
  }
});

// Remove a song from a playlist
// Remove a song from a playlist
// Remove a song from a playlist
// Remove song from playlist
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
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ message: 'Error removing song from playlist' });
  }
});


module.exports = router;

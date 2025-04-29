const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  songs: [{
    _id: mongoose.Schema.Types.ObjectId, // Add _id to each song
    name: String,
    artist: String,
    previewUrl: String,
    spotifyId: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);

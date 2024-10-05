const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/playlistRoutes'); // Adjust path as needed
const oauthRoutes = require('./signin/sigin'); // Adjust path as needed

const app = express();

app.use(express.json());
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000' // Replace with your frontend URL
}));


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/playlist', authRoutes); // Example: '/api/playlist' for playlist routes
app.use('/api/auth', oauthRoutes); // Example: '/api/oauth' for OAuth routes

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Replace with your actual client ID and client secret
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
console.log(client_id)


// Function to get Spotify Access Token
const getSpotifyToken = async () => {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const data = 'grant_type=client_credentials';

    const headers = {
        'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
        const response = await axios.post(tokenUrl, data, { headers });
        return response.data.access_token;
    } catch (error) {
        console.error('Error obtaining access token:', error.response?.data || error.message);
    }
};

// Function to get popular artists
const getPopularArtists = async () => {
    const accessToken = await getSpotifyToken();
    if (!accessToken) return;

    try {
        // Get pop category
        const response = await axios.get('https://api.spotify.com/v1/browse/categories', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const categories = response.data.categories.items;
        const popCategory = categories.find(category => category.name.toLowerCase() === 'pop');
        if (!popCategory) return console.error('Pop category not found');

        // Get playlists in pop category
        const playlistsResponse = await axios.get(`https://api.spotify.com/v1/browse/categories/${popCategory.id}/playlists`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const playlists = playlistsResponse.data.playlists.items;

        // Get unique artists from playlists
        for (const { id, name } of playlists) {
            const tracksResponse = await axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            const artists = new Set(tracksResponse.data.items.flatMap(track => track.track.artists.map(artist => artist.name)));
            console.log(`Popular Artists from Playlist "${name}":`);
            artists.forEach(artist => console.log(artist));
        }

    } catch (error) {
        console.error('Error fetching Spotify data:', error.response?.data || error.message);
    }
};

getPopularArtists();

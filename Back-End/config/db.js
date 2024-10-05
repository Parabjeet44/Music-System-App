const mongoose = require('mongoose');

async function connectToMongoDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/Project', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('An error occurred while connecting to MongoDB:', err);
    }
}

connectToMongoDB(); // Immediately connect

module.exports = connectToMongoDB; // Export it in case you want to use it elsewhere

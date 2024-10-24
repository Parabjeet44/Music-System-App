const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Import bcrypt
const User = require('./userModel'); // Adjust the path if needed

router.post('/oauth-signin', async (req, res) => {
    console.log('Received data:', req.body);

    const { email, image } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            const placeholderPassword = `oauth-${Date.now()}`;
            const hashedPassword = await bcrypt.hash(placeholderPassword, 10);
            user = new User({ email, image, password: hashedPassword });
            await user.save();
            console.log('New user created:', user);
        } else {
            console.log('Existing user signed in:', user);
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error('Error saving user to the database:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


module.exports = router;

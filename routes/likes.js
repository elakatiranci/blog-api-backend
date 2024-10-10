const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const auth = require('../middleware/auth');

// Beğeni Ekleme
router.post('/', auth, async (req, res) => {
    const { postId } = req.body;
    if (!postId) {
        return res.status(400).json({ message: 'Post ID\'si gereklidir.' });
    }
    try {
        const like = new Like({
            user: req.user.id,
            post: postId
        });
        await like.save();
        res.status(201).json(like);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Belirli bir gönderinin beğenilerini alma
router.get('/:postId', async (req, res) => {
    try {
        const likes = await Like.find({ post: req.params.postId }).populate('user', 'username');
        res.status(200).json(likes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

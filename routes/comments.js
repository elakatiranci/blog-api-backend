const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const BlogPost = require('../models/BlogPost');
const auth = require('../middleware/auth');

// Yorum Ekleme
router.post('/', auth, async (req, res) => {
    const { content, postId } = req.body;
    if (!content || !postId) {
        return res.status(400).json({ message: 'Yorum ve post ID\'si gereklidir.' });
    }
    try {
        const comment = new Comment({
            content,
            author: req.user.id,
            post: postId
        });
        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Tüm yorumları alma
router.get('/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId }).populate('author', 'username');
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Yorumlara yanıt verme
router.post('/:commentId/replies', auth, async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'Yanıt içeriği gereklidir.' });
    }
    try {
        const parentComment = await Comment.findById(req.params.commentId);
        if (!parentComment) {
            return res.status(404).json({ message: 'Üst yorum bulunamadı.' });
        }
        const reply = new Comment({
            content,
            author: req.user.id,
            post: parentComment.post, 
            parentComment: parentComment._id 
        });
        await reply.save();
        parentComment.replies.push(reply._id);
        await parentComment.save();
        res.status(201).json(reply);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

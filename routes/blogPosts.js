const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const User = require('../models/User'); 
const auth = require('../middleware/auth');
const multer = require('multer');

// Multer ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});

const upload = multer({ storage: storage });

// Blog gönderisi oluşturma
router.post('/', async (req, res) => {
    const { title, content, tags, username} = req.body; 
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
        }
        const blogPost = new BlogPost({
            title,
            content,
            author: user._id, 
            tags 
        });
        await blogPost.save();
        res.status(201).json(blogPost);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Tüm blog gönderilerini alma
router.get('/', async (req, res) => {
    const { author, tags, startDate, endDate, views } = req.query; 
    try {
        const query = {};

        // Eğer yazar varsa filtrele
        if (author) {
            const user = await User.findOne({ username: author });
            if (user) {
                query.author = user._id; 
            } else {
                return res.status(400).json({ message: 'Yazar bulunamadı' });
            }
        }

        // Eğer etiket varsa filtrele
        if (tags) {
            query.tags = { $in: tags.split(',') };
        }

        // Eğer başlangıç ve bitiş tarihi varsa filtrele
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate); 
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate); 
            }
        }

        // Eğer belirli bir görüntülenme sayısı varsa filtrele
        if (views) {
            query.views = parseInt(views, 10);
        }

        // Blog gönderilerini veritabanından al
        const blogPosts = await BlogPost.find(query).populate('author', 'username');

        // Yanıtı gönder
        res.status(200).json(blogPosts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Belirli bir blog gönderisini alma
router.get('/:id', async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id).populate('author', 'username');
        if (!blogPost) return res.status(404).json({ message: 'Blog gönderisi bulunamadı' });
        blogPost.views += 1; 
        await blogPost.save();
        res.status(200).json(blogPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Belirli bir blog gönderisini silme
router.delete('/:id', async (req, res) => {
    try {
        const blogPost = await BlogPost.findByIdAndDelete(req.params.id);
        if (!blogPost) return res.status(404).json({ message: 'Blog gönderisi bulunamadı' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Belirli bir blog gönderisini güncelleme
router.put('/:id', auth, async (req, res) => {
    const { title, content, tags } = req.body;
    try {
        const blogPost = await BlogPost.findByIdAndUpdate(
            req.params.id,
            { title, content, tags },
            { new: true, runValidators: true } 
        );
        if (!blogPost) {
            return res.status(404).json({ message: 'Blog gönderisi bulunamadı' });
        }
        res.status(200).json(blogPost);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

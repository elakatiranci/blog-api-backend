const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const multer = require('multer');
const nodemailer = require('nodemailer'); 

// Nodemailer 
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'your-email@gmail.com', 
        pass: 'your-email-password', 
    },
});

// Kullanıcı Kaydı
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu kullanıcı adı veya e-posta zaten mevcut.' });
        }
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu. E-posta adresinize doğrulama bağlantısı gönderildi.' });
    } catch (error) {
        console.error("Hata: ", error);
        res.status(400).json({ error: error.message });
    }
});

// Kullanıcı Girişi
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Multer ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); 
    },
});

// Kullanıcı Profilini Güncelleme
router.put('/profile', auth, async (req, res) => {
    const { username, email, profileImage } = req.body; 
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { username, email, profileImage },
            { new: true } 
        );
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

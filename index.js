const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS ayarlarını yapılandırma
const corsOptions = {
  origin: 'http://localhost:5001', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
};

// CORS'u kullan
app.use(cors(corsOptions));

// JSON veri
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect('mongodb+srv://admin:ela12345@cluster0.sbsxq.mongodb.net/blog-api', {
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Sunucuyu başlat
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const blogPostRoutes = require('./routes/blogPosts');
app.use('/api/posts', blogPostRoutes); 

const commentRoutes = require('./routes/comments');
app.use('/api/comments', commentRoutes);

const likeRoutes = require('./routes/likes');
app.use('/api/likes', likeRoutes);

app.use('/uploads', express.static('uploads'));



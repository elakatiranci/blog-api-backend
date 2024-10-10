const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [String], 
    createdAt: { type: Date, default: Date.now },
    image: { type: String },
    views: { type: Number, default: 0 }, 
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);

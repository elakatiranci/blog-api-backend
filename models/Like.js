const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
});

module.exports = mongoose.model('Like', LikeSchema);

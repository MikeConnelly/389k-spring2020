var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    postID: {
        type: Number,
        required: true
    },
    commentNumber: {
        type: Number,
        requried: true
    }
});

var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;

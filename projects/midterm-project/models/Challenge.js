var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    preview: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    difficulty: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    id: {
        type: Number,
        required: true
    }
});

var Challenge = mongoose.model('Challenge', challengeSchema);
module.exports = Challenge;

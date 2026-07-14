const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storySchema = new Schema({
    uploadedFile: {
        filename: String,
        url: String,
    },
    originalName: String,
});

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const materialSchema = new Schema({
    title: {
        type: String,

    },
    uploadedFile: {
        filename: String,
        url: String,

    },
    resource_type: String,
    originalName: String,
    icon: String,
    createdAt: { type: Date, default: Date.now }

});
const linkSchema = new Schema({
    linkUrl: String,
    title: String,
    createdAt: { type: Date, default: Date.now }
})
const topicSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,

    },
    level: {
        type: String,
        enum: ['intermediate', 'advanced'],
        required: true
    },
    materials: [{
        type: materialSchema,
        sort: { createdAt: -1 }
    }],
    links: [{
        type: linkSchema,
        sort: { createdAt: -1 }
    }]

});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
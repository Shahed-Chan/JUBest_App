const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const phraseSchema = new Schema({
    category: String,
    arabic_Phrase: String,
    romanizations: String,
    english_Translations: String,
    pronunciation_of_Phrases: [{
        uploadedFile: {
            filename: String,
            url: String
        },
        originalName: String
    }]
});

const Phrases = mongoose.model('Phrases', phraseSchema);

module.exports = Phrases;

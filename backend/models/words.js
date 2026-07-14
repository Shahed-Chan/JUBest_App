const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wordSchema = new Schema({
    category: String,
    arabic_word: String,
    romanizations: String,
    english_Translations: String,
    pronunciation_of_Words: [{
        uploadedFile: {
            filename: String,
            url: String
        },
        originalName: String
    }]
});

const Word = mongoose.model('Word', wordSchema);


module.exports = Word;

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,
        required: true
    }
});

const quizSessionSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizData: {
        type: Object
    }
});

const quizSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    questions: [questionSchema],
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    quizSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizSession'
    }
});

const QuizSession = mongoose.model('QuizSession', quizSessionSchema);
const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = { QuizSession, Quiz };


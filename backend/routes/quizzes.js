const express = require('express');
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isAdmin, isUser, validateQuizId, noCache } = require('../middleware');
const { Quiz, QuizSession } = require('../models/quizzes');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');

router.get('/', isLoggedIn, noCache, catchAsync(async (req, res) => {
    const level = req.params.level;
    const quizzes = await Quiz.find({ level }); // find all the quizzes for the level

    // format the quizzes and questions
    const formattedQuizzes = quizzes.map((q) => {
        return {
            name: q.name,
            id: q._id,
            questions: q.questions.map((qu) => {
                return {
                    q: qu.question,
                    options: qu.options,
                    answer: qu.correctAnswer
                };
            })
        };
    });

    // Retrieve the quiz sessions
    const quizSessions = await QuizSession.find({ user: req.user.id });

    if (quizSessions) {
        for (const quizSession of quizSessions) {
            // Delete each quiz session
            await QuizSession.findByIdAndDelete(quizSession._id);
        }
    }

    res.render('levels/quiz', { level, quizzes: formattedQuizzes });
}));



router.route('/create')
    .get(isLoggedIn, isAdmin, noCache, (req, res) => {
        const level = req.params.level;
        const quiz = new Quiz();
        res.render('createQuiz', { level, quiz });
    })
    .post(isLoggedIn, isAdmin, catchAsync(async (req, res) => {

        const level = req.params.level
        const questionsData = req.body.questions;

        // Check if all required fields are filled in
        const quizName = req.body.name;
        const hasQuizName = quizName.trim() !== '';
        if (!hasQuizName) {
            req.flash('error', 'Please enter a quiz name.');
            return res.redirect('back');
        }
        const hasQuestions = Array.isArray(questionsData) && questionsData.length > 0;
        const hasTwoOptionsPerQuestion = questionsData.every(qData => Array.isArray(qData.options) && qData.options.length >= 2);
        const hasCorrectAnswerPerQuestion = questionsData.every(qData => qData.correctAnswer !== '');

        if (!hasQuizName || !hasQuestions || !hasTwoOptionsPerQuestion || !hasCorrectAnswerPerQuestion || (hasQuestions && questionsData.every(qData => qData.question === ''))) {
            req.flash('error', 'Please fill in all required fields.');
            return res.redirect('back');
        }

        const questions = questionsData.map((qData) => {
            const options = Array.isArray(qData.options) ? qData.options : [];
            const correctAnswer = qData.correctAnswer;

            if (correctAnswer === '' || correctAnswer > options.length) {
                req.flash('error', 'Please select a valid correct answer.');
                return res.redirect('back');
            }

            return {
                question: qData.question,
                options,
                correctAnswer: parseInt(correctAnswer),
            }
        });

        const quiz = new Quiz({
            name: quizName,
            level,
            questions,
        });

        await quiz.save()
            .then(quiz => {
                req.flash('success', 'quiz created successfully');
                res.redirect(`/levels/${level}/quiz#${quiz._id}`);
            })
            .catch(err => {
                res.render('error', { message: 'Error creating quiz', err: err });
            });


    }));

router.delete('/:id', isLoggedIn, isAdmin, validateQuizId, catchAsync(async (req, res) => {
    const { level, id } = req.params;
    await Quiz.findByIdAndDelete(id);
    req.flash('success', 'Quiz deleted successfully!');
    res.redirect(`/levels/${level}/quiz`);
}));

router.get('/:id/view', isLoggedIn, isUser, validateQuizId, catchAsync(async (req, res) => {
    const { level, id } = req.params;
    const quiz = await Quiz.findById(id);
    const token = crypto.randomBytes(32).toString('hex');
    const quizSession = new QuizSession({ token, quiz: id, user: req.user.id });
    await quizSession.save();
    res.render('levels/StartQuiz', { level, quiz, token })
}));

router.route('/:id/edit')
    .get(isLoggedIn, isAdmin, validateQuizId, catchAsync(async (req, res) => {
        const { level, id } = req.params;
        const quiz = await Quiz.findById(id);
        res.render('updateQuiz', { level, quiz })
    })).put(isLoggedIn, isAdmin, validateQuizId, catchAsync(async (req, res) => {
        const { level, id } = req.params;
        const { name, questions: newQuestionsData } = req.body;

        // Check if all required fields are filled in
        const hasQuizName = name.trim() !== '';
        if (!hasQuizName) {
            req.flash('error', 'Please enter a quiz name.');
            return res.redirect('back');
        }
        const hasQuestions = Array.isArray(newQuestionsData) && newQuestionsData.length > 0;
        const hasTwoOptionsPerQuestion = newQuestionsData.every(qData => Array.isArray(qData.options) && qData.options.length >= 2);
        const hasCorrectAnswerPerQuestion = newQuestionsData.every(qData => qData.correctAnswer !== '');

        if (!hasQuizName || !hasQuestions || !hasTwoOptionsPerQuestion || !hasCorrectAnswerPerQuestion || (hasQuestions && newQuestionsData.every(qData => qData.question === ''))) {
            req.flash('error', 'Please fill in all required fields.');
            return res.redirect('back');
        }

        const newQuestions = newQuestionsData.map(qData => {
            const options = Array.isArray(qData.options) ? qData.options : [];
            const correctAnswer = qData.correctAnswer;

            if (correctAnswer === '' || correctAnswer > options.length) {
                req.flash('error', 'Please select a valid correct answer.');
                return res.redirect('back');
            }

            return {
                question: qData.question,
                options,
                correctAnswer: parseInt(correctAnswer),
            }
        });

        const updatedQuiz = {
            name: name,
            questions: newQuestions
        };

        await Quiz.findByIdAndUpdate(id, updatedQuiz)
            .then(quiz => {
                req.flash('success', 'Quiz updated successfully');
                res.redirect(`/levels/${level}/quiz#${quiz._id}`);
            })
            .catch(err => {
                res.render('error', { message: 'Error updating quiz', err: err });
            });
    }));



router.get('/:id/data-end-point', isLoggedIn, validateQuizId, catchAsync(async (req, res) => {
    const { level, id } = req.params;
    const token = req.query.token;
    const quizSession = await QuizSession.findOne({ token, quiz: id, user: req.user.id });

    if (!quizSession) {
        res.status(403).render('error', { message: 'You are not allowed to get here', err: new Error('Forbidden access') });
        return;
    }

    const quiz = await Quiz.findById(id);
    const formattedQuiz = {
        name: quiz.name,
        questions: quiz.questions.map((qu) => {
            return {
                q: qu.question,
                options: qu.options,
                answer: qu.correctAnswer
            };
        })
    };
    res.json(formattedQuiz);
}));



module.exports = router;

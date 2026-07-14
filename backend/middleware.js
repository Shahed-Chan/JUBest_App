const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/signin');
    }
    next();
}

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {

        next();
    } else {

        res.status(401).render('error', { message: 'Unauthorized Access', err: new Error('Unauthorized Access') });

    }
};
const isUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {

        next();
    } else {

        res.status(401).render('error', { message: 'Unauthorized Access', err: new Error('Unauthorized Access') });

    }
};

const validateLevel = (req, res, next) => {
    const level = req.params.level;
    if (level !== "intermediate" && level !== "advanced") {
        return res.status(400).render('error', { message: 'Level does not exist', err: new Error('Level does not exist') });
    }
    next();
};

const validateTopicId = (req, res, next) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).render('error', { message: 'Invalid Topic ID', err: new Error('invalid Topic ID') });
    }
    next();
}

const validateQuizId = (req, res, next) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).render('error', { message: 'Invalid Quiz ID', err: new Error('invalid Quiz ID') });
    }
    next();
}

const noCache = (req, res, next) => {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    next();
}

module.exports = {
    isLoggedIn,
    isAdmin,
    isUser,
    validateLevel,
    validateTopicId,
    validateQuizId,
    noCache
}


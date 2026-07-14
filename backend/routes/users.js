const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const { noCache } = require('../middleware')

router.get('/register', (req, res) => {
  res.render('register');
})

router.post('/register', async (req, res) => {
  try {
    let { email, password, confirmPassword } = req.body;
    email = email.toLowerCase();
    // Validate password using regular expression
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!String(password).match(passwordPattern)) {
      req.flash('error', 'Password must contain at least 8 characters with at least one lowercase letter, one uppercase letter, and one numeric character.');
      res.redirect('/register');
      return;
    }
    if (password !== confirmPassword) {
      req.flash('error', 'Confirm password does not match with password.');
      res.redirect('/register');
      return;
    }

    const user = new User({ email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome to Jubest!');
      res.redirect('/levels');
    });
  } catch (e) {
    if (
      e.name === 'UserExistsError' ||
      (e.code === 11000 && e.keyPattern && e.keyPattern.email)
    ) {
      req.flash('error', 'An account with that email already exists.');
      res.redirect('/register');
    } else {
      req.flash('error', e.message);
      res.redirect('/register');
    }
  }
});



router.get('/signin', noCache, (req, res) => {
  if (!req.user) {
    res.render('signin');
  } else {
    res.redirect('/confirm');
  }
});

router.get('/confirm', noCache, (req, res) => {
  res.render('confirm');
});


router.post('/signin', (req, res, next) => {
  // Convert the email to lowercase
  req.body.email = req.body.email.toLowerCase();
  next();
}, passport.authenticate('local', { keepSessionInfo: true, failureFlash: 'Invalid email or password.', failureRedirect: '/signin' }), (req, res) => {
  req.flash('success', 'Welcome back!');
  const redirectUrl = req.session.returnTo || '/levels';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;

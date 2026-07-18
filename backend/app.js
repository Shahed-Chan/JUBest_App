const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const methodoverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const levels = require('./routes/levels');
const quizRoutes = require('./routes/quizzes');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const ExpressError = require('./utils/expressError');
const mongoSanitize = require('express-mongo-sanitize');
//const db_Url = process.env.DB_URL

const app = express();

// Need a congfig.env + database 

// mongoose.connect(db_Url);
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("database connected ")
// });


mongoose.connect(process.env.DB_URL)
    .then(() => console.log('Database connected successfully!'))
    .catch(err => console.error('Database connection error:', err));


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/../frontend/views');
app.use(express.static(__dirname + '/../frontend/public'));

app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisShouldBeChanged';
const sessionConfig = {
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: null,
        maxAge: null
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next();
})

// Routes
app.use('/', userRoutes);
app.use('/levels', levels)
app.use('/levels/:level/quiz', quizRoutes)
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.header('Cache-Control', 'no-cache, no-store');
    res.header('Pragma', 'no-cache');
    res.header('Expires', 0);
    res.render('levels/index');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listen on port ${port}`);
})

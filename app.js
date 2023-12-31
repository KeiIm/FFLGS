if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./util/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const MongoStore = require('connect-mongo');

const mongoSanitize = require('express-mongo-sanitize');

const gamestoreRoutes = require('./routes/gamestores');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('MONGO CONNECTION OPEN!!!')
    })
    .catch(err => {
        console.log('MONGO CONNECTION ERROR!!!')
        console.log(err)
    })

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'simpleSecret'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600 //24 hours in seconds
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    secret,
    name: 'gamer',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, //localhost is not https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // one week in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (!['/login', '/', '/favicon.ico'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    console.log("app.use req.session.returnTo = " + req.session.returnTo)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//Routes
app.use('/', userRoutes);
app.use('/gamestores', gamestoreRoutes);
app.use('/gamestores/:id/reviews', reviewRoutes);


//ROOT
app.get('/', (req, res) => {
    res.render('home')
});


//ERRORS
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no, something went wrong."
    res.status(statusCode).render('error', { err });
})


//LISTEN
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});
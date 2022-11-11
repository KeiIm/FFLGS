const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Self Yelp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.loginRedirect = (req, res) => {
    req.flash('success', 'welcome back');
    console.log(req.session.returnTo) //REMOVE - why undefined???
    const redirectUrl = req.session.returnTo || '/campgrounds';
    //delete req.session.returnTo; //Not necessary now that returnTo is created at app.use
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success', 'Logged out!')
        res.redirect('/campgrounds');
    });
};
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const errorController = require('./controllers/error');
// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://richard:JJMIpoBmvAubPelh@cluster0-1sjtq.mongodb.net/shop?retryWrites=true';

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

// tell express what are view engine is and where they can be found
// we installed ejs as our templating engine
app.set('view engine', 'ejs');
// this is the default setting but its added anyway and dont need to add if we are using views folder
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'mySecret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
)
app.use(csrfProtection)
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next()
    })
    .catch(err => console.log(err))
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404)


mongoose
    .connect(MONGODB_URI)
    .then(result => {
        app.listen(3000)
    })
    .catch(err => console.log(err))
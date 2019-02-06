const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop')

const app = express();

// tell express what are view engine is and where they can be found
// we installed ejs as our templating engine
app.set('view engine', 'ejs');
// this is the default setting but its added anyway and dont need to add if we are using views folder
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {

    User.findById('5c5b568bed2429547f40ab06')
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404)


mongoose
    .connect('mongodb+srv://richard:JJMIpoBmvAubPelh@cluster0-1sjtq.mongodb.net/shop?retryWrites=true')
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Richard',
                    email: 'rich@test.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        })

        app.listen(3000)
    })
    .catch(err => console.log(err))
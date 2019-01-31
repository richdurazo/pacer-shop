const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop')

const app = express();

// tell express what are view engine is and where they can be found
// we installed ejs as our templating engine
app.set('view engine', 'ejs');
// this is the default setting but its added anyway and dont need to add if we are using views folder
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404)

app.listen(3000)
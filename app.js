var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');

var homeRouter = require('./routes/home');
var aboutRouter = require('./routes/about');
var loginRouter = require('./routes/login');
var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'FjoDZsnxqD8rBFCrUHFU',
    resave: true,
    saveUninitialized: false
}));

app.use('/', indexRouter);
app.use('/home', homeRouter);
app.use('/about', aboutRouter);
app.use('/login', loginRouter);

module.exports = app;

var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.sendFile('login.html', {root: path.join(__dirname, '../public/views')});
});

module.exports = router;

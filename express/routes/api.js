/* Adam Mercer */
var query = require('../public/javascripts/dbms');
var express = require('express');
var router = express.Router();

/* Return JSON object representing orders on POST request. */
router.post('/', function (req, res, next) {
  query.dbquery(req.body.command, function (error, results = null) {
    // send results if there is no error
    if (error == null || error === false) {
      res.send(results);
    }
  });
});

module.exports = router;

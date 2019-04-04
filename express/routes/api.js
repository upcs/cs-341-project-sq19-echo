/* Adam Mercer */
var query = require('./dbms');
var express = require('express');
var router = express.Router();

/* Return JSON object representing orders on POST request. */
router.post('/', function(req, res, next) {
  // set query to get data for current month
  //const month = req.body.month;
  const queryType = req.body.command;
  // query data
  query.dbquery(queryType, callback);
  // send results if there is no error
  function callback(error, results = null) {
    if(error == null || error === false) {
      res.send(results);
    }
  }
});

module.exports = router;

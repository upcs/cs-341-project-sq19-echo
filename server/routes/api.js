/* Adam Mercer */
const query = require('../public/javascripts/dbms');
const express = require('express');
const router = express.Router();

/* Return JSON object representing orders on POST request. */
router.post('/', (req, res) => {
  query.dbquery(req.body.command, (error, results = null) => {
    // send results if there is no error
    if (error == null || error === false) {
      res.send(results);
    }
  });
});

module.exports = router;

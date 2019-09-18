/**
 * dbms.js
 *
 * This file contains functions for accessing a MySQL database.
 */

exports.version = '0.0.1';

const mysql = require('mysql');
const async = require('async');

const host = "35.199.150.239";  //from GCloud instance
const database = "data";
const user = "echodev";
const password = "echo";

let dbclient;

/**
 * dbquery
 *
 * performs a given SQL query on the database and returns the results
 * to the caller
 *
 * @param query_str     the query to perform (e.g., "SELECT * FROM ...")
 * @param callback  the callback function to call with two values
 *                   error - (or 'false' if none)
 *                   results - as given by the mysql client
 */
exports.dbquery = (query_str, callback) => {
  let results = null;

  async.waterfall([
      //Step 1: Connect to the database
      (callback) => {
        console.log("\n** creating connection.");
        dbclient = mysql.createConnection({
          host: host,
          user: user,
          password: password,
          database: database
        });

        dbclient.connect(callback);
      },

      //Step 2: Issue query
      (results, callback) => {
        console.log("\n** retrieving data");
        dbclient.query(query_str, callback);
      },

      //Step 3: Collect results
      (rows, fields, callback) => {
        console.log("\n** dumping data:");
        results = rows;
        console.log("" + rows);
        callback(null);
      }
    ],

    // waterfall cleanup function
    (err) => {
      if (err) {
        console.log("Database query failed.  :(");
        console.log(err);
        callback(err, null);
      } else {
        console.log("Database query completed.");
        callback(false, results);
      }
    });
};

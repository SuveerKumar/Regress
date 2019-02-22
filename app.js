//Implement your backend in this file

//Do not change these imports
var request = require("request");
var rp = require("request-promise");
var fs = require('fs');
var express = require('express');
var app = express();
app.use(express.json());
var multer = require('multer');
var upload = multer({dest: "uploads/"});


//Implementation should be below
// application -------------------------------------------------------------
app.get('*', function(req, res) {
    res.sendfile('./www/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});


module.exports = app;


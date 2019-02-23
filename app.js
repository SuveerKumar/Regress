"use 'esversion: 6'";
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
var path = require("path");
var mongoose = require('mongoose'); 
var webshot = require('webshot');
 


// Connect to MongoDB
const mongoDbBaseUrl = 'mongodb://localhost:27017/RegressTest';
testDB = mongoose.connect(mongoDbBaseUrl, {useNewUrlParser: true});

const Test = mongoose.model('skeshav', { name: String });


//Implementation should be below

// Save test case
app.post('/api/savetestcase', function (req, res) {

    const testCaseName = Object.keys(req.body)[0];
    const testCaseBody = req.body[testCaseName];
    if( testCaseBody && (typeof testCaseBody == "object") ){
        var options = {
            onLoadFinished: function() {
              var links = document.getElementsByTagName('a');
           
              for (var i=0; i<links.length; i++) {
                var link = links[i];
                link.innerHTML = 'My custom text';
              } 
            }
        };
        
        var _res = res;
        
        webshot('google.com', 'google.png', options, function(err) {
            // screenshot now saved to google.png
            _res.status(200).send({"message": "SUCCESS"});
        });
        //testCaseBody
        const pingTest = new Test(testCaseBody);
        pingTest.save().then(() => {
            res.status(200).send({status: "SUCCESS", message: "Test Case Saved"});
        }, ()=>{
            res.status(500).send({status: "ERROR", message: "Internal Error: Could not save to Mongo DB"});
        });
        
    }else{
        res.status(400).send({status: "ERROR", message: "Bad input"});
    }

    

});

// Get all test cases
app.get('/api/testcases', function (req, res) {
    // use mongoose to get all testcases in the database
    Test.find(function(err, testCases) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err);

        res.status(200).json(testCases); // return all tests in JSON format
    });

});


// Get test case for test_id
app.get('/api/testcase/:test_id', function (req, res) {
    // use mongoose to get a testcase with _id:test_id in the database
    Test.find({_id: req.params.test_id},function(err, testCase) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err);

        res.status(200).json(testCase); // return test in JSON format
    });

});

// Run test case with _id: test_id
app.get('/api/runtestcase/:test_id', function (req, res) {
    var options = {
        onLoadFinished: function() {
          var links = document.getElementsByTagName('a');
       
          for (var i=0; i<links.length; i++) {
            var link = links[i];
            link.innerHTML = 'My custom text';
          } 
        }
    };
    
    var _res = res;
    
    webshot('google.com', 'google.png', options, function(err) {
        // screenshot now saved to google.png
        _res.status(200).send({"message": "SUCCESS"});
    });

});





// application -------------------------------------------------------------
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'www/index.html')); // load the single view file (angular will handle the page changes on the front-end)
});


module.exports = app;


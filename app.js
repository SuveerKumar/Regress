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
var PNG = require('pngjs').PNG;
var pixelmatch = require('pixelmatch');
 


// Connect to MongoDB
const mongoDbBaseUrl = 'mongodb://localhost:27017/RegressTest';
testDB = mongoose.connect(mongoDbBaseUrl, {useNewUrlParser: true});

const Test = mongoose.model('skeshav', 
    { 
        name: String,
        url: String,
        steps: {},
        image: { data: Buffer, contentType: String }
        
    });


//Implementation should be below

// Save test case
app.post('/api/savetestcase', function (req, res) {

    const testCaseName = Object.keys(req.body)[0];
    const testCaseBody = req.body[testCaseName];
    if( testCaseBody && (typeof testCaseBody == "object") ){
        var func = new Function("return " + "function (a, b) { alert(a+b); return a + b; }")();
        var options = {
            renderDelay: 15000,
            onLoadFinished: function() {
                // var searchInputField = $('.fan-input').get(0);
                // searchInputField.value = "wonder woman";
                // searchInputField.dispatchEvent(new Event("input"));
                // $('.fan-btn.fan-btn-style-go').click();
                

            }
        };
        
        var _res = res;
        var _testCaseBody = testCaseBody;
        var _fs = fs;
        let testCaseSteps = testCaseBody.steps;
        let testCaseUrl = testCaseBody.url;
        let name = testCaseBody.name;
        let refImagePath = path.join(__dirname, 'reference-images/'+name+'_ref.png');
        
        webshot('https://www.w3schools.com/', refImagePath, options, function(err) {
        // webshot(testCaseUrl, refImagePath, options, function(err) {
            // screenshot now saved to the specified path
            //_res.status(200).send({"message": "SUCCESS"});

            //testCaseBody
            const testCase = new Test(_testCaseBody);
            testCase.image.data = _fs.readFileSync(refImagePath);
            testCase.image.contentType = 'image/png';
            testCase.save().then(() => {
                _res.status(200).send({status: "SUCCESS", message: "Test Case Saved"});
            }, ()=>{
                _res.status(500).send({status: "ERROR", message: "Internal Error: Could not save to Mongo DB"});
            });
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
    Test.findById(req.params.test_id,function(err, testCase) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err);

        testCase.image = null;
        res.status(200).json(testCase); // return test in JSON format
    });

});

// Get test case image for test_id
app.get('/api/testcaseimage/:test_id', function (req, res) {
    // use mongoose to get a testcase with _id:test_id in the database
    Test.findById(req.params.test_id,function(err, testCase) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err);

        res.contentType(testCase.image.contentType);
        res.status(200).send(testCase.image.data); // return test image
    });

});

// Run test case with _id: test_id
app.get('/api/runtestcase/:test_id', function (req, res) {
    // use mongoose to get a testcase and its image with _id:test_id in the database
    Test.findById(req.params.test_id,function(err, testCase) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err);
        
        let testCaseSteps = testCase.steps;
        let testCaseUrl = testCase.url;
        let name = testCase.name;
        let contentType = testCase.image.contentType;
        let refImagePath = path.join(__dirname, 'reference-images/'+name+'_ref.png');
        let outputImagePath = path.join(__dirname, 'outputs/'+name+'_testoutput.png');
        let diffImagePath = path.join(__dirname, 'diffs/'+name+'_diff.png');

        var data = testCase.image.data;
        var buf = Buffer.from(data, 'base64');
        fs.writeFile(refImagePath, buf, function(err) {
            if (err) throw err;
        });

        var options = {
            renderDelay: 15000,
            onLoadFinished: function() {
                // var searchInputField = $('.fan-input').get(0);
                // searchInputField.value = "wonder woman";
                // searchInputField.dispatchEvent(new Event("input"));
                // $('body').css("padding-left", 10);
                setTimeout(function() {
                    var links = document.getElementsByTagName('a');
                    links[0].innerHTML = '';
                }, 5000);
                


            }
        };
        
        var _res = res;
        var _fs = fs;
        var _PNG = PNG;
        var _pixelmatch = pixelmatch;
        
        webshot('https://www.w3schools.com/', outputImagePath, options, function(err) {
        // webshot(testCaseUrl, outputImagePath, options, function(err) {
            // screenshot now saved to <name>_testoutput.png
            var testData = _fs.readFileSync(outputImagePath);
            var testImg = _PNG.sync.read(testData);
            var refData = data;
            var refImg = _PNG.sync.read(refData);

            if((testImg.height != refImg.height) || (testImg.width != refImg.width)){
                _res.status(200).send({
                    "success": false,
                    "message": "Test Case FAILED! The height and width of the reference image and the test output image dont match."
                });
            }else{
                var diff = new _PNG({width: testImg.width, height: testImg.height});

                var diffPixels = _pixelmatch(testImg.data, refImg.data, diff.data, testImg.width, testImg.height, {threshold: 0.1});

                if (diffPixels > 0) {
                    diff.pack().pipe(_fs.createWriteStream(diffImagePath)).on('finish', ()=>{
                        var diffImgData = _fs.readFileSync(diffImagePath);
                        // deleteFile(diffImagePath);
                        _res.contentType(contentType);
                        _res.send(diffImgData);
                    });
                    
                }else{
                    _res.status(200).send({"message": "Test Case PASSED!", "success": true});
                }
            }

            
        });

    });

});


let deleteFile = function(path){
    // Assuming that 'path' is a regular file.
    fs.unlink(path, (err) => {
        if (err) throw err;
    });
};



// application -------------------------------------------------------------
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'www/index.html')); // load the single view file (angular will handle the page changes on the front-end)
});


module.exports = app;

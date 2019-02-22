var port = process.env.port || 9977;

const app = require('./app');

app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

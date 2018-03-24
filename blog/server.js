const express = require ('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const blog_app = express();

const port = 3000;

blog_app.use(bodyParser.urlencoded({ extended: true}))

// Empty object passed in because database does not exist
require('./app/routes')(blog_app, {});




blog_app.listen(port, () => {
    console.log("Listening on port " + port + " @ http://localhost:3000");
});
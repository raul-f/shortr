'use strict'; // strict mode

// modules requirement

const express = require('express');
const bodyParser = require('body-parser');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
const cors = require('cors');

// Basic Configuration 
const app = express();
const port = process.env.PORT || 3000;

dotenv.config();
mongoose.connect(process.env.MONGO_URI, {useMongoClient: true});
dns.lookup('google.com', (error, address, family) => {
	if (error) console.log(error);
	else console.log('address: %j family: IPv%s', address, family);
});

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use('/public', express.static(process.cwd() + '/public'));

// route handling

app.get('/', function(req, res){
	res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoints

app.get("/api/hello", function (req, res) {
	res.json({greeting: 'hello API'});
});

// receive new url to shorten /api/shorturl/new

app.post('/', (req, res) => {
	console.log(req.body);
	res.json({resp:'request successfully processed.'});
});

app.post('/api/shorturl/new', (req, res) => {
	console.log(req.body);
	res.json({resp:`request to ${req.url} successfully processed.`});
});

// receive shorturl and redirect to og url

app.get('/:short', (req, res) => {
	res.redirect('');
});

// listener setup

const listener = app.listen(port, function () {
  console.log('Node.js listening on port %s', listener.address().port);
});
let express = require('express');
let app = express();

//initialise DB
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/';
MongoClient.connect(url, {useNewUrlParser: true}, function (err, client) {
    if (err) {
        console.log('Err  ', err);
    } else {
        console.log("Connected successfully to server");
        db = client.db('fit2095');
    }
});

//allows use of ejs rendering engine, configures express app to handle engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//deals with incoming data from the body of the requst (Post)
app.use(express.urlencoded({extended: true}));
app.use(express.json())

//allows serving of static files from ceratin directories
app.use(express.static('images'));
app.use(express.static('css'));

app.set('port', 8080);

//middleware
app.use(['/parcelnew', '/parcelupdate'], function (req, res, next) {
    if (req.body.sender.length < 3 || req.body.address.length < 3 || req.body.weight < 0) {
        res.render('invaliddata.html');
    } else {
        next();
    }
});

app.use(['/parceldelete', '/parcelupdate'], function (req, res, next) {
    if (req.body.id.length < 24 || req.body.id.length > 24) {
        res.render('invalidid.html');
    } else {
        next();
    }
});

//post
app.post('/parcelnew', function (req, res) {
    let sender = req.body.sender;
    let address = req.body.address;
    let weight = parseInt(req.body.weight);
    let cost = parseInt(req.body.cost);
    let fragile = req.body.fragile;
    
    if (sender.length < 3 || address.length < 3 || weight < 0) {
        res.render('invaliddata.html');
    } else {
        db.collection('week5lab').insertOne({sender: sender, address: address, weight: weight, cost: cost, fragile: fragile});
        res.redirect('/getparcels');
    }
});

app.post('/parcelupdate', function (req, res) {
    let parcelId = req.body.id;
    let sender = req.body.sender;
    let address = req.body.address;
    let cost = parseInt(req.body.cost);
    let weight = parseInt(req.body.weight);
    let fragile = req.body.fragile;

    db.collection('week5lab').updateOne({_id: mongodb.ObjectId(parcelId)}, {$set: {sender: sender, address: address, weight: weight, cost: cost, fragile: fragile}}, function (err, result) {
        if (err) {
            throw err;
        } else {
            res.redirect('/getparcels');
        }
    });
});

app.post('/parceldelete', function (req, res) {
    let parcelId = req.body.id;
    let weight = parseInt(req.body.weight);

    db.collection('week5lab').deleteOne({_id: mongodb.ObjectId(parcelId), weight: weight}, function (err, obj) {
        if (err) {
            throw err;
        } else if (obj.deletedCount != 1) {
            res.render('invaliddata.html');
        } else {
            res.redirect('/getparcels');
        }
    });
});

//get
app.get('/', function (req, res) {
    res.render('index.html');
});

app.get('/addparcel', function (req, res) {
    res.render('newparcel.html');
});

app.get('/getparcels', function (req, res) {
    db.collection('week5lab').find({}).toArray(function (err, result) {
        res.render('listparcel.html', {parcelDB: result});
    });
});

app.get('/deleteparcel', function (req, res) {
    res.render('deleteparcel.html');
});

app.get('/updateparcel', function (req, res) {
    res.render('updateparcel.html');
});

app.get('*', function (req, res) {
    res.render('404.html');
});

app.listen(app.get('port'));
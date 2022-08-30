const e = require('express');
let express = require('express');
let app = express();

//initialise DB
const mongoose = require('mongoose');
const parcel = require('./models/parcel');
const url= 'mongodb://localhost:27017/poms';
const Parcel = require('./models/parcel');
mongoose.connect(url, function (err) {
    if (err) {
        console.log('Error in mongoose connection');
        throw err;
    }
    console.log('Successfully connected to mongoose');
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
    let fragile = req.body.fragile;
    
    let newParcel = new Parcel ({
        _id: new mongoose.Types.ObjectId(),
        sender: sender,
        address: address,
        weight: weight,
        fragile: fragile
    });

    newParcel.save(function (err) {
        if (err) {
            console.log('Error cannot add parcel');
            throw err
        }
        console.log('Parcel added successfully');
    });

    res.redirect('/getparcels');
});

app.post('/parcelupdate', function (req, res) {
    let parcelId = req.body.id;
    let sender = req.body.sender;
    let address = req.body.address;
    let weight = parseInt(req.body.weight);
    let fragile = req.body.fragile;

    Parcel.updateOne({_id: parcelId}, {$set: {sender: sender, address: address, weight: weight, fragile: fragile}}, function (err, parcel) {
        if (parcel.modifiedCount === 1) {
            res.redirect('/getparcels');
        } else {
            res.render('invalidid.html');
        }
    });
});

app.post('/parceldelete', function (req, res) {
    let parcelId = req.body.id;
    
    Parcel.deleteOne({_id: parcelId}, function (err, parcel) {
        if (parcel.deletedCount === 1) {
            console.log('Parcel deleted successfully');
            res.redirect('/getparcels');
        } else {
            console.log('Error, no parcel with that ID');
            res.render('invalidid.html');
        }
    });
});

app.post('/getparcelsbysender', function (req, res) {
    let sender = req.body.sender;

    Parcel.where({sender: sender}).exec(function (err, parcels) {
        res.render('listparcel.html', {parcelDB: parcels, pageTitle: "All Parcels From " + sender});
    })
});

app.post('/getparcelsbyweight', function (req, res) {
    let minWeight = req.body.minweight;
    let maxWeight = req.body.maxweight;

    Parcel.find().where('weight').gte(minWeight).lte(maxWeight).exec(function (err, parcels) {
        res.render('listparcel.html', {parcelDB: parcels, pageTitle: "All parcels >= " + minWeight + "kg and <= " + maxWeight + "kg"});
    })
});

//get
app.get('/', function (req, res) {
    res.render('index.html');
});

app.get('/addparcel', function (req, res) {
    res.render('newparcel.html');
});

app.get('/getparcels', function (req, res) {
    Parcel.find({}, function (err, parcels) {
        res.render('listparcel.html', {parcelDB: parcels, pageTitle: "All Parcels"})
    });
});

app.get('/deleteparcel', function (req, res) {
    res.render('deleteparcel.html');
});

app.get('/updateparcel', function (req, res) {
    res.render('updateparcel.html');
});

app.get('/getparcelssender', function (req, res) {
    res.render('listparcelsender.html');
})

app.get('/getparcelsweight', function (req, res) {
    res.render('listparcelweight.html');
});

app.get('*', function (req, res) {
    res.render('404.html');
});

app.listen(app.get('port'));
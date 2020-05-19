const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const Sensors = require('./sensors.js')

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(
    'mongodb://localhost:27017/on_surf',
    { useNewUrlParser: true, useUnifiedTopology: true });



var myLogger = function (req, res, next) {
    next();
}

app.use(myLogger);

app.get('/sensors', function (req, res) {
    Sensors.find().sort('_id -1').limit(2000).exec(
        (err, prods) => {
            if (err)
                res.status(500).send(err);
            else
                res.status(200).send(prods);
        }
    );
});

app.post('/sensors', function (req, res) {
    data = new Sensors({
        date: req.body.date,
        temp: req.body.temp,
        press: req.body.press
    });
    data.save((err, prod) => {
        if (err)
            res.status(500).send(err);
        else{
            res.status(200).send(prod);
            console.log(prod);
        }
    });
});



app.listen(3000);
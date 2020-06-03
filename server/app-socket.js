var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Sensors = require('./sensor.js');
const cors = require('cors');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(
    'mongodb://localhost:27017/teste_socket',
    { useNewUrlParser: true, useUnifiedTopology: true });



var myLogger = function (req, res, next) {
    next();
}

app.use(myLogger);


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
    // io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' });
    io.emit('chat message', "qualquer coisa");


});

app.get('/sensors', function (req, res) {

    Sensors.find({}).exec(
        // Sensors.find().sort({ timestamp: 1 }).limit(3000).exec(
        (err, prods) => {
            if (err)
                res.status(500).send(err);
            else {
                console.log("Top")
                res.status(200).send(prods);
            }
        }
    );
});

app.post('/', function (req, res) {
    data = new Sensors({
        date: req.body.date,
        temp: req.body.temp,
        press: req.body.press
    });
    data.save((err, prod) => {
        if (err)
            res.status(500).send(err);
        else {
            res.status(200).send(prod);
            console.log(prod);
            io.emit('chat message', data);

        }
    });
});


io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        console.log(msg);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
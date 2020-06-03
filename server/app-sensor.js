const express = require('express');
const socket = require('socket.io')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const Sensors = require('./sensor.js');

var app = express();
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


const server = app.listen(3000, () => {
    console.log('Started in 3000');
});

const io = socket(server);


io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        console.log(msg);
    });
    socket.on('disconnect', (msg) => {
        io.emit('chat message', msg);
        console.log('user disconnected');
    });
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
    // io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' });
    io.emit('chat message', "qualquer coisa");


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

app.get('/sensors', function (req, res) {

    Sensors.find({}).exec(
        // Sensors.find().sort({ timestamp: 1 }).limit(3000).exec(
        (err, prods) => {
            if (err)
                res.status(500).send(err);
            else {

                res.status(200).send(prods);
            }
        }
    );
});

app.get('/sensors/maxTemp', function (req, res) {
    pipeline = [

        {

            $addFields: {
                dateConverted: {
                    $toDate: "$date"
                }
            }

        },
        {
            $match: {
                date: { $gte: 1580601600000, $lte: 1580601600000 + 3599995 },
                "temp": { $gte: 1 }
            },
            // {
            //     $and: [{ date: { $gte: 1590188400055} }, { date: { $lte: 1590288400070 } }]
            // }             
        },
        {
            $sort: {
                "temp": -1
            }
        },
        {
            $group: {
                _id:
                {
                    // minutes: { $minute: "$dateConverted" },
                    // seconds: {$second: "$dateConverted"},
                    "dayOfYear": { "$dayOfYear": "$dateConverted" },
                    "hours": { "$hour": "$dateConverted" },
                    "minutes": { "$minute": "$dateConverted" },
                    "seconds": {
                        "$subtract": [
                            { "$second": "$dateConverted" },
                            { "$mod": [{ "$second": "$dateConverted" }, 10] }
                        ]
                    },
                    // "milliseconds": {
                    //     "$subtract": [
                    //         { "$millisecond": "$dateConverted" },
                    //         { "$mod": [{ "$millisecond": "$dateConverted" }, 500] }
                    //     ]
                    // },

                },
                count: {
                    $sum: 1
                },
                // lista: { $push: { temp: "$temp" } },
                maxTemp: { $first: "$temp" },
                avgTemp: { $avg: "$temp" },
                avgDate: { $avg: "$date" },
                minTemp: { $last: "$temp" },
                // firstTemp: { $first: "$temp" },
                // lastTemp: { $last: "$temp" },
                maxDate: { $first: "$date" },
                minDate: { $last: "$date" }
            }
        },
        {
            $sort: {
                maxDate: 1
            }
        }
    ];

    Sensors.aggregate(pipeline)
        // .limit(10000)
        .exec(
            // Sensors.find().sort({ timestamp: 1 }).limit(3000).exec(
            (err, prods) => {
                if (err)
                    res.status(500).send(err);
                else {

                    res.status(200).send(prods);
                }
            }
        );
});



app.get('/sensors/maxPress', function (req, res) {
    pipeline = [

        {

            $addFields: {
                dateConverted: {
                    $toDate: "$date"
                }
            }

        },
        {
            $match: {
                date: { $gte: 1580601600000, $lte: 1580601600000 + 3599995 },
                "press": { $gte: 0 }
            },
            // {
            //     $and: [{ date: { $gte: 1590188400055} }, { date: { $lte: 1590288400070 } }]
            // }             
        },
        {
            $sort: {
                "press": -1
            }
        },
        {
            $group: {
                _id:
                {
                    // minutes: { $minute: "$dateConverted" },
                    // seconds: {$second: "$dateConverted"},
                    "dayOfYear": { "$dayOfYear": "$dateConverted" },
                    "hours": { "$hour": "$dateConverted" },
                    "minutes": { "$minute": "$dateConverted" },
                    "seconds": {
                        "$subtract": [
                            { "$second": "$dateConverted" },
                            { "$mod": [{ "$second": "$dateConverted" }, 10] }
                        ]
                    },
                    // "milliseconds": {
                    //     "$subtract": [
                    //         { "$millisecond": "$dateConverted" },
                    //         { "$mod": [{ "$millisecond": "$dateConverted" }, 500] }
                    //     ]
                    // },

                },
                count: {
                    $sum: 1
                },
                // lista: { $push: { temp: "$temp" } },
                maxPress: { $first: "$press" },
                avgPress: { $avg: "$press" },
                avgDate: { $avg: "$date" },
                minPress: { $last: "$press" },
                // firstTemp: { $first: "$temp" },
                // lastTemp: { $last: "$temp" },
                maxDate: { $first: "$date" },
                minDate: { $last: "$date" }
            }
        },
        {
            $sort: {
                maxDate: 1
            }
        }
    ];

    Sensors.aggregate(pipeline)
        // .limit()
        .exec(
            // Sensors.find().sort({ timestamp: 1 }).limit(3000).exec(
            (err, prods) => {
                if (err)
                    res.status(500).send(err);
                else {

                    res.status(200).send(prods);
                }
            }
        );
});

// {temp:{$gte:350}
//         // $or: [{ temp: { $gte: 380 } }, { temp: { $lte: 30 } }],
//         // $or: [
//         //     {
//         //         $and: [
//         //             { date: { $gte: 1577836800000 } },
//         //             { date: { $lte: 1577858032266 } }
//         //         ]},
//         //     {
//         //         $and: [
//         //             { date: { $gte: 1577858032266 } },
//         //             { date: { $lte: 1577882803243 } }]
//         //     },
//         //     { date: 1578148206569 }]
//     }

app.post('/sensors', function (req, res) {
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
        }
    });
});



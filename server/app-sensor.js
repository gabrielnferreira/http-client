const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const Sensors = require('./sensor.js');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


mongoose.connect(
    'mongodb://localhost:27017/testes',
    { useNewUrlParser: true, useUnifiedTopology: true });



var myLogger = function (req, res, next) {
    next();
}

app.use(myLogger);

app.get('/sensors', function (req, res) {
    pipeline = [
        {
            $match: {
                date: { $gte: 1590188400000, $lte: 1590200000000 }
            },
            // {
            //     $and: [{ date: { $gte: 1590188400055} }, { date: { $lte: 1590288400070 } }]
            // }             
        },
        {

            $addFields: {
                dateConverted: {
                    $toDate: "$date"
                }
            }

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
                    "hour": { "$hour": "$dateConverted" },
                    "minute": {
                        "$subtract": [
                            { "$minute": "$dateConverted" },
                            { "$mod": [{ "$minute": "$dateConverted" }, 10] }
                        ]
                    },
                    "second": {
                        "$subtract": [
                            { "$second": "$dateConverted" },
                            { "$mod": [{ "$second": "$dateConverted" }, 10] }
                        ]
                    },
                    milliseconds: { $millisecond: "$dateConverted" }
                },
                count: {
                    $sum: 1
                },
                // lista: { $push: { temp: "$temp" } },
                maxTemp: { $first: "$temp" },
                avgTemp: { $avg: "$temp" },
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
        },


    ];

    Sensors.aggregate(pipeline).limit(1000).exec(
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



app.listen(3000);
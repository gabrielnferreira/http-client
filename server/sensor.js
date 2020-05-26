const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var sensorsSchema = new Schema({
    temp: Number,
    press: Number,
    date: Number
},
{
    versionKey: false // You should be aware of the outcome after set to false
}
);

module.exports = mongoose.model("Sensor",sensorsSchema);
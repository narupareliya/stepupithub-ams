console.log('asd');

var config = require('config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var attendanceSchema = new Schema({
    devId: String,
    intime: Number,
    outtime: {
        type: Number,
        default: 0
    },
    worktime: {
        type: Number,
        default: 0
    },
    pureDate: String,
    createdAt: Date,
});
mongoose.model('attendance', attendanceSchema);


var attendanceAppSettingsSchema = new Schema({
    starttime: Number,
    endtime: Number,
    workinghours: Number,
    holidays: [],
    createdAt: Date,
});
mongoose.model('attendanceAppSettings', attendanceAppSettingsSchema);


var developerSchema = new Schema({
    fname: String,
    lname: String,
    devId: String,
    salary: Number,
    password:String,
    status: {
        type: Boolean,
        default: true
    },  
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: Date,
});
mongoose.model('developers', developerSchema);
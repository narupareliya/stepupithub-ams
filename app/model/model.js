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

// ----------- Expense Manager User ---------------------------
var expenseUser = new Schema({
    userName: String,
    email: String,
    contact: String,
    password: String,
    gender: String,
    loginpin: String,
    createdAt: Date,
    updatedAt: Date
});

mongoose.model('expenseUser', expenseUser);


var expenseLogs = new Schema({
    userId: String,
    logs: [],
    createdAt: Date,
    updatedAt: Date
});

mongoose.model('expenseLogs', expenseLogs);

var girlsphotoLikes = new Schema({
    image: String,
    likes: [{
        deviceId: String,
        createdAt: Date,
    }]
});

mongoose.model('girlsphotoLikes', girlsphotoLikes);


var couplephotoLikes = new Schema({
    image: String,
    likes: [{
        deviceId: String,
        createdAt: Date,
    }]
});

mongoose.model('couplephotoLikes', couplephotoLikes);
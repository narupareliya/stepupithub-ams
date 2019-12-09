var mongoose = require('mongoose');
var uid = require('uid');
require('date-utils');

var developersModel = mongoose.model('developers');
var attendanceModel = mongoose.model('attendance');


var getDate = function() {
	var date = {};

	date.start = new Date();
	date.start.setHours(0,0,0,0);
	date.end = new Date();
	date.end.setHours(23,59,59,999);

	return date;
}

exports.getWork = function(req, res) {
	var date = getDate();

	attendanceModel.findOne({
		devId: req.body.devId,
		outtime: 0,
		createdAt: { $gte: date.start, $lt: date.end },
	}, {
		_id: true,
	}).exec(function(err, response) {
		res.json(response);
	});
}

exports.startWork = function(req, res) {
	req.body.createdAt = new Date();
	req.body.intime = new Date().getTime() / 1000;
	req.body.pureDate = (new Date().getMonth()+1) +'-'+ (new Date().getFullYear());
	req.body.outtime = 0;

	var formData = new attendanceModel(req.body);

	formData.save(function(err, result) {
		res.json(result);
	});
}

exports.stopWork = function(req, res) {
	attendanceModel.findOne({
		_id: req.body._id
	},{
		intime: true
	}).exec(function(err, timeRes) {
		var outtime = new Date().getTime() / 1000;

		attendanceModel.update({
			_id: req.body._id
		},{
			outtime: outtime,
			worktime: (outtime - timeRes.intime),
		}).exec(function(err, result) {
			res.json(result);
		});
	});
}

exports.getWorkReport = function(req, res) {
	attendanceModel.find({
		devId: req.body.devId,
		pureDate: req.body.reqDate,
	}).lean().exec(function(err, response) {
		if (response.length) {
			var data = [];
			var finalRes = [];

			for (var i in response) {
				response[i].date = new Date(response[i].createdAt).toFormat('D-M-YYYY');

				if (!data[response[i].date]) {
					data[response[i].date] = {
						_id: response[i]._id,
						devId: response[i].devId,
						createdAt: response[i].createdAt,
						intime: response[i].intime,
						pureDate: response[i].pureDate,
						outtime: response[i].outtime,
						worktime: response[i].worktime,
						date: response[i].date,
					};
				} else {
					data[response[i].date].worktime += response[i].worktime;
				}
			}

			for (var i in data) {
				finalRes.push(data[i]);
			}

			res.json(finalRes);
			return;
		}

		res.json(response);
	});
}


// ------------------------------------------
// Cron section
// ------------------------------------------
var cron = require('node-cron');
 
cron.schedule('* * * * *', () => {
	var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
	indiaTime = new Date(indiaTime);
	var hour = indiaTime.getHours();

	console.log("hour >>>>>", hour);

	if (hour == 13 || hour >= 20) {
		console.log('Cron start ....', new Date());
		attendanceModel.find({
			outtime: 0
		},{
			intime: true
		}).exec(function(err, timeRes) {
			if (!timeRes.length) {
				console.log('no data');
				return;
			}

			var count = 0;
			var outtime = new Date().getTime() / 1000;
			var update = function() {
				if (timeRes.length > count) {
					attendanceModel.update({
						_id: timeRes[count]._id,
					},{
						outtime: outtime,
						worktime: (outtime - timeRes[count].intime),
					}).exec(function(err, result) {
						count = count + 1;
						console.log('Cron completed ....', new Date());
					});
				}
			}
			update();
		});
	}
});









// ----------------------------------------
// Expense manager app business logic
// ----------------------------------------


exports.expRegister = function(req, res) {
    var userModel = mongoose.model('expenseUser');

    userModel.find({
        email: req.body.email
    }).exec(function(err, result) {

        if (err) {
            return;
        }

        if (result && result.length) {
            res.json({
                status: 1,
            });

            return;
        }

        req.body.createdAt = new Date();
        var user = new userModel(req.body);

        var errors = req.validationErrors();

        if (errors) {
            res.json({
                status: 2,
                errors: errors,
            })
            return
        }

        user.save(function(err, result) {
            res.json(result);
        });
    });
};

exports.expregUpdate = function(req, res) {
    var userModel = mongoose.model('expenseUser');

    userModel.find({
        email: req.body.email
    }).exec(function(err, result) {

        if (err) {
            return;
        }

        if (result && result.length) {
            res.json({
                status: 1,
            });

            return;
        }

        req.body.createdAt = new Date();
        var user = new userModel(req.body);

        var errors = req.validationErrors();

        if (errors) {
            res.json({
                status: 2,
                errors: errors,
            })
            return
        }

        userModel.update({
        _id: req.body._id
	    }, req.body, {
	        multi: true
	    }).exec(function(err, result) {
	        res.json({
	            status: true,
	            result: result
	        });
	    });
    });
};

exports.expLogin = function(req, res) {
    var userModel = mongoose.model('expenseUser');
    
    userModel.findOne({
        email: req.body.email,
        password: req.body.password
    }, function(err, user) {
        if (err || !user) {
            res.json({
                msg: 'User not found',
                status: false
            });
            return;
        }

        res.json({
            status: true,
            user: user,
        });
    });
 //    if(req.body.type=='Password'){
	// } else {
	// 	 userModel.findOne({
	//         loginpin: req.body.loginpin
	//     }, function(err, user) {
	//         if (err || !user) {
	//             res.json({
	//                 msg: 'User not found',
	//                 status: false
	//             });
	//             return;
	//         }

	//         res.json({
	//             status: true,
	//             user: user,
	//         });
	//     });
	// }
}

exports.changePass = function(req, res) {

    var userModel = mongoose.model('expenseUser');

    userModel.update({
        _id: req.body._id
    }, req.body, {
        multi: true
    }).exec(function(err, result) {
        res.json({
            status: true,
            result: result
        });
    });
};

exports.setPin = function(req, res) {
	console.log("req.body._id",req.body._id)
    var userModel = mongoose.model('expenseUser');
    userModel.update({
        _id: req.body._id
    }, req.body, {
        multi: true
    }).exec(function(err, result) {
        res.json({
            status: true,
            result: result
        });
    });
};

exports.postLog = function(req, res) {
    var explogsModel = mongoose.model('expenseLogs');

    explogsModel.update({
        userId: req.body.userId
    }, req.body, {
        upsert: true
    }).exec(function(err, result) {
        res.json({
            status: true,
            result: result
        });
    });
};

exports.restoreLog = function(req, res) {
    var explogsModel = mongoose.model('expenseLogs');

    explogsModel.findOne({
		userId: req.body.userId,
	}).exec(function(err, response) {
		res.json(response);
	});
};

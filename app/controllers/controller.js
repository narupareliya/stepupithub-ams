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
        email: req.body.email,
        _id: { $ne: req.body._id }
    }).exec(function(err, result) {
        if (result && result.length) {
            res.json({
                status: 1,
            });
            return;
        }

        userModel.update({
        	_id: req.body._id
	    }, req.body, {
	        multi: true
	    }).exec(function(err, result) {
	        res.json({
	            status: 2,
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
}

exports.changePass = function(req, res) {
	console.log("req.body",req.body)
    var userModel = mongoose.model('expenseUser');
    userModel.update({
        _id: req.body.userId
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


//Girls Pose


exports.girlsLike = function(req, res) {
    var userModel = mongoose.model(req.body.model);
 
    var finalLike = {
        deviceId: req.body.likes,
        createdAt: new Date()
    };

    req.body.likes = finalLike;
    
    userModel.findOne({
        image: req.body.image,
    }).exec(function(err, result) {
        if (err) {
            res.json({
                status: 0,
            });
            return;
        }

        if (result && result._id) {
            if(req.body.status == 1){
                pushLike();
            }
            else
            {
                unLike();
            }
        }
        else
        {
            var like = new userModel(req.body);
            like.save(function(err, result) {
                res.json({
                    status: 1,
                    result: result
                });
             });
        }
    });

    var pushLike = function() {
        userModel.update({
            "image" : req.body.image,
        },{
            $push: { "likes": req.body.likes }
        }).exec(function(err, result) {
            console.log(err, result);
            if (err) {
                res.json({
                    status: false
                });
                return;
            }
            res.json({
                    status: true
                });
            return;
        });
    }

    var unLike = function() {
        userModel.update({
            "image" : req.body.image,
        },{
            $pull: { "likes" : { deviceId: req.body.likes.deviceId }},
        }).exec(function(err, result) {
            if (err) {
                res.json({
                    status: false
                });
                return;
            }
            res.json({
                    status: true
                });
            return;
        });
    }
};


exports.mostLike = function(req, res) {
    if (!req.body.model) {
        res.json([]);
        return;
    }

    var imgLikes = mongoose.model(req.body.model);
    var dt = exports.getTimeStamp('lastWeek');
    imgLikes.aggregate ([
        { $match : {"likes.createdAt": { $gt: dt.fromDate,$lte: dt.toDate }}},
        { $unwind : "$likes" },
        { $match : {"likes.createdAt": { $gt: dt.fromDate,$lte: dt.toDate }}},
        { $group: {_id: '$image',count: { $sum: 1 }}
    }]).exec(function(err, response) {
        
        if(response.length) {
            response.sort(function(a,b) {
               return b.count - a.count;
            });
        }

        imgLikes.aggregate ([
            { $match : {"likes.deviceId": req.body.deviceid }
        }]).exec(function(err, likes) {
            var like = [];

            if(likes.length) {
                for (var i in likes) {
                    like.push(likes[i].image);
                }
            }
            var photoweek = "";
            if(response.length) {
                photoweek = response[0]._id+".jpg"
            }

            console.log("photoweek>>>>",photoweek)
            res.json({
                image:photoweek,
                likes: like,
            });
        });
    });
};


exports.getTimeStamp = function(timespans) {
    //
    var fromHours = new Date();
    var toHours = new Date();
    var currentDate = new Date();

    switch (timespans) {

        case "lastWeek":

            var d = new Date();
            var to = d.setTime(d.getTime() - (d.getDay() ? d.getDay() : 7) * 24 * 60 * 60 * 1000);
            var from = d.setTime(d.getTime() - 6 * 24 * 60 * 60 * 1000);

            var firstDate = new Date(from);
            var lastDate = new Date(to);
            firstDate.setHours(0, 0, 0, 0);
            lastDate.setHours(23, 59, 59, 999);

            var from_day = firstDate.getDaysBetween(lastDate);
            var to_day = lastDate.getDaysBetween(currentDate);
            from_day += 1;
            fromHours = fromHours.addDays(-(from_day + to_day));
            to_day += 1
            toHours = toHours.addDays(-to_day);

            break;

    }

    fromHours.setHours(0, 0, 0, 0);
    toHours.setHours(23, 59, 59, 999);

    return {
        fromDate: fromHours,
        toDate: toHours
    };
}



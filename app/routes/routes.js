'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var ctrl = require('../controllers/controller');
var icdb = require('../controllers/icdb');


router.get('/', function(req, res) {
	res.json('Connected...')
});

router.all('/api/icdb/add-data', cors(), icdb.postAddData);
router.all('/api/icdb/get-data', cors(), icdb.getData);
router.all('/api/icdb/get-condition', cors(), icdb.getCondition);
router.all('/api/icdb/single-data', cors(), icdb.getSingle);
router.all('/api/icdb/edit-data', cors(), icdb.getEditData);
router.all('/api/icdb/delete', cors(), icdb.getDeleteData);
router.all('/api/icdb/delete-condition', cors(), icdb.getDeleteDataCondition);

router.all('/api/v1/app/att/work/start', cors(), ctrl.startWork);
router.all('/api/v1/app/att/work/stop', cors(), ctrl.stopWork);
router.all('/api/v1/app/att/get/work', cors(), ctrl.getWork);
router.all('/api/v1/app/att/get/reports', cors(), ctrl.getWorkReport);

//Expence Manager App Route
router.all('/api/user/expregister', cors(), ctrl.expRegister);
router.all('/api/user/expregupdate', cors(), ctrl.expregUpdate);
router.all('/api/user/explogin', cors(), ctrl.expLogin);
router.all('/api/user/changepass', cors(), ctrl.changePass);
router.all('/api/user/setpin', cors(), ctrl.setPin);
router.all('/api/app/exp/post-log', cors(), ctrl.postLog);
router.all('/api/app/exp/restore-log', cors(), ctrl.restoreLog);


// Girls / Couple / Attitude Pose
router.all('/api/girlsphoto/like', cors(), ctrl.girlsLike);

//  Girls / Couple / Attitude Most Like
router.all('/api/girlsphoto/mostlike', cors(), ctrl.mostLike);



module.exports = router;

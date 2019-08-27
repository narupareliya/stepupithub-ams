'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var ctrl = require('../controllers/controller');


router.all('/api/v1/app/att/work/start', cors(), ctrl.startWork);
router.all('/api/v1/app/att/work/stop', cors(), ctrl.stopWork);
router.all('/api/v1/app/att/get/work', cors(), ctrl.getWork);
router.all('/api/v1/app/att/get/reports', cors(), ctrl.getWorkReport);


module.exports = router;

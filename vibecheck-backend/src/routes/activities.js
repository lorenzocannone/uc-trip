// src/routes/activities.js
const express = require('express');
const catchAsync = require('../utils/catchAsync');
const activities = require('../controllers/activities');

const router = express.Router({ mergeParams: true });

router.post('/:dayId/activities', catchAsync(activities.addActivity));

module.exports = router;

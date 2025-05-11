// src/routes/days.js
const express = require('express');
const catchAsync = require('../utils/catchAsync');
const days = require('../controllers/days');

const router = express.Router({ mergeParams: true });

router.post('/', catchAsync(days.addDay));

module.exports = router;

// src/routes/trips.js
const express = require('express');
const catchAsync = require('../utils/catchAsync');
const trips = require('../controllers/trips');

const router = express.Router();

router
  .route('/')
  .get(catchAsync(trips.getAllTrips))
  .post(catchAsync(trips.createTrip));

router
  .route('/:tripId')
  .get(catchAsync(trips.getTripDetails));

module.exports = router;

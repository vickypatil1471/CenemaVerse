const express = require("express");

const router = express.Router();

const {
  createBooking,
  verifyPayment,
  getBookings,
  getAllGlobalBookings,
  createNetBankingBooking,
} = require("../controllers/bookingController");

const {
  protect,
  adminProtect,
} = require("../middleware/auth");



// CREATE BOOKING
router.post("/", protect, createBooking);

// VERIFY PAYMENT
router.post("/verify", protect, verifyPayment);

// USER BOOKINGS
router.get("/mybookings", protect, getBookings);

// ADMIN BOOKINGS
router.get("/all", protect, adminProtect, getAllGlobalBookings);

// NET BANKING 

router.post(
  "/netbanking",
  protect,
  createNetBankingBooking
);


module.exports = router;
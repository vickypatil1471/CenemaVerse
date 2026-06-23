const Booking = require("../models/bookingModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CREATE BOOKING + ORDER
const createBooking = async (req, res) => {
  try {
    const {
      movieId,
      movieTitle,
      moviePoster,
      basePrice,
      seats,
      showtimeDate,
      showtimeTime,
    } = req.body;

    if (!seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No seats selected",
      });
    }

    let amountPaid = 0;

    seats.forEach((seat) => {
      if (seat.startsWith("D") || seat.startsWith("E")) {
        amountPaid += Number(basePrice) * 1.5;
      } else {
        amountPaid += Number(basePrice);
      }
    });

    console.log("========== PAYMENT DEBUG ==========");
    console.log("RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID);
    console.log("BASE PRICE:", basePrice);
    console.log("SEATS:", seats);
    console.log("TOTAL:", amountPaid);
    console.log("===================================");

    const order = await razorpay.orders.create({
      amount: Math.round(amountPaid * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        movieId: movieId.toString(),
        seats: seats.join(","),
      },
    });

    const booking = await Booking.create({
      user: req.user._id,
      movieId: movieId.toString(),
      movieTitle,
      moviePoster,
      seats,
      amountPaid,
      stripeSessionId: order.id,
      showtimeDate,
      showtimeTime,
      paymentStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      booking,
    });
  } catch (error) {
    console.log("CREATE BOOKING ERROR:");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// VERIFY PAYMENT
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const booking = await Booking.findOne({
      stripeSessionId: razorpay_order_id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.paymentStatus = "paid";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      booking,
    });
  } catch (error) {
    console.log("VERIFY PAYMENT ERROR:");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// USER BOOKINGS
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
      paymentStatus: "paid",
    }).sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN BOOKINGS
const getAllGlobalBookings = async (req, res) => {
  try {
const bookings = await Booking.find({
  paymentStatus: "paid",
})
  .populate("user", "fullName email")
  .sort({ createdAt: -1 });
    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createNetBankingBooking = async (
  req,
  res
) => {
  try {
    const {
      movieId,
      movieTitle,
      moviePoster,
      seats,
      amountPaid,
      showtimeDate,
      showtimeTime,
    } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "Movie ID is required",
      });
    }

    if (!seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No seats selected",
      });
    }

    const booking =
      await Booking.create({
        user: req.user._id,
        movieId: movieId.toString(),
        movieTitle,
        moviePoster,
        seats,
        amountPaid,
        showtimeDate,
        showtimeTime,
        paymentStatus: "paid",
      });

    return res.status(201).json({
      success: true,
      message:
        "Ticket booked successfully",
      booking,
    });
  } catch (error) {
    console.log(
      "NET BANKING BOOKING ERROR:"
    );
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  verifyPayment,
  getBookings,
  getAllGlobalBookings,
  createNetBankingBooking,
};
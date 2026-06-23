
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  ShieldCheck,
  ChevronLeft,
  Building2,
} from "lucide-react";

import axios from "axios";

import { useState } from "react";

export default function NetBankingPage() {
  const navigate = useNavigate();

const [customerId, setCustomerId] =
  useState("");

const [accountNumber, setAccountNumber] =
  useState("");

const [password, setPassword] =
  useState("");

  const location = useLocation();

  const {
    movie,
    seats = [],
    amount = 0,
    auditorium = "Audi 1",
    slotKey,
  } = location.state || {};

if (!movie) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Booking Data Missing
        </h1>

        <button
          onClick={() =>
            navigate("/movies")
          }
          className="
            bg-red-600
            px-6
            py-3
            rounded-lg
          "
        >
          Back To Movies
        </button>
      </div>
    </div>
  );
}

  const booking = {
    movie:
      movie?.title || "Movie",

    theatre:
      auditorium || "Audi 1",

    date: slotKey
      ? new Date(slotKey).toLocaleDateString(
          "en-IN"
        )
      : "N/A",

    time: slotKey
      ? new Date(slotKey).toLocaleTimeString(
          "en-IN"
        )
      : "N/A",

    seats:
      seats.length > 0
        ? seats.join(", ")
        : "N/A",

    ticketAmount: amount,
  };

const handlePayment = async () => {
  try {
    if (!customerId.trim()) {
      alert("Enter Customer ID");
      return;
    }

    if (
      !/^\d{10,18}$/.test(
        accountNumber
      )
    ) {
      alert(
        "Account Number must be 10 to 18 digits"
      );
      return;
    }

    if (password.length < 4) {
      alert("Enter Password");
      return;
    }

    const token =
      localStorage.getItem(
        "cine_token"
      );

    if (!token) {
      navigate("/login");
      return;
    }

    await axios.post(
      "https://cenemaverse-1.onrender.com/api/bookings/netbanking",
      {
        movieId:
          movie._id || movie.id,

        movieTitle:
          movie.title,

        moviePoster:
          movie.posterUrl ||
          movie.image,

        seats,

        amountPaid:
          booking.ticketAmount,

        showtimeDate:
          new Date(slotKey),

        showtimeTime:
          new Date(
            slotKey
          ).toLocaleTimeString(
            "en-IN"
          ),
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    alert(
      "Payment Successful 🎉"
    );

    navigate("/bookings");
  } catch (err) {
    console.log(err);

    alert(
      err.response?.data
        ?.message ||
        "Payment Failed"
    );
  }
};

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-5xl font-bold">
              Net Banking
            </h1>

            <p className="text-gray-400 mt-2">
              Movie Booking • Secure Checkout
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="
            flex
            items-center
            gap-2
            text-red-400
            hover:text-red-300
            "
          >
            <ChevronLeft size={18} />
            Back
          </button>

        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT PANEL */}

          <div
            className="
            lg:col-span-2
            bg-[#0b1120]
            border
            border-red-500/20
            rounded-2xl
            p-6
            "
          >

            {/* STEPS */}

            <div className="flex justify-between mb-10">

              <div className="flex flex-col items-center">
                <div
                  className="
                  w-10
                  h-10
                  rounded-full
                  bg-red-600
                  flex
                  items-center
                  justify-center
                  font-bold
                  "
                >
                  1
                </div>

                <p className="mt-2 text-red-400">
                  Ticket Details
                </p>
              </div>

              <div className="flex-1 border-t border-dashed border-gray-700 mx-4 mt-5"></div>

              <div className="flex flex-col items-center">
                <div
                  className="
                  w-10
                  h-10
                  rounded-full
                  border
                  border-red-500
                  flex
                  items-center
                  justify-center
                  font-bold
                  "
                >
                  2
                </div>

                <p className="mt-2 text-red-400">
                  Net Banking
                </p>
              </div>

              <div className="flex-1 border-t border-dashed border-gray-700 mx-4 mt-5"></div>

              <div className="flex flex-col items-center">
                <div
                  className="
                  w-10
                  h-10
                  rounded-full
                  border
                  border-gray-600
                  flex
                  items-center
                  justify-center
                  font-bold
                  "
                >
                  3
                </div>

                <p className="mt-2">
                  Payment
                </p>
              </div>

            </div>

            {/* MOVIE DETAILS */}

            <div
              className="
              bg-[#111827]
              border
              border-red-500/10
              rounded-xl
              p-5
              "
            >

              <h2 className="text-xl font-bold mb-5">
                Ticket Information
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="text-gray-400 text-sm">
                    Movie
                  </label>

                  <input
                    readOnly
                    value={booking.movie}
                    className="
                    w-full
                    mt-2
                    bg-black
                    border
                    border-gray-700
                    rounded-lg
                    p-3
                    "
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm">
                    Auditorium
                  </label>

                  <input
                    readOnly
                    value={booking.theatre}
                    className="
                    w-full
                    mt-2
                    bg-black
                    border
                    border-gray-700
                    rounded-lg
                    p-3
                    "
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm">
                    Date
                  </label>

                  <input
                    readOnly
                    value={booking.date}
                    className="
                    w-full
                    mt-2
                    bg-black
                    border
                    border-gray-700
                    rounded-lg
                    p-3
                    "
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm">
                    Show Time
                  </label>

                  <input
                    readOnly
                    value={booking.time}
                    className="
                    w-full
                    mt-2
                    bg-black
                    border
                    border-gray-700
                    rounded-lg
                    p-3
                    "
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm">
                    Seats
                  </label>

                  <input
                    readOnly
                    value={booking.seats}
                    className="
                    w-full
                    mt-2
                    bg-black
                    border
                    border-gray-700
                    rounded-lg
                    p-3
                    "
                  />
                </div>

              </div>

              <div
                className="
                mt-5
                bg-red-500/10
                border
                border-red-500/20
                rounded-xl
                p-4
                flex
                justify-between
                font-bold
                "
              >
                <span>Total Amount</span>

                <span className="text-red-400">
                  ₹{booking.ticketAmount}
                </span>
              </div>

            </div>

            {/* NET BANKING DETAILS */}

            <div
              className="
              bg-[#111827]
              border
              border-red-500/10
              rounded-xl
              p-5
              mt-5
              "
            >

              <h2 className="font-bold text-xl mb-4">
                Net Banking Details
              </h2>

              <div className="space-y-4">

<input
  type="text"
  placeholder="Customer ID"
  value={customerId}
  onChange={(e) =>
    setCustomerId(e.target.value)
  }
  className="
    w-full
    bg-black
    border
    border-gray-700
    rounded-lg
    p-4
    text-white
  "
/>

<input
  type="text"
  placeholder="Account Number"
  value={accountNumber}
  onChange={(e) =>
    setAccountNumber(e.target.value)
  }
  className="
    w-full
    bg-black
    border
    border-gray-700
    rounded-lg
    p-4
    text-white
  "
/>

<input
  type="password"
  placeholder="Internet Banking Password"
  value={password}
  onChange={(e) =>
    setPassword(e.target.value)
  }
  className="
    w-full
    bg-black
    border
    border-gray-700
    rounded-lg
    p-4
    text-white
  "
/>

              </div>

            </div>

            {/* SECURITY */}

            <div
              className="
              mt-5
              bg-[#111827]
              rounded-xl
              p-5
              flex
              gap-4
              "
            >
              <ShieldCheck
                className="text-green-500"
              />

              <div>
                <h3 className="font-semibold">
                  Secure Transaction
                </h3>

                <p className="text-sm text-gray-400">
                  Your transaction is protected.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL */}

          <div
            className="
            bg-[#0b1120]
            border
            border-red-500/20
            rounded-2xl
            p-6
            "
          >

            <h2 className="text-2xl font-bold mb-6">
              Payment Summary
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between">
                <span>Movie</span>
                <span>{booking.movie}</span>
              </div>

              <div className="flex justify-between">
                <span>Auditorium</span>
                <span>{booking.theatre}</span>
              </div>

              <div className="flex justify-between">
                <span>Date & Time</span>
                <span>
                  {booking.date}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Seats</span>
                <span>{booking.seats}</span>
              </div>

              <hr className="border-gray-700" />

              <div className="flex justify-between">
                <span>Ticket Amount</span>
                <span>
                  ₹{booking.ticketAmount}
                </span>
              </div>

              <hr className="border-gray-700" />

              <div className="flex justify-between text-3xl font-bold">

                <span>Total</span>

                <span className="text-red-500">
                  ₹{booking.ticketAmount}
                </span>

              </div>

            </div>

            <div
              className="
              bg-green-500/10
              border
              border-green-500/20
              rounded-xl
              p-4
              mt-6
              "
            >

              <div className="flex gap-3">

                <Building2
                  className="text-green-500"
                />

                <div>
                  <p className="font-semibold">
                    Net Banking
                  </p>

                  <p className="text-sm text-gray-400">
                    Secure Payment Gateway
                  </p>
                </div>

              </div>

            </div>

            <button
              onClick={handlePayment}
              className="
              w-full
              bg-red-600
              hover:bg-red-700
              rounded-xl
              py-4
              mt-6
              font-bold
              transition
              "
            >
              Proceed To Pay ₹{booking.ticketAmount}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="
              w-full
              mt-4
              text-gray-400
              "
            >
              Cancel Transaction
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


const mongoose = require("mongoose");

const movieSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
    },

    releaseDate: {
  type: Date,
},

    language: {
      type: String,
      default: "English",
    },

    category: [
      {
        type: String,
      },
    ],

    posterUrl: {
      type: String,
      default: "",
    },

    trailerUrl: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 7.5,
    },

    auditorium: {
  type: String,
  default: "Audi 1",
},

    type: {
      type: String,
      default: "normal",
    },

    seatPrices: {
      standard: {
        type: Number,
        default: 0,
      },

      recliner: {
        type: Number,
        default: 0,
      },
    },

    cast: [
      {
        name: String,
        role: String,
        avatarUrl: String,
      },
    ],

    directors: [
      {
        name: String,
        avatarUrl: String,
      },
    ],

    producers: [
      {
        name: String,
        avatarUrl: String,
      },
    ],

    showtimes: [
{
  id: String,

  date: String,
  time: String,
  ampm: String,

  bookedSeats: [{ type: String }]
}
],

    latestTrailer: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Movie", movieSchema);
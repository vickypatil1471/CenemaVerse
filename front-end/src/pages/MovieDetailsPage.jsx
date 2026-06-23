import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Play,
  X,
} from "lucide-react";

import { movieDetailHStyles } from "../assets/dummyStyles";
import api, { getApiBaseUrl } from "../utils/api";

import MOVIES_MAIN from "../assets/dummymdata";
import MOVIES_FEATURED from "../assets/dummymoviedata";

// NORMALIZE FEATURED MOVIES
const MOVIES_FEATURED_NORMALISED = MOVIES_FEATURED.map((m) => ({
  ...m,
  image: m.img,
}));

// MERGE ALL DUMMY MOVIES
const ALL_DUMMY_MOVIES = [
  ...MOVIES_MAIN,
  ...MOVIES_FEATURED_NORMALISED,
];

// ROWS




// YOUTUBE HELPERS
function extractYouTubeId(urlOrId) {
  if (!urlOrId) return null;

  if (/^[A-Za-z0-9_-]{6,}$/.test(urlOrId)) {
    return urlOrId;
  }

  const re =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;

  const m = urlOrId.match(re);

  return m ? m[1] : null;
}

const getEmbedUrl = (id) =>
  id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
    : null;

// FALLBACK AVATAR


export default function MovieDetailsPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);

  const [loading, setLoading] = useState(true);

  const [showTrailer, setShowTrailer] = useState(false);

  const [selectedTrailerId, setSelectedTrailerId] = useState(null);

  const [selectedMovie, setSelectedMovie] = useState(null);

  const [selectedDay, setSelectedDay] = useState(0);

  const [selectedTime, setSelectedTime] = useState(null);

  // FETCH MOVIE
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // TRY BACKEND FIRST
        const res = await api.get(`/movies/${id}`);

        setMovie(res.data);
      } catch (err) {
        console.log("Backend movie not found. Trying dummy movie...");

        // TRY DUMMY MOVIES
        const dummyMovie = ALL_DUMMY_MOVIES.find(
          (m) => String(m.id) === String(id)
        );

        if (dummyMovie) {
          setMovie(dummyMovie);
        } else {
          setMovie(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // SHOWTIMES
  const showtimeDays = useMemo(() => {
    if (!movie) return [];

    // DUMMY MOVIE SUPPORT
    if (movie.slots) {
      const grouped = {};

      movie.slots.forEach((slot) => {
        const dateObj = new Date(slot.time);

        const dateKey = dateObj.toISOString().split("T")[0];

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }

        grouped[dateKey].push({
          time: dateObj.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),

          datetime: slot.time,

          audi: slot.audi,

          bookedCount: 0,
        });
      });

      return Object.keys(grouped).map((dateKey) => {
        const dateObj = new Date(dateKey);

        return {
          date: dateKey,

          shortDay: dateObj.toLocaleDateString("en-US", {
            weekday: "short",
          }),

          dateStr: dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),

          showtimes: grouped[dateKey],
        };
      });
    }

    // BACKEND MOVIE SUPPORT
    if (movie.showtimes) {
      const slotsByDate = {};

      movie.showtimes.forEach((slot) => {
        if (!slotsByDate[slot.date]) {
          slotsByDate[slot.date] = [];
        }

        slotsByDate[slot.date].push(slot);
      });

      return Object.keys(slotsByDate)
        .sort()
        .map((key) => {
          const [yy, mm, dd] = key.split("-").map(Number);

          const asDate = new Date(Date.UTC(yy, mm - 1, dd));

          const shortDay = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            timeZone: "UTC",
          }).format(asDate);

          const dateStr = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }).format(asDate);

          const showtimes = slotsByDate[key].map((slot) => {
            const synDate = new Date(
  `${slot.date} ${slot.time} ${slot.ampm}`
);

const isExpired =
  synDate.getTime() < new Date().getTime();

return {
  time: `${slot.time} ${slot.ampm}`,
  datetime: synDate.toISOString(),
  audi: movie.auditorium || "Audi 1",
  bookedCount: slot.bookedSeats?.length || 0,
  expired: isExpired,
};
          });

          return {
            date: key,
            shortDay,
            dateStr,
            showtimes,
          };
        });
    }

    return [];
  }, [movie]);

  // TRAILER
  const openTrailer = (movieObj) => {
    const ytId = extractYouTubeId(
      movieObj?.trailerUrl ||
        movieObj?.trailer ||
        movieObj?.latestTrailer?.videoId ||
        ""
    );

    if (!ytId) {
      toast.info("Trailer not available for this movie.");
      return;
    }

    setSelectedMovie(movieObj);

    setSelectedTrailerId(ytId);

    setShowTrailer(true);
  };

  const closeTrailer = () => {
    setShowTrailer(false);

    setSelectedTrailerId(null);

    setSelectedMovie(null);
  };

  // SELECT TIME
  const handleTimeSelect = (datetime) => {
    setSelectedTime((prev) => (prev === datetime ? null : datetime));
  };

  // BOOK NOW
  const handleBookNow = () => {
    if (!selectedTime) {
      toast.error("Please select a showtime first.");

      return;
    }

    const movieRouteId = movie?.id || movie?._id;

    navigate(
      `/seat/${movieRouteId}/${encodeURIComponent(selectedTime)}`
    );
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading movie details...
      </div>
    );
  }

  // NOT FOUND
  if (!movie) {
    return (
      <div className={movieDetailHStyles.notFoundContainer}>
        <div className={movieDetailHStyles.notFoundContent}>
          <p className={movieDetailHStyles.notFoundTitle}>
            Movie not found.
          </p>

          <Link
            to="/movies"
            className={movieDetailHStyles.notFoundLink}
          >
            ← Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={movieDetailHStyles.pageContainer}>
<div className="fixed top-0 left-0 w-96 h-96 bg-red-600/10 blur-[150px] rounded-full pointer-events-none"></div>

<div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
      />

      <style>{movieDetailHStyles.customCSS}</style>

      {/* TRAILER MODAL */}
      {showTrailer && selectedTrailerId && (
        <div className={movieDetailHStyles.trailerModal}>
          <div
            className={movieDetailHStyles.trailerContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeTrailer}
              className={movieDetailHStyles.closeButton}
            >
              <X size={36} />
            </button>

            <div className={movieDetailHStyles.trailerIframe}>
              <iframe
                key={selectedTrailerId}
                width="100%"
                height="100%"
                src={getEmbedUrl(selectedTrailerId)}
                title="Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className={movieDetailHStyles.iframe}
              />
            </div>
          </div>
        </div>
      )}

      <div className={movieDetailHStyles.mainContainer}>

        {/* HEADER */}
        <div className={movieDetailHStyles.headerContainer}>
<button
  onClick={() => navigate("/movies")}
  className={movieDetailHStyles.backButton}
>
            <ArrowLeft size={18} />

            <span className={movieDetailHStyles.backButtonText}>
              Back
            </span>
          </button>
        </div>


{/* MAIN GRID */}
<div className={movieDetailHStyles.mainGrid}>

  {/* POSTER */}
  <div className={movieDetailHStyles.posterContainer}>
    <div className={movieDetailHStyles.posterCard}>

      {/* Movie Title */}
      <h2 className="text-4xl font-bold text-white text-center mb-5">
        {movie.title}
      </h2>

      {/* Poster */}
      <div
        className={`${movieDetailHStyles.posterImageContainer} relative`}
      >
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 z-10 bg-black/80 text-yellow-400 px-3 py-1 rounded-full font-semibold text-sm">
          ⭐ {movie.rating}/10
        </div>

        <img
          src={
            movie.image ||
            movie.img ||
            (movie.posterUrl
              ? `${getApiBaseUrl()}/${movie.posterUrl}`
              : "https://via.placeholder.com/320x480?text=No+Image")
          }
          alt={movie.title}
          className={`${movieDetailHStyles.posterImage} transition-all duration-300 hover:scale-[1.02]`}
        />
      </div>
<div className="text-center mt-4">
  <h3 className="text-xl font-bold text-white">
    {movie.title}
  </h3>

  <p className="text-gray-400 text-sm mt-1">
{Array.isArray(movie.category)
  ? movie.category.join(" • ")
  : movie.category}
  </p>
</div>
  
      {/* Movie Info */}
      <div className="flex justify-center gap-2 mt-4 flex-wrap">
        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
          ⭐ {movie.rating}/10
        </span>

        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
          ⏱ {movie.duration} Min
        </span>

 {(Array.isArray(movie.category)
  ? movie.category
  : [movie.category]
).slice(0, 2).map((cat, index) => (
          <span
            key={index}
            className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Trailer Button */}
      <button
        onClick={() => openTrailer(movie)}
        className={`${movieDetailHStyles.trailerButton} mt-5`}
      >
        <Play size={18} />
        <span>Watch Trailer</span>
      </button>

    </div>
  </div>

{/* SHOWTIMES */}
<div className={movieDetailHStyles.showtimesContainer}>
  <div
    className={`${movieDetailHStyles.showtimesCard} p-8`}
  >
    <h3 className="flex items-center gap-3 text-4xl font-bold text-red-300 mb-8">
      <Calendar size={34} />
      Showtimes
    </h3>

    {/* DAY SELECTOR */}
    <div className="flex flex-wrap gap-4 mb-8">
      {showtimeDays.map((day, index) => (
        <button
          key={day.date}
          onClick={() => {
            setSelectedDay(index);
            setSelectedTime(null);
          }}
          className={`
            px-6 py-4 rounded-2xl
            transition-all duration-300
            ${
              selectedDay === index
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105"
                : "bg-black/40 border border-white/10 text-gray-300 hover:border-red-500"
            }
          `}
        >
          <div className="font-bold text-lg">
            {day.shortDay}
          </div>

          <div className="text-sm">
            {day.dateStr}
          </div>
        </button>
      ))}
    </div>

    {/* SHOWTIME BUTTONS */}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {showtimeDays[selectedDay]?.showtimes?.map(
        (showtime, index) => (
<button
  key={index}
  disabled={showtime.expired}
  onClick={() =>
    !showtime.expired &&
    handleTimeSelect(showtime.datetime)
  }
  className={`
    px-8 py-4 rounded-xl font-semibold
    ${
      showtime.expired
        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
        : selectedTime === showtime.datetime
        ? "bg-red-600 text-white"
        : "bg-[#111827] text-white"
    }
  `}
>
  {showtime.expired ? (
    <div>
      <div>{showtime.time}</div>
      <div className="text-xs">
        Show Ended
      </div>
    </div>
  ) : (
    showtime.time
  )}
</button>
        )
      )}
    </div>

    {/* SELECTED SHOWTIME */}
{/* SELECTED SHOWTIME */}
{selectedTime && (
  <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-red-900/20 to-red-600/10 border border-red-500/20 text-center">

    <p className="text-red-300 font-semibold text-lg flex items-center justify-center gap-2">
      🎟 Selected Showtime
    </p>

    <p className="text-white text-2xl font-bold mt-3">
      {new Date(selectedTime).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </p>

  </div>
)}

    {/* BOOK BUTTON */}
    {selectedTime && (
      <div className="mt-6">
        <button
          onClick={handleBookNow}
          className="
            w-full
            bg-red-600
            hover:bg-red-700
            text-white
            font-bold
            py-4
            rounded-2xl
            transition-all
            duration-300
            shadow-lg
            shadow-red-600/20
          "
        >
          Proceed to Seat Selection
        </button>
      </div>
    )}
  </div>
</div>

</div>
      
{/* STORY */}
<div className="mt-10 rounded-3xl overflow-hidden border border-white/10 bg-[#0B1120]">

  <div className="bg-gradient-to-r from-red-600/20 to-transparent px-8 py-5 border-b border-white/10">
    <h2 className="text-3xl font-bold text-white">
       Story
    </h2>
  </div>

  <div className="p-8">
    <p className="text-gray-300 text-lg leading-9">
      {movie.description ||
        movie.story ||
        movie.synopsis ||
        "No story available."}
    </p>
  </div>

</div>

{/* Info */}
<div className={movieDetailHStyles.storyCard}>
  <h2 className="text-4xl text-center font-bold text-red-300 mb-8">
    Movie Information
  </h2>

  <div className="grid md:grid-cols-4 gap-4">

    <div className="bg-black/40 p-5 rounded-2xl text-center">
      <h3 className="text-red-400">Duration</h3>
      <p className="text-white text-xl font-bold">
        {movie.duration} Min
      </p>
    </div>

    <div className="bg-black/40 p-5 rounded-2xl text-center">
      <h3 className="text-red-400">Rating</h3>
      <p className="text-white text-xl font-bold">
        {movie.rating}/10
      </p>
    </div>

    <div className="bg-black/40 p-5 rounded-2xl text-center">
      <h3 className="text-red-400">Auditorium</h3>
      <p className="text-white text-xl font-bold">
        {movie.auditorium}
      </p>
    </div>

    <div className="bg-black/40 p-5 rounded-2xl text-center">
      <h3 className="text-red-400">Category</h3>
      <p className="text-white text-xl font-bold">
{Array.isArray(movie.category)
  ? movie.category.join(", ")
  : movie.category}
      </p>
    </div>

  </div>
</div>

{/* CAST */}
{movie.cast?.length > 0 && (
  <div className={movieDetailHStyles.storyCard}>
    <h2 className={movieDetailHStyles.storyTitle}>
      Cast
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {movie.cast.map((person, index) => (
        <div
          key={index}
          className="bg-black/40 border border-red-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300"
        >
          <img
            src={`${getApiBaseUrl()}/${person.avatarUrl}`}
            alt={person.name}
            className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-red-500 shadow-lg shadow-red-500/30"
          />

          <h4 className="text-white mt-2">
            {person.name}
          </h4>

          <p className="text-gray-400 text-sm">
            {person.role}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
{/* DIRECTORS */}
{movie.directors?.length > 0 && (
  <div className={movieDetailHStyles.storyCard}>
    <h2 className={movieDetailHStyles.storyTitle}>
      Directors
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {movie.directors.map((person, index) => (
        <div
          key={index}
          className="bg-black/40 border border-red-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300"
        >
          <img
            src={`${getApiBaseUrl()}/${person.avatarUrl}`}
            alt={person.name}
            className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-red-500 shadow-lg shadow-red-500/30"
          />

          <h4 className="text-white mt-2">
            {person.name}
          </h4>
        </div>
      ))}
    </div>
  </div>
)}
{/* PRODUCERS */}
{movie.producers?.length > 0 && (
  <div className={movieDetailHStyles.storyCard}>
    <h2 className={movieDetailHStyles.storyTitle}>
      Producers
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {movie.producers.map((person, index) => (
        <div
          key={index}
          className="bg-black/40 border border-red-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300"
        >
          <img
            src={`${getApiBaseUrl()}/${person.avatarUrl}`}
            alt={person.name}
            className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-red-500 shadow-lg shadow-red-500/30"
          />

          <h4 className="text-white mt-2">
            {person.name}
          </h4>
        </div>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  );
}
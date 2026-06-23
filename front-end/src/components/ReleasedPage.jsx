import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api, { getApiBaseUrl } from "../utils/api";
import { releasesStyles } from "../assets/dummyStyles";
import dummyMovies from "../assets/dummyrdata";

const ReleasedPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data } = await api.get("/movies");

const releaseSoonMovies = data
  .filter((m) => m.type === "releaseSoon")
  .map((m) => ({
    _id: m._id,
    title: m.title,
    category: Array.isArray(m.category)
      ? m.category.join(", ")
      : m.category,
    image: `${getApiBaseUrl()}/${m.posterUrl}`,
    releaseDate: m.releaseDate,
    isBackend: true,
  }));

setMovies([
  ...releaseSoonMovies,
  ...dummyMovies,
]);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-white mt-20">
        Loading...
      </div>
    );
  }

  return (
    <div className={releasesStyles.pageContainer}>
      <div className={releasesStyles.headerContainer}>
        <h1 className={releasesStyles.headerTitle}>
          RELEASES SOON
        </h1>

        <p className={releasesStyles.headerSubtitle}>
          Upcoming Movies
        </p>
      </div>

      <div className={releasesStyles.movieGrid}>
        {movies.map((movie) => (
          <Link
key={movie._id || movie.id}
to={`/movie/${movie._id || movie.id}`}
            className={releasesStyles.movieCard}
            style={{ textDecoration: "none" }}
          >
            <div className={releasesStyles.imageContainer}>
              <img
                src={movie.image}
                alt={movie.title}
                className={releasesStyles.movieImage}
              />
            </div>

            <div className={releasesStyles.movieInfo}>
              <h3 className={releasesStyles.movieTitle}>
                {movie.title}
              </h3>

              <p className={releasesStyles.movieCategory}>
                {Array.isArray(movie.category)
                  ? movie.category.join(", ")
                  : movie.category}
              </p>

              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#f87171",
                  marginTop: "4px",
                }}
              >
                {movie.releaseDate
                  ? new Date(
                      movie.releaseDate
                    ).toLocaleDateString("en-IN")
                  : "Coming Soon"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ReleasedPage;
import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Movie from "./pages/Movie";
import Release from "./pages/Release";
import Bookings from "./pages/Bookings";
import Contacts from "./pages/Contacts";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import SeatSelector from "./pages/SeatSelector";
import NetBankingPage from "./pages/NetBankingPage";

// ScrollToTop utility — from repo's App.jsx
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movie />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/seat/:id/:slot" element={<SeatSelector />} />
        <Route path="/releases" element={<Release />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/contact" element={<Contacts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
<Route
  path="/netbanking/:id/:slot"
  element={<NetBankingPage />}
/>       
      </Routes>
    </>
  );
};

export default App;

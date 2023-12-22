// import { useEffect } from "react";
import SearchPlayer from "./SearchPlayer";
import Home from "./Home";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PlayerStats from "./PlayerStats";
// import SideBar from "./SideBar";
import LiveGameStats from "./LiveGameStats";

const AnimatedRoutes = () => {
  const location = useLocation();
  // const navigate = useNavigate();
  const playerId = location.state ? location.state.playerId : null;

  //Redirect back to search UI
  // useEffect(() => {
  //   if (playerId === null) {
  //     navigate("/playerstats");
  //   }
  // }, [playerId, navigate]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route index element={<Home />} />
        <Route exact path="/playerstats" element={<SearchPlayer />} />
        <Route
          exact
          path="/playerstats/*"
          element={<PlayerStats playerId={playerId} />}
        />
        <Route exact path="/livegamestats" element={<LiveGameStats />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;

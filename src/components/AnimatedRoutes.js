// import { useEffect } from "react";
import SearchPlayer from "./SearchPlayer";
import Home from "./Home";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LiveGameStats from "./LiveGameStats";
import PastGameStats from "./PastGameStats";
import LineChart from "./LineChart";

const AnimatedRoutes = ({ openLinks }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route index element={<Home openLinks={openLinks} />} />
        <Route
          exact
          path="/playerstats"
          element={<SearchPlayer openLinks={openLinks} />}
        />
        <Route
          exact
          path="/livegamestats"
          element={<LiveGameStats openLinks={openLinks} />}
        />
        <Route
          exact
          path="/pastgamestats"
          element={<PastGameStats openLinks={openLinks} />}
        />
        <Route
          exact
          path="/test"
          element={<LineChart openLinks={openLinks} />}
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;

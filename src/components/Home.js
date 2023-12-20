import React from "react";
import Lottie from "lottie-react";
import animationData from "../assets/basketball-animation.json";
import { Link } from "react-router-dom";
import "./Home.css";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div>
        <Lottie animationData={animationData} className="lottie-animation" />
      </div>
      <div className="home-buttons">
        <Link className="btn btn-primary" to="/playerstats">
          Search for Player
        </Link>
        <Link className="btn btn-primary" to="/livegamestats">
          Live Games Stats
        </Link>
      </div>
    </motion.div>
  );
};

export default Home;

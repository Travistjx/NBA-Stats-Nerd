import React from "react";
import Lottie from "lottie-react";
import basketballAnimation from "../assets/basketball-animation.json";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import { motion } from "framer-motion";

const Home = ({ openLinks }) => {
  return (
    <motion.div
      className={openLinks ? styles["home-page-adjusted"] : styles["home-page"]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div>
        <Lottie
          animationData={basketballAnimation}
          className={styles["basketball-animation"]}
        />
      </div>
      <div className={styles["home-buttons"]}>
        <Link className="btn btn-primary" to="/compareplayers">
          Compare Players
        </Link>
        <Link className="btn btn-primary" to="/searchplayer">
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

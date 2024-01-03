import React, { useState, useEffect } from "react";
import styles from "./LiveGameStats.module.css";
import moment from "moment-timezone";
import axios from "axios";
import loadingAnimation from "../assets/loading-animation.json";
import Lottie from "lottie-react";
import { motion } from "framer-motion";

const LiveGameStats = ({ openLinks }) => {
  const [liveGameData, setLiveGameData] = useState(null);
  const [isloading, setIsLoading] = useState(true);

  // Takes place every 15 seconds, call API to retrieve games for that day, live or not
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Convert to US timezone
      const convertedDate = moment().tz("US/Pacific").format("YYYY-MM-DD");

      const fetchDate = async () => {
        try {
          const liveGameAPI = `https://www.balldontlie.io/api/v1/games?start_date=${convertedDate}&end_date=${convertedDate}`;
          const response = await axios.get(liveGameAPI, { timeout: 10000 });

          setLiveGameData(response.data);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching live game data:", error);
        }
      };

      fetchDate();
    }, 15000);

    //clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return /* Loading Animation */ isloading ? (
    <Lottie
      animationData={loadingAnimation}
      className={styles["loading-animation"]}
    />
  ) : (
    // When loaded, display live data if it's present
    liveGameData && (
      /* Fade in / Out when entering or leaving page */
      <motion.div
        className={
          openLinks
            ? styles["live-game-stats-container-adjusted"]
            : styles["live-game-stats-container"]
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div>
          <h1>Games Today</h1>
        </div>
        <div>
          {/* Live scoreboards of games today */}
          <div className={styles["scoreboard-container"]}>
            {liveGameData.data.map((gameStat, index) => (
              <div className="scoreboard card" key={index}>
                <div className={styles["game-status"]}>
                  {gameStat.period === 0
                    ? "Not Started"
                    : gameStat.period === 1
                    ? "1st Quarter"
                    : gameStat.period === 2
                    ? "2nd Quarter"
                    : gameStat.period === 3
                    ? "3rd Quarter"
                    : "4th Quarter / Finished"}
                </div>
                <div className={styles["scoreboard-stats"]}>
                  <div className={styles["home-team-stats"]}>
                    <span>{gameStat.home_team.full_name}</span>
                    <span>{gameStat.home_team_score || 0}</span>
                  </div>
                  <div className={styles["visitor-team-stats"]}>
                    <span>{gameStat.visitor_team.full_name}</span>
                    <span>{gameStat.visitor_team_score || 0} </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  );
};

export default LiveGameStats;

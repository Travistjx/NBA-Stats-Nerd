import React, { useState, useEffect } from "react";
import "./LiveGameStats.css";
import moment from "moment-timezone";
import axios from "axios";
import loadingAnimation from "../assets/loading-animation.json";
import Lottie from "lottie-react";
import { motion } from "framer-motion";

const LiveGameStats = () => {
  const [liveGameData, setLiveGameData] = useState(null);
  const [isloading, setIsLoading] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const convertedDate = moment().tz("US/Pacific").format("YYYY-MM-DD");

      const fetchDate = async () => {
        try {
          const liveGameAPI = `https://www.balldontlie.io/api/v1/games?start_date=${convertedDate}&end_date=${convertedDate}`;
          const response = await axios.get(liveGameAPI);

          console.log(response.data);
          setLiveGameData(response.data);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching live game data:", error);
        }
      };

      fetchDate();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return isloading ? (
    <Lottie animationData={loadingAnimation} className="loading-animation" />
  ) : (
    liveGameData && (
      <motion.div
        className="live-game-stats-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div>
          <h1>Games Today</h1>
        </div>
        <div>
          <div className="scoreboard-container">
            {liveGameData.data.map((gameStat, index) => (
              <div className="scoreboard card" key={index}>
                <div className="game-status">
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
                <div className="scoreboard-stats">
                  <div className="home-team-stats">
                    <span>{gameStat.home_team.full_name}</span>{" "}
                    <span>{gameStat.home_team_score || 0}</span>
                  </div>
                  <div className="visitor-team-stats">
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

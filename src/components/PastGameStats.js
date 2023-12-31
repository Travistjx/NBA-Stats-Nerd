import React, { useState } from "react";
import styles from "./PastGameStats.module.css";
import axios from "axios";
import { motion } from "framer-motion";

const PastGameStats = ({ openLinks }) => {
  const [gamesDate, setGamesDate] = useState(null);
  const [convertedDate, setConvertedDate] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [buttonIsClicked, setbuttonIsClicked] = useState(false);
  const [gamesData, setGamesData] = useState(null);

  //When date info is submitted, fetch API and get game information based on date
  const handleSubmit = (e) => {
    e.preventDefault();

    setIsPending(true);
    const convertedDate = new Date(gamesDate).toISOString().split("T")[0];
    setConvertedDate(convertedDate);

    const fetchData = async () => {
      try {
        const pastGameAPI = `https://www.balldontlie.io/api/v1/games?start_date=${convertedDate}&end_date=${convertedDate}`;
        const response = await axios.get(pastGameAPI, { timeout: 10000 });
        console.log(response.data);

        setGamesData(response.data);
        setIsPending(false);
        setbuttonIsClicked(true);
      } catch (error) {
        console.error("Error fetching player data:", error);
        setIsPending(false);
      }
    };

    fetchData();
  };

  return (
    //Fade in/out when entering or leaving page
    <motion.div
      className={
        openLinks
          ? styles["past-game-stats-container-adjusted"]
          : styles["past-game-stats-container"]
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Move the form up and down depending if button is clicked */}
      <div
        className={
          buttonIsClicked
            ? styles["games-search-container-top"]
            : styles["games-search-container"]
        }
      >
        {/* Form to submit game date */}
        <form onSubmit={handleSubmit} className={styles["games-search-form"]}>
          <div className="row">
            <div className="col-8">
              <input
                type="date"
                className="form-control"
                value={gamesDate}
                onChange={(e) => setGamesDate(e.target.value)}
                required
              />
            </div>
            <div className="col-4">
              <button className="btn btn-secondary">
                {!isPending ? "Search" : "Searching..."}
              </button>
            </div>
          </div>
        </form>
      </div>

      {gamesData && (
        // Fade in when games are found
        <div className={`${styles["games-found"]} fade-in`}>
          <div>
            <h1>Games on {convertedDate}</h1>
          </div>

          {/* Games found  */}
          <div>
            <div className={styles["scoreboard-container"]}>
              {gamesData.data.map((gameStat, index) => (
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
        </div>
      )}
    </motion.div>
  );
};

export default PastGameStats;

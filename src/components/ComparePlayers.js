import React, { useState } from "react";
import styles from "./ComparePlayers.module.css";
import LineChart from "./LineChart";
import ComparePlayerStats from "./ComparePlayerStats";
import { motion } from "framer-motion";

const ComparePlayers = ({ openLinks }) => {
  const [firstPlayerProfile, setFirstPlayerProfile] = useState(null);
  const [secondPlayerProfile, setSecondPlayerProfile] = useState(null);
  const [firstPlayerSeasonAverage, setFirstPlayerSeasonAverage] =
    useState(null);
  const [secondPlayerSeasonAverage, setSecondPlayerSeasonAverage] =
    useState(null);
  const [firstPlayerGameStats, setFirstPlayerGameStats] = useState(null);
  const [secondPlayerGameStats, setSecondPlayerGameStats] = useState(null);

  /* Render/Display template for each game stat (last 10 game averages) */
  const renderGameStats = (gameStats, label, statsType) => (
    <div className={styles["player-last-ten-games-stat"]}>
      <b>{label}</b>
      <br />
      <span className={styles["player-last-ten-games-stat-number"]}>
        {label === "FT%" || label === "FG%" || label === "3PT%"
          ? (
              gameStats?.data?.data
                .slice(-10)
                .reduce(
                  (total, currentValue) =>
                    (total = total + currentValue[statsType] * 100),
                  0
                ) / 10
            ).toFixed(2)
          : gameStats?.data?.data
              .slice(-10)
              .reduce(
                (total, currentValue) =>
                  (total = total + currentValue[statsType]),
                0
              ) / 10}
      </span>
    </div>
  );

  /* Render/Display all game stats (last 10 game averages)*/
  const renderLastTenGameStats = (gameStats, player) => (
    <div className="last-ten-games-stats-comparison">
      <div className={styles["player-last-ten-games-stats"]}>
        <div
          className={styles["player-last-ten-games-stat"]}
          style={{ width: "20%" }}
        >
          <span style={{ fontSize: "18px" }}>
            {`${player.first_name} ${player.last_name}`}
          </span>
          <br />
          {`(${gameStats?.data?.data.slice(-10).length} Games)`}
        </div>
        {renderGameStats(gameStats, "PTS", "pts")}
        {renderGameStats(gameStats, "REB", "reb")}
        {renderGameStats(gameStats, "AST", "ast")}
        {renderGameStats(gameStats, "BLK", "blk")}
        {renderGameStats(gameStats, "STL", "stl")}
        {renderGameStats(gameStats, "FG%", "fg_pct")}
        {renderGameStats(gameStats, "3PT%", "fg3_pct")}
        {renderGameStats(gameStats, "FT%", "ft_pct")}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className={
          openLinks === true
            ? styles["compare-players-page-adjusted"]
            : styles["compare-players-page"]
        }
      >
        <div class={styles["compare-players-header"]}>
          Player Comparison (Current Season)
        </div>
        <div className={styles["compare-players-boxes"]}>
          {/* First Player Stats*/}
          <ComparePlayerStats
            firstPlayerProfile={firstPlayerProfile}
            setFirstPlayerProfile={setFirstPlayerProfile}
            firstPlayerSeasonAverage={firstPlayerSeasonAverage}
            setFirstPlayerSeasonAverage={setFirstPlayerSeasonAverage}
            firstPlayerGameStats={firstPlayerGameStats}
            setFirstPlayerGameStats={setFirstPlayerGameStats}
            secondPlayerSeasonAverage={secondPlayerSeasonAverage}
            secondPlayerGameStats={secondPlayerGameStats}
          />

          {/* Second Player Stats*/}
          <ComparePlayerStats
            firstPlayerProfile={secondPlayerProfile}
            setFirstPlayerProfile={setSecondPlayerProfile}
            firstPlayerSeasonAverage={secondPlayerSeasonAverage}
            setFirstPlayerSeasonAverage={setSecondPlayerSeasonAverage}
            firstPlayerGameStats={secondPlayerGameStats}
            setFirstPlayerGameStats={setSecondPlayerGameStats}
            secondPlayerSeasonAverage={firstPlayerSeasonAverage}
            secondPlayerGameStats={firstPlayerGameStats}
          />
        </div>

        {/* Last 10 Games Averages */}
        <h3>Last 10 Games Averages </h3>
        <hr />
        {!firstPlayerGameStats && !secondPlayerGameStats && (
          <div>
            <span>No player data found.</span>
          </div>
        )}
        {firstPlayerGameStats && (
          <div>
            {renderLastTenGameStats(firstPlayerGameStats, firstPlayerProfile)}
          </div>
        )}
        {secondPlayerGameStats && (
          <div>
            {renderLastTenGameStats(secondPlayerGameStats, secondPlayerProfile)}
          </div>
        )}

        {/* Comparison graph based on chosen first and second player */}
        <div className={styles["comparison-graph"]}>
          <h3>Graph comparison (Last 10 Games)</h3>
          <hr />
          <LineChart
            firstPlayerName={`${firstPlayerProfile?.first_name} ${firstPlayerProfile?.last_name}`}
            secondPlayerName={`${secondPlayerProfile?.first_name} ${secondPlayerProfile?.last_name}`}
            firstPlayerGameStats={firstPlayerGameStats}
            secondPlayerGameStats={secondPlayerGameStats}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ComparePlayers;

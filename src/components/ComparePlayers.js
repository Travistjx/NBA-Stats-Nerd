import React, { useState, useEffect } from "react";
import styles from "./ComparePlayers.module.css";
import LineChart from "./LineChart";
import GetSecondPlayerStats from "./GetSecondPlayerStats";
import GetFirstPlayerStats from "./GetFirstPlayerStats";

const ComparePlayers = ({ openLinks }) => {
  const [firstPlayerName, setFirstPlayerName] = useState(null);
  const [secondPlayerName, setSecondPlayerName] = useState(null);
  const [firstPlayerSeasonAverage, setFirstPlayerSeasonAverage] =
    useState(null);
  const [secondPlayerSeasonAverage, setSecondPlayerSeasonAverage] =
    useState(null);
  const [firstPlayerGameStats, setFirstPlayerGameStats] = useState(null);
  const [secondPlayerGameStats, setSecondPlayerGameStats] = useState(null);

  const renderLastTenGameStats = (gameStats, playerName) => (
    <div className="last-ten-games-stats-comparison">
      <div className="player-last-ten-games-stats">
        <div className="player-last-ten-games-stat" style={{ width: "20%" }}>
          <span style={{ fontSize: "18px" }}>
            <b>{playerName}</b>
          </span>
          <br />
          {`(${gameStats?.data?.data.slice(-10).length} Games)`}
        </div>
        <div className="player-last-ten-games-stat">
          <b>PTS</b>
          <br />
          <span className="player-last-ten-games-stat-number">
            {gameStats?.data?.data
              .slice(-10)
              .reduce(
                (total, currentValue) => (total = total + currentValue.pts),
                0
              ) / 10}
          </span>
        </div>
        <div className="player-last-ten-games-stat">
          <b>REB</b>
          <br />
          <span className="player-last-ten-games-stat-number">
            {gameStats?.data?.data
              .slice(-10)
              .reduce(
                (total, currentValue) => (total = total + currentValue.reb),
                0
              ) / 10}
          </span>
        </div>
        <div className="player-last-ten-games-stat">
          <b>AST</b>
          <br />
          <span className="player-last-ten-games-stat-number">
            {gameStats?.data?.data
              .slice(-10)
              .reduce(
                (total, currentValue) => (total = total + currentValue.ast),
                0
              ) / 10}
          </span>
        </div>
        <div className="player-last-ten-games-stat">
          <b>BLK</b>
          <br />
          <span className="player-last-ten-games-stat-number">
            {gameStats?.data?.data
              .slice(-10)
              .reduce(
                (total, currentValue) => (total = total + currentValue.blk),
                0
              ) / 10}
          </span>
        </div>
        <div className="player-last-ten-games-stat">
          <b>STL</b>
          <br />
          <span className="player-last-ten-games-stat-number">
            {gameStats?.data?.data
              .slice(-10)
              .reduce(
                (total, currentValue) => (total = total + currentValue.stl),
                0
              ) / 10}
          </span>
        </div>
        <div className="player-last-ten-games-stat">
          <b>FG%</b>
          <br />
          <span className="player-last-ten-games-stat-number">
            {(
              gameStats?.data?.data
                .slice(-10)
                .reduce(
                  (total, currentValue) =>
                    (total = total + currentValue.fg_pct * 100),
                  0
                ) / 10
            ).toFixed(2)}
          </span>
        </div>
        <div className="player-last-ten-games-stat">
          <b>3P%</b>
          <br />
          <span className="player-last-ten-games-stat-number">
            {(
              gameStats?.data?.data
                .slice(-10)
                .reduce(
                  (total, currentValue) =>
                    (total = total + currentValue.fg3_pct * 100),
                  0
                ) / 10
            ).toFixed(2)}
          </span>
        </div>
        <div className="player-last-ten-games-stat">
          <b>FT%</b>
          <br />
          <span className="player-last-ten-games-stat-number">
            {(
              gameStats?.data?.data
                .slice(-10)
                .reduce(
                  (total, currentValue) =>
                    (total = total + currentValue.ft_pct * 100),
                  0
                ) / 10
            ).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles["compare-players-page"]}>
      <div class="compare-players-header">
        Player Comparison (Current Season)
      </div>
      <div className={styles["compare-players-boxes"]}>
        {/* First Player */}
        <GetFirstPlayerStats
          firstPlayerName={firstPlayerName}
          setFirstPlayerName={setFirstPlayerName}
          firstPlayerSeasonAverage={firstPlayerSeasonAverage}
          setFirstPlayerSeasonAverage={setFirstPlayerSeasonAverage}
          firstPlayerGameStats={firstPlayerGameStats}
          setFirstPlayerGameStats={setFirstPlayerGameStats}
          secondPlayerSeasonAverage={secondPlayerSeasonAverage}
          secondPlayerGameStats={secondPlayerGameStats}
        />
        <GetSecondPlayerStats
          secondPlayerName={secondPlayerName}
          setSecondPlayerName={setSecondPlayerName}
          secondPlayerSeasonAverage={secondPlayerSeasonAverage}
          setSecondPlayerSeasonAverage={setSecondPlayerSeasonAverage}
          secondPlayerGameStats={secondPlayerGameStats}
          setSecondPlayerGameStats={setSecondPlayerGameStats}
          firstPlayerSeasonAverage={firstPlayerSeasonAverage}
          firstPlayerGameStats={firstPlayerGameStats}
        />

        {/* Second Player */}
      </div>
      <h3>Last 10 Games Averages </h3>
      <hr />
      {!firstPlayerGameStats && !secondPlayerGameStats && (
        <div>
          <span>No player data found.</span>
        </div>
      )}
      {firstPlayerGameStats && (
        <div>
          {renderLastTenGameStats(firstPlayerGameStats, firstPlayerName)}
        </div>
      )}
      {secondPlayerGameStats && (
        <div>
          {renderLastTenGameStats(secondPlayerGameStats, secondPlayerName)}
        </div>
      )}

      {/* Comparison graph based on chosen first and second player */}
      <div className="comparison-graph">
        <h3>Graph comparison (Last 10 Games)</h3>
        <hr />
        <LineChart
          firstPlayerName={firstPlayerName}
          secondPlayerName={secondPlayerName}
          firstPlayerGameStats={firstPlayerGameStats}
          secondPlayerGameStats={secondPlayerGameStats}
        />
      </div>
    </div>
  );
};

export default ComparePlayers;

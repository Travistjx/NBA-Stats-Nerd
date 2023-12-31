import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJs } from "chart.js/auto";
import styles from "./LineChart.module.css";

const LineChart = ({
  firstPlayerName,
  secondPlayerName,
  firstPlayerGameStats,
  secondPlayerGameStats,
}) => {
  const [playerChartData, setPlayerChartData] = useState(null);
  const [graphOption, setGraphOption] = useState("pts");

  const changeGraphOption = (graphOption, label) => {
    setGraphOption(graphOption);
    if (firstPlayerGameStats || secondPlayerGameStats) {
      if (label === "FG%" || label === "3PT%" || label === "FT%") {
        setPlayerChartData({
          labels: ["Oldest", 2, 3, 4, 5, 6, 7, 8, 9, "Most Recent"],
          datasets: [
            {
              label: label + ` (${firstPlayerName})`,
              borderColor: "#fa617a",
              backgroundColor: "#fa617a",
              data: firstPlayerGameStats?.data?.data
                .slice(-10)
                .map((data) => (data[graphOption] * 100).toFixed(2)),
            },
            {
              label: label + ` (${secondPlayerName})`,
              borderColor: "#4682B4",
              backgroundColor: "#4682B4",
              data: secondPlayerGameStats?.data.data
                .slice(-10)
                .map((data) => (data[graphOption] * 100).toFixed(2)),
            },
          ],
        });
      } else {
        setPlayerChartData({
          labels: ["Oldest", 2, 3, 4, 5, 6, 7, 8, 9, "Most Recent"],
          datasets: [
            {
              label: label + ` (${firstPlayerName})`,
              borderColor: "#fa617a",
              backgroundColor: "#fa617a",
              data: firstPlayerGameStats?.data?.data
                .slice(-10)
                .map((data) => data[graphOption]),
            },
            {
              label: label + ` (${secondPlayerName})`,
              borderColor: "#4682B4",
              backgroundColor: "#4682B4",
              data: secondPlayerGameStats?.data.data
                .slice(-10)
                .map((data) => data[graphOption]),
            },
          ],
        });
      }
    }
  };

  useEffect(() => {
    if (firstPlayerGameStats || secondPlayerGameStats) {
      setPlayerChartData({
        labels: ["Oldest", 2, 3, 4, 5, 6, 7, 8, 9, "Most Recent"],
        datasets: [
          {
            label: `Points (${firstPlayerName})`,
            borderColor: "#fa617a",
            backgroundColor: "#fa617a",
            data: firstPlayerGameStats?.data?.data
              .slice(-10)
              .map((data) => data.pts),
          },
          {
            label: `Points (${secondPlayerName})`,
            borderColor: "#4682B4",
            backgroundColor: "#4682B4",
            data: secondPlayerGameStats?.data?.data
              .slice(-10)
              .map((data) => data.pts),
          },
        ],
      });
    }
  }, [
    firstPlayerGameStats,
    secondPlayerGameStats,
    firstPlayerName,
    secondPlayerName,
  ]);

  return (
    <div>
      {playerChartData ? (
        <div>
          <div className="toggle-graph-options">
            <button
              className={`${
                graphOption === "pts" ? styles["btn-selected"] : ""
              } ${styles["graph-option-button"]}`}
              onClick={() => changeGraphOption("pts", "Points")}
            >
              Points
            </button>
            <button
              className={`${
                graphOption === "reb" ? styles["btn-selected"] : ""
              } ${styles["graph-option-button"]}`}
              onClick={() => changeGraphOption("reb", "Rebounds")}
            >
              Rebounds
            </button>
            <button
              className={`${
                graphOption === "ast" ? styles["btn-selected"] : ""
              } ${styles["graph-option-button"]}`}
              onClick={() => changeGraphOption("ast", "Assists")}
            >
              Assists
            </button>
            <button
              className={`${
                graphOption === "blk" ? styles["btn-selected"] : ""
              } ${styles["graph-option-button"]}`}
              onClick={() => changeGraphOption("blk", "Blocks")}
            >
              Blocks
            </button>
            <button
              className={`${
                graphOption === "stl" ? styles["btn-selected"] : ""
              } ${styles["graph-option-button"]}`}
              onClick={() => changeGraphOption("stl", "Steals")}
            >
              Steals
            </button>
            <button
              className={` ${
                graphOption === "fg_pct" ? styles["btn-selected"] : ""
              } ${styles["graph-option-button"]}`}
              onClick={() => changeGraphOption("fg_pct", "FG%")}
            >
              Field Goal %
            </button>
            <button
              className={`${
                graphOption === "fg3_pct" ? styles["btn-selected"] : ""
              } ${styles["graph-option-button"]}`}
              onClick={() => changeGraphOption("fg3_pct", "3PT%")}
            >
              3-Pointer %
            </button>
            <button
              className={`${
                graphOption === "ft_pct" ? styles["btn-selected"] : ""
              } ${styles["graph-option-button"]}`}
              onClick={() => changeGraphOption("ft_pct", "FT%")}
            >
              Free Throw %
            </button>
          </div>
          <Line data={playerChartData} className={styles["line-graph"]} />
        </div>
      ) : (
        <span>No player data found.</span>
      )}
    </div>
  );
};

export default LineChart;

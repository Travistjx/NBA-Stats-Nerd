import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { UserData } from "./UserData.js";
import { Chart as ChartJs } from "chart.js/auto";
import axios from "axios";
import "./LineChart.css";

const LineChart = ({ openLinks }) => {
  const [allFirstPlayersFound, setallFirstPlayersFound] = useState(null);
  const [allSecondPlayersFound, setallSecondPlayersFound] = useState(null);
  const [firstPlayerName, setFirstPlayerName] = useState(null);
  const [secondPlayerName, setSecondPlayerName] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [seasonAverage, setSeasonAverage] = useState(null);
  const [gameStats, setGameStats] = useState(null);
  const [playerIsChosen, setPlayerIsChosen] = useState(false);

  const [userData, setUserData] = useState({
    labels: UserData.map((data) => data.year),
    datasets: [
      {
        label: "Users Gained",
        data: UserData.map((data) => data.userGain),
      },
    ],
  });

  const getPlayerStats = (chosenPlayer) => {
    const fetchPlayerStats = async () => {
      const seasonAverageAPI = `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${chosenPlayer.id}`;
      const gameStatsAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}`;

      const [seasonAverageData, gameStatsData] = await Promise.all([
        axios.get(seasonAverageAPI),
        axios.get(gameStatsAPI),
      ]);

      setSeasonAverage(seasonAverageData.data);
      setGameStats(gameStatsData.data);
    };

    fetchPlayerStats();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPending(true);
    setPlayerIsChosen(false);

    let formattedPlayerName = firstPlayerName.trim().replace(/\s+/g, "+");

    const fetchPlayerProfile = async () => {
      const playerProfileAPI = `https://www.balldontlie.io/api/v1/players?search=${formattedPlayerName}`;
      const response = await axios.get(playerProfileAPI);
      console.log(response.data.data);
      setallFirstPlayersFound(response.data.data);
      setIsPending(false);
    };

    fetchPlayerProfile();
  };

  useEffect(() => {
    const fetchData = async () => {
      const gameStatsAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${145}&page=${22}`;
      const response = await axios.get(gameStatsAPI);
      //console.log(response.data.data[3].pts);

      setUserData({
        labels: response.data.data.map((data, index) => index),
        datasets: [
          {
            label: "Points scored",
            data: response.data.data.map((data) => data.pts),
          },
        ],
      });
    };

    //fetchData();
  }, []);
  //<Line data={userData} />
  return (
    <div className="compare-players-page">
      <div className="compare-players-boxes">
        <div className="compare-players-box">
          <form onSubmit={handleSubmit} className="first-player-form">
            <input
              type="text"
              placeholder="Player's Name"
              onChange={(e) => setFirstPlayerName(e.target.value)}
              required
            />
            <button className="btn btn-secondary">
              {!isPending ? "Search" : "Searching..."}
            </button>
          </form>
          {seasonAverage && playerIsChosen && (
            <div className="first-player-stats-summary">
              <b>Current Season Averages ({seasonAverage.data[0]?.season})</b>
              <br />
              <span>Name: {firstPlayerName}</span>
              <br />
              <span>
                Games Played: {seasonAverage.data[0]?.games_played || 0}
              </span>
              <br />
              <span>Mins: {seasonAverage.data[0]?.min || 0}</span>
              <br />
              <span>PPG: {seasonAverage.data[0]?.pts || 0}</span>
              <br />
              <span>REB: {seasonAverage.data[0]?.reb || 0}</span>
              <br />
              <span>AST: {seasonAverage.data[0]?.ast || 0}</span>
              <br />
              <span>BLK {seasonAverage.data[0]?.blk || 0}</span>
              <br />
              <span>STL {seasonAverage.data[0]?.stl || 0}</span>
              <br />
              <span>TOV {seasonAverage.data[0]?.turnover || 0}</span>
              <br />
              <span>
                FG%{" "}
                {seasonAverage.data[0]?.fg_pct
                  ? (seasonAverage?.data[0]?.fg_pct * 100).toFixed(1)
                  : 0}
              </span>
              <br />
              <span>
                3P%{" "}
                {seasonAverage.data[0]?.fg3_pct
                  ? (seasonAverage.data[0]?.fg3_pct * 100).toFixed(1)
                  : 0}
              </span>
              <br />
              <span>
                FT%{" "}
                {seasonAverage.data[0]?.ft_pct
                  ? (seasonAverage.data[0]?.ft_pct * 100).toFixed(1)
                  : 0}
              </span>
              <br />
            </div>
          )}
          <div className="first-player-search-results">
            {allFirstPlayersFound &&
              !playerIsChosen &&
              allFirstPlayersFound?.map((player) => (
                <div
                  className="search-result-box"
                  key={player.id}
                  onClick={() => {
                    getPlayerStats(player);
                    setPlayerIsChosen(true);
                    setFirstPlayerName(
                      `${player.first_name} ${player.last_name}`
                    );
                  }}
                >
                  {`${player.first_name} ${player.last_name}`}
                  <br />
                  {`Team: ${player.team.full_name}`}
                </div>
              ))}
          </div>
        </div>
        <div className="compare-players-box">
          <form onSubmit={handleSubmit} className="second-player-form">
            <input
              type="text"
              placeholder="Player's Name"
              onChange={(e) => setSecondPlayerName(e.target.value)}
              required
            />
            <button className="btn btn-secondary">
              {!isPending ? "Search" : "Searching..."}
            </button>
          </form>
          <div className="second-player-search-results">
            {allSecondPlayersFound &&
              !playerIsChosen &&
              allSecondPlayersFound?.map((player) => (
                <div
                  className="search-result-box"
                  key={player.id}
                  onClick={() => {
                    getPlayerStats(player);
                    setPlayerIsChosen(true);
                    setFirstPlayerName(
                      `${player.first_name} ${player.last_name}`
                    );
                  }}
                >
                  {`${player.first_name} ${player.last_name}`}
                  <br />
                  {`Team: ${player.team.full_name}`}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineChart;

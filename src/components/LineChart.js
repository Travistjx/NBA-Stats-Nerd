import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { UserData } from "./UserData.js";
import { Chart as ChartJs } from "chart.js/auto";
import axios from "axios";
import "./LineChart.css";
import playerPhoto from "../assets/player-photos.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/fontawesome-free-solid";

const LineChart = ({ openLinks }) => {
  const [allFirstPlayersFound, setAllFirstPlayersFound] = useState(null);
  const [allSecondPlayersFound, setAllSecondPlayersFound] = useState(null);
  const [firstPlayerName, setFirstPlayerName] = useState(null);
  const [secondPlayerName, setSecondPlayerName] = useState(null);
  const [firstFormIsPending, setFirstFormIsPending] = useState(false);
  const [secondFormIsPending, setSecondFormIsPending] = useState(false);
  const [firstPlayerSeasonAverage, setFirstPlayerSeasonAverage] =
    useState(null);
  const [secondPlayerSeasonAverage, setSecondPlayerSeasonAverage] =
    useState(null);
  const [firstPlayerGameStats, setFirstPlayerGameStats] = useState(null);
  const [secondPlayerGameStats, setSecondPlayerGameStats] = useState(null);
  const [firstPlayerIsChosen, setFirstPlayerIsChosen] = useState(false);
  const [secondPlayerIsChosen, setSecondPlayerIsChosen] = useState(false);
  const [firstPlayerPhoto, setFirstPlayerPhoto] = useState(null);
  const [secondPlayerPhoto, setSecondPlayerPhoto] = useState(null);
  const [firstSearchItem, setFirstSearchItem] = useState(null);
  const [secondSearchItem, setSecondSearchItem] = useState(null);

  const [userData, setUserData] = useState({
    labels: UserData.map((data) => data.year),
    datasets: [
      {
        label: "Users Gained",
        data: UserData.map((data) => data.userGain),
      },
    ],
  });

  const compareAndColor = (value1, value2) => {
    if (value1 < value2) {
      return "red";
    } else if (value1 > value2) {
      return "green";
    } else {
      return "grey";
    }
  };

  const renderStat = (label, mainValue, otherValue, color) => (
    <span style={{ color }}>
      {label}: {mainValue}{" "}
      {color === "green"
        ? `(${label === "TOV" ? "-" : "+"}${(mainValue - otherValue).toFixed(
            2
          )})`
        : color === "red"
        ? `(${label === "TOV" ? "+" : "-"}${Math.abs(
            otherValue - mainValue
          ).toFixed(2)})`
        : ""}
    </span>
  );

  //Function to get corresponding image link based on player name (using imported json file)
  const getPlayerPhoto = (playerName) => {
    console.log(playerName);
    let formattedNameArray = playerName.split(" ");
    const lastName = formattedNameArray[1].slice(0, 5);
    const charactersNeededFromFirstName = 7 - lastName.length;
    const firstName = formattedNameArray[0].slice(
      0,
      charactersNeededFromFirstName
    );
    const formattedName = lastName.toLowerCase() + firstName.toLowerCase();

    const playerPhotoFound = Object.keys(playerPhoto).find((key) =>
      key.includes(formattedName)
    );
    console.log(playerPhotoFound);
    return playerPhoto ? playerPhoto[playerPhotoFound] : "N/A";
  };

  // Set chosen first player's season average, game stats, and photo
  const getFirstPlayerStats = (chosenPlayer) => {
    const fetchPlayerStats = async () => {
      const seasonAverageAPI = `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${chosenPlayer.id}`;
      const gameStatsAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}`;

      const [seasonAverageData, gameStatsData] = await Promise.all([
        axios.get(seasonAverageAPI),
        axios.get(gameStatsAPI),
      ]);

      setFirstPlayerSeasonAverage(seasonAverageData.data);
      setFirstPlayerGameStats(gameStatsData.data);
      console.log(chosenPlayer.firstName);
      setFirstPlayerPhoto(
        getPlayerPhoto(`${chosenPlayer.first_name} ${chosenPlayer.last_name}`)
      );
    };

    fetchPlayerStats();
  };

  // Set chosen second player's season average, game stats, and photo
  const getSecondPlayerStats = (chosenPlayer) => {
    const fetchPlayerStats = async () => {
      const seasonAverageAPI = `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${chosenPlayer.id}`;
      const gameStatsAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}`;

      const [seasonAverageData, gameStatsData] = await Promise.all([
        axios.get(seasonAverageAPI),
        axios.get(gameStatsAPI),
      ]);

      setSecondPlayerSeasonAverage(seasonAverageData.data);
      setSecondPlayerGameStats(gameStatsData.data);
      setSecondPlayerPhoto(
        getPlayerPhoto(`${chosenPlayer.first_name} ${chosenPlayer.last_name}`)
      );
    };

    fetchPlayerStats();
  };

  const handleSubmitFirstPlayer = (e) => {
    e.preventDefault();
    setFirstFormIsPending(true);
    setFirstPlayerIsChosen(false);

    let formattedPlayerName = firstSearchItem.trim().replace(/\s+/g, "+");

    const fetchPlayerProfile = async () => {
      const playerProfileAPI = `https://www.balldontlie.io/api/v1/players?search=${formattedPlayerName}`;
      const response = await axios.get(playerProfileAPI);
      console.log(response.data.data);
      setAllFirstPlayersFound(response.data.data);
      setFirstFormIsPending(false);
    };

    fetchPlayerProfile();
  };

  const handleSubmitSecondPlayer = (e) => {
    e.preventDefault();
    setSecondFormIsPending(true);
    setSecondPlayerIsChosen(false);

    let formattedPlayerName = secondSearchItem.trim().replace(/\s+/g, "+");

    const fetchPlayerProfile = async () => {
      const playerProfileAPI = `https://www.balldontlie.io/api/v1/players?search=${formattedPlayerName}`;
      const response = await axios.get(playerProfileAPI);
      console.log(response.data.data);
      setAllSecondPlayersFound(response.data.data);
      setSecondFormIsPending(false);
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
      <div class="compare-players-header">Player Comparison</div>
      <div className="compare-players-boxes">
        {/* First Player */}
        <div className="compare-players-box">
          {/* First Player (Search Form) */}
          <form
            onSubmit={handleSubmitFirstPlayer}
            className="first-player-form"
          >
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faSearch} />
              <input
                className="input"
                type="text"
                placeholder="Player's Name"
                onChange={(e) => setFirstSearchItem(e.target.value)}
                required
              />
            </div>
          </form>
          {/* First Player (Season Average) */}
          {firstPlayerSeasonAverage && firstPlayerIsChosen && (
            <div className="first-player-stats-summary">
              <img src={firstPlayerPhoto}></img>
              <br />
              <br />
              <b>
                Season Averages ({firstPlayerSeasonAverage.data[0]?.season})
              </b>
              <br />
              <span>Name: {firstPlayerName}</span>
              <br />
              <span>
                Games Played:{" "}
                {firstPlayerSeasonAverage.data[0]?.games_played || 0}
              </span>
              <br />
              <span>Mins: {firstPlayerSeasonAverage.data[0]?.min || 0}</span>
              <br />
              {renderStat(
                "PTS",
                firstPlayerSeasonAverage?.data[0]?.pts || 0,
                secondPlayerSeasonAverage?.data[0]?.pts || 0,
                compareAndColor(
                  firstPlayerSeasonAverage?.data[0]?.pts || 0,
                  secondPlayerSeasonAverage?.data[0]?.pts || 0
                )
              )}
              <br />
              {renderStat(
                "REB",
                firstPlayerSeasonAverage?.data[0]?.reb || 0,
                secondPlayerSeasonAverage?.data[0]?.reb || 0,
                compareAndColor(
                  firstPlayerSeasonAverage?.data[0]?.reb || 0,
                  secondPlayerSeasonAverage?.data[0]?.reb || 0
                )
              )}
              <br />
              {renderStat(
                "AST",
                firstPlayerSeasonAverage?.data[0]?.ast || 0,
                secondPlayerSeasonAverage?.data[0]?.ast || 0,
                compareAndColor(
                  firstPlayerSeasonAverage?.data[0]?.ast || 0,
                  secondPlayerSeasonAverage?.data[0]?.ast || 0
                )
              )}
              <br />
              {renderStat(
                "BLK",
                firstPlayerSeasonAverage?.data[0]?.blk || 0,
                secondPlayerSeasonAverage?.data[0]?.blk || 0,
                compareAndColor(
                  firstPlayerSeasonAverage?.data[0]?.blk || 0,
                  secondPlayerSeasonAverage?.data[0]?.blk || 0
                )
              )}
              <br />
              {renderStat(
                "STL",
                firstPlayerSeasonAverage?.data[0]?.stl || 0,
                secondPlayerSeasonAverage?.data[0]?.stl || 0,
                compareAndColor(
                  firstPlayerSeasonAverage?.data[0]?.stl || 0,
                  secondPlayerSeasonAverage?.data[0]?.stl || 0
                )
              )}
              <br />
              {renderStat(
                "TOV",
                firstPlayerSeasonAverage?.data[0]?.turnover || 0,
                secondPlayerSeasonAverage?.data[0]?.turnover || 0,
                compareAndColor(
                  secondPlayerSeasonAverage?.data[0]?.turnover || 0,
                  firstPlayerSeasonAverage?.data[0]?.turnover || 0
                )
              )}
              <br />
              {renderStat(
                "FG%",
                (firstPlayerSeasonAverage?.data[0]?.fg_pct * 100).toFixed(1) ||
                  0,
                secondPlayerSeasonAverage?.data[0]?.fg_pct * 100 || 0,
                compareAndColor(
                  firstPlayerSeasonAverage?.data[0]?.fg_pct || 0,
                  secondPlayerSeasonAverage?.data[0]?.fg_pct || 0
                )
              )}

              <br />
              {renderStat(
                "3PT%",
                (firstPlayerSeasonAverage?.data[0]?.fg3_pct * 100).toFixed(1) ||
                  0,
                secondPlayerSeasonAverage?.data[0]?.fg3_pct * 100 || 0,
                compareAndColor(
                  firstPlayerSeasonAverage?.data[0]?.fg3_pct || 0,
                  secondPlayerSeasonAverage?.data[0]?.fg3_pct || 0
                )
              )}
              <br />
              {renderStat(
                "FT%",
                (firstPlayerSeasonAverage?.data[0]?.ft_pct * 100).toFixed(1) ||
                  0,
                secondPlayerSeasonAverage?.data[0]?.ft_pct * 100 || 0,
                compareAndColor(
                  firstPlayerSeasonAverage?.data[0]?.ft_pct || 0,
                  secondPlayerSeasonAverage?.data[0]?.ft_pct || 0
                )
              )}
              <br />
            </div>
          )}
          {/* First Player (Search Results) */}
          <div className="first-player-search-results">
            {allFirstPlayersFound &&
              !firstPlayerIsChosen &&
              allFirstPlayersFound?.map((player) => (
                <div
                  className="search-result-box"
                  key={player.id}
                  onClick={() => {
                    getFirstPlayerStats(player);
                    setFirstPlayerIsChosen(true);
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

        {/* Second Player */}
        <div className="compare-players-box">
          {/* Second Player (Search Form)*/}
          <form
            onSubmit={handleSubmitSecondPlayer}
            className="second-player-form"
          >
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faSearch} />
              <input
                className="input"
                type="text"
                placeholder="Player's Name"
                onChange={(e) => setSecondSearchItem(e.target.value)}
                required
              />
            </div>
            {/* <button className="btn btn-secondary">
              {!secondFormIsPending ? "Search" : "Searching..."}
            </button> */}
          </form>
          {/* Second Player (Season Average) */}
          {secondPlayerSeasonAverage && secondPlayerIsChosen && (
            <div className="second-player-stats-summary">
              <img src={secondPlayerPhoto}></img>
              <br />
              <br />
              <b>
                Season Averages ({secondPlayerSeasonAverage.data[0]?.season})
              </b>
              <br />
              <span>Name: {secondPlayerName}</span>
              <br />
              <span>
                Games Played:{" "}
                {secondPlayerSeasonAverage.data[0]?.games_played || 0}
              </span>
              <br />
              <span>Mins: {secondPlayerSeasonAverage.data[0]?.min || 0}</span>
              <br />
              <span>PPG: {secondPlayerSeasonAverage.data[0]?.pts || 0}</span>
              <br />
              <span>REB: {secondPlayerSeasonAverage.data[0]?.reb || 0}</span>
              <br />
              <span>AST: {secondPlayerSeasonAverage.data[0]?.ast || 0}</span>
              <br />
              <span>BLK {secondPlayerSeasonAverage.data[0]?.blk || 0}</span>
              <br />
              <span>STL {secondPlayerSeasonAverage.data[0]?.stl || 0}</span>
              <br />
              <span>
                TOV {secondPlayerSeasonAverage.data[0]?.turnover || 0}
              </span>
              <br />
              <span>
                FG%{" "}
                {secondPlayerSeasonAverage.data[0]?.fg_pct
                  ? (secondPlayerSeasonAverage?.data[0]?.fg_pct * 100).toFixed(
                      1
                    )
                  : 0}
              </span>
              <br />
              <span>
                3P%{" "}
                {secondPlayerSeasonAverage.data[0]?.fg3_pct
                  ? (secondPlayerSeasonAverage.data[0]?.fg3_pct * 100).toFixed(
                      1
                    )
                  : 0}
              </span>
              <br />
              <span>
                FT%{" "}
                {secondPlayerSeasonAverage.data[0]?.ft_pct
                  ? (secondPlayerSeasonAverage.data[0]?.ft_pct * 100).toFixed(1)
                  : 0}
              </span>
              <br />
            </div>
          )}
          {/* Second Player (Search Results)*/}
          <div className="second-player-search-results">
            {allSecondPlayersFound &&
              !secondPlayerIsChosen &&
              allSecondPlayersFound?.map((player) => (
                <div
                  className="search-result-box"
                  key={player.id}
                  onClick={() => {
                    getSecondPlayerStats(player);
                    setSecondPlayerIsChosen(true);
                    setSecondPlayerName(
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

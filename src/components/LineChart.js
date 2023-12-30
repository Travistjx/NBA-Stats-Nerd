import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
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

  // compare 2 values and returning a color to be used for <span> tags
  const compareAndColor = (value1, value2) => {
    if (value1 < value2) {
      return "red";
    } else if (value1 > value2) {
      return "green";
    } else {
      return "grey";
    }
  };

  // Method o generate a custom span tag for player season average
  const renderStat = (label, mainValue, otherValue, color) => (
    <span style={{ color }}>
      {label}: {mainValue}{" "}
      {color === "green"
        ? `(${label === "TOV" ? "-" : "+"}${Math.abs(
            mainValue - otherValue
          ).toFixed(2)})`
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

      let totalPages = gameStatsData.data.meta.total_pages;

      if (totalPages > 1) {
        const lastPageAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}&page=${totalPages}`;
        const lastPageData = await axios.get(lastPageAPI);

        let filteredStats = lastPageData?.data.data.filter(
          (gameStat) => gameStat.min !== "00"
        );

        let gameSize = filteredStats.length;

        setFirstPlayerGameStats(lastPageData);

        // Check if more pages are needed (since data on last page might be insufficient)
        if (gameSize < 10 && totalPages > 1) {
          totalPages -= 1;
          const previousPageAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}&page=${totalPages}`;
          const previousPageData = await axios.get(previousPageAPI);

          setFirstPlayerGameStats({
            data: {
              data: [
                ...previousPageData?.data.data?.filter(
                  (gameStat) => gameStat.min !== "00"
                ),
                ...lastPageData?.data.data?.filter(
                  (gameStat) => gameStat.min !== "00"
                ),
              ],
            },
          });
        }
      }

      setFirstPlayerSeasonAverage(seasonAverageData.data);
      //setFirstPlayerGameStats(gameStatsData.data);
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

      let totalPages = gameStatsData.data.meta.total_pages;

      if (totalPages > 1) {
        const lastPageAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}&page=${totalPages}`;
        const lastPageData = await axios.get(lastPageAPI);

        let filteredStats = lastPageData?.data.data.filter(
          (gameStat) => gameStat.min !== "00"
        );

        let gameSize = filteredStats.length;

        setSecondPlayerGameStats(lastPageData);

        // Check if more pages are needed (since data on last page might be insufficient)
        if (gameSize < 10 && totalPages > 1) {
          totalPages -= 1;
          const previousPageAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}&page=${totalPages}`;
          const previousPageData = await axios.get(previousPageAPI);

          setSecondPlayerGameStats({
            data: {
              data: [
                ...previousPageData?.data.data?.filter(
                  (gameStat) => gameStat.min !== "00"
                ),
                ...lastPageData?.data.data?.filter(
                  (gameStat) => gameStat.min !== "00"
                ),
              ],
            },
          });
        }
      }

      setSecondPlayerSeasonAverage(seasonAverageData.data);
      //setSecondPlayerGameStats(gameStatsData.data);
      setSecondPlayerPhoto(
        getPlayerPhoto(`${chosenPlayer.first_name} ${chosenPlayer.last_name}`)
      );
    };

    fetchPlayerStats();
  };

  // Handle the submit for first player form to get an array of players found based on search item
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

  // Handle the submit for second player form to get an array of players found based on search item
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
    setUserData({
      labels: [1 + " (Latest)", 2, 3, 4, 5, 6, 7, 8, 9, 10],
      datasets: [
        {
          label: `Points scored (${firstPlayerName})`,
          borderColor: "#ff311f",
          backgroundColor: "#ff311f",
          data: firstPlayerGameStats?.data.data
            .slice(-10)
            .reverse()
            .map((data) => data.pts),
        },
        {
          label: `Points scored (${secondPlayerName})`,
          borderColor: "#1f5aff",
          backgroundColor: "#1f5aff",
          data: secondPlayerGameStats?.data.data
            .slice(-10)
            .reverse()
            .map((data) => data.pts),
        },
      ],
    });

    // const fetchData = async () => {
    //   const gameStatsAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${145}&page=${22}`;
    //   const response = await axios.get(gameStatsAPI);
    //   //console.log(response.data.data[3].pts);

    //   setUserData({
    //     labels: response.data.data.map((data, index) => index),
    //     datasets: [
    //       {
    //         label: "Points scored",
    //         data: response.data.data.map((data) => data.pts),
    //       },
    //     ],
    //   });
    // };

    //fetchData();
  }, [firstPlayerGameStats, secondPlayerGameStats]);

  return (
    <div className="compare-players-page">
      <div class="compare-players-header">
        Player Comparison (Current Season)
      </div>
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
          {firstPlayerSeasonAverage?.data[0]?.season && firstPlayerIsChosen ? (
            <div className="first-player-stats-summary">
              <div className="compare-players-image-box">
                <img src={firstPlayerPhoto}></img>
              </div>
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
          ) : (
            firstPlayerIsChosen && (
              <div className="player-not-active alert alert-danger">
                Chosen player is not an active player.
              </div>
            )
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
          {secondPlayerSeasonAverage?.data[0]?.season &&
          secondPlayerIsChosen ? (
            <div className="second-player-stats-summary">
              <div className="compare-players-image-box">
                <img src={secondPlayerPhoto}></img>
              </div>
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
              {renderStat(
                "PTS",
                secondPlayerSeasonAverage?.data[0]?.pts || 0,
                firstPlayerSeasonAverage?.data[0]?.pts || 0,
                compareAndColor(
                  secondPlayerSeasonAverage?.data[0]?.pts || 0,
                  firstPlayerSeasonAverage?.data[0]?.pts || 0
                )
              )}
              <br />
              {renderStat(
                "REB",
                secondPlayerSeasonAverage?.data[0]?.reb || 0,
                firstPlayerSeasonAverage?.data[0]?.reb || 0,
                compareAndColor(
                  secondPlayerSeasonAverage?.data[0]?.reb || 0,
                  firstPlayerSeasonAverage?.data[0]?.reb || 0
                )
              )}
              <br />
              {renderStat(
                "AST",
                secondPlayerSeasonAverage?.data[0]?.ast || 0,
                firstPlayerSeasonAverage?.data[0]?.ast || 0,
                compareAndColor(
                  secondPlayerSeasonAverage?.data[0]?.ast || 0,
                  firstPlayerSeasonAverage?.data[0]?.ast || 0
                )
              )}
              <br />
              {renderStat(
                "BLK",
                secondPlayerSeasonAverage?.data[0]?.blk || 0,
                firstPlayerSeasonAverage?.data[0]?.blk || 0,
                compareAndColor(
                  secondPlayerSeasonAverage?.data[0]?.blk || 0,
                  firstPlayerSeasonAverage?.data[0]?.blk || 0
                )
              )}
              <br />
              {renderStat(
                "STL",
                secondPlayerSeasonAverage?.data[0]?.stl || 0,
                firstPlayerSeasonAverage?.data[0]?.stl || 0,
                compareAndColor(
                  secondPlayerSeasonAverage?.data[0]?.stl || 0,
                  firstPlayerSeasonAverage?.data[0]?.stl || 0
                )
              )}
              <br />
              <span>
                {renderStat(
                  "TOV",
                  secondPlayerSeasonAverage?.data[0]?.turnover || 0,
                  firstPlayerSeasonAverage?.data[0]?.turnover || 0,
                  compareAndColor(
                    firstPlayerSeasonAverage?.data[0]?.turnover || 0,
                    secondPlayerSeasonAverage?.data[0]?.turnover || 0
                  )
                )}
              </span>
              <br />
              {renderStat(
                "FG%",
                (secondPlayerSeasonAverage?.data[0]?.fg_pct * 100).toFixed(1) ||
                  0,
                firstPlayerSeasonAverage?.data[0]?.fg_pct * 100 || 0,
                compareAndColor(
                  secondPlayerSeasonAverage?.data[0]?.fg_pct || 0,
                  firstPlayerSeasonAverage?.data[0]?.fg_pct || 0
                )
              )}
              <br />
              {renderStat(
                "3P%",
                (secondPlayerSeasonAverage?.data[0]?.fg3_pct * 100).toFixed(
                  1
                ) || 0,
                firstPlayerSeasonAverage?.data[0]?.fg3_pct * 100 || 0,
                compareAndColor(
                  secondPlayerSeasonAverage?.data[0]?.fg3_pct || 0,
                  firstPlayerSeasonAverage?.data[0]?.fg3_pct || 0
                )
              )}
              <br />
              {renderStat(
                "FT%",
                (secondPlayerSeasonAverage?.data[0]?.ft_pct * 100).toFixed(1) ||
                  0,
                firstPlayerSeasonAverage?.data[0]?.ft_pct * 100 || 0,
                compareAndColor(
                  secondPlayerSeasonAverage?.data[0]?.ft_pct || 0,
                  firstPlayerSeasonAverage?.data[0]?.ft_pct || 0
                )
              )}
              <br />
            </div>
          ) : (
            secondPlayerIsChosen && (
              <div className="player-not-active alert alert-danger">
                Chosen player is not an active player.
              </div>
            )
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
      <Bar data={userData} />
    </div>
  );
};

export default LineChart;

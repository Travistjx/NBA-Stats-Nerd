import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import { UserData } from "./UserData.js";
import { Chart as ChartJs } from "chart.js/auto";
import axios from "axios";
import "./LineChart.css";
import playerPhoto from "../assets/player-photos.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/fontawesome-free-solid";
import loadingAnimation from "../assets/loading-animation.json";
import Lottie from "lottie-react";

const LineChart = ({ openLinks }) => {
  const [allFirstPlayersFound, setAllFirstPlayersFound] = useState(null);
  const [allSecondPlayersFound, setAllSecondPlayersFound] = useState(null);
  const [firstPlayerName, setFirstPlayerName] = useState(null);
  const [secondPlayerName, setSecondPlayerName] = useState(null);
  const [firstFormIsPending, setFirstFormIsPending] = useState(false);
  const [secondFormIsPending, setSecondFormIsPending] = useState(false);
  const [firstPlayerLoading, setFirstPlayerLoading] = useState(false);
  const [secondPlayerLoading, setSecondPlayerLoading] = useState(false);
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
  const [firstPlayerError, setFirstPlayerError] = useState(null);
  const [secondPlayerError, setSecondPlayerError] = useState(null);
  const [playerChartData, setPlayerChartData] = useState(null);
  const [graphOption, setGraphOption] = useState("pts");

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
    const firstName = formattedNameArray[0].slice(0, 1);
    const formattedName = lastName.toLowerCase() + firstName.toLowerCase();
    console.log(formattedName);

    const playerPhotoFound = Object.keys(playerPhoto).find((key) =>
      key.includes(formattedName)
    );
    console.log(playerPhotoFound);
    return playerPhoto ? playerPhoto[playerPhotoFound] : "N/A";
  };

  // Set chosen first player's season average, game stats, and photo
  const getFirstPlayerStats = (chosenPlayer) => {
    setFirstPlayerLoading(true);
    const fetchPlayerStats = async () => {
      const seasonAverageAPI = `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${chosenPlayer.id}`;
      const gameStatsAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}`;

      const [seasonAverageData, gameStatsData] = await Promise.all([
        axios.get(seasonAverageAPI),
        axios.get(gameStatsAPI),
      ]);

      //to store all the data
      let totalPageData = null;

      if (seasonAverageData?.data.data[0]?.season) {
        let totalPages = gameStatsData.data.meta.total_pages;

        if (totalPages > 1) {
          const lastPageAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}&page=${totalPages}`;
          const lastPageData = await axios.get(lastPageAPI);

          let filteredStats = lastPageData?.data.data.filter(
            (gameStat) =>
              gameStat.min !== "00" &&
              gameStat.game.season === 2023 &&
              gameStat.game.postseason === false
          );

          let gameSize = filteredStats.length;

          setFirstPlayerGameStats(filteredStats);

          totalPageData = filteredStats;
          let count = 0;

          // Check if more pages are needed (since data on last page might be insufficient)
          while (gameSize < 10 && totalPages > 1 && count < 6) {
            totalPages -= 1;
            const previousPageAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}&page=${totalPages}`;
            const previousPageData = await axios.get(previousPageAPI);

            //get number of games that player actually played in this season
            filteredStats = previousPageData?.data.data.filter(
              (gameStat) =>
                gameStat.min !== "00" &&
                gameStat.game.season === 2023 &&
                gameStat.game.postseason === false
            );

            //concantenate all the results found
            totalPageData = filteredStats.concat(totalPageData);

            gameSize += filteredStats.length;
            count += 1;
          }
        }
      } else {
        setFirstPlayerError("notActive");
        setFirstPlayerLoading(false);
        return;
      }

      setFirstPlayerGameStats({
        data: {
          data: [
            ...totalPageData?.filter(
              (gameStat) =>
                gameStat.min !== "00" &&
                gameStat.game.season === 2023 &&
                gameStat.game.postseason === false
            ),
          ],
        },
      });
      setFirstPlayerSeasonAverage(seasonAverageData.data);
      //setFirstPlayerGameStats(gameStatsData.data);
      setFirstPlayerPhoto(
        getPlayerPhoto(`${chosenPlayer.first_name} ${chosenPlayer.last_name}`)
      );
      setFirstPlayerLoading(false);
    };

    // Make sure the same player cannot be chosen, if not, do not fetch api
    if (chosenPlayer.id === secondPlayerGameStats?.data.data[0].player.id) {
      console.log(chosenPlayer.id);
      console.log(secondPlayerGameStats?.data.data[0].player.id);
      setFirstPlayerError("samePlayer");
      setFirstPlayerLoading(false);
      return;
    }

    fetchPlayerStats();
  };

  // Set chosen second player's season average, game stats, and photo
  const getSecondPlayerStats = (chosenPlayer) => {
    setSecondPlayerLoading(true);

    const fetchPlayerStats = async () => {
      const seasonAverageAPI = `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${chosenPlayer.id}`;
      const gameStatsAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}`;

      const [seasonAverageData, gameStatsData] = await Promise.all([
        axios.get(seasonAverageAPI),
        axios.get(gameStatsAPI),
      ]);

      let totalPageData = null;

      if (seasonAverageData?.data.data[0]?.season) {
        let totalPages = gameStatsData.data.meta.total_pages;

        if (totalPages > 1) {
          const lastPageAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}&page=${totalPages}`;
          const lastPageData = await axios.get(lastPageAPI);

          let filteredStats = lastPageData?.data.data.filter(
            (gameStat) =>
              gameStat.min !== "00" &&
              gameStat.game.season === 2023 &&
              gameStat.game.postseason === false
          );

          let gameSize = filteredStats.length;

          setSecondPlayerGameStats(filteredStats);

          totalPageData = filteredStats;
          let count = 0;

          // Check if more pages are needed (since data on last page might be insufficient)
          while (gameSize < 10 && totalPages > 1 && count < 6) {
            totalPages -= 1;
            const previousPageAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}&page=${totalPages}`;
            const previousPageData = await axios.get(previousPageAPI);

            //get number of games that player actually played in this season
            filteredStats = previousPageData?.data.data.filter(
              (gameStat) =>
                gameStat.min !== "00" &&
                gameStat.game.season === 2023 &&
                gameStat.game.postseason === false
            );

            //concantenate all the results found
            totalPageData = filteredStats.concat(totalPageData);

            gameSize += filteredStats.length;
            count += 1;
          }
        }
      } else {
        setSecondPlayerError("notActive");
        setSecondPlayerLoading(false);
        return;
      }

      setSecondPlayerGameStats({
        data: {
          data: [
            ...totalPageData?.filter(
              (gameStat) =>
                gameStat.min !== "00" &&
                gameStat.game.season === 2023 &&
                gameStat.game.postseason === false
            ),
          ],
        },
      });
      setSecondPlayerSeasonAverage(seasonAverageData.data);
      //setSecondPlayerGameStats(gameStatsData.data);
      setSecondPlayerPhoto(
        getPlayerPhoto(`${chosenPlayer.first_name} ${chosenPlayer.last_name}`)
      );
      setSecondPlayerLoading(false);
    };

    // Make sure the same player cannot be chosen, if not, do not fetch api
    if (chosenPlayer.id === firstPlayerGameStats?.data.data[0].player.id) {
      console.log(chosenPlayer.id);
      console.log(firstPlayerGameStats?.data.data[0].player.id);
      setSecondPlayerError("samePlayer");
      setSecondPlayerLoading(false);
      return;
    }

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
          {firstPlayerLoading && (
            <Lottie
              animationData={loadingAnimation}
              className="first-player-loading-animation"
            />
          )}
          {!firstPlayerLoading && !firstPlayerError && firstPlayerIsChosen ? (
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
            firstPlayerIsChosen &&
            !firstPlayerLoading &&
            firstPlayerError && (
              <div>
                {firstPlayerError === "samePlayer" && (
                  <div className="player-not-active alert alert-danger">
                    Chosen player cannot be the same as the one you have already
                    chosen.
                  </div>
                )}
                {firstPlayerError === "notActive" && (
                  <div className="player-not-active alert alert-danger">
                    Chosen player is not an active player.
                  </div>
                )}
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
          {secondPlayerLoading && (
            <Lottie
              animationData={loadingAnimation}
              className="second-player-loading-animation"
            />
          )}
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
            secondPlayerIsChosen &&
            !secondPlayerLoading &&
            secondPlayerError && (
              <div>
                {secondPlayerError === "samePlayer" && (
                  <div className="player-not-active alert alert-danger">
                    Chosen player cannot be the same as the one you have already
                    chosen.
                  </div>
                )}
                {secondPlayerError === "notActive" && (
                  <div className="player-not-active alert alert-danger">
                    Chosen player is not an active player.
                  </div>
                )}
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
      <h3>Last 10 Games Averages </h3>
      <hr />
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
      <div className="comparison-graph">
        {/* <div class="compare-players-header">Comparison Graph</div> */}
        <h3>Graph comparison (Last 10 Games)</h3>
        <hr />
        <div className="toggle-graph-options">
          <button
            className={`graph-option-button ${
              graphOption === "pts" ? "btn-selected" : ""
            }`}
            onClick={() => changeGraphOption("pts", "Points")}
          >
            Points
          </button>
          <button
            className={`graph-option-button ${
              graphOption === "reb" ? "btn-selected" : ""
            }`}
            onClick={() => changeGraphOption("reb", "Rebounds")}
          >
            Rebounds
          </button>
          <button
            className={`graph-option-button ${
              graphOption === "ast" ? "btn-selected" : ""
            }`}
            onClick={() => changeGraphOption("ast", "Assists")}
          >
            Assists
          </button>
          <button
            className={`graph-option-button ${
              graphOption === "blk" ? "btn-selected" : ""
            }`}
            onClick={() => changeGraphOption("blk", "Blocks")}
          >
            Blocks
          </button>
          <button
            className={`graph-option-button ${
              graphOption === "stl" ? "btn-selected" : ""
            }`}
            onClick={() => changeGraphOption("stl", "Steals")}
          >
            Steals
          </button>
          <button
            className={`graph-option-button ${
              graphOption === "fg_pct" ? "btn-selected" : ""
            }`}
            onClick={() => changeGraphOption("fg_pct", "FG%")}
          >
            Field Goal %
          </button>
          <button
            className={`graph-option-button ${
              graphOption === "fg3_pct" ? "btn-selected" : ""
            }`}
            onClick={() => changeGraphOption("fg3_pct", "3PT%")}
          >
            3-Pointer %
          </button>
          <button
            className={`graph-option-button ${
              graphOption === "ft_pct" ? "btn-selected" : ""
            }`}
            onClick={() => changeGraphOption("ft_pct", "FT%")}
          >
            Free Throw %
          </button>
        </div>

        {playerChartData ? (
          <Line data={playerChartData} className="line-graph" />
        ) : (
          <span className="">No player data found.</span>
        )}
      </div>
    </div>
  );
};

export default LineChart;

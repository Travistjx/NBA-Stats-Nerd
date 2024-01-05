import React, { useState } from "react";
import playerPhoto from "../assets/photos.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/fontawesome-free-solid";
import axios from "axios";
import loadingAnimation from "../assets/loading-animation.json";
import Lottie from "lottie-react";
import styles from "./ComparePlayerStats.module.css";

const ComparePlayerStats = ({
  firstPlayerProfile,
  setFirstPlayerProfile,
  firstPlayerSeasonAverage,
  setFirstPlayerSeasonAverage,
  setFirstPlayerGameStats,
  secondPlayerSeasonAverage,
  secondPlayerGameStats,
}) => {
  const [firstPlayerLoading, setFirstPlayerLoading] = useState(false);
  const [firstSearchItem, setFirstSearchItem] = useState(null);
  const [firstFormIsPending, setFirstFormIsPending] = useState(false);
  const [firstPlayerIsChosen, setFirstPlayerIsChosen] = useState(false);
  const [allFirstPlayersFound, setAllFirstPlayersFound] = useState(null);
  const [firstPlayerError, setFirstPlayerError] = useState(null);
  const [firstPlayerPhoto, setFirstPlayerPhoto] = useState(null);

  // Handle the form submit when searching for players
  const handleSubmitFirstPlayer = (e) => {
    e.preventDefault();
    setFirstFormIsPending(true);
    setFirstPlayerIsChosen(false);

    let formattedPlayerName = firstSearchItem.trim().replace(/\s+/g, "+");

    const fetchPlayerProfile = async () => {
      const playerProfileAPI = `https://www.balldontlie.io/api/v1/players?search=${formattedPlayerName}`;
      const response = await axios.get(playerProfileAPI);
      if (response.data.data) {
        setAllFirstPlayersFound(response.data.data);
      }

      setFirstFormIsPending(false);
    };

    fetchPlayerProfile();
  };

  /* Get Player Photo from player photos json file which contain links */
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

  // Fetch API. Get the player's season averages/last 10 game stats
  const getPlayerStats = (chosenPlayer) => {
    setFirstPlayerLoading(true);

    const fetchPlayerStats = async () => {
      const seasonAverageAPI = `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${chosenPlayer.id}`;
      const gameStatsAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}`;

      const [seasonAverageData, gameStatsData] = await Promise.all([
        axios.get(seasonAverageAPI, { timeout: 10000 }),
        axios.get(gameStatsAPI, { timeout: 10000 }),
      ]);

      //to store all the data
      let totalPageData = null;

      if (seasonAverageData?.data.data[0]?.season) {
        let totalPages = gameStatsData.data.meta.total_pages;

        if (totalPages > 1) {
          const lastPageAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${chosenPlayer.id}&page=${totalPages}`;
          const lastPageData = await axios.get(lastPageAPI, { timeout: 10000 });

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
            const previousPageData = await axios.get(previousPageAPI, {
              timeout: 10000,
            });

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
      setFirstPlayerPhoto(
        getPlayerPhoto(`${chosenPlayer.first_name} ${chosenPlayer.last_name}`)
      );
      setFirstPlayerLoading(false);
    };

    // Make sure the same player cannot be chosen, if not, do not fetch api
    if (chosenPlayer.id === secondPlayerGameStats?.data.data[0].player.id) {
      setFirstPlayerError("samePlayer");
      setFirstPlayerLoading(false);
      return;
    }

    try {
      fetchPlayerStats();
    } catch (error) {
      console.error("Error fetching player data:", error);
    }
  };

  return (
    <div className={styles["compare-players-box"]}>
      {/* First Player (Search Form) */}
      <form
        onSubmit={handleSubmitFirstPlayer}
        className={styles["player-form"]}
        data-testid="compare-players-form"
      >
        <div className={styles["input-wrapper"]}>
          <FontAwesomeIcon icon={faSearch} />
          <input
            className={styles["search-bar"]}
            type="text"
            placeholder="Player's Name"
            onChange={(e) => setFirstSearchItem(e.target.value)}
            required
          />
        </div>
        <input type="submit" hidden />
      </form>

      {/* First Player (Season Average) */}
      {(firstPlayerLoading || firstFormIsPending) && (
        <Lottie
          animationData={loadingAnimation}
          className={styles["player-loading-animation"]}
        />
      )}

      {/* First Player (Search Results) */}
      <div className={styles["player-search-results"]}>
        {allFirstPlayersFound &&
          !firstPlayerIsChosen &&
          allFirstPlayersFound?.map((player, index) => (
            <div
              className={styles["search-result-box"]}
              data-testid={`player-season-average-${index}`}
              key={player.id}
              onClick={() => {
                getPlayerStats(player);
                setFirstPlayerIsChosen(true);
                setFirstPlayerProfile(player);
              }}
            >
              {`${player.first_name} ${player.last_name}`}
              <br />
              {`Team: ${player.team.full_name}`}
            </div>
          ))}
      </div>

      {/* Display the player stats  */}
      {!firstPlayerLoading && !firstPlayerError && firstPlayerIsChosen ? (
        <div className={styles["player-stats-summary"]}>
          <div className={styles["compare-players-image-box"]}>
            <img
              src={firstPlayerPhoto}
              className={styles["player-image"]}
              alt=""
            ></img>
          </div>
          <br />
          <br />
          <b>Season Averages ({firstPlayerSeasonAverage?.data[0]?.season})</b>
          <br />

          {/* Player Name  */}
          <span>
            Name:{" "}
            {`${firstPlayerProfile.first_name} ${firstPlayerProfile.last_name}`}
          </span>
          <br />

          {/* Games Played  */}
          <span>
            Games Played: {firstPlayerSeasonAverage?.data[0]?.games_played || 0}
          </span>
          <br />

          {/* Mins Played  */}
          <span>Mins: {firstPlayerSeasonAverage?.data[0]?.min || 0}</span>
          <br />

          {/* Points  */}
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

          {/* Rebounds  */}
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

          {/* Assists  */}
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

          {/* Blocks  */}
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

          {/* Steals  */}
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

          {/* Turnovers  */}
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

          {/* FG%  */}
          {renderStat(
            "FG%",
            (firstPlayerSeasonAverage?.data[0]?.fg_pct * 100).toFixed(1) || 0,
            secondPlayerSeasonAverage?.data[0]?.fg_pct * 100 || 0,
            compareAndColor(
              firstPlayerSeasonAverage?.data[0]?.fg_pct || 0,
              secondPlayerSeasonAverage?.data[0]?.fg_pct || 0
            )
          )}
          <br />

          {/* 3PT%  */}
          {renderStat(
            "3PT%",
            (firstPlayerSeasonAverage?.data[0]?.fg3_pct * 100).toFixed(1) || 0,
            secondPlayerSeasonAverage?.data[0]?.fg3_pct * 100 || 0,
            compareAndColor(
              firstPlayerSeasonAverage?.data[0]?.fg3_pct || 0,
              secondPlayerSeasonAverage?.data[0]?.fg3_pct || 0
            )
          )}
          <br />

          {/* FT% */}
          {renderStat(
            "FT%",
            (firstPlayerSeasonAverage?.data[0]?.ft_pct * 100).toFixed(1) || 0,
            secondPlayerSeasonAverage?.data[0]?.ft_pct * 100 || 0,
            compareAndColor(
              firstPlayerSeasonAverage?.data[0]?.ft_pct || 0,
              secondPlayerSeasonAverage?.data[0]?.ft_pct || 0
            )
          )}
          <br />
        </div>
      ) : (
        // Display error if any
        firstPlayerIsChosen &&
        !firstPlayerLoading &&
        firstPlayerError && (
          <div>
            {firstPlayerError === "samePlayer" && (
              <div className={`alert alert-danger ${styles["same-player"]}`}>
                Chosen player cannot be the same as the one you have already
                chosen.
              </div>
            )}
            {firstPlayerError === "notActive" && (
              <div
                className={`alert alert-danger ${styles["player-not-active"]}`}
              >
                Chosen player is not an active player.
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default ComparePlayerStats;

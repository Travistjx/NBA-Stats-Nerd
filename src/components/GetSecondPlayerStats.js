import React, { useState, useEffect } from "react";
import playerPhoto from "../assets/player-photos.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/fontawesome-free-solid";
import axios from "axios";
import loadingAnimation from "../assets/loading-animation.json";
import Lottie from "lottie-react";
import styles from "./GetFirstAndSecondPlayerStats.module.css";

const GetSecondPlayerStats = ({
  secondPlayerName,
  setSecondPlayerName,
  secondPlayerSeasonAverage,
  setSecondPlayerSeasonAverage,
  secondPlayerGameStats,
  setSecondPlayerGameStats,
  firstPlayerSeasonAverage,
  firstPlayerGameStats,
}) => {
  const [secondPlayerLoading, setSecondPlayerLoading] = useState(false);
  const [secondSearchItem, setSecondSearchItem] = useState(null);
  const [secondFormIsPending, setSecondFormIsPending] = useState(false);
  const [secondPlayerIsChosen, setSecondPlayerIsChosen] = useState(false);
  const [allSecondPlayersFound, setAllSecondPlayersFound] = useState(null);
  const [secondPlayerError, setSecondPlayerError] = useState(null);
  const [secondPlayerPhoto, setSecondPlayerPhoto] = useState(null);

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
  // Get the player photo of the player chosen
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

  // Set chosen second player's season average, game stats, and photo
  const getPlayerStats = (chosenPlayer) => {
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

  return (
    <div className={styles["compare-players-box"]}>
      {/* Second Player (Search Form)*/}
      <form onSubmit={handleSubmitSecondPlayer} className="second-player-form">
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
      </form>
      {/* Second Player (Season Average) */}
      {(secondPlayerLoading || secondFormIsPending) && (
        <Lottie
          animationData={loadingAnimation}
          className="second-player-loading-animation"
        />
      )}
      {secondPlayerSeasonAverage?.data[0]?.season && secondPlayerIsChosen ? (
        <div className="second-player-stats-summary">
          <div className="compare-players-image-box">
            <img src={secondPlayerPhoto}></img>
          </div>
          <br />
          <br />
          <b>Season Averages ({secondPlayerSeasonAverage.data[0]?.season})</b>
          <br />
          <span>Name: {secondPlayerName}</span>
          <br />
          <span>
            Games Played: {secondPlayerSeasonAverage.data[0]?.games_played || 0}
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
            (secondPlayerSeasonAverage?.data[0]?.fg_pct * 100).toFixed(1) || 0,
            firstPlayerSeasonAverage?.data[0]?.fg_pct * 100 || 0,
            compareAndColor(
              secondPlayerSeasonAverage?.data[0]?.fg_pct || 0,
              firstPlayerSeasonAverage?.data[0]?.fg_pct || 0
            )
          )}
          <br />
          {renderStat(
            "3P%",
            (secondPlayerSeasonAverage?.data[0]?.fg3_pct * 100).toFixed(1) || 0,
            firstPlayerSeasonAverage?.data[0]?.fg3_pct * 100 || 0,
            compareAndColor(
              secondPlayerSeasonAverage?.data[0]?.fg3_pct || 0,
              firstPlayerSeasonAverage?.data[0]?.fg3_pct || 0
            )
          )}
          <br />
          {renderStat(
            "FT%",
            (secondPlayerSeasonAverage?.data[0]?.ft_pct * 100).toFixed(1) || 0,
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
                getPlayerStats(player);
                setSecondPlayerIsChosen(true);
                setSecondPlayerName(`${player.first_name} ${player.last_name}`);
              }}
            >
              {`${player.first_name} ${player.last_name}`}
              <br />
              {`Team: ${player.team.full_name}`}
            </div>
          ))}
      </div>
    </div>
  );
};

export default GetSecondPlayerStats;

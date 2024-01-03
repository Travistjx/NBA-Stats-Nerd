import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../assets/team-name-id.json";
import styles from "./PlayerStats.module.css";
import loadingAnimation from "../assets/loading-animation.json";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import playerPhoto from "../assets/photos.json";

const PlayerStats = ({ playerId }) => {
  const [seasonAverage, setSeasonAverage] = useState(null);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [gameStats, setGameStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  //Function to get corresponding image link based on player name (using imported json file)
  const getPlayerPhoto = (playerName) => {
    let formattedNameArray = playerName.split(" ");
    const lastName = formattedNameArray[1].slice(0, 5);
    const firstName = formattedNameArray[0].slice(0, 1);
    const formattedName = lastName.toLowerCase() + firstName.toLowerCase();

    const playerPhotoFound = Object.keys(playerPhoto).find((key) =>
      key.includes(formattedName)
    );
    return playerPhoto ? playerPhoto[playerPhotoFound] : "N/A";
  };

  //Find Team Abbreviation from local json (e.g. Chicago for CHI)
  const findAbbreviationById = (id) => {
    const team = teamData.data.find((team) => team.id === id);
    return team ? team.abbreviation : "N/A";
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const seasonAverageAPI = `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${playerId}`;
        const playerProfileAPI = `https://www.balldontlie.io/api/v1/players/${playerId}`;
        const gameStatsAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}`;

        //retrieve data from api asynchronously
        const [seasonAverageData, playerProfileData, gameStatsData] =
          await Promise.all([
            axios.get(seasonAverageAPI, { timeout: 10000 }),
            axios.get(playerProfileAPI, { timeout: 10000 }),
            axios.get(gameStatsAPI, { timeout: 10000 }),
          ]);

        //set season average and player profile data
        setSeasonAverage(seasonAverageData.data);
        setPlayerProfile(playerProfileData.data);

        //to store all the game stats data
        let totalPageData = null;

        // Find total pages for data
        let totalPages = gameStatsData.data.meta.total_pages;

        //If pages > 1, fetch data from the last page for specific player
        if (totalPages > 1) {
          const lastPageApiUrl = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}&page=${totalPages}`;
          const lastPageData = await axios.get(lastPageApiUrl, {
            timeout: 10000,
          });

          let filteredStats = lastPageData?.data.data.filter(
            (gameStat) =>
              gameStat.min !== "00" &&
              gameStat.game.season === 2023 &&
              gameStat.game.postseason === false
          );

          let gameSize = filteredStats.length;

          setGameStats(filteredStats);

          totalPageData = filteredStats;
          let count = 0;

          // Check if more pages are needed (since data on last page might be insufficient)
          while (gameSize < 10 && totalPages > 1 && count < 6) {
            totalPages -= 1;
            const previousPageAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}&page=${totalPages}`;
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

        setGameStats({
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
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };

    fetchData();
  }, [playerId]);

  // Method to get and display the last 10 games that selected player partook in
  const gameStatsRows = gameStats?.data?.data
    .filter((gameStat) => gameStat.min !== "00") //filter out those that didn't play
    .slice(-10) //from the back
    .reverse() //in descending order
    .map((gameStat, index) => (
      <tr key={index}>
        <td>{gameStat.game.season || NaN}</td>
        <td>{gameStat.team.abbreviation || NaN}</td>
        <td>
          {gameStat.game.visitor_team_id &&
          gameStat.team.id &&
          gameStat.game.home_team_id
            ? gameStat.game.visitor_team_id === gameStat.team.id
              ? findAbbreviationById(gameStat.game.home_team_id)
              : findAbbreviationById(gameStat.game.visitor_team_id)
            : NaN}
        </td>
        <td>
          {gameStat.game.home_team_id &&
          gameStat.team.id &&
          gameStat.game.home_team_id
            ? (gameStat.game.home_team_id === gameStat.team.id &&
                gameStat.game.home_team_score <
                  gameStat.game.visitor_team_score) ||
              (gameStat.game.home_team_id !== gameStat.team.id &&
                gameStat.game.home_team_score >
                  gameStat.game.visitor_team_score)
              ? "Lose"
              : "Win"
            : NaN}
        </td>
        <td>
          {gameStat.game.home_team_score +
            "-" +
            gameStat.game.visitor_team_score}
        </td>
        <td>{gameStat.min || 0}</td>
        <td>{gameStat.pts || 0}</td>
        <td>{gameStat.fgm || 0}</td>
        <td>{gameStat.fga || 0}</td>
        <td>{gameStat.fg3a || 0}</td>
        <td>{gameStat.fg3m || 0}</td>
        <td>{gameStat.fta || 0}</td>
        <td>{gameStat.ftm || 0}</td>
        <td>{gameStat.oreb || 0}</td>
        <td>{gameStat.dreb || 0}</td>
        <td>{gameStat.reb || 0}</td>
        <td>{gameStat.ast || 0}</td>
        <td>{gameStat.stl || 0}</td>
        <td>{gameStat.blk || 0}</td>
        <td>{gameStat.turnover || 0}</td>
        <td>{gameStat.pf || 0}</td>
      </tr>
    ));

  return isLoading ? (
    <Lottie
      animationData={loadingAnimation}
      className={styles["loading-animation"]}
    />
  ) : (
    seasonAverage && playerProfile && gameStats && (
      // Fade in / out when entering or leaving page
      <motion.div
        className={styles["player-stats"]}
        initial={{ opacity: 0, transition: { duration: 1 } }}
        animate={{ opacity: 1, transition: { duration: 1 } }}
        exit={{ opacity: 0, transition: { duration: 1 } }}
      >
        {/* Display player profile information  */}
        <div className={styles["player-stats-info"]}>
          <div className={styles["player-profile"]}>
            <div className={styles["player-profile-photo-space"]}>
              <img
                className={styles["player-profile-photo"]}
                src={getPlayerPhoto(
                  `${playerProfile.first_name} ${playerProfile.last_name}`
                )}
                alt=""
              />
            </div>
            <div className={styles["player-profile-information"]}>
              <span>
                <b>Name: </b>
                {playerProfile.first_name !== null &&
                playerProfile.first_name !== "" &&
                playerProfile.last_name !== null &&
                playerProfile.last_name !== ""
                  ? playerProfile.first_name + " " + playerProfile.last_name
                  : NaN}
              </span>
              <br />
              <span>
                <b>Position: </b>
                {playerProfile?.position !== null &&
                playerProfile?.position !== ""
                  ? playerProfile.position
                  : NaN}
              </span>
              <br />
              <span>
                <b>Height: </b>
                {playerProfile?.height_feet !== null &&
                playerProfile?.height_feet !== "" &&
                playerProfile?.height_inches !== null &&
                playerProfile?.height_inches !== ""
                  ? `${playerProfile.height_feet}'${playerProfile.height_inches}"`
                  : NaN}
              </span>
              <br />
              <span>
                <b>Weight: </b>
                {playerProfile?.weight_pounds !== null &&
                playerProfile?.weight_pounds !== ""
                  ? `${playerProfile?.weight_pounds}lb`
                  : NaN}
              </span>
            </div>
          </div>

          {/* Display the current season average (if applicable)*/}
          <div className={styles["stats-summary"]}>
            <b>Current Season (If Applicable)</b>
            <table className={styles["season-average"]}>
              <thead>
                <tr>
                  <th>Season</th>
                  <th>GP</th>
                  <th>MINS</th>
                  <th>PTS</th>
                  <th>REB</th>
                  <th>AST</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>TOV</th>
                  <th>FG%</th>
                  <th>3PT%</th>
                  <th>FT%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td> {seasonAverage.data[0]?.season || 0} </td>
                  <td> {seasonAverage.data[0]?.games_played || 0} </td>
                  <td> {seasonAverage.data[0]?.min || 0} </td>
                  <td> {seasonAverage.data[0]?.pts || 0} </td>
                  <td> {seasonAverage.data[0]?.reb || 0} </td>
                  <td> {seasonAverage.data[0]?.ast || 0} </td>
                  <td> {seasonAverage.data[0]?.stl || 0} </td>
                  <td> {seasonAverage.data[0]?.blk || 0} </td>
                  <td> {seasonAverage.data[0]?.turnover || 0} </td>
                  <td>
                    {seasonAverage.data[0]?.fg_pct
                      ? (seasonAverage?.data[0]?.fg_pct * 100).toFixed(1)
                      : 0}
                  </td>
                  <td>
                    {seasonAverage.data[0]?.fg3_pct
                      ? (seasonAverage.data[0]?.fg3_pct * 100).toFixed(1)
                      : 0}
                  </td>
                  <td>
                    {seasonAverage.data[0]?.ft_pct
                      ? (seasonAverage.data[0]?.ft_pct * 100).toFixed(1)
                      : 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Display the stats of last 10 games (if applicable)*/}
          <div className={styles["last-ten-games"]}>
            <b>Last 10 Games (If Applicable)</b>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Team</th>
                  <th>Opp</th>
                  <th>Result</th>
                  <th>Score</th>
                  <th>MINS</th>
                  <th>PTS</th>
                  <th>FG</th>
                  <th>FGA</th>
                  <th>3P</th>
                  <th>3PA</th>
                  <th>FT</th>
                  <th>FTA</th>
                  <th>ORB</th>
                  <th>DRB</th>
                  <th>TRB</th>
                  <th>AST</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>TOV</th>
                  <th>PF</th>
                </tr>
              </thead>
              <tbody>{gameStatsRows}</tbody>
            </table>
          </div>
        </div>
      </motion.div>
    )
  );
};

export default PlayerStats;

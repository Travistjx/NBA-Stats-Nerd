import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import teamData from "../assets/team-name-id.json";
import "./PlayerStats.css";
import loadingAnimation from "../assets/loading-animation.json";
import Lottie from "lottie-react";
import { motion } from "framer-motion";

const PlayerStats = ({ playerId }) => {
  const controller = useMemo(() => new AbortController(), []);
  const [seasonAverage, setSeasonAverage] = useState(null);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [gameStats, setGameStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  //Find Team Abbreviation from local json (e.g. Chicago for CHI)
  const findAbbreviationById = (id) => {
    const team = teamData.data.find((team) => team.id === id);
    return team ? team.abbreviation : "N/A";
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        //set timeout
        const timeoutId = setTimeout(() => {
          console.error("Request timed out");
          controller.abort();
        }, 5000);

        const seasonAverageAPI = `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${playerId}`;
        const playerProfileAPI = `https://www.balldontlie.io/api/v1/players/${playerId}`;
        const gameStatsAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}`;

        //retrieve data from api asynchronously
        const [seasonAverageData, playerProfileData, gameStatsData] =
          await Promise.all([
            axios.get(seasonAverageAPI),
            axios.get(playerProfileAPI),
            axios.get(gameStatsAPI),
          ]);

        console.log("Season Average Data:", seasonAverageData.data);
        console.log("Player Profile Data:", playerProfileData.data);
        console.log("Game Stats Data:", gameStatsData.data);

        //set season average and player profile data
        setSeasonAverage(seasonAverageData.data);
        setPlayerProfile(playerProfileData.data);

        // Find total pages for data
        let totalPages = gameStatsData.data.meta.total_pages;
        console.log("Total Pages:", totalPages);

        //If pages > 1, fetch data from the last page for specific player
        if (totalPages > 1) {
          const lastPageApiUrl = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}&page=${totalPages}`;
          const lastPageData = await axios.get(lastPageApiUrl);

          console.log("Data from Last Page:", lastPageData.data);

          let filteredStats = lastPageData.data.data?.filter(
            (gameStat) => gameStat.min !== "00"
          );

          let gameSize = filteredStats.length;
          console.log(gameSize);

          setGameStats(lastPageData);

          // Check if more pages are needed (since data on last page might be insufficient)
          if (gameSize < 10 && totalPages > 1) {
            totalPages -= 1;
            const previousPageApiUrl = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}&page=${totalPages}`;
            const previousPageData = await axios.get(previousPageApiUrl);

            console.log("Data from Previous Page:", previousPageData.data);

            filteredStats = previousPageData.data.data?.filter(
              (gameStat) => gameStat.min !== "00"
            );

            gameSize += filteredStats.length;
            console.log(gameSize);

            setGameStats({
              data: {
                data: [
                  ...previousPageData.data.data?.filter(
                    (gameStat) => gameStat.min !== "00"
                  ),
                  ...lastPageData.data.data?.filter(
                    (gameStat) => gameStat.min !== "00"
                  ),
                ],
              },
            });
          }
        }

        setIsLoading(false);
        clearTimeout(timeoutId);
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };

    fetchData();
    return () => {
      controller.abort();
    };
  }, [playerId, controller]);

  // useEffect(() => {
  //   if (gameStats && gameStats.data && gameStats.data.data) {
  //     setPlayerData({
  //       labels: gameStats?.data?.data
  //         .filter((gameStat) => gameStat.min !== "00") //filter out those that didn't play
  //         .slice(-10) //from the back
  //         .reverse() //in descending order
  //         .map((data) => data.pts),
  //       datasets: [
  //         {
  //           label: "Last 10 Games",
  //           data: gameStats?.data?.data
  //             .filter((gameStat) => gameStat.min !== "00") //filter out those that didn't play
  //             .slice(-10) //from the back
  //             .reverse() //in descending order
  //             .map((data) => data.team.abbreviation),
  //         },
  //       ],
  //     });
  //   }
  // }, [gameStats]);

  // To get the last 10 games that selected player partook in
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
    <Lottie animationData={loadingAnimation} className="loading-animation" />
  ) : (
    seasonAverage && playerProfile && gameStats && (
      //Display player profile information
      <motion.div
        className="player-stats"
        initial={{ opacity: 0, transition: { duration: 1 } }}
        animate={{ opacity: 1, transition: { duration: 1 } }}
        exit={{ opacity: 0, transition: { duration: 1 } }}
      >
        <div className="player-stats-info">
          <div className="player-profile">
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
            <br />
            <br />
          </div>
          {/* Display the current season average (if applicable)*/}
          <div className="stats-summary">
            <b>Current Season (If Applicable)</b>
            <table className="season-average">
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
          <div className="last-ten-games">
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

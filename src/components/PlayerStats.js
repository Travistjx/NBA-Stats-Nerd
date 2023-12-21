import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import teamData from "../assets/team-name-id.json";

const PlayerStats = ({ playerId }) => {
  const controller = useMemo(() => new AbortController(), []);
  const [seasonAverage, setSeasonAverage] = useState(null);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [gameStats, setGameStats] = useState(null);

  const findAbbreviationById = (id) => {
    const team = teamData.data.find((team) => team.id === id);
    return team ? team.abbreviation : "N/A";
  };

  useEffect(() => {
    const fetchData = () => {
      try {
        const timeoutId = setTimeout(() => {
          console.error("Request timed out");
          controller.abort();
        }, 5000);

        const seasonAverageAPI = `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${playerId}`;
        const playerProfileAPI = `https://www.balldontlie.io/api/v1/players/${playerId}`;
        const gameStatsAPI = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}`;

        const getSeasonAverage = axios.get(seasonAverageAPI);
        const getPlayerProfile = axios.get(playerProfileAPI);
        const getGameStats = axios.get(gameStatsAPI);

        axios.all([getSeasonAverage, getPlayerProfile, getGameStats]).then(
          axios.spread(
            (seasonAverageData, playerProfileData, gameStatsData) => {
              console.log("Season Average Data:", seasonAverageData.data);
              console.log("Player Profile Data:", playerProfileData.data);
              console.log("Game Stats Data:", gameStatsData.data);

              setSeasonAverage(seasonAverageData.data);
              setPlayerProfile(playerProfileData.data);
              setGameStats(gameStatsData.data);

              const totalPages = gameStatsData.data.meta.total_pages;
              console.log("Total Pages:", totalPages);

              if (totalPages > 1) {
                const lastPageApiUrl = `https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}&page=${totalPages}`;
                axios.get(lastPageApiUrl).then((lastPageData) => {
                  console.log("Data from Last Page:", lastPageData.data);
                  setGameStats(lastPageData.data);
                });
              }
            }
          )
        );
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

  const gameStatsRows = gameStats?.data.slice(-10).map((gameStat, index) => (
    <tr key={index}>
      <td>{gameStat.game.season}</td>
      <td>{gameStat.team.abbreviation}</td>
      <td>
        {gameStat.game.visitor_team_id === gameStat.team.id
          ? findAbbreviationById(gameStat.game.home_team_id)
          : findAbbreviationById(gameStat.game.visitor_team_id)}
      </td>
      <td>
        {(gameStat.game.home_team_id === gameStat.team.id &&
        gameStat.game.home_team_score < gameStat.game.visitor_team_score
          ? "L"
          : "W") +
          " " +
          gameStat.game.home_team_score +
          "-" +
          gameStat.game.visitor_team_score}
      </td>
      <td>{gameStat.fgm}</td>
      <td>{gameStat.min}</td>
      <td>{gameStat.ast}</td>
      <td>{gameStat.blk}</td>
      <td>{gameStat.dreb}</td>
      <td>{gameStat.fg3_pct}</td>
      <td>{gameStat.fg3a}</td>
      <td>{gameStat.fg3m}</td>
      <td>{gameStat.fg_pct}</td>
      <td>{gameStat.fga}</td>
      <td>{gameStat.ft_pct}</td>
      <td>{gameStat.fta}</td>
      <td>{gameStat.ftm}</td>
      <td>{gameStat.oreb}</td>
      <td>{gameStat.pf}</td>
      <td>{gameStat.pts}</td>
      <td>{gameStat.reb}</td>
      <td>{gameStat.stl}</td>
      <td>{gameStat.turnover}</td>
    </tr>
  ));

  return (
    seasonAverage &&
    playerProfile && (
      <div className="player-stats">
        <div className="player-profile">
          <span>
            <b>Name: </b>
            {playerProfile?.first_name + " " + playerProfile?.last_name}
          </span>
          <br />
          <span>
            <b>Position: </b>
            {playerProfile?.position}
          </span>
          <br />
          <span>
            <b>Height: </b>
            {playerProfile?.height_feet +
              "'" +
              playerProfile?.height_inches +
              '"'}
          </span>
          <br />
          <span>
            <b>Weight: </b> {playerProfile?.weight_pounds}lb
          </span>
          <br />
          <br />
        </div>
        <div className="stats-summary">
          <b>Current Season (If Applicable)</b>
          <table>
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
                <td> {seasonAverage?.data[0]?.season} </td>
                <td> {seasonAverage?.data[0]?.games_played} </td>
                <td> {seasonAverage?.data[0]?.min} </td>
                <td> {seasonAverage?.data[0]?.pts} </td>
                <td> {seasonAverage?.data[0]?.reb} </td>
                <td> {seasonAverage?.data[0]?.ast} </td>
                <td> {seasonAverage?.data[0]?.stl} </td>
                <td> {seasonAverage?.data[0]?.blk} </td>
                <td> {seasonAverage?.data[0]?.turnover} </td>
                <td> {(seasonAverage?.data[0]?.fg_pct * 100).toFixed(1)} </td>
                <td> {(seasonAverage?.data[0]?.fg3_pct * 100).toFixed(1)}</td>
                <td> {(seasonAverage?.data[0]?.ft_pct * 100).toFixed(1)} </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="last-five-games">
          <b>Last 5 games</b>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Team</th>
                <th>Opp</th>
                <th>Score</th>
                <th>MINS</th>
                <th>PTS</th>
                <th>FG</th>
                <th>FGA</th>
                <th>3P</th>
                <th>3PA</th>
                <th>FT</th>
                <th>FTA</th>
                <th>FT%</th>
                <th>ORB</th>
                <th>DRB</th>
                <th>TRB</th>
                <th>AST</th>
                <th>STL</th>
                <th>BLK</th>
                <th>TOV</th>
                <th>PF</th>
                <th>+/-</th>
              </tr>
            </thead>
            <tbody>{gameStatsRows}</tbody>
          </table>
        </div>
      </div>
      // <div>
      //   <div>Games Played: {seasonAverage?.data[0]?.games_played}</div>
      //   Id: {playerId}
      // </div>
    )
  );
};

export default PlayerStats;

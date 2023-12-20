import React, { useState, useEffect, useMemo } from "react";

const PlayerStats = ({ playerId }) => {
  const controller = useMemo(() => new AbortController(), []);
  const signal = controller.signal;
  const [seasonAverage, setSeasonAverage] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.error("Request timed out");
      controller.abort();
    }, 5000);

    fetch(
      `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${playerId}`,
      { signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setSeasonAverage(data.data);
      })
      .catch((error) => {
        console.error("Error fetching player data:", error);
      })
      .finally(() => {
        clearTimeout(timeoutId); // Clear the timeout when the request is completed
      });
  }, [playerId, controller, signal]);

  return (
    seasonAverage && (
      <div>
        {seasonAverage.map((player) => (
          <div className="seasonAverage" key="player.id">
            {`${player.season}`}
          </div>
        ))}
        Id: {playerId}
      </div>
    )
  );
};

export default PlayerStats;

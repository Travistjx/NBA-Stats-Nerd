import { useState } from "react";
import styles from "./SearchPlayer.module.css";
import { motion } from "framer-motion";
import PlayerStats from "./PlayerStats";

const SearchPlayer = ({ openLinks }) => {
  const [playerName, setPlayerName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [buttonIsClicked, setbuttonIsClicked] = useState(false);
  const [playerClicked, setPlayerClicked] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  /* Handle submit when a player is selected*/
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPending(true);

    // replace space with +, so maintain valid url when used with url
    let formattedPlayerName = playerName.trim().replace(/\s+/g, "+");

    if (!formattedPlayerName) {
      setIsPending(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
      console.error("Request timed out");
      setIsPending(false);
      controller.abort();
    }, 5000);

    return fetch(
      `https://www.balldontlie.io/api/v1/players?search=${formattedPlayerName}`,
      { signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setPlayerData(data.data);
        setIsPending(false);
        setbuttonIsClicked(true);
        setPlayerClicked(false);
      })
      .catch((error) => {
        console.error("Error fetching player data:", error);
        setIsPending(false);
      })
      .finally(() => {
        clearTimeout(timeoutId); // Clear the timeout when the request is completed
      });
  };

  return (
    /* Motion div to add fade in and out when switching pages */
    <motion.div
      className={
        openLinks
          ? styles["player-stats-page-adjusted"]
          : styles["player-stats-page"]
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Fade in / Out when search results appear when player name is searched */}
      <div
        className={
          buttonIsClicked
            ? styles["player-search-container-top"]
            : styles["player-search-container"]
        }
      >
        {/* Form to take in player name  */}
        <form onSubmit={handleSubmit} className="player-search-form">
          <div className="row">
            <div className="col-8">
              <input
                placeholder="Player Name"
                type="text"
                className="form-control"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </div>
            <div className="col-4">
              <button className="btn btn-secondary">
                {!isPending ? "Search" : "Searching..."}
              </button>
            </div>
          </div>
        </form>
      </div>
      {/* Search results  */}
      {!playerClicked && playerData != null && (
        <div className={`${styles["search-results"]} ${styles["fade-in"]}`}>
          <h2 className={styles["search-title"]}>Search Results</h2>
          <br />
          <div>
            <div className={styles["scrollable-container"]}>
              {playerData.map((player) => (
                <div
                  className={styles["player-box"]}
                  key={player.id}
                  onClick={() => {
                    setPlayerClicked(true);
                    setPlayerId(player.id);
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
      )}
      {/* Display player stats based on player chosen  */}
      {playerClicked && (
        <div className={styles["player-stats-div"]}>
          <PlayerStats playerId={playerId} />
        </div>
      )}
    </motion.div>
  );
};

export default SearchPlayer;

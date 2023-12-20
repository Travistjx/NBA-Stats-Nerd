import { useState, useEffect } from "react";
import "./SearchPlayer.css";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SearchPlayer = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [buttonIsClicked, setbuttonIsClicked] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPending(true);

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
      `https://www.balldontlie.io/api/v1/players?search=${playerName}`,
      { signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setPlayerData(data.data);
        setIsPending(false);
        setbuttonIsClicked(true);
      })
      .catch((error) => {
        console.error("Error fetching player data:", error);
        setIsPending(false);
      })
      .finally(() => {
        clearTimeout(timeoutId); // Clear the timeout when the request is completed
      });
  };

  useEffect(() => {}, [playerName]);

  let groupSize = 2;

  let groups = playerData?.reduce(function (acc, item, index) {
    if (index % groupSize === 0) {
      acc.push([item]);
    } else {
      acc[acc.length - 1].push(item);
    }
    return acc;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <CSSTransition
        in={buttonIsClicked}
        timeout={500}
        classNames="player-search-div"
      >
        <div className="player-search-div">
          <form onSubmit={handleSubmit}>
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
      </CSSTransition>
      <CSSTransition
        in={playerData !== null}
        timeout={500}
        classNames="search-results"
        unmountOnExit
      >
        {playerData && (
          <div className="search-results">
            <h2>Player Information</h2>
            <br />
            <div>
              <div className="scrollable-container">
                <TransitionGroup>
                  {groups.map((group, rowIndex) => (
                    <CSSTransition
                      key={rowIndex}
                      timeout={500}
                      classNames="player"
                    >
                      <div className="row">
                        {group.map((player) => (
                          <div className="col-6" key={player.id}>
                            <div
                              className="player-box"
                              onClick={() => {
                                // Pass player.id to PlayerStats component using state
                                navigate(`/playerstats/${player.id}`, {
                                  state: { playerId: player.id },
                                });
                              }}
                            >
                              {`${player.first_name} ${player.last_name}`}
                              <br />
                              {`Team: ${player.team.full_name}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CSSTransition>
                  ))}
                </TransitionGroup>
              </div>
            </div>
          </div>
        )}
      </CSSTransition>
    </motion.div>
  );
};

export default SearchPlayer;

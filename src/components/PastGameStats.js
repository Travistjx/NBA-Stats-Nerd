import React, { useState } from "react";

const PastGameStats = () => {
  const [gamesDate, setGamesDate] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="search-game-form">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-8">
            <input
              type="date"
              className="form-control"
              value={gamesDate}
              onChange={(e) => setGamesDate(e.target.value)}
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
  );
};

export default PastGameStats;

import React, { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [openProfile, setOpenProfile] = useState(false);

  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        NBA Stats Nerd
      </Link>
      <ul>
        <li>
          <Link to="/playerstats">Player Stats</Link>
        </li>
        <li>
          <Link onClick={() => setOpenProfile((prev) => !prev)}>
            Games Stats
          </Link>
        </li>
      </ul>
      {openProfile && (
        <div className="drop-down">
          <Link to="/livegamestats">Live Games</Link>
          <Link to="/pastgamestats">Past Games</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

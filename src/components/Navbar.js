import React from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
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
          <Link to="/livegamestats">Live Game Stats</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

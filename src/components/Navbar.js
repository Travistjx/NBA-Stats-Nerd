import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef(null);

  console.log(openProfile);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openProfile &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        // Click outside the dropdown, close the profile
        setOpenProfile(false);
      }
    };

    // Add event listener when the component mounts
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openProfile]);

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
          <Link
            onClick={(event) =>
              setOpenProfile((prev) => !prev, event.stopPropagation())
            }
          >
            Games Stats
          </Link>
        </li>
      </ul>
      {openProfile && (
        <div className="drop-down" ref={dropdownRef}>
          <Link to="/livegamestats">Live Games</Link>
          <Link to="/pastgamestats">Past Games</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

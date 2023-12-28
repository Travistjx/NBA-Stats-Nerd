import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/fontawesome-free-solid";

const Navbar = ({ openLinks, setOpenLinks }) => {
  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef(null);

  console.log(openLinks);

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
    <div>
      <nav className="nav">
        <Link to="/" className="site-title">
          NBA Stats Nerd
        </Link>
        <div className={`nav-links${openLinks ? "-responsive" : ""}`}>
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
                Games Stats{" "}
                <FontAwesomeIcon icon={faCaretDown} className="faCaretDown" />
              </Link>
            </li>
            {openProfile && (
              <div className="drop-down" ref={dropdownRef}>
                <Link to="/livegamestats">Live Games </Link>
                <Link to="/pastgamestats">Past Games</Link>
              </div>
            )}
          </ul>
        </div>
        <Link
          className="navbar-icon"
          onClick={() => setOpenLinks((prev) => !prev)}
        >
          &#9776;
        </Link>
      </nav>
    </div>
  );
};

export default Navbar;

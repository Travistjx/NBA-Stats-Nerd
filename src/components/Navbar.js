import React, { useState, useEffect, useRef } from "react";
import styles from "./Navbar.module.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/fontawesome-free-solid";

const Navbar = ({ openLinks, setOpenLinks }) => {
  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef(null);

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
      <nav className={styles["nav"]}>
        <Link to="/" className={styles["site-title"]}>
          NBA Stats Nerd
        </Link>
        <div
          className={
            openLinks ? styles["nav-links-responsive"] : styles["nav-links"]
          }
        >
          <ul>
            <li>
              <Link to="/compareplayers">Compare Active Players</Link>
            </li>
            <li>
              <Link to="/searchplayer">Search Player</Link>
            </li>
            <li>
              <Link
                onClick={(event) =>
                  setOpenProfile((prev) => !prev, event.stopPropagation())
                }
              >
                Games Stats{" "}
                <FontAwesomeIcon
                  icon={faCaretDown}
                  className={styles["faCaretDown"]}
                />
              </Link>
            </li>
            {openProfile && (
              <div className={styles["drop-down"]} ref={dropdownRef}>
                <Link to="/livegamestats">Live Games </Link>
                <Link to="/pastgamestats">Past Games</Link>
              </div>
            )}
          </ul>
        </div>
        <Link
          className={styles["navbar-icon"]}
          onClick={() => setOpenLinks((prev) => !prev)}
        >
          &#9776;
        </Link>
      </nav>
    </div>
  );
};

export default Navbar;

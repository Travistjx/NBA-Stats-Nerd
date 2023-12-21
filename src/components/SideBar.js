import "./PlayerStats.css";

function SideBar() {
  return (
    <div className="player-stats">
      <div className="player-profile">
        <span>
          <b>Name: </b>Joel Embiid
        </span>
        <br />
        <span>
          <b>Position: </b>Center
        </span>
        <br />
        <span>
          <b>Height: </b>7'0"
        </span>
        <br />
        <span>
          <b>Weight: </b> 250lb
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
              <th>Gp</th>
              <th>Mins</th>
              <th>Pts</th>
              <th>Reb</th>
              <th>Ast</th>
              <th>Stl</th>
              <th>Blk</th>
              <th>Tov</th>
              <th>Fg%</th>
              <th>3pt%</th>
              <th>Ft%</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2023</td>
              <td>23</td>
              <td>36</td>
              <td>34</td>
              <td>23</td>
              <td>23</td>
              <td>23</td>
              <td>23</td>
              <td>3.83</td>
              <td>57</td>
              <td>36</td>
              <td>86</td>
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
          <tbody>
            <tr>
              <td>2023</td>
              <td>23</td>
              <td>36</td>
              <td>34</td>
              <td>23</td>
              <td>23</td>
              <td>23</td>
              <td>23</td>
              <td>3.83</td>
              <td>57</td>
              <td>36</td>
              <td>86</td>
              <td>86</td>
              <td>86</td>
              <td>86</td>
              <td>86</td>
              <td>86</td>
              <td>86</td>
              <td>86</td>
              <td>86</td>
              <td>86</td>
              <td>+6</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SideBar;

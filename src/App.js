import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AnimatedRoutes from "./components/AnimatedRoutes";
import Navbar from "./components/Navbar";
import React, { useState } from "react";

function App() {
  const [openLinks, setOpenLinks] = useState(false);

  return (
    <Router>
      <Navbar openLinks={openLinks} setOpenLinks={setOpenLinks} />
      <AnimatedRoutes openLinks={openLinks} />
    </Router>
  );
}

export default App;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <span className="navbar-logo">Splitflow</span>
        <button className="burger" onClick={() => setOpen(!open)}>
          ☰
        </button>
        <ul className={`navbar-links ${open ? "open" : ""}`}>
          <li>
            <Link to="/" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/participants" onClick={() => setOpen(false)}>
              Teilnehmer
            </Link>
          </li>
          <li>
            <Link to="/add" onClick={() => setOpen(false)}>
              Erfassen
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

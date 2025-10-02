import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          Splitflow
        </Link>

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

        <div className="navbar-actions">
          <Link to="/add" className="navbar-add-button">
            ＋
          </Link>
          <button className="burger" onClick={() => setOpen(!open)}>
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

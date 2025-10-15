import React, { useState, useEffect } from "react";
import "../styles/QuickAddMenu.css";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiArrowLeft,
  FiPlus,
  FiUsers,
} from "react-icons/fi";

export default function QuickAddMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOverlayClick = () => setOpen(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [open]);

  return (
    <>
      {open && (
        <div className="quick-add-overlay" onClick={handleOverlayClick} />
      )}

      <div className="quick-add-container">
        {open && (
          <div className="quick-add-options">
            <div
              className="quick-add-option"
              onClick={() => {
                setOpen(false);
                navigate("/add-expense");
              }}
            >
              <div className="quick-add-label">
                <strong>Neue Einnahmen</strong>
                <small>Jemand schuldet mir</small>
              </div>
              <button className="quick-add-circle">
                <FiArrowLeft size={20} />
              </button>
            </div>

            <div
              className="quick-add-option"
              onClick={() => {
                setOpen(false);
                navigate("/add-debt");
              }}
            >
              <div className="quick-add-label">
                <strong>Neue Schuld</strong>
                <small>Ich schulde jemandem</small>
              </div>
              <button className="quick-add-circle">
                <FiArrowRight size={20} />
              </button>
            </div>

            <div
              className="quick-add-option"
              onClick={() => {
                setOpen(false);
                navigate("/add-subscription");
              }}
            >
              <div className="quick-add-label">
                <strong>Neues Abo</strong>
                <small>Regelmäßige Kosten hinzufügen</small>
              </div>
              <button className="quick-add-circle">
                <FiCalendar size={20} />
              </button>
            </div>

            <div
              className="quick-add-option"
              onClick={() => {
                setOpen(false);
                navigate("/participants");
              }}
            >
              <div className="quick-add-label">
                <strong>Neue Person</strong>
                <small>Personen hinzufügen oder bearbeiten</small>
              </div>
              <button className="quick-add-circle">
                <FiUsers size={20} />
              </button>
            </div>
          </div>
        )}

        <button className="quick-add-button" onClick={() => setOpen(!open)}>
          <FiPlus size={30} />
        </button>
      </div>
    </>
  );
}

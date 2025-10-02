import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/SubscriptionDetails.css";

function SubscriptionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const fetchSub = async () => {
      const res = await fetch(`${API}/api/subscriptions/${id}`);
      const data = await res.json();
      setSubscription(data);
    };

    fetchSub();
  }, [API, id]);

  if (!subscription) return <p className="loading-text">Lade Abo-Daten…</p>;

  return (
    <div className="subscription-details-container">
      <div className="subscription-header">
        <h2 className="subscription-name">{subscription.name}</h2>
        <div className="subscription-buttons">
          <button
            className="action-button edit-button"
            onClick={() => navigate(`/edit-subscription/${subscription._id}`)}
            title="Abo bearbeiten"
          >
            {/* Stift-Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.04a.996.996 0 0 0 0-1.41l-2.5-2.5a.996.996 0 1 0-1.41 1.41l2.5 2.5c.39.39 1.02.39 1.41 0z" />
            </svg>
          </button>

          <button
            className="action-button back-button"
            onClick={() => navigate("/")}
            title="Zurück"
          >
            {/* Pfeil nach links */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
        </div>
      </div>

      <p className="subscription-amount">
        Gesamtbetrag: <strong>{subscription.amount.toFixed(2)} CHF</strong>
      </p>

      <p className="subscription-next-date">
        Nächste Schulden am:{" "}
        {new Date(subscription.nextDueDate).toLocaleDateString("de-CH", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>

      <h3 className="subscription-section-title">Teilnehmer</h3>
      <ul className="participant-list">
        {subscription.participants.map((p) => (
          <li key={p.name} className="participant-item">
            <span>{p.name}</span>
            <span className="participant-share">{p.share.toFixed(2)} CHF</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SubscriptionDetails;

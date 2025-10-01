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

  if (!subscription) return <p className="loading-message">Lade Abo-Daten…</p>;

  return (
    <div className="subscription-details-container">
      <h2 className="subscription-details-heading">{subscription.name}</h2>

      <p className="subscription-details-amount">
        Gesamtbetrag: <strong>{subscription.amount.toFixed(2)} CHF</strong>
      </p>

      <p className="subscription-details-next-due">
        Nächste Schulden am:{" "}
        {new Date(subscription.nextDueDate).toLocaleDateString("de-CH", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>

      <h3 className="subscription-details-subheading">Teilnehmer</h3>
      <ul className="subscription-participant-list">
        {subscription.participants.map((p) => (
          <li key={p.name} className="subscription-participant-item">
            <span className="participant-name">{p.name}</span>
            <span className="participant-share">{p.share.toFixed(2)} CHF</span>
          </li>
        ))}
      </ul>

      <div className="subscription-button-group">
        <button
          className="subscription-button"
          onClick={() => navigate(`/edit-subscription/${subscription._id}`)}
        >
          Abo bearbeiten
        </button>
        <button
          className="subscription-button secondary"
          onClick={() => navigate("/")}
        >
          Zurück
        </button>
      </div>
    </div>
  );
}

export default SubscriptionDetails;

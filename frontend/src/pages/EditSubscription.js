// src/pages/EditSubscription.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditSubscription.css";

function EditSubscription() {
  const { id } = useParams();
  const API = process.env.REACT_APP_API;
  const navigate = useNavigate();
  const currentUser = "Jascha";

  const [subscription, setSubscription] = useState(null);
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Subscription laden
      const res = await fetch(`${API}/api/subscriptions/${id}`);
      const data = await res.json();
      setSubscription(data);

      // Prüfen, ob offene Schulden existieren
      const resDebts = await fetch(`${API}/api/debts?subscriptionId=${id}`);
      const debts = await resDebts.json();
      const hasOpen = debts.some(
        (d) => d.status === "open" || d.status === "partial"
      );
      setCanDelete(!hasOpen);

      // Teilnehmer laden
      const resParts = await fetch(
        `${API}/api/participants?user=${currentUser}`
      );
      const parts = await resParts.json();
      const includesSelf = parts.some((p) => p.name === currentUser);
      const combined = includesSelf
        ? parts
        : [...parts, { name: currentUser, _id: "self" }];
      setAvailableParticipants(combined);
    };
    fetchData();
  }, [id, API, currentUser]);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Fehler beim Speichern.");
        setIsSaving(false);
        return;
      }

      alert("Abo gespeichert.");
      navigate("/");
    } catch (err) {
      setError("Verbindungsfehler.");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Willst du dieses Abo wirklich löschen? Das geht nur, wenn keine offenen Schulden mehr vorhanden sind."
      )
    )
      return;

    const res = await fetch(`${API}/api/subscriptions/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (res.ok) {
      alert("Abo gelöscht.");
      navigate("/");
    } else {
      alert(result.error || "Fehler beim Löschen.");
    }
  };

  if (!subscription) return <p className="edit-loading-text">Lade Abo...</p>;

  const totalShare = subscription.participants.reduce(
    (sum, p) => sum + p.share,
    0
  );
  const sharesMatch = Math.abs(totalShare - subscription.amount) < 0.01;

  const usedNames = subscription.participants.map((p) => p.name);
  const availableOptions = availableParticipants.filter(
    (p) => !usedNames.includes(p.name)
  );

  return (
    <div className="edit-subscription-container">
      {/* Header */}
      <div className="edit-subscription-header">
        <h2 className="edit-subscription-title">Abo bearbeiten</h2>
        <button
          className="edit-back-button"
          onClick={() => navigate(`/subscription/${id}`)}
          title="Zurück"
        >
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

      {error && <p className="edit-error-message">{error}</p>}

      {/* Name */}
      <div className="edit-form-group">
        <label>Name</label>
        <input
          type="text"
          value={subscription.name}
          onChange={(e) =>
            setSubscription({ ...subscription, name: e.target.value })
          }
        />
      </div>

      {/* Betrag */}
      <div className="edit-form-group">
        <label>Betrag</label>
        <input
          type="number"
          value={subscription.amount}
          onChange={(e) =>
            setSubscription({
              ...subscription,
              amount: parseFloat(e.target.value),
            })
          }
        />
      </div>

      {/* Startdatum */}
      <div className="edit-form-group">
        <label>Startdatum</label>
        <input
          type="date"
          value={subscription.startDate.slice(0, 10)}
          onChange={(e) =>
            setSubscription({ ...subscription, startDate: e.target.value })
          }
        />
      </div>

      {/* Pause Checkbox */}
      <div className="edit-form-group checkbox">
        <input
          id="pause-checkbox"
          type="checkbox"
          checked={subscription.isPaused || false}
          onChange={(e) =>
            setSubscription({ ...subscription, isPaused: e.target.checked })
          }
        />
        <label htmlFor="pause-checkbox">
          {subscription.isPaused ? "Abo ist pausiert" : "Abo pausieren"}
        </label>
      </div>

      {/* Teilnehmer */}
      <div className="edit-participants-section">
        <h3>Teilnehmer</h3>
        <p>
          Anteile gesamt: {totalShare.toFixed(2)} CHF
          {!sharesMatch && (
            <>
              {" "}
              &nbsp;
              <span className="edit-warning-note">
                ≠ {subscription.amount.toFixed(2)} CHF
              </span>
            </>
          )}
        </p>

        {subscription.participants.map((p, idx) => (
          <div className="edit-participant-card" key={idx}>
            <div className="edit-participant-info">
              <input
                type="text"
                value={p.name}
                readOnly
                disabled
                className="edit-name-input"
              />
              <input
                type="number"
                value={p.share}
                onChange={(e) => {
                  const updated = [...subscription.participants];
                  updated[idx].share = parseFloat(e.target.value);
                  setSubscription({ ...subscription, participants: updated });
                }}
                className="edit-share-input"
              />
            </div>
            <button
              className="edit-remove-button"
              onClick={() => {
                const updated = [...subscription.participants];
                updated.splice(idx, 1);
                setSubscription({ ...subscription, participants: updated });
              }}
            >
              ✕
            </button>
          </div>
        ))}

        {availableOptions.length > 0 && (
          <select
            className="edit-select-add"
            onChange={(e) => {
              const selected = e.target.value;
              if (!selected) return;
              setSubscription({
                ...subscription,
                participants: [
                  ...subscription.participants,
                  { name: selected, share: 0 },
                ],
              });
              e.target.value = "";
            }}
          >
            <option value="">➕ Teilnehmer hinzufügen</option>
            {availableOptions.map((p) => (
              <option key={p._id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Buttons */}
      <div className="edit-action-buttons">
        <button onClick={handleSave} disabled={isSaving}>
          Speichern
        </button>
        {canDelete && (
          <button className="danger-button" onClick={handleDelete}>
            Abo löschen
          </button>
        )}
      </div>
    </div>
  );
}

export default EditSubscription;

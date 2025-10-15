// src/pages/EditDebt.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditDebt.css";

function EditDebt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  const [debt, setDebt] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  // --- Daten laden ---
  useEffect(() => {
    const fetchDebt = async () => {
      try {
        const res = await fetch(`${API}/api/debts/${id}`);
        const data = await res.json();
        setDebt(data);
        setAmount(data.amount);
        setDescription(data.description);
        setDate(data.date ? data.date.split("T")[0] : "");
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden der Schuld:", err);
        setLoading(false);
      }
    };
    fetchDebt();
  }, [API, id]);

  // --- Schuld speichern ---
  const handleSave = async () => {
    if (!amount || !description) {
      alert("Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/debts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          date,
        }),
      });

      if (res.ok) {
        alert("Schuld erfolgreich aktualisiert.");
        navigate(-1);
      } else {
        alert("Fehler beim Speichern.");
      }
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
    }
  };

  // --- Schuld löschen ---
  const handleDelete = async () => {
    if (!window.confirm("Möchtest du diese Schuld wirklich löschen?")) return;

    try {
      const res = await fetch(`${API}/api/debts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Schuld gelöscht.");
        navigate(-1);
      } else {
        alert("Fehler beim Löschen.");
      }
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };

  if (loading) return <p className="edit-debt-loading">Lade...</p>;
  if (!debt) return <p className="edit-debt-error">Schuld nicht gefunden.</p>;

  return (
    <div className="edit-debt-container">
      <h2 className="edit-debt-title">Schuld bearbeiten</h2>

      <div className="edit-debt-form">
        <div className="edit-debt-group">
          <label>Betrag (CHF)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="edit-debt-group">
          <label>Beschreibung</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="edit-debt-group">
          <label>Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="edit-debt-actions">
          <button className="edit-debt-save" onClick={handleSave}>
            Speichern
          </button>
          <button className="edit-debt-delete" onClick={handleDelete}>
            Löschen
          </button>
          <button className="edit-debt-cancel" onClick={() => navigate(-1)}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditDebt;

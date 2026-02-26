import React, { useEffect, useState } from "react";
import "../styles/AddDebt.css";
import { FiSave } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function AddDebt() {
  const API = process.env.REACT_APP_API;
  const currentUser = "Jascha"; // du bist immer der Schuldner
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [creditor, setCreditor] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchParticipants = async () => {
      const res = await fetch(`${API}/api/participants?user=${currentUser}`);
      const data = await res.json();
      setParticipants(data);
    };
    fetchParticipants();
  }, [API, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!creditor || !amount || !description || !date) {
      alert("Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/debts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creditor,
          debtor: currentUser,
          amount: parseFloat(amount),
          description,
          date,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Fehler beim Speichern.");
        return;
      }

      alert("Schuld erfolgreich gespeichert!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern.");
    }
  };

  return (
    <div className="adddebt-container">
      <h2 className="adddebt-title">Einmalige Schuld erfassen</h2>

      <form className="adddebt-form" onSubmit={handleSubmit}>
        <div className="adddebt-group">
          <label>Ich schulde an:</label>
          <select
            className="adddebt-select"
            value={creditor}
            onChange={(e) => setCreditor(e.target.value)}
            required
          >
            <option value="">– Teilnehmer wählen –</option>
            {participants
              .filter((p) => p.name !== currentUser)
              .map((p) => (
                <option key={p._id} value={p.name}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>

        <div className="adddebt-group">
          <label>Betrag (CHF)</label>
          <input
            className="adddebt-input"
            type="number"
            step="0.01"
            placeholder="z. B. 12.50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="adddebt-group">
          <label>Beschreibung</label>
          <input
            className="adddebt-input"
            type="text"
            placeholder="z. B. Pizzaabend"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="adddebt-group">
          <label>Datum</label>
          <input
            className="adddebt-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="adddebt-submit">
          <FiSave className="adddebt-btn-icon" /> Speichern
        </button>
      </form>
    </div>
  );
}

export default AddDebt;

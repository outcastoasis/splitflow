// src/pages/Add.js
import React, { useEffect, useState } from "react";
import "../styles/Add.css";
import { useNavigate } from "react-router-dom";

function Subscriptions() {
  const currentUser = "Jascha";
  const API = process.env.REACT_APP_API;
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState([]);
  const [availableParticipants, setAvailableParticipants] = useState([]);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [participants, setParticipants] = useState([]);
  const [oneCreditor, setOneCreditor] = useState("");
  const [oneDebtor, setOneDebtor] = useState("");
  const [oneAmount, setOneAmount] = useState("");
  const [oneDescription, setOneDescription] = useState("");
  const [oneDate, setOneDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const resSubs = await fetch(
        `${API}/api/subscriptions?user=${currentUser}`
      );
      const subs = await resSubs.json();
      setSubscriptions(subs);

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
  }, [API, currentUser]);

  const handleAddParticipant = () => {
    const usedNames = participants.map((p) => p.name);
    const unused = availableParticipants.find(
      (p) => !usedNames.includes(p.name)
    );
    if (!unused) return;
    setParticipants([
      ...participants,
      { name: unused.name, share: 0, isCustom: false },
    ]);
  };

  const handleRemoveParticipant = (index) => {
    const updated = [...participants];
    updated.splice(index, 1);
    setParticipants(updated);
  };

  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    if (field === "share") updated[index].isCustom = true;
    setParticipants(updated);
  };

  const resetShare = (index) => {
    const updated = [...participants];
    updated[index].isCustom = false;
    updated[index].share = 0;
    setParticipants(updated);
  };

  useEffect(() => {
    const total = parseFloat(amount);
    if (!total || participants.length === 0) return;

    const fixed = participants.filter((p) => p.isCustom);
    const dynamic = participants.filter((p) => !p.isCustom);

    const fixedSum = fixed.reduce(
      (sum, p) => sum + parseFloat(p.share || 0),
      0
    );
    const remaining = total - fixedSum;
    const perPerson = dynamic.length > 0 ? remaining / dynamic.length : 0;

    const updated = participants.map((p) => {
      if (p.isCustom) return p;
      return { ...p, share: perPerson.toFixed(2) };
    });

    const changed =
      participants.length !== updated.length ||
      participants.some(
        (p, i) => p.share !== updated[i].share || p.name !== updated[i].name
      );

    if (changed) {
      setParticipants(updated);
    }
  }, [amount, participants]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      amount: parseFloat(amount),
      startDate,
      createdBy: currentUser,
      participants: participants.map((p) => ({
        name: p.name,
        share: parseFloat(p.share),
      })),
    };

    await fetch(`${API}/api/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Formular zurücksetzen
    setName("");
    setAmount("");
    setStartDate("");
    setParticipants([]);

    // Zur Startseite (Dashboard) navigieren
    navigate("/");
  };

  // Anpassung handleOneTimeDebt (Einmalige Schuld erfassen)
  const handleOneTimeDebt = async (e) => {
    e.preventDefault();
    if (!oneCreditor || !oneDebtor || !oneAmount || !oneDate) {
      alert("Bitte alle Felder ausfüllen.");
      return;
    }

    await fetch(`${API}/api/debts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creditor: oneCreditor,
        debtor: oneDebtor,
        amount: parseFloat(oneAmount),
        description: oneDescription,
        date: oneDate,
      }),
    });

    // Optionaler Alert
    alert("Schuld gespeichert!");

    // Formular zurücksetzen
    setOneCreditor("");
    setOneDebtor("");
    setOneAmount("");
    setOneDescription("");
    setOneDate("");

    // Zur Startseite navigieren
    navigate("/");
  };

  return (
    <div className="add-container">
      <h2 className="add-heading">Einmalige Schuld erfassen</h2>
      <form onSubmit={handleOneTimeDebt} className="add-form">
        <div className="add-label-group">
          <label>Wer schuldet wem?</label>
          <div className="add-inline-group">
            <select
              className="add-select"
              value={oneDebtor}
              onChange={(e) => setOneDebtor(e.target.value)}
              required
            >
              <option value="">-- Name --</option>
              {availableParticipants.map((p) => (
                <option key={p._id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <span>schuldet</span>
            <select
              className="add-select"
              value={oneCreditor}
              onChange={(e) => setOneCreditor(e.target.value)}
              required
            >
              <option value="">-- Name --</option>
              {availableParticipants.map((p) => (
                <option key={p._id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="add-label-group">
          <label>Betrag (CHF):</label>
          <input
            className="add-input"
            type="number"
            step="0.01"
            value={oneAmount}
            onChange={(e) => setOneAmount(e.target.value)}
            required
          />
        </div>

        <div className="add-label-group">
          <label>Wofür?</label>
          <input
            className="add-input"
            type="text"
            value={oneDescription}
            onChange={(e) => setOneDescription(e.target.value)}
            required
          />
        </div>

        <div className="add-label-group">
          <label>Wann?</label>
          <input
            className="add-input"
            type="date"
            value={oneDate}
            onChange={(e) => setOneDate(e.target.value)}
            required
          />
        </div>

        <button className="add-button primary" type="submit">
          ➕ Einmalige Schuld erfassen
        </button>
      </form>

      <h2 className="add-heading">Abo erstellen</h2>
      <form onSubmit={handleSubmit} className="add-form">
        <input
          className="add-input"
          type="text"
          placeholder="Abo-Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="add-input"
          type="number"
          placeholder="Gesamtbetrag"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          className="add-input"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <h4 className="add-subheading">Teilnehmeranteile</h4>
        {participants.map((p, index) => (
          <div key={index} className="add-participant-row">
            <select
              className="add-select"
              value={p.name}
              onChange={(e) =>
                handleParticipantChange(index, "name", e.target.value)
              }
            >
              {availableParticipants.map((option) => (
                <option
                  key={option._id}
                  value={option.name}
                  disabled={participants.some(
                    (pp, i) => i !== index && pp.name === option.name
                  )}
                >
                  {option.name}
                </option>
              ))}
            </select>

            <input
              className="add-input small"
              type="number"
              value={p.share}
              onChange={(e) =>
                handleParticipantChange(
                  index,
                  "share",
                  parseFloat(e.target.value)
                )
              }
              onDoubleClick={() => resetShare(index)}
            />

            <button
              className="add-remove-btn"
              type="button"
              onClick={() => handleRemoveParticipant(index)}
            >
              🗑️
            </button>
          </div>
        ))}

        <button
          className="add-button secondary"
          type="button"
          onClick={handleAddParticipant}
        >
          ➕ Teilnehmer hinzufügen
        </button>
        <button className="add-button primary" type="submit">
          ✅ Abo speichern
        </button>
      </form>
    </div>
  );
}

export default Subscriptions;

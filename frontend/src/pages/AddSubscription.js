import React, { useEffect, useState } from "react";
import "../styles/AddSubscription.css";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiPlus } from "react-icons/fi";

function AddSubscription() {
  const currentUser = "Jascha";
  const API = process.env.REACT_APP_API;
  const navigate = useNavigate();

  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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

    setName("");
    setAmount("");
    setStartDate("");
    setParticipants([]);
    navigate("/");
  };

  return (
    <div className="add-subscription-container">
      <div className="add-subscription-header">
        <h2 className="add-subscription-title">Abo erstellen</h2>
      </div>

      <form onSubmit={handleSubmit} className="add-subscription-form">
        <div className="add-subscription-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="z.B. Netflix, Spotify"
          />
        </div>

        <div className="add-subscription-group">
          <label>Betrag</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="z.B. 12.99"
          />
        </div>

        <div className="add-subscription-group">
          <label>Startdatum</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="add-subscription-participants">
          <h3>Teilnehmer</h3>
          {participants.map((p, index) => (
            <div key={index} className="add-subscription-participant-card">
              <div className="add-subscription-participant-info">
                <select
                  className="add-name-input"
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
                  className="add-share-input"
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
              </div>

              <button
                className="add-subscription-remove-btn"
                type="button"
                onClick={() => handleRemoveParticipant(index)}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}

          <button
            type="button"
            className="add-subscription-add-btn"
            onClick={handleAddParticipant}
          >
            <FiPlus /> Teilnehmer hinzufügen
          </button>
        </div>

        <div className="add-subscription-actions">
          <button type="submit">Speichern</button>
        </div>
      </form>
    </div>
  );
}

export default AddSubscription;

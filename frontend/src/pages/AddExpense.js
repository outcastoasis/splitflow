import React, { useEffect, useState } from "react";
import "../styles/AddExpense.css";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiPlus } from "react-icons/fi";

function AddExpense() {
  const currentUser = "Jascha"; // du bist immer der Gläubiger
  const API = process.env.REACT_APP_API;
  const navigate = useNavigate();

  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState([]);
  const [manualWarningShown, setManualWarningShown] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      const res = await fetch(`${API}/api/participants?user=${currentUser}`);
      const data = await res.json();
      const filtered = data.filter((p) => p.name !== currentUser);
      setAvailableParticipants(filtered);
    };
    fetchParticipants();
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
    if (field === "share") {
      updated[index].isCustom = true;
      updated[index].share = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setParticipants(updated);
  };

  const resetShare = (index) => {
    const updated = [...participants];
    updated[index].isCustom = false;
    updated[index].share = 0;
    setParticipants(updated);
  };

  // Automatische Aufteilung mit Balanceprüfung
  useEffect(() => {
    const total = parseFloat(amount);
    if (!total || participants.length === 0) return;

    const fixed = participants.filter((p) => p.isCustom);
    const dynamic = participants.filter((p) => !p.isCustom);
    const fixedSum = fixed.reduce(
      (sum, p) => sum + parseFloat(p.share || 0),
      0
    );

    // Wenn alle Beträge manuell festgelegt -> Warnung
    if (participants.length > 0 && fixed.length === participants.length) {
      if (!manualWarningShown) {
        alert(
          "Hinweis: Alle Beträge wurden manuell angepasst. Die automatische Aufteilung wird deaktiviert."
        );
        setManualWarningShown(true);
      }
      return; // Keine automatische Anpassung
    }

    const remaining = total - fixedSum;
    const perPerson = dynamic.length > 0 ? remaining / dynamic.length : 0;

    const updated = participants.map((p) => {
      if (p.isCustom) return p;
      return { ...p, share: perPerson.toFixed(2) };
    });

    setParticipants(updated);
    setManualWarningShown(false);
  }, [amount, participants.length, participants.map((p) => p.share).join(",")]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || !amount || !date || participants.length === 0) {
      alert("Bitte alle Felder ausfüllen und mindestens eine Person wählen.");
      return;
    }

    // Prüfen, ob Summe korrekt mit Gesamtbetrag übereinstimmt
    const totalEntered = participants.reduce(
      (sum, p) => sum + parseFloat(p.share || 0),
      0
    );

    if (Math.abs(totalEntered - parseFloat(amount)) > 0.01) {
      const confirmProceed = window.confirm(
        `Die Summe der Einzelbeträge (${totalEntered.toFixed(
          2
        )} CHF) stimmt nicht mit dem Gesamtbetrag (${parseFloat(amount).toFixed(
          2
        )} CHF) überein.\n\nTrotzdem speichern?`
      );
      if (!confirmProceed) return;
    }

    for (const p of participants) {
      await fetch(`${API}/api/debts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creditor: currentUser,
          debtor: p.name,
          amount: parseFloat(p.share),
          description,
          date,
        }),
      });
    }

    alert("Einnahme erfolgreich gespeichert!");
    setDescription("");
    setAmount("");
    setDate("");
    setParticipants([]);
    navigate("/");
  };

  return (
    <div className="addexpense-container">
      <div className="addexpense-header">
        <h2 className="addexpense-title">Einnahme erfassen</h2>
      </div>

      <form onSubmit={handleSubmit} className="addexpense-form">
        <div className="addexpense-group">
          <label>Beschreibung</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="z. B. Pizza"
          />
        </div>

        <div className="addexpense-group">
          <label>Gesamtbetrag</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="z. B. 45.00"
          />
        </div>

        <div className="addexpense-group">
          <label>Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="addexpense-participants">
          <h3>Beteiligte Personen</h3>
          {participants.map((p, index) => (
            <div key={index} className="addexpense-participant-card">
              <div className="addexpense-participant-info">
                <select
                  className="addexpense-name-input"
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
                  className="addexpense-share-input"
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
                className="addexpense-remove-btn"
                type="button"
                onClick={() => handleRemoveParticipant(index)}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}

          <button
            type="button"
            className="addexpense-add-btn"
            onClick={handleAddParticipant}
          >
            <FiPlus /> Teilnehmer hinzufügen
          </button>
        </div>

        <div className="addexpense-actions">
          <button type="submit">Speichern</button>
        </div>
      </form>
    </div>
  );
}

export default AddExpense;

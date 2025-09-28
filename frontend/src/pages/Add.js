import React, { useEffect, useState } from "react";

function Subscriptions() {
  const currentUser = "Jascha";

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

  // Daten laden: Abos + Teilnehmer
  useEffect(() => {
    const fetchData = async () => {
      const resSubs = await fetch(`/api/subscriptions?user=${currentUser}`);
      const subs = await resSubs.json();
      setSubscriptions(subs);

      const resParts = await fetch(`/api/participants?user=${currentUser}`);
      const parts = await resParts.json();

      // currentUser manuell hinzufügen, falls nicht enthalten
      const includesSelf = parts.some((p) => p.name === currentUser);
      const combined = includesSelf
        ? parts
        : [...parts, { name: currentUser, _id: "self" }];

      setAvailableParticipants(combined);
    };

    fetchData();
  }, []);

  // Teilnehmer hinzufügen
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

  // Teilnehmer löschen
  const handleRemoveParticipant = (index) => {
    const updated = [...participants];
    updated.splice(index, 1);
    setParticipants(updated);
  };

  // Teilnehmerfelder ändern
  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    if (field === "share") updated[index].isCustom = true;
    setParticipants(updated);
  };

  // Anteil zurücksetzen (z. B. per Doppelklick)
  const resetShare = (index) => {
    const updated = [...participants];
    updated[index].isCustom = false;
    updated[index].share = 0;
    setParticipants(updated);
  };

  // Dynamische Anteilverteilung
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

    // Nur aktualisieren, wenn sich etwas ändert
    const changed =
      participants.length !== updated.length ||
      participants.some(
        (p, i) => p.share !== updated[i].share || p.name !== updated[i].name
      );

    if (changed) {
      setParticipants(updated);
    }
  }, [amount, participants]);

  // Abo absenden
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

    await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Reset + Neu laden
    setName("");
    setAmount("");
    setStartDate("");
    setParticipants([]);
    const resSubs = await fetch(`/api/subscriptions?user=${currentUser}`);
    const subs = await resSubs.json();
    setSubscriptions(subs);
  };

  return (
    <div>
      <h2>Abo erstellen</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Abo-Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Gesamtbetrag"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <h4>Teilnehmeranteile</h4>
        {participants.map((p, index) => (
          <div key={index}>
            <select
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
              type="button"
              onClick={() => handleRemoveParticipant(index)}
            >
              🗑️
            </button>
          </div>
        ))}

        <button type="button" onClick={handleAddParticipant}>
          ➕ Teilnehmer hinzufügen
        </button>

        <button type="submit">✅ Abo speichern</button>
      </form>

      <h3>Meine Abos</h3>
      <ul>
        {subscriptions.map((sub) => (
          <li key={sub._id}>
            {sub.name} – {sub.amount}€ – Start:{" "}
            {new Date(sub.startDate).toLocaleDateString("de-CH")}
            <ul>
              {sub.participants.map((p, i) => (
                <li key={i}>
                  {p.name}: {p.share}€
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <h2>Einmalige Schuld erfassen</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (!oneCreditor || !oneDebtor || !oneAmount || !oneDate) {
            alert("Bitte alle Felder ausfüllen.");
            return;
          }

          await fetch("/api/debts", {
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

          alert("Schuld gespeichert!");

          setOneCreditor("");
          setOneDebtor("");
          setOneAmount("");
          setOneDescription("");
          setOneDate("");
        }}
      >
        <div>
          <label>{`Wer schuldet wem?`}</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <select
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

        <div>
          <label>Betrag (CHF):</label>
          <input
            type="number"
            step="0.01"
            value={oneAmount}
            onChange={(e) => setOneAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Wofür?</label>
          <input
            type="text"
            value={oneDescription}
            onChange={(e) => setOneDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Wann?</label>
          <input
            type="date"
            value={oneDate}
            onChange={(e) => setOneDate(e.target.value)}
            required
          />
        </div>

        <button type="submit">➕ Einmalige Schuld erfassen</button>
      </form>
    </div>
  );
}

export default Subscriptions;

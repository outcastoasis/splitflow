import React, { useEffect, useState } from "react";

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState("");
  const currentUser = "Jascha"; // Platzhalter

  const API = process.env.REACT_APP_API;

  // Teilnehmer abrufen
  const fetchParticipants = async () => {
    const res = await fetch(`${API}/api/participants?user=${currentUser}`);
    const data = await res.json();
    setParticipants(data);
  };

  useEffect(() => {
    fetchParticipants();
  }, [API]);

  // Teilnehmer hinzufügen
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    await fetch(`${API}/api/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, createdBy: currentUser }),
    });
    setName("");
    fetchParticipants();
  };

  // Teilnehmer löschen
  const handleDelete = async (id) => {
    await fetch(`${API}/api/participants/${id}`, { method: "DELETE" });
    fetchParticipants();
  };

  return (
    <div>
      <h2>Teilnehmer verwalten</h2>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Name eingeben"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Hinzufügen</button>
      </form>

      <ul>
        {participants.map((p) => (
          <li key={p._id}>
            {p.name} <button onClick={() => handleDelete(p._id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Participants;

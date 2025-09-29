import React, { useEffect, useState } from "react";
import "../styles/Participants.css";

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState("");
  const currentUser = "Jascha";

  const API = process.env.REACT_APP_API;

  const fetchParticipants = async () => {
    const res = await fetch(`${API}/api/participants?user=${currentUser}`);
    const data = await res.json();
    setParticipants(data);
  };

  useEffect(() => {
    fetchParticipants();
  }, [API]);

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

  const handleDelete = async (id) => {
    await fetch(`${API}/api/participants/${id}`, { method: "DELETE" });
    fetchParticipants();
  };

  return (
    <div className="participants-container">
      <h2>Teilnehmer verwalten</h2>
      <form className="participants-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Name eingeben"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Hinzufügen</button>
      </form>

      <ul className="participants-list">
        {participants.map((p) => (
          <li key={p._id}>
            {p.name}
            <button onClick={() => handleDelete(p._id)}>Entfernen</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Participants;

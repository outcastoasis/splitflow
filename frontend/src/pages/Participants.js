import React, { useEffect, useState, useCallback } from "react";
import "../styles/Participants.css";

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const currentUser = "Jascha";
  const API = process.env.REACT_APP_API;
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchParticipants = useCallback(async () => {
    const res = await fetch(`${API}/api/participants?user=${currentUser}`);
    const data = await res.json();
    setParticipants(data);
  }, [API, currentUser]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    setError("");
    const res = await fetch(`${API}/api/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, createdBy: currentUser }),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Fehler beim Erstellen.");
      return;
    }
    setName("");
    fetchParticipants();
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/api/participants/${id}`, { method: "DELETE" });
    fetchParticipants();
  };

  const handleEdit = (id, currentName) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const handleUpdate = async (id) => {
    if (!newName.trim()) return;
    setError("");
    const res = await fetch(`${API}/api/participants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newName }),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Fehler beim Aktualisieren.");
      return;
    }
    setEditingId(null);
    setNewName("");
    setSuccessMessage("Name erfolgreich aktualisiert.");
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
      {error && <p className="participants-error">{error}</p>}
      {successMessage && (
        <p className="participants-success">{successMessage}</p>
      )}
      <ul className="participants-list">
        {participants.map((p) => (
          <li key={p._id}>
            {editingId === p._id ? (
              <>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <div className="button-group">
                  <button onClick={() => handleUpdate(p._id)}>Speichern</button>
                  <button onClick={() => setEditingId(null)}>Abbrechen</button>
                </div>
              </>
            ) : (
              <>
                {p.name}
                <div className="button-group">
                  <button onClick={() => handleEdit(p._id, p.name)}>
                    Bearbeiten
                  </button>
                  <button onClick={() => handleDelete(p._id)}>Entfernen</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Participants;

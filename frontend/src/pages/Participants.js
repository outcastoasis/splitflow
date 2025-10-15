import React, { useEffect, useState, useCallback } from "react";
import "../styles/Participants.css";
import { FiTrash2, FiEdit, FiSave, FiX, FiPlus } from "react-icons/fi";

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
      <h2>Teilnehmer</h2>

      <form className="participants-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Neuen Teilnehmer eingeben"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" title="Teilnehmer hinzufügen">
          <FiPlus />
        </button>
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
                  <button
                    className="edit-button-participant"
                    onClick={() => handleUpdate(p._id)}
                    title="Speichern"
                  >
                    <FiSave />
                  </button>
                  <button
                    className="delete-button-participant"
                    onClick={() => setEditingId(null)}
                    title="Abbrechen"
                  >
                    <FiX />
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="participant-name">{p.name}</span>
                <div className="button-group">
                  <button
                    className="edit-button-participant"
                    onClick={() => handleEdit(p._id, p.name)}
                    title="Bearbeiten"
                  >
                    <FiEdit />
                  </button>
                  <button
                    className="delete-button-participant"
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Teilnehmer "${p.name}" wirklich löschen?`
                      );
                      if (confirmed) handleDelete(p._id);
                    }}
                    title="Entfernen"
                  >
                    <FiTrash2 />
                  </button>
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

// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const currentUser = "Jascha";
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [recentDebts, setRecentDebts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const resDebts = await fetch(`/api/debts?user=${currentUser}`);
      const data = await resDebts.json();

      const grouped = {};
      data.forEach((debt) => {
        if (debt.status !== "open") return;
        const other =
          debt.creditor === currentUser ? debt.debtor : debt.creditor;
        const amount =
          debt.creditor === currentUser
            ? debt.amount - (debt.paidAmount || 0)
            : -(debt.amount - (debt.paidAmount || 0));
        if (!grouped[other]) grouped[other] = 0;
        grouped[other] += amount;
      });

      const summaryArray = Object.entries(grouped).map(([name, total]) => ({
        name,
        total,
      }));
      setSummary(summaryArray);

      const sortedDebts = data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentDebts(sortedDebts);

      const resSubs = await fetch(`/api/subscriptions?user=${currentUser}`);
      const subs = await resSubs.json();
      setSubscriptions(subs);
    };

    fetchData();
  }, []);

  return (
    <div>
      <section className="filters">
        <select>
          <option>September 2025</option>
          <option>August 2025</option>
        </select>
        <label>
          <input type="checkbox" defaultChecked />
          Nur offene Schulden
        </label>
        <input type="text" placeholder="🔍 Suche nach Name oder Abo" />
      </section>

      <section className="section">
        <h2>👥 Teilnehmerübersicht</h2>
        <div className="cards">
          {summary.map((entry) => (
            <div className="card" key={entry.name}>
              <h3>{entry.name}</h3>
              <div className="participant-status">
                {entry.total > 0 ? (
                  <>
                    <span>Offene Schulden: {entry.total.toFixed(2)} CHF</span>
                    <span className="status-badge status-offen">offen</span>
                  </>
                ) : (
                  <>
                    <span>Alles bezahlt</span>
                    <span className="status-badge status-bezahlt">bezahlt</span>
                  </>
                )}
              </div>
              <button onClick={() => navigate(`/dashboard/${entry.name}`)}>
                Details anzeigen
              </button>
              {entry.total > 0 && (
                <button onClick={() => navigate(`/dashboard/${entry.name}`)}>
                  Zahlung erfassen
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>📦 Eigene Abos</h2>
        <div className="cards">
          {subscriptions.map((sub) => (
            <div className="card" key={sub._id}>
              <h3>
                {sub.name} – {sub.amount} CHF
              </h3>
              <p>
                {sub.participants
                  .map((p) => `${p.name} (${p.share} CHF)`)
                  .join(", ")}
              </p>
              <button onClick={() => navigate(`/edit-subscription/${sub._id}`)}>
                Abo bearbeiten
              </button>
              <button
                onClick={() => navigate(`/preview-subscription/${sub._id}`)}
              >
                Vorschau anzeigen
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>📋 Schulden (letzte Einträge)</h2>
        <div className="card">
          {recentDebts.map((debt, idx) => (
            <div className="entry-row" key={idx}>
              <span>{new Date(debt.date).toLocaleDateString("de-CH")}</span>
              <span>
                {debt.debtor} → {debt.creditor}
              </span>
              <span>{debt.amount.toFixed(2)} CHF</span>
              <span>{debt.description}</span>
              {debt.status === "open" ? (
                <button
                  onClick={() =>
                    navigate(
                      `/dashboard/${
                        debt.creditor === currentUser
                          ? debt.debtor
                          : debt.creditor
                      }`
                    )
                  }
                >
                  Zahlung erfassen
                </button>
              ) : (
                <span className="status-badge status-bezahlt">bezahlt</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

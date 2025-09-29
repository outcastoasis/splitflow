// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const currentUser = "Jascha";
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  const [summary, setSummary] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [recentDebts, setRecentDebts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const resDebts = await fetch(`${API}/api/debts?user=${currentUser}`);
      const data = await resDebts.json();

      const grouped = {};

      data
        .filter((debt) => debt.status === "open")
        .forEach((debt) => {
          const other =
            debt.creditor === currentUser ? debt.debtor : debt.creditor;

          const amountLeft = debt.amount - (debt.paidAmount || 0);

          if (!grouped[other]) grouped[other] = { youGet: 0, youOwe: 0 };

          if (debt.creditor === currentUser) {
            // Du bist Gläubiger
            grouped[other].youGet += amountLeft;
          } else {
            // Du bist Schuldner
            grouped[other].youOwe += amountLeft;
          }
        });

      const summaryArray = Object.entries(grouped).map(([name, values]) => {
        const net = values.youGet - values.youOwe;
        return {
          name,
          net,
          youGet: values.youGet,
          youOwe: values.youOwe,
        };
      });

      setSummary(summaryArray);

      const allDebts = data
        .filter(
          (debt) =>
            (debt.creditor === currentUser || debt.debtor === currentUser) &&
            debt.status !== "paid"
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      setRecentDebts(allDebts);

      const resSubs = await fetch(
        `${API}/api/subscriptions?user=${currentUser}`
      );
      const subs = await resSubs.json();
      setSubscriptions(subs);
    };

    fetchData();
  }, [API, currentUser]);

  return (
    <div className="dashboard-container">
      <section className="filters">
        <select>
          <option>September 2025</option>
          <option>August 2025</option>
        </select>
        <label>
          <input type="checkbox" defaultChecked /> Nur offene Schulden
        </label>
        <input type="text" placeholder="Suche nach Name oder Abo" />
      </section>

      <section className="section">
        <h2 className="section-title">Teilnehmerübersicht</h2>
        <div className="cards">
          {summary.map((entry) => (
            <div className="card participant-card" key={entry.name}>
              <div className="card-header">
                <h3>{entry.name}</h3>
                <span
                  className={`status-badge ${
                    entry.net > 0
                      ? "status-offen" // du bekommst Geld
                      : entry.net < 0
                      ? "status-schuldest" // du schuldest Geld
                      : "status-bezahlt" // alles bezahlt
                  }`}
                >
                  {entry.net > 0
                    ? "offen"
                    : entry.net < 0
                    ? "du schuldest"
                    : "bezahlt"}
                </span>
              </div>
              <div className="card-body">
                <p>
                  {entry.net > 0
                    ? `Du bekommst ${entry.net.toFixed(2)} CHF`
                    : entry.net < 0
                    ? `Du schuldest ${Math.abs(entry.net).toFixed(2)} CHF`
                    : "Alles bezahlt"}
                </p>
                <div className="card-buttons">
                  <button
                    className="btn"
                    onClick={() => navigate(`/dashboard/${entry.name}`)}
                  >
                    Details anzeigen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Eigene Abos</h2>
        <div className="cards">
          {subscriptions.map((sub) => (
            <div className="card subscription-card" key={sub._id}>
              <h3>
                {sub.name} – {sub.amount.toFixed(2)} CHF
              </h3>
              <p className="sub-list">
                {sub.participants
                  .map((p) => `${p.name} (${p.share.toFixed(2)} CHF)`)
                  .join(", ")}
              </p>
              <p className="sub-next-info">
                Nächste Schulden am:{" "}
                {new Date(sub.nextDueDate).toLocaleDateString("de-CH", {
                  month: "long",
                  year: "numeric",
                  day: "2-digit",
                })}
              </p>
              <p className="sub-next-info">
                Vorschau nächste Schulden:
                <br />
                {sub.participants
                  .map((p) => `• ${p.name}: ${p.share.toFixed(2)} CHF`)
                  .join(" | ")}
              </p>
              <div className="card-buttons">
                <button
                  className="btn"
                  onClick={() => navigate(`/edit-subscription/${sub._id}`)}
                >
                  Abo bearbeiten
                </button>
                <button
                  className="btn"
                  onClick={() => navigate(`/preview-subscription/${sub._id}`)}
                >
                  Vorschau anzeigen
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Letzte Schulden</h2>
        <div className="card debt-list">
          {recentDebts.map((debt, idx) => (
            <div className="entry-row" key={idx}>
              <span>{new Date(debt.date).toLocaleDateString("de-CH")}</span>
              <span>
                {debt.debtor} → {debt.creditor}
              </span>
              <span>
                {(debt.amount - (debt.paidAmount || 0)).toFixed(2)} CHF
                {debt.status === "partial" && (
                  <span className="status-badge status-teilweise">
                    TEILZAHLUNG
                  </span>
                )}
              </span>
              <span className="description">
                {debt.description}
                {!debt.isFromSubscription && " (Einmalig)"}
              </span>
              <span>
                {debt.status === "open" ? (
                  <button
                    className="btn"
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
                  <span className="status-badge status-bezahlt">BEZAHLT</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

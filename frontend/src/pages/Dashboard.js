// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import ChartSummary from "../components/ChartSummary";

function Dashboard() {
  const currentUser = "Jascha";
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  const [summary, setSummary] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [recentDebts, setRecentDebts] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [monthOptions, setMonthOptions] = useState([]);

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
            grouped[other].youGet += amountLeft;
          } else {
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
        .slice(0, 50);
      setRecentDebts(allDebts);

      const months = Array.from(
        new Set(
          allDebts.map((debt) => new Date(debt.date).toISOString().slice(0, 7))
        )
      ).sort((a, b) => b.localeCompare(a));
      setMonthOptions(months);

      const resSubs = await fetch(
        `${API}/api/subscriptions?user=${currentUser}`
      );
      const subs = await resSubs.json();
      setSubscriptions(subs);
    };

    fetchData();
  }, [API, currentUser]);

  const filteredDebts = recentDebts.filter((debt) => {
    if (selectedMonth) {
      const dateString = new Date(debt.date).toISOString().slice(0, 7);
      if (dateString !== selectedMonth) return false;
    }
    if (showOnlyOpen && debt.status !== "open") return false;
    if (
      searchText &&
      !(
        debt.debtor.toLowerCase().includes(searchText.toLowerCase()) ||
        debt.creditor.toLowerCase().includes(searchText.toLowerCase()) ||
        (debt.description &&
          debt.description.toLowerCase().includes(searchText.toLowerCase()))
      )
    ) {
      return false;
    }
    return true;
  });

  const filteredSummary = summary.filter((entry) =>
    entry.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchText.toLowerCase()) ||
      sub.participants.some((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      )
  );

  return (
    <div className="dashboard-container">
      <section className="filters">
        <input
          type="text"
          placeholder="Suche nach Name oder Abo"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </section>

      <section className="section">
        <ChartSummary
          youOwe={summary.reduce((sum, e) => sum + e.youOwe, 0)}
          youGet={summary.reduce((sum, e) => sum + e.youGet, 0)}
        />
      </section>

      <section className="section">
        <h2 className="section-title">Teilnehmerübersicht</h2>
        <div className="cards">
          {filteredSummary.map((entry) => (
            <div
              className="card participant-card clickable-card"
              key={entry.name}
              onClick={() => navigate(`/dashboard/${entry.name}`)}
            >
              <div className="card-header">
                <h3>{entry.name}</h3>
                <span
                  className={`status-badge ${
                    entry.net > 0
                      ? "status-offen"
                      : entry.net < 0
                      ? "status-schuldest"
                      : "status-bezahlt"
                  }`}
                >
                  {entry.net > 0
                    ? "offen"
                    : entry.net < 0
                    ? "du schuldest"
                    : "bezahlt"}
                </span>
              </div>
              <div className="amount-display">
                <span
                  className={`amount ${
                    entry.net > 0 ? "positive" : entry.net < 0 ? "negative" : ""
                  }`}
                >
                  {entry.net > 0
                    ? `+${entry.net.toFixed(2)} CHF`
                    : entry.net < 0
                    ? `-${Math.abs(entry.net).toFixed(2)} CHF`
                    : "0.00 CHF"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Eigene Abos</h2>
        <div className="cards">
          {filteredSubscriptions.map((sub) => (
            <div
              className="card subscription-card clickable-card"
              key={sub._id}
              onClick={() => navigate(`/subscription/${sub._id}`)}
            >
              <div className="card-header">
                <h3>{sub.name}</h3>
                {sub.isPaused ? (
                  <span className="status-badge status-warning">PAUSIERT</span>
                ) : (
                  <span className="status-badge status-active">AKTIV</span>
                )}
              </div>

              <p className="sub-meta">
                <span>{sub.participants.length} Teilnehmer</span>
                <br />
                <span>
                  Nächste Schulden:{" "}
                  {new Date(sub.nextDueDate).toLocaleDateString("de-CH", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
              <div className="amount-display sub-amount-display">
                {sub.amount.toFixed(2)} CHF
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Letzte Schulden</h2>
        <div className="debt-list-wrapper">
          <div className="card debt-list">
            {filteredDebts.map((debt, idx) => (
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
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

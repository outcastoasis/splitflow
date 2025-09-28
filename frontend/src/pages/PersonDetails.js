import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/PersonDetails.css";

function PersonDetails() {
  const currentUser = "Jascha";
  const { name } = useParams();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  const [debts, setDebts] = useState([]);
  const [paymentInputs, setPaymentInputs] = useState({});

  const fetchDebts = useCallback(async () => {
    const res = await fetch(`${API}/api/debts?user=${currentUser}`);
    const data = await res.json();
    const filtered = data.filter(
      (d) =>
        (d.creditor === name && d.debtor === currentUser) ||
        (d.debtor === name && d.creditor === currentUser)
    );
    setDebts(filtered);
  }, [API, currentUser, name]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handlePaymentChange = (id, value) => {
    setPaymentInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddPayment = async (debt) => {
    const amount = parseFloat(paymentInputs[debt._id]);
    if (!amount || amount <= 0) {
      alert("Bitte einen gültigen Betrag eingeben");
      return;
    }

    await fetch(`${API}/api/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        debtId: debt._id,
        amount,
        date: new Date(),
        paidBy: currentUser,
      }),
    });

    setPaymentInputs((prev) => ({ ...prev, [debt._id]: "" }));
    fetchDebts();
  };

  const total = debts.reduce((sum, d) => {
    const val = d.amount - (d.paidAmount || 0);
    if (d.status === "paid") return sum;
    return d.creditor === currentUser ? sum + val : sum - val;
  }, 0);

  const sortedDebts = [
    ...debts
      .filter((d) => d.status === "open")
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    ...debts
      .filter((d) => d.status === "paid")
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
  ];

  return (
    <div className="person-details-container">
      <div className="person-header">
        <h2>Details zu {name}</h2>
        <button onClick={() => navigate("/")}>← Zurück</button>
      </div>

      <p>
        <strong>Saldo:</strong> {total.toFixed(2)} CHF
      </p>

      {debts.length === 0 && <p>Keine Einträge gefunden.</p>}

      <div className="person-section">
        {sortedDebts.map((debt) => {
          const rest = (debt.amount - (debt.paidAmount || 0)).toFixed(2);
          const isIncoming = debt.creditor === currentUser;
          const arrow = isIncoming ? "➜" : "⬅";

          return (
            <div
              key={debt._id}
              className={`person-row ${isIncoming ? "incoming" : "outgoing"}`}
            >
              <div className="person-label">
                <span
                  className={`arrow-icon ${
                    isIncoming ? "arrow-in" : "arrow-out"
                  }`}
                >
                  {arrow}
                </span>
                {isIncoming ? "Du bekommst" : "Du schuldest"}{" "}
                {debt.amount.toFixed(2)} CHF
              </div>

              <div className="person-description">
                Beschreibung: <strong>{debt.description}</strong>
              </div>

              {debt.status !== "paid" ? (
                <>
                  <div className="person-open">
                    Noch offen: <strong>{rest} CHF</strong>
                  </div>
                  <div className="person-payment-form">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Betrag"
                      value={paymentInputs[debt._id] || ""}
                      onChange={(e) =>
                        handlePaymentChange(debt._id, e.target.value)
                      }
                    />
                    <button onClick={() => handleAddPayment(debt)}>
                      Zahlung erfassen
                    </button>
                  </div>
                </>
              ) : (
                <span className="person-status-badge">bezahlt</span>
              )}

              {debt.payments && debt.payments.length > 0 && (
                <div className="person-payment-history">
                  <strong>Historie:</strong>
                  <ul>
                    {debt.payments.map((p, i) => (
                      <li key={i}>
                        {new Date(p.date).toLocaleDateString("de-CH")} –{" "}
                        {p.amount.toFixed(2)} CHF
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PersonDetails;

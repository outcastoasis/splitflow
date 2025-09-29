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
  const [aboAmountToPay, setAboAmountToPay] = useState("");

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

  const handlePayAboDebts = async () => {
    const amount = parseFloat(aboAmountToPay);
    if (!amount || amount <= 0) {
      alert("Bitte gültigen Betrag eingeben");
      return;
    }

    try {
      const res = await fetch(`${API}/api/payments/abos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debtor: name,
          creditor: currentUser,
          amount,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(`Erfolgreich ${result.totalProcessed.toFixed(2)} CHF bezahlt.`);
        setAboAmountToPay("");
        fetchDebts();
      } else {
        alert(result.error || "Fehler bei Zahlung.");
      }
    } catch (err) {
      alert("Fehler bei Zahlung.");
      console.error(err);
    }
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

  const oneTimeDebts = sortedDebts.filter((d) => !d.isFromSubscription);
  const subscriptionDebts = sortedDebts.filter((d) => d.isFromSubscription);

  const openAboDebts = debts.filter(
    (d) =>
      d.debtor === name &&
      d.creditor === currentUser &&
      d.isFromSubscription &&
      d.status !== "paid"
  );

  const totalAboDebt = openAboDebts.reduce((sum, d) => {
    return sum + (d.amount - (d.paidAmount || 0));
  }, 0);

  const renderDebtRow = (debt) => {
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
            className={`arrow-icon ${isIncoming ? "arrow-in" : "arrow-out"}`}
          >
            {arrow}
          </span>
          {isIncoming ? "Du bekommst" : "Du schuldest"} {debt.amount.toFixed(2)}{" "}
          CHF
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
                onChange={(e) => handlePaymentChange(debt._id, e.target.value)}
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
  };

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
        {/* EINMALIGE SCHULDEN */}
        <h3 className="person-section-heading">Einmalige Schulden</h3>
        {oneTimeDebts.length === 0 && <p>Keine einmaligen Schulden.</p>}
        {oneTimeDebts.map((debt) => renderDebtRow(debt))}

        {/* ABO-SCHULDEN */}
        <h3 className="person-section-heading">Abo-Schulden</h3>

        {totalAboDebt > 0 && (
          <div className="abo-payment-block">
            <p>
              <strong>Offene Abo-Schulden:</strong> {totalAboDebt.toFixed(2)}{" "}
              CHF
            </p>
            <div className="person-payment-form">
              <input
                type="number"
                step="0.01"
                placeholder="Betrag für Abo-Schulden"
                value={aboAmountToPay}
                onChange={(e) => setAboAmountToPay(e.target.value)}
              />
              <button onClick={handlePayAboDebts}>
                Abo-Schulden begleichen
              </button>
            </div>
          </div>
        )}

        {subscriptionDebts.length === 0 && <p>Keine Abo-Schulden.</p>}
        {subscriptionDebts.map((debt) => renderDebtRow(debt))}
      </div>
    </div>
  );
}

export default PersonDetails;

// src/pages/PersonDetails.js
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
  const [copied, setCopied] = useState(false);

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

  // Saldo berechnen
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

  // einzelne Schuldenzeilen modern rendern
  const renderDebtRow = (debt) => {
    const rest = (debt.amount - (debt.paidAmount || 0)).toFixed(2);
    const isIncoming = debt.creditor === currentUser;

    return (
      <div
        key={debt._id}
        className={`debt-card ${isIncoming ? "positive" : "negative"}`}
      >
        <div className="debt-row">
          <div
            className={`debt-amount-large ${
              isIncoming ? "positive" : "negative"
            }`}
          >
            {debt.amount.toFixed(2)} CHF
          </div>

          <div className="debt-description">
            <span>Beschreibung:</span> <strong>{debt.description}</strong>
          </div>

          {debt.status !== "paid" ? (
            <>
              <div className="debt-rest">
                Noch offen: <strong>{rest} CHF</strong>
              </div>
              <div className="payment-input">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Betrag"
                  value={paymentInputs[debt._id] || ""}
                  onChange={(e) =>
                    handlePaymentChange(debt._id, e.target.value)
                  }
                />
                <button onClick={() => handleAddPayment(debt)}>Zahlen</button>
              </div>
            </>
          ) : (
            <span className="debt-paid">Bezahlt</span>
          )}

          {debt.payments && debt.payments.length > 0 && (
            <div className="history">
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
      </div>
    );
  };

  const handleCopySummary = () => {
    const now = new Date().toLocaleDateString("de-CH");
    const openDebts = debts.filter((d) => d.status !== "paid");
    const youOwe = openDebts.filter((d) => d.creditor === name);
    const theyOwe = openDebts.filter((d) => d.debtor === name);

    const lines = [];
    lines.push(`Schuldenübersicht mit ${name}`);
    lines.push(`Stand: ${now}\n`);

    if (youOwe.length > 0) {
      lines.push("Jascha schuldet dir:");
      youOwe.forEach((d) => {
        const rest = (d.amount - (d.paidAmount || 0)).toFixed(2);
        lines.push(
          `- ${rest} CHF für "${d.description}" (${new Date(
            d.date
          ).toLocaleDateString("de-CH")})`
        );
      });
      lines.push("");
    }

    if (theyOwe.length > 0) {
      lines.push("Du schuldest Jascha:");
      theyOwe.forEach((d) => {
        const rest = (d.amount - (d.paidAmount || 0)).toFixed(2);
        lines.push(
          `- ${rest} CHF für "${d.description}" (${new Date(
            d.date
          ).toLocaleDateString("de-CH")})`
        );
      });
      lines.push("");
    }

    const saldoText =
      total === 0
        ? "Saldo: Ausgeglichen"
        : `Saldo: ${total >= 0 ? "+" : "-"}${Math.abs(total).toFixed(2)} CHF`;
    lines.push(saldoText);

    navigator.clipboard.writeText(lines.join("\n"));

    // Setze Bestätigungsanzeige
    setCopied(true);
    setTimeout(() => setCopied(false), 2500); // nach 2.5 Sekunden ausblenden
  };

  return (
    <div className="person-details-container">
      <div className="details-header">
        <h2 className="no-autolink">{name}</h2>
        {copied && <div className="copy-toast">✔ Kopiert</div>}
        <div className="details-buttons">
          <button
            className="action-button copy-button"
            onClick={handleCopySummary}
            title="Übersicht kopieren"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 18H8V7h11v16z" />
            </svg>
          </button>
          <button
            className="action-button back-button"
            onClick={() => navigate("/")}
            title="Zurück"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`saldo-display ${total < 0 ? "negative" : "positive"}`}>
        {total >= 0 ? "+" : "-"}
        {Math.abs(total).toFixed(2)} CHF
      </div>

      {debts.length === 0 && (
        <p className="no-entries">Keine Einträge gefunden.</p>
      )}

      <h3 className="section-heading">Einmalige Schulden</h3>
      {oneTimeDebts.length === 0 ? (
        <p className="no-entries">Keine einmaligen Schulden.</p>
      ) : (
        oneTimeDebts.map((debt) => renderDebtRow(debt))
      )}

      <h3 className="section-heading">Abo-Schulden</h3>
      {totalAboDebt > 0 && (
        <div className="debt-card positive">
          <div className="debt-row">
            <div>
              <strong>Offene Abo-Schulden:</strong> {totalAboDebt.toFixed(2)}{" "}
              CHF
            </div>
            <div className="payment-input">
              <input
                type="number"
                step="0.01"
                placeholder="Betrag für Abo-Schulden"
                value={aboAmountToPay}
                onChange={(e) => setAboAmountToPay(e.target.value)}
              />
              <button onClick={handlePayAboDebts}>Zahlen</button>
            </div>
          </div>
        </div>
      )}
      {subscriptionDebts.length === 0 ? (
        <p className="no-entries">Keine Abo-Schulden.</p>
      ) : (
        subscriptionDebts.map((debt) => renderDebtRow(debt))
      )}
    </div>
  );
}

export default PersonDetails;

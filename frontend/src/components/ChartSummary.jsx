import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import "../styles/ChartSummary.css";

function ChartSummary({ youOwe, youGet }) {
  const saldo = youGet - youOwe;

  const data = [
    { name: "Ich schulde", value: youOwe },
    { name: "Mir schulden", value: youGet },
  ];

  const COLORS = ["#ef4444", "#22c55e"];

  return (
    <div className="chart-summary-container">
      <h2 className="section-title">Saldo Übersicht</h2>

      <PieChart width={260} height={260}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>

      <div className="saldo-label">
        <span className={saldo >= 0 ? "saldo-positive" : "saldo-negative"}>
          {saldo >= 0 ? "+" : "-"}
          {Math.abs(saldo).toFixed(2)} CHF
        </span>
      </div>

      <div className="basic-legend">
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: COLORS[1] }}
          ></span>
          <span>+{youGet.toFixed(2)} CHF</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: COLORS[0] }}
          ></span>
          <span>-{youOwe.toFixed(2)} CHF</span>
        </div>
      </div>
    </div>
  );
}

export default ChartSummary;

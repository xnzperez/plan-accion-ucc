import React from 'react';

function SummaryCard({ title, value, color }) {
  return (
    <div className="card">
      <h3 className="summary-card-title">{title}</h3>
      <p className={`summary-card-value ${color}`}>{value}</p>
    </div>
  );
}

export default SummaryCard;
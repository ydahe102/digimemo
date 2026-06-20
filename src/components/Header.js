import React from 'react';
import '../styles/App.css';

function Header({ best }) {
  return (
    <header className="dm-head">
      <div className="dm-head-in">
        <div>
          <p className="eyebrow">Sequence memory trainer</p>
          <h1 className="brand">Digimemo</h1>
        </div>
        {/* Keep the best score visible for users who want to beat it. */}
        <div className="best-chip">
          <span>Best</span>
          <strong>{best}</strong>
        </div>
      </div>
    </header>
  );
}

export default Header;

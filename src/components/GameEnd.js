import React from 'react';
import '../styles/GameEnd.css';

function GameEnd({ message, isRecord, score, best, round, rounds, onPlayAgain, onHome }) {
  return (
    <section className="card end" aria-labelledby="end-t" aria-describedby="end-summary">
      <p className="eyebrow">Session complete</p>
      <h2 id="end-t" className="end-title">{message}</h2>
      <p id="end-summary" className="end-summary">
        Choose Play again to start a new game with the same settings, or Home to return to the setup screen.
      </p>

      {isRecord && <div className="record">New personal best</div>}

      {/* Final stats are grouped so the end screen is easy to scan. */}
      <div className="stats" aria-label="Final game statistics">
        <div className="stat"><span className="lbl">Score</span><strong>{score}</strong></div>
        <div className="stat"><span className="lbl">Best</span><strong>{best}</strong></div>
        <div className="stat"><span className="lbl">Reached</span><strong>{Math.min(round, rounds)}/{rounds}</strong></div>
      </div>

      {/* User can replay right away or go home to change the settings. */}
      <div className="actions">
        <button className="start" type="button" onClick={onPlayAgain}>Play again</button>
        <button className="secondary-action" type="button" onClick={onHome}>Home</button>
      </div>
    </section>
  );
}

export default GameEnd;

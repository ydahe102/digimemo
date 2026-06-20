import React from 'react';
import { DIFF } from '../App';
import '../styles/GameSetup.css';

const THEMES = [
  { id: 'signal', name: 'Signal', desc: 'Amber light on deep pine' },
  { id: 'dusk',   name: 'Dusk',   desc: 'Soft rose on plum' },
  { id: 'mono',   name: 'Focus',  desc: 'High-contrast black & white' }
];

function GameSetup({ difficulty, setDifficulty, rounds, setRounds, theme, setTheme, muted, onToggleMute, onStart }) {
  return (
    <section className="card setup" aria-labelledby="su-t">
      <h2 id="su-t" className="setup-title">Train your recall.</h2>
      <p className="setup-sub">
        A sequence lights up on the keypad, one key at a time. When it stops,
        tap it back from memory. Clear a round and the sequence grows by one.
      </p>

      <fieldset className="block">
        <legend className="lbl">Difficulty</legend>
        <div className="grid3">
          {/* Difficulty changes the starting length and speed of the sequence. */}
          {Object.entries(DIFF).map(([id, d]) => (
            <button
              key={id}
              type="button"
              className={`pick ${difficulty === id ? 'on' : ''}`}
              aria-pressed={difficulty === id}
              onClick={() => setDifficulty(id)}
            >
              <span className="pick-name">{d.label}</span>
              <small>{d.desc}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="block">
        <legend className="lbl">Game length</legend>
        <div className="seg" role="group" aria-label="Rounds to win">
          {/* This lets the player pick a quick game or a longer challenge. */}
          {[4, 8, 12].map((r) => (
            <button
              key={r}
              type="button"
              className={rounds === r ? 'on' : ''}
              aria-pressed={rounds === r}
              onClick={() => setRounds(r)}
            >
              {r} rounds
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="block">
        <legend className="lbl">Theme</legend>
        <div className="grid3">
          {/* Themes change the visual style but not the game rules. */}
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`pick theme-pick ${theme === t.id ? 'on' : ''}`}
              aria-pressed={theme === t.id}
              onClick={() => setTheme(t.id)}
            >
              <span className={`swatch sw-${t.id}`} aria-hidden="true" />
              <span className="pick-name">{t.name}</span>
              <small>{t.desc}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="setup-foot">
        <label className="sound">
          <input type="checkbox" checked={!muted} onChange={onToggleMute} />
          <span>Sound {muted ? 'off' : 'on'}</span>
        </label>
        <button className="start" type="button" onClick={onStart}>Start game</button>
      </div>

      <p className="hint">
        Three lives. A wrong key costs a life and replays the same sequence.
        Use your keyboard digits or tap the keys.
      </p>
    </section>
  );
}

export default GameSetup;

import React from 'react';
import '../styles/GameBoard.css';

const KEYPAD = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, null];

function NumberPad({ lit, disabled, showing, onPress }) {
  return (
    <div className={`pad ${showing ? 'showing' : ''}`} role="group" aria-label="Keypad">
      {/* Null values are spacers so 0 sits in the middle like a real keypad. */}
      {KEYPAD.map((n, i) =>
        n === null ? (
          <span key={i} className="key spacer" aria-hidden="true" />
        ) : (
          <button
            key={i}
            type="button"
            className={`key ${lit === n ? 'lit' : ''}`}
            disabled={disabled}
            aria-label={`Number ${n}${lit === n ? ', highlighted' : ''}`}
            aria-pressed={lit === n}
            onClick={() => onPress(n)}
          >
            {n}
          </button>
        )
      )}
    </div>
  );
}

export default NumberPad;

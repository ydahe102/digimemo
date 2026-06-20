import React from 'react';
import NumberPad from './NumberPad';
import '../styles/GameBoard.css';

function GameBoard({
  difficultyLabel, round, rounds, score, message, tone,
  lives, sequence, input, lit, phase, muted,
  onPress, onHome, onToggleMute
}) {
  const progress = ((round - 1) / rounds) * 100;
  const isInputTurn = phase === 'input';
  // The helper text changes depending on whether the user is watching or answering.
  const phaseInstruction = isInputTurn
    ? `Enter ${sequence.length} numbers. You have entered ${input.length}.`
    : `Watch the keypad. The sequence has ${sequence.length} numbers.`;

  return (
    <section className="play" aria-labelledby="game-title" aria-describedby="game-help lives-text">
      <div className="topbar">
        <button className="ghost" type="button" onClick={onHome}>Home</button>
        <div className="meta" aria-label="Game status">
          <span className="chip">Level: {difficultyLabel}</span>
          <span className="chip">Round: {round} of {rounds}</span>
          <span className="chip score">Score: {score}</span>
        </div>
        <button
          className="ghost icon"
          type="button"
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          aria-pressed={muted}
          onClick={onToggleMute}
        >
          {muted ? 'Sound off' : 'Sound on'}
        </button>
      </div>

      <div className="track" aria-label={`Game progress: round ${round} of ${rounds}`}>
        <div className="track-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="game-copy">
        <h2 id="game-title">Memory round</h2>
        <p id="game-help">{phaseInstruction}</p>
      </div>

      <p className={`status ${tone}`} role="status" aria-live="polite">{message}</p>

      <div className="lives-panel" aria-live="polite">
        <p id="lives-text" className="lives-text">Lives left: {lives} of 3</p>
        {/* The circles are extra visual feedback; the text is the accessible version. */}
        <div className="lives" aria-hidden="true">
          {[0, 1, 2].map((i) => <span key={i} className={`pip ${i < lives ? '' : 'out'}`} />)}
        </div>
      </div>

      <div className="readout-wrap">
        <p className="readout-label">Your input: {input.length} of {sequence.length} numbers entered</p>
        {/* Empty slots show how much of the sequence is still left to enter. */}
        <div className="readout" aria-label={`Your input. ${input.length} of ${sequence.length} numbers entered.`}>
          {sequence.map((_, i) => (
            <span
              key={i}
              className={`slot ${input[i] !== undefined ? 'filled' : ''}`}
              aria-label={input[i] !== undefined ? `Position ${i + 1}: ${input[i]}` : `Position ${i + 1}: empty`}
            >
              {input[i] !== undefined ? input[i] : ''}
            </span>
          ))}
        </div>
      </div>

      <NumberPad
        lit={lit}
        disabled={!isInputTurn}
        showing={phase === 'showing'}
        onPress={onPress}
      />
    </section>
  );
}

export default GameBoard;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from './components/Header';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import GameEnd from './components/GameEnd';
import './styles/App.css';

export const DIFF = {
  beginner: { label: 'Beginner', start: 3, flash: 620, gap: 210, points: 10, desc: '3 steps, slow signal' },
  intermediate: { label: 'Intermediate', start: 4, flash: 470, gap: 160, points: 15, desc: '4 steps, quicker signal' },
  advanced: { label: 'Advanced', start: 5, flash: 350, gap: 120, points: 20, desc: '5 steps, fast signal' }
};

// These tones are used when the keypad lights up or the player taps a key.
const FREQS = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randDigit = () => Math.floor(Math.random() * 10);
const makeSeq = (n) => Array.from({ length: n }, randDigit);

function App() {
  const [screen, setScreen] = useState('setup');
  const [difficulty, setDifficulty] = useState('beginner');
  const [rounds, setRounds] = useState(4);
  const [theme, setTheme] = useState('signal');
  const [muted, setMuted] = useState(false);

  const [sequence, setSequence] = useState([]);
  const [input, setInput] = useState([]);
  const [phase, setPhase] = useState('idle');
  const [lit, setLit] = useState(null);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [isRecord, setIsRecord] = useState(false);
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState('neutral');

  const audioRef = useRef(null);
  const runId = useRef(0);

  // Save the best score so the user can come back later and still see it.
  useEffect(() => {
    const saved = localStorage.getItem('digimemo-best');
    if (saved) setBest(parseInt(saved, 10));
  }, []);

  // Create the browser audio context only when we actually need it.
  const ac = () => {
    if (!audioRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioRef.current = new Ctx();
    }
    return audioRef.current;
  };

  // Browsers do not let audio play until the user interacts with the page.
  const unlock = () => {
    const c = ac();
    if (c && c.state === 'suspended') c.resume();
  };

  // Plays the short sound effects for showing, tapping, and mistakes.
  const beep = useCallback((freq, kind = 'show') => {
    if (muted) return;
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    if (kind === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.value = 120;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      osc.start(t);
      osc.stop(t + 0.34);
      return;
    }

    osc.type = kind === 'tap' ? 'triangle' : 'sine';
    osc.frequency.value = freq;
    const peak = kind === 'tap' ? 0.2 : 0.16;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    osc.start(t);
    osc.stop(t + 0.3);
  }, [muted]);

  const chime = useCallback(() => {
    if (muted) return;
    [523.25, 659.25, 783.99].forEach((f, i) => setTimeout(() => beep(f, 'tap'), i * 70));
  }, [muted, beep]);

  // Plays the sequence first, then switches the game to the user's turn.
  const showSequence = useCallback(async (seq) => {
    const mine = ++runId.current;
    setPhase('showing');
    setInput([]);
    setLit(null);
    setTone('neutral');
    setMessage('Watch the highlighted keys. Memorize the order.');
    await sleep(680);

    const { flash, gap } = DIFF[difficulty];
    for (let i = 0; i < seq.length; i += 1) {
      if (runId.current !== mine) return;
      setLit(seq[i]);
      beep(FREQS[seq[i]], 'show');
      await sleep(flash);
      if (runId.current !== mine) return;
      setLit(null);
      await sleep(gap);
    }

    if (runId.current !== mine) return;
    setPhase('input');
    setMessage('Your turn. Enter the same sequence.');
  }, [difficulty, beep]);

  // Starts a new game using the selected level and resets the old score.
  const startGame = () => {
    unlock();
    const seq = makeSeq(DIFF[difficulty].start);
    setScore(0);
    setLives(3);
    setRound(1);
    setIsRecord(false);
    setSequence(seq);
    setScreen('play');
    showSequence(seq);
  };

  // Shows the ending screen with either a win message or a no-lives-left message.
  const endGame = (win, finalScore) => {
    runId.current += 1;
    setMessage(
      win
        ? `You completed all rounds. Final score: ${finalScore}.`
        : `No lives left. Game over at round ${round}. Final score: ${finalScore}.`
    );
    if (win) chime();
    else beep(0, 'error');
    setScreen('end');
  };

  // This is the Home button behavior. It stops the current round and returns to setup.
  const home = () => {
    runId.current += 1;
    setScreen('setup');
    setPhase('idle');
    setLit(null);
    setInput([]);
    setSequence([]);
    setMessage('');
  };

  // Checks each number the player enters against the current sequence.
  const press = (n) => {
    if (phase !== 'input') return;
    unlock();
    beep(FREQS[n], 'tap');
    setLit(n);
    setTimeout(() => setLit((current) => (current === n ? null : current)), 150);

    if (n !== sequence[input.length]) {
      const left = lives - 1;
      setLives(left);
      beep(0, 'error');
      if (left <= 0) {
        endGame(false, score);
        return;
      }
      setPhase('feedback');
      setTone('bad');
      setMessage(`Wrong key. You have ${left} ${left === 1 ? 'life' : 'lives'} left. Watch the sequence again.`);
      setTimeout(() => showSequence(sequence), 1150);
      return;
    }

    const next = [...input, n];
    setInput(next);
    if (next.length !== sequence.length) return;

    // The full sequence was correct, so score the round and add one more digit.
    const pts = DIFF[difficulty].points + sequence.length;
    const newScore = score + pts;
    setScore(newScore);
    if (newScore > best) {
      setBest(newScore);
      setIsRecord(true);
      localStorage.setItem('digimemo-best', String(newScore));
    }
    if (round >= rounds) {
      setPhase('feedback');
      endGame(true, newScore);
      return;
    }

    setRound((current) => current + 1);
    setPhase('feedback');
    setTone('good');
    chime();
    setMessage(`Correct. You earned ${pts} points. Next round starts now.`);
    const grown = [...sequence, randDigit()];
    setTimeout(() => {
      setSequence(grown);
      showSequence(grown);
    }, 1100);
  };

  // Let users play with keyboard numbers too, not only mouse/touch.
  useEffect(() => {
    const onKey = (e) => {
      if (screen !== 'play' || phase !== 'input') return;
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        press(parseInt(e.key, 10));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const toggleMute = () => {
    unlock();
    setMuted((current) => !current);
  };

  return (
    <div className={`dm theme-${theme}`}>
      <Header best={best} />

      <main className="dm-main">
        {screen === 'setup' && (
          <GameSetup
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            rounds={rounds}
            setRounds={setRounds}
            theme={theme}
            setTheme={setTheme}
            muted={muted}
            onToggleMute={toggleMute}
            onStart={startGame}
          />
        )}

        {screen === 'play' && (
          <GameBoard
            difficultyLabel={DIFF[difficulty].label}
            round={round}
            rounds={rounds}
            score={score}
            message={message}
            tone={tone}
            lives={lives}
            sequence={sequence}
            input={input}
            lit={lit}
            phase={phase}
            muted={muted}
            onPress={press}
            onHome={home}
            onToggleMute={toggleMute}
          />
        )}

        {screen === 'end' && (
          <GameEnd
            message={message}
            isRecord={isRecord}
            score={score}
            best={best}
            round={round}
            rounds={rounds}
            onPlayAgain={startGame}
            onHome={home}
          />
        )}
      </main>

      <footer className="dm-foot">Repeat the signal. Grow the sequence. Train your memory.</footer>
    </div>
  );
}

export default App;

// chessboard.jsx — board rendering, position data, arrows. Mocked, no real engine.

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const GLYPH = { K: '\u265A', Q: '\u265B', R: '\u265C', B: '\u265D', N: '\u265E', P: '\u265F' };
const PIECE_NAME = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' };

function fenToPos(fen) {
  const rows = fen.split(' ')[0].split('/');
  const pos = {};
  rows.forEach((row, ri) => {
    const rank = 8 - ri;
    let fi = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) { fi += +ch; }
      else {
        const color = ch === ch.toUpperCase() ? 'w' : 'b';
        pos[FILES[fi] + rank] = color + ch.toUpperCase();
        fi++;
      }
    }
  });
  return pos;
}

const STD_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
// Scan flow position: a busy Giuoco Piano (Italian) middlegame, White to move. Best = d4 break.
const SCAN_FEN = 'r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2PP1N1P/PP3PP1/RNBQR1K1';
// Onboarding hero: Kasparov–Topalov, Wijk aan Zee 1999, before 24.Rxd4 (the immortal rook sacrifice)
const KT99_FEN = 'b2r3r/k4p1p/p2q1np1/NppP4/3p1Q2/P4PPB/1PP4P/1K1RR3';

// Mock multi-PV (top 3 engine lines) for the scanned position (White to move).
// Engine variation lines for a scanned position (played from SCAN_FEN). Each line is a
// sequence of plies (from/to so the board can be stepped through). Line 0 = engine best.
const POSITION_LINES = [
  { evalCp: 40, badge: 'best', plies: [
    { from: 'd3', to: 'd4', san: 'd4' }, { from: 'e5', to: 'd4', san: 'exd4' },
    { from: 'c3', to: 'd4', san: 'cxd4' }, { from: 'c5', to: 'b6', san: 'Bb6' },
    { from: 'b1', to: 'c3', san: 'Nc3' }, { from: 'f8', to: 'e8', san: 'Re8' },
    { from: 'c4', to: 'b3', san: 'Bb3' }, { from: 'c6', to: 'e7', san: 'Ne7' },
  ] },
  { evalCp: 20, plies: [
    { from: 'b1', to: 'd2', san: 'Nbd2' }, { from: 'c8', to: 'e6', san: 'Be6' },
    { from: 'c4', to: 'b3', san: 'Bb3' }, { from: 'f8', to: 'e8', san: 'Re8' },
    { from: 'd1', to: 'e2', san: 'Qe2' }, { from: 'h7', to: 'h6', san: 'h6' },
    { from: 'a2', to: 'a4', san: 'a4' }, { from: 'c6', to: 'e7', san: 'Ne7' },
  ] },
  { evalCp: 10, plies: [
    { from: 'a2', to: 'a4', san: 'a4' }, { from: 'a6', to: 'a5', san: 'a5' },
    { from: 'b1', to: 'd2', san: 'Nbd2' }, { from: 'c8', to: 'e6', san: 'Be6' },
    { from: 'c4', to: 'b3', san: 'Bb3' }, { from: 'f8', to: 'e8', san: 'Re8' },
    { from: 'g1', to: 'h1', san: 'Kh1' }, { from: 'f6', to: 'h5', san: 'Nh5' },
  ] },
];

function applyMove(pos, m) {
  const np = { ...pos };
  np[m.to] = np[m.from];
  delete np[m.from];
  if (m.rook) { np[m.rook[1]] = np[m.rook[0]]; delete np[m.rook[0]]; }
  return np;
}

// ── Reviewed game: an Italian where White's 2nd move (d3) is a small inaccuracy ──
const GAME_PLIES = [
  { from: 'e2', to: 'e4', san: 'e4', name: 'Pawn to e4', color: 'w', evalCp: 30 },
  { from: 'e7', to: 'e5', san: 'e5', name: 'Pawn to e5', color: 'b', evalCp: 20 },
  {
    from: 'd2', to: 'd3', san: 'd3', name: 'Pawn to d3', color: 'w', evalCp: -10,
    inaccuracy: true, quality: 'mistake',
    better: { from: 'g1', to: 'f3', san: 'Nf3', name: 'Knight to f3',
      why: 'develops a piece and attacks the e5 pawn.' },
  },
  { from: 'g8', to: 'f6', san: 'Nf6', name: 'Knight to f6', color: 'b', evalCp: -20 },
  { from: 'g1', to: 'f3', san: 'Nf3', name: 'Knight to f3', color: 'w', evalCp: 0, quality: 'best' },
  { from: 'b8', to: 'c6', san: 'Nc6', name: 'Knight to c6', color: 'b', evalCp: 0 },
  { from: 'f1', to: 'e2', san: 'Be2', name: 'Bishop to e2', color: 'w', evalCp: -10 },
  { from: 'f8', to: 'c5', san: 'Bc5', name: 'Bishop to c5', color: 'b', evalCp: -20, quality: 'inaccuracy' },
  { from: 'e1', to: 'g1', san: 'O-O', name: 'Castles kingside', color: 'w', evalCp: 0, rook: ['h1', 'f1'] },
  { from: 'e8', to: 'g8', san: 'O-O', name: 'Castles kingside', color: 'b', evalCp: 0, rook: ['h8', 'f8'] },
];

function buildGamePositions() {
  const out = [fenToPos(STD_FEN)];
  let cur = out[0];
  for (const m of GAME_PLIES) { cur = applyMove(cur, m); out.push(cur); }
  return out;
}
const GAME_POSITIONS = buildGamePositions();

// Engine alternative lines (full games from the start) for the score-sheet review.
const SHEET_ALT_LINES = [
  { evalCp: 35, plies: [
    { from: 'd2', to: 'd4', san: 'd4' }, { from: 'd7', to: 'd5', san: 'd5' },
    { from: 'c2', to: 'c4', san: 'c4' }, { from: 'e7', to: 'e6', san: 'e6' },
    { from: 'b1', to: 'c3', san: 'Nc3' }, { from: 'g8', to: 'f6', san: 'Nf6' },
    { from: 'c1', to: 'g5', san: 'Bg5' }, { from: 'f8', to: 'e7', san: 'Be7' },
  ] },
  { evalCp: 20, plies: [
    { from: 'c2', to: 'c4', san: 'c4' }, { from: 'e7', to: 'e5', san: 'e5' },
    { from: 'b1', to: 'c3', san: 'Nc3' }, { from: 'g8', to: 'f6', san: 'Nf6' },
    { from: 'g1', to: 'f3', san: 'Nf3' }, { from: 'b8', to: 'c6', san: 'Nc6' },
    { from: 'g2', to: 'g3', san: 'g3' }, { from: 'f8', to: 'b4', san: 'Bb4' },
  ] },
];

// Build the 3 multi-PV lines for a mode. Position: all engine. Sheet: line 1 = real game.
function buildLines(mode) {
  if (mode === 'sheet') {
    return [
      { evalCp: 0, badge: 'yourgame', plies: GAME_PLIES },
      SHEET_ALT_LINES[0], SHEET_ALT_LINES[1],
    ];
  }
  return POSITION_LINES;
}

function startPosFor(mode) {
  return mode === 'sheet' ? fenToPos(STD_FEN) : fenToPos(SCAN_FEN);
}

// Fold plies onto a starting position; returns array of length plies.length + 1.
function computeLinePositions(startPos, plies) {
  const out = [startPos];
  let cur = startPos;
  for (const m of plies) { cur = applyMove(cur, m); out.push(cur); }
  return out;
}

// Saved games library (mock). type: 'P' position scan, 'S' score-sheet scan.
const SAVED_GAMES = [
  { id: 'g1', type: 'S', title: 'Tuesday Rapid vs M. Reyes', event: 'Club Ladder', white: 'You', black: 'M. Reyes',
    result: '1\u20130', dateSaved: 5, dateSavedLabel: 'Jun 2', datePlayed: 'Mar 14', scope: 'review' },
  { id: 'g2', type: 'P', title: 'Italian, Giuoco Piano', event: 'Position scan', white: '\u2014', black: '\u2014',
    result: '\u2014', dateSaved: 4, dateSavedLabel: 'Jun 1', datePlayed: '\u2014', scope: 'analysis' },
  { id: 'g3', type: 'S', title: 'Saturday Open, round 3', event: 'Saturday Open', white: 'A. Novak', black: 'You',
    result: '\u00bd\u2013\u00bd', dateSaved: 3, dateSavedLabel: 'May 28', datePlayed: 'Feb 28', scope: 'review' },
  { id: 'g4', type: 'P', title: 'Endgame study', event: 'Position scan', white: '\u2014', black: '\u2014',
    result: '\u2014', dateSaved: 2, dateSavedLabel: 'May 20', datePlayed: '\u2014', scope: 'analysis' },
];
function savedBoard(g) {
  if (g.id === 'g1') return { pos: GAME_POSITIONS[10] };
  if (g.id === 'g2') return { pos: fenToPos(SCAN_FEN), arrow: ['d3', 'd4'] };
  if (g.id === 'g3') return { pos: GAME_POSITIONS[6] };
  return { pos: fenToPos('r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/3P1N2/PPP2PPP/RNBQ1RK1') };
}

// ── Square geometry helpers (white's view: rank 8 top, a-file left) ──
function squareXY(sq, sz) {
  const file = FILES.indexOf(sq[0]);
  const rank = parseInt(sq[1], 10);
  const s = sz / 8;
  return { x: (file + 0.5) * s, y: (8 - rank + 0.5) * s };
}

function Arrows({ size, arrows }) {
  if (!arrows || !arrows.length) return null;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      <defs>
        <filter id="arrowGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {arrows.map((a, i) => {
        const from = squareXY(a.from, size);
        const to = squareXY(a.to, size);
        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.hypot(dx, dy);
        const ux = dx / len, uy = dy / len;
        const w = a.width || size * 0.026;
        const head = w * 2.6;
        // shorten tail & tip so the arrowhead sits cleanly on the square
        const sx = from.x + ux * (size / 8) * 0.34;
        const sy = from.y + uy * (size / 8) * 0.34;
        const ex = to.x - ux * head * 0.9;
        const ey = to.y - uy * head * 0.9;
        const px = -uy, py = ux;
        const tip = `${to.x - ux * head * 0.1},${to.y - uy * head * 0.1}`;
        const b1 = `${ex + px * head * 0.62},${ey + py * head * 0.62}`;
        const b2 = `${ex - px * head * 0.62},${ey - py * head * 0.62}`;
        const color = a.color || '#5C7A6B';
        return (
          <g key={i} opacity={a.opacity != null ? a.opacity : 0.9}
            filter={a.glow ? 'url(#arrowGlow)' : undefined}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color}
              strokeWidth={w} strokeLinecap="round"
              strokeDasharray={a.dashed ? `${w * 1.4} ${w * 1.4}` : undefined} />
            <polygon points={`${tip} ${b1} ${b2}`} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

function Board({ position, size = 320, arrows, onSquareClick, selected, highlight, lastMove, dark }) {
  const s = size / 8;
  const squares = [];
  for (let r = 8; r >= 1; r--) {
    for (let f = 0; f < 8; f++) {
      const sq = FILES[f] + r;
      const isLight = (f + r) % 2 === 1;
      const piece = position[sq];
      const isSel = selected === sq;
      const isHl = highlight && highlight.includes(sq);
      const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
      squares.push(
        <div key={sq}
          onClick={onSquareClick ? () => onSquareClick(sq) : undefined}
          style={{
            position: 'relative',
            background: isLight ? '#E8DDC8' : '#A88B6C',
            cursor: onSquareClick ? 'pointer' : 'default',
          }}>
          {isLast && <div style={{ position: 'absolute', inset: 0, background: '#5C7A6B', opacity: 0.16 }} />}
          {isHl && <div style={{ position: 'absolute', inset: 0, background: '#D4A24A', opacity: 0.28 }} />}
          {isSel && <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 3px #5C7A6B' }} />}
          {f === 0 && (
            <span style={{ position: 'absolute', top: 2, left: 3, fontSize: s * 0.2, fontWeight: 600,
              color: isLight ? '#A88B6C' : '#E8DDC8', opacity: .9 }}>{r}</span>
          )}
          {r === 1 && (
            <span style={{ position: 'absolute', bottom: 1, right: 3, fontSize: s * 0.2, fontWeight: 600,
              color: isLight ? '#A88B6C' : '#E8DDC8', opacity: .9 }}>{FILES[f]}</span>
          )}
          {piece && (
            <div className={'piece piece-' + piece[0]}
              style={{ position: 'absolute', inset: 0, fontSize: s * 0.78 }}>
              {GLYPH[piece[1]]}
            </div>
          )}
        </div>
      );
    }
  }
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: 8, overflow: 'hidden',
      boxShadow: dark ? '0 6px 22px rgba(0,0,0,.5)' : '0 6px 22px rgba(80,60,30,.18)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(8, ${s}px)`,
        gridTemplateRows: `repeat(8, ${s}px)`, width: size, height: size }}>
        {squares}
      </div>
      <Arrows size={size} arrows={arrows} />
    </div>
  );
}

// Compact eval formatter: +0.4 / -1.2 / 0.0
function fmtCp(cp) {
  const v = Math.abs(cp / 100).toFixed(1);
  if (cp > 0) return '+' + v;
  if (cp < 0) return '\u2212' + v;
  return '0.0';
}

// Vertical evaluation bar (no numbers). Sage fills from the bottom = White's share.
function EvalBar({ cp, scoreMate, height = 320 }) {
  let whitePct;
  if (scoreMate !== undefined && scoreMate !== null) whitePct = scoreMate > 0 ? 100 : 0;
  else whitePct = (1 / (1 + Math.exp(-cp / 350))) * 100;
  return (
    <div className="relative w-4 rounded-md overflow-hidden bg-[#E7DECC] dark:bg-[#2b2a26] border border-[#cdbf9f] dark:border-[#3a3833]"
      style={{ height }} aria-hidden="true">
      <div className="absolute bottom-0 left-0 w-full bg-sage transition-all duration-300 ease-out"
        style={{ height: whitePct + '%' }} />
      <div className="absolute left-0 w-full h-px bg-black/25 dark:bg-white/20" style={{ top: '50%' }} />
    </div>
  );
}

Object.assign(window, {
  FILES, GLYPH, PIECE_NAME, fenToPos, applyMove, squareXY,
  STD_FEN, SCAN_FEN, KT99_FEN, POSITION_LINES, SHEET_ALT_LINES,
  buildLines, startPosFor, computeLinePositions,
  SAVED_GAMES, savedBoard, fmtCp,
  GAME_PLIES, GAME_POSITIONS,
  Board, Arrows, EvalBar,
});

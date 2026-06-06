// screens-camera.jsx — Camera (board + sheet capture) and Confirm position.

const { useState, useRef, useEffect } = React;

// ── Draggable quadrilateral overlay ──
function CornerOverlay({ corners, setCorners, color = '#5C7A6B' }) {
  const ref = useRef(null);
  const order = ['tl', 'tr', 'br', 'bl'];
  const poly = order.map(k => `${corners[k].x},${corners[k].y}`).join(' ');

  function onDrag(key, e) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const r = ref.current.getBoundingClientRect();
      const x = Math.max(8, Math.min(r.width - 8, ev.clientX - r.left));
      const y = Math.max(8, Math.min(r.height - 8, ev.clientY - r.top));
      setCorners(c => ({ ...c, [key]: { x, y } }));
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  return (
    <div ref={ref} className="absolute inset-0">
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="quadMask">
            <rect width="100%" height="100%" fill="white" />
            <polygon points={poly} fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(8,9,11,.62)" mask="url(#quadMask)" />
        <polygon points={poly} fill="none" stroke={color} strokeWidth="2.5" />
        {order.map(k => {
          const c = corners[k];
          const len = 16;
          const dirs = { tl: [1, 1], tr: [-1, 1], br: [-1, -1], bl: [1, -1] };
          const [dx, dy] = dirs[k];
          return (
            <g key={k} stroke={color} strokeWidth="3.5" strokeLinecap="round">
              <line x1={c.x} y1={c.y} x2={c.x + dx * len} y2={c.y} />
              <line x1={c.x} y1={c.y} x2={c.x} y2={c.y + dy * len} />
            </g>
          );
        })}
      </svg>
      {order.map(k => (
        <div key={k} onPointerDown={(e) => onDrag(k, e)}
          className="absolute w-11 h-11 -ml-[22px] -mt-[22px] touch-none cursor-grab active:cursor-grabbing"
          style={{ left: corners[k].x, top: corners[k].y }}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/95 shadow-[0_2px_6px_rgba(0,0,0,.4)] border-2" style={{ borderColor: color }} />
        </div>
      ))}
    </div>
  );
}

function CameraScreen({ dark, toggleDark, mode, go }) {
  const isSheet = mode === 'sheet';
  const [corners, setCorners] = useState(
    isSheet
      ? { tl: { x: 70, y: 250 }, tr: { x: 320, y: 250 }, br: { x: 320, y: 560 }, bl: { x: 70, y: 560 } }
      : { tl: { x: 64, y: 300 }, tr: { x: 330, y: 300 }, br: { x: 356, y: 545 }, bl: { x: 38, y: 545 } }
  );

  const sheetRows = [['1', 'e4', 'e5'], ['2', 'd3', 'Nf6'], ['3', 'Nf3', 'Nc6'], ['4', 'Be2', 'Bc5'], ['5', 'O-O', 'O-O']];

  return (
    <div className="h-full w-full relative bg-[#0c0d0f] overflow-hidden select-none">
      {/* faux camera scene */}
      <div className="absolute inset-0 flex items-center justify-center"
        style={{ background: 'radial-gradient(120% 90% at 50% 38%, #2b2622 0%, #161311 55%, #0c0a09 100%)' }}>
        {isSheet ? (
          <div style={{ transform: 'rotate(-4deg)', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.6))' }}
            className="w-[250px] bg-[#F5F1E7] rounded-[6px] overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-[12px] tracking-wide text-[#9a8e74] font-semibold uppercase">Game record</div>
            {sheetRows.map((r, i) => (
              <div key={i} className="grid grid-cols-[28px_1fr_1fr] items-baseline px-5 py-1.5 border-t border-dashed border-[#dccfb4]">
                <span className="text-[13px] text-[#aa9c80]">{r[0]}.</span>
                <span className="font-hand text-[26px] text-[#2c2a24]">{r[1]}</span>
                <span className="font-hand text-[26px] text-[#2c2a24]">{r[2]}</span>
              </div>
            ))}
            <div className="h-6" />
          </div>
        ) : (
          <div style={{ transform: 'perspective(820px) rotateX(40deg) rotateZ(-9deg)', filter: 'drop-shadow(0 34px 36px rgba(0,0,0,.6))' }}>
            <Board position={fenToPos(SCAN_FEN)} size={300} />
          </div>
        )}
      </div>

      <CornerOverlay corners={corners} setCorners={setCorners} />

      {/* top banner hint */}
      <div className="absolute left-0 right-0 flex flex-col items-center px-4" style={{ top: SAFE_TOP - 6 }}>
        <div className="flex items-center justify-between w-full">
          <IconButton name="x" label="Close" onClick={() => go('home')} className="text-white bg-black/30 backdrop-blur-sm" />
          <SettingsButton go={go} variant="overlay" />
        </div>
        <div className="mt-3 px-4 py-2 rounded-full bg-black/45 backdrop-blur-sm text-white text-[14px] font-medium text-center max-w-[300px]">
          {isSheet ? 'Drag the corners to frame the score sheet.' : 'Drag the corners to match the board edges.'}
        </div>
      </div>

      {/* capture */}
      <div className="absolute left-0 right-0 flex flex-col items-center gap-4 px-7" style={{ bottom: SAFE_BOTTOM + 8 }}>
        <button onClick={() => go(isSheet ? 'confirmSheet' : 'confirmPos')}
          className="w-[76px] h-[76px] rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform shadow-[0_6px_24px_rgba(0,0,0,.4)]"
          aria-label="Capture">
          <div className="w-[62px] h-[62px] rounded-full bg-white border-[3px] border-[#0c0d0f] flex items-center justify-center text-[#0c0d0f]">
            <Icon name="camera" size={26} strokeWidth={1.75} />
          </div>
        </button>
        <div className="text-white/70 text-[13px]">Hold steady and capture</div>
      </div>
    </div>
  );
}

// ── Confirm position (screen 5) ──
const PALETTE = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];

function Segmented({ value, onChange, options }) {
  return (
    <div className="flex p-1 rounded-2xl bg-[#EFE9DE] dark:bg-[#23262b] gap-1">
      {options.map(o => {
        const active = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            className={'flex-1 min-h-[44px] rounded-xl flex items-center justify-center gap-2 text-[15px] font-semibold transition-all duration-200 ' +
              (active ? 'bg-white dark:bg-[#33373d] text-[#1A1A1A] dark:text-[#ECECEC] shadow-[0_1px_4px_rgba(0,0,0,.1)]'
                : 'text-[#6B6B6B] dark:text-[#9C9C9C]')}>
            <span className={'w-3.5 h-3.5 rounded-full border ' + (o.value === 'w' ? 'bg-white border-[#c9bfa9]' : 'bg-[#2A2620] border-[#2A2620]')} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const SIZE = 300, CELL = SIZE / 8;

function ConfirmPositionScreen({ dark, toggleDark, go }) {
  const [pos, setPos] = useState(() => fenToPos(SCAN_FEN));
  const [sel, setSel] = useState(null);
  const [turn, setTurn] = useState('w');
  const [sheet, setSheet] = useState(false);
  const [drag, setDrag] = useState(null); // {piece, from, x, y, moved}
  const wrapRef = useRef(null);
  const dragRef = useRef(null);

  function local(e) {
    const r = wrapRef.current.getBoundingClientRect();
    const sc = r.width / SIZE;
    const x = (e.clientX - r.left) / sc, y = (e.clientY - r.top) / sc;
    return { x, y, inside: x >= 0 && x <= SIZE && y >= 0 && y <= SIZE };
  }
  function sqAt(l) {
    if (!l.inside) return null;
    const col = Math.min(7, Math.max(0, Math.floor(l.x / CELL)));
    const row = Math.min(7, Math.max(0, Math.floor(l.y / CELL)));
    return FILES[col] + (8 - row);
  }
  function beginDrag(piece, from, e) {
    const l = local(e);
    const d = { piece, from, x: l.x, y: l.y, moved: false };
    dragRef.current = d; setDrag(d);
    const move = (ev) => {
      const ll = local(ev);
      const cur = dragRef.current; if (!cur) return;
      const moved = cur.moved || Math.abs(ll.x - cur.x) > 6 || Math.abs(ll.y - cur.y) > 6 || from === null;
      const nd = { ...cur, x: ll.x, y: ll.y, moved };
      dragRef.current = nd; setDrag(nd);
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const cur = dragRef.current; dragRef.current = null; setDrag(null);
      const target = sqAt(local(ev));
      if (!cur) return;
      if (from === null) {
        if (!cur.moved) { // tap on palette → place on selected square (fallback)
          if (sel) applyEdit(sel, piece); else setSheet(true);
        } else if (target) applyEdit(target, piece);
      } else { // dragging an existing piece
        if (!cur.moved) { setSel(s => s === from ? null : from); setSheet(true); }
        else if (!target) applyEdit(from, 'x'); // dropped off-board → remove
        else if (target !== from) { applyEdit(from, 'x'); applyEdit(target, pos[from]); }
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
  function applyEdit(sq, piece) {
    setPos(p => { const np = { ...p }; if (piece === 'x' || !piece) delete np[sq]; else np[sq] = piece; return np; });
  }

  const dragGlyph = drag && (
    <div className="absolute pointer-events-none z-30" style={{ left: drag.x, top: drag.y, transform: 'translate(-50%,-50%)' }}>
      <div className={'piece piece-' + drag.piece[0]} style={{ fontSize: CELL * 0.82, width: CELL, height: CELL, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,.4))' }}>{GLYPH[drag.piece[1]]}</div>
    </div>
  );

  return (
    <div className={'h-full w-full flex flex-col ' + T.bg}>
      <div className="flex items-center justify-between px-2" style={{ paddingTop: SAFE_TOP }}>
        <TextLink onClick={() => go('camera', { mode: 'board' })} className="px-2"><Icon name="chevronLeft" size={18} strokeWidth={1.75} /> Retake</TextLink>
        <div className={'text-[16px] font-semibold ' + T.ink}>Check the position</div>
        <SettingsButton go={go} />
      </div>

      <div className="flex-1 overflow-y-auto no-sb px-6 pt-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-[8px] overflow-hidden border border-[#ECE6DC] dark:border-[#2A2D31]">
            <Board position={pos} size={56} />
          </div>
          <div>
            <div className={'text-[13px] font-semibold ' + T.ink}>From your photo</div>
            <div className={'text-[13px] ' + T.sub}>Got it. Drag a piece to fix it, or tap a square.</div>
          </div>
        </div>

        <div className="flex justify-center">
          <div ref={wrapRef} className="relative" style={{ width: SIZE, height: SIZE, touchAction: 'none' }}>
            <Board position={pos} size={SIZE} selected={sel} dark={dark} />
            <div className="absolute inset-0 z-20" style={{ touchAction: 'none' }}
              onPointerDown={(e) => { const sq = sqAt(local(e)); if (!sq) return; if (pos[sq]) beginDrag(pos[sq], sq, e); else { setSel(s => s === sq ? null : sq); setSheet(true); } }} />
            {dragGlyph}
          </div>
        </div>

        <div className="mt-5">
          <Segmented value={turn} onChange={setTurn}
            options={[{ value: 'w', label: 'White to move' }, { value: 'b', label: 'Black to move' }]} />
        </div>
        <div className="h-3" />
      </div>

      {/* bottom sheet: piece palette + analyze */}
      <div className="px-6 border-t border-[#ECE6DC] dark:border-[#2A2D31] bg-[#FAF7F2] dark:bg-[#16181B]"
        style={{ paddingBottom: SAFE_BOTTOM + 10, paddingTop: 10 }}>
        <button onClick={() => setSheet(s => !s)} className="w-full flex flex-col items-center gap-1.5 pb-1.5">
          <span className="w-9 h-1 rounded-full bg-[#D8CFC0] dark:bg-[#33373c]" />
          <span className={'text-[13px] font-medium flex items-center gap-1 ' + T.sub}>
            {sel ? <>Placing on <span className="font-semibold text-sage uppercase">{sel}</span></> : 'Drag a piece onto the board'}
            <Icon name="chevronDown" size={15} className={'transition-transform ' + (sheet ? 'rotate-180' : '')} />
          </span>
        </button>
        {sheet && (
          <div className="anim-fadein grid grid-cols-7 gap-1.5 mb-3" style={{ touchAction: 'none' }}>
            {PALETTE.map(pc => (
              <div key={pc} onPointerDown={(e) => beginDrag(pc, null, e)}
                className="aspect-square rounded-xl bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] flex items-center justify-center active:scale-95 transition-transform cursor-grab"
                style={{ touchAction: 'none' }}>
                <div className={'piece piece-' + pc[0]} style={{ fontSize: 24, width: '100%', height: '100%' }}>{GLYPH[pc[1]]}</div>
              </div>
            ))}
            <div onPointerDown={(e) => beginDrag('x', null, e)}
              className="aspect-square rounded-xl bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] flex items-center justify-center text-[#6B6B6B] dark:text-[#9C9C9C] active:scale-95 transition-transform cursor-grab"
              style={{ touchAction: 'none' }}>
              <Icon name="eraser" size={20} />
            </div>
          </div>
        )}
        <PrimaryButton onClick={() => go('gameReview', { mode: 'position' })} icon="search">Analyze</PrimaryButton>
      </div>
    </div>
  );
}

Object.assign(window, { CameraScreen, ConfirmPositionScreen, Segmented });

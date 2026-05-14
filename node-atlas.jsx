// Node Atlas — fullscreen interactive network map.
// Native DOM event listeners for pointer handling (no React synthetic events).
// Satellite nodes auto-generated from data — add to data.js, node appears automatically.

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA, useMemo: useMemoA } = React;

const HUB_COLOR = {
  research:     'var(--accent)',
  publications: 'var(--accent-2)',
  blog:         'var(--blue)',
  labs:         'var(--green)',
  teaching:     'var(--violet)',
  talks:        'var(--accent)',
  cv:           'var(--fg)'
};

const HUB_LABEL_NICE = {
  research:     'RESEARCH',
  publications: 'PUBLICATIONS',
  blog:         'BLOG',
  labs:         'LABS',
  teaching:     'TEACH',
  talks:        'TALKS',
  cv:           'CV'
};

// Route for clicking a satellite node
const SAT_ROUTE = {
  research:     (s) => ({ page: 'research-detail', id: s.id }),
  blog:         (s) => ({ page: 'blog-detail',     id: s.id }),
  labs:         (s) => ({ page: 'lab-detail',      id: s.id }),
  publications: ()  => ({ page: 'publications' }),
  teaching:     ()  => ({ page: 'teaching' }),
  talks:        ()  => ({ page: 'talks' }),
  cv:           ()  => ({ page: 'cv' })
};

// Build satellite items from portfolio data
// Adding a new item to data.js automatically creates a new node
function buildSats(data) {
  return {
    publications: (data.publications || []).map(p => ({
      id:    String(p.year) + (p.title || '').slice(0, 8).replace(/\s/g,''),
      label: p.title || '',
      sub:   (p.venue || '') + (p.year ? ' · ' + p.year : ''),
      extra: (p.authors || []).join(', '),
      kind:  'Paper'
    })),
    research: (data.research || []).map(r => ({
      id:    r.id,
      label: r.title || '',
      sub:   (r.year || '') + ' · ' + (r.status || ''),
      extra: (r.tags || []).join(', '),
      kind:  'Project',
      tags:  r.tags || []
    })),
    blog: (data.blog || []).map(b => ({
      id:    b.id,
      label: b.title || '',
      sub:   b.date || '',
      extra: b.excerpt || '',
      kind:  'Post',
      tags:  b.tag ? [b.tag] : []
    })),
    labs: (data.labs || []).map(l => ({
      id:    l.id,
      label: l.title || '',
      sub:   (l.time || '') + ' · ' + (l.diff === 'beg' ? 'Beginner' : l.diff === 'int' ? 'Intermediate' : 'Advanced'),
      extra: 'Tools: ' + (l.tools || []).join(', '),
      kind:  'Lab',
      tags:  l.tools || []
    })),
    teaching: (data.teaching || []).map(t => ({
      id:    (t.code || '') + (t.term || ''),
      label: (t.code || '') + ' — ' + (t.title || ''),
      sub:   (t.term || '') + (t.eval ? ' · ' + t.eval : ''),
      extra: (t.role || '') + ' · ' + (t.enr || ''),
      kind:  'Course'
    })),
    talks: (data.talks || []).map(t => ({
      id:    (t.where || '') + (t.date || ''),
      label: t.title || '',
      sub:   (t.where || '') + ' · ' + (t.date || ''),
      extra: (t.loc || '') + ' · ' + (t.kind || ''),
      kind:  'Talk'
    })),
    cv: []
  };
}

// Dialogue card shown on satellite hover
function SatDialogue({ hover, pan, size, isDraggingNode }) {
  if (!hover || hover.kind !== 'sat' || isDraggingNode) return null;
  const d   = hover.data;
  const col = HUB_COLOR[hover.parent] || 'var(--accent)';
  const rawL = hover.x + pan.x + 24;
  const left = rawL + 340 > size.w ? hover.x + pan.x - 360 : rawL;
  const top  = Math.max(8, hover.y + pan.y - 16);

  return (
    <div style={{
      position: 'absolute', left, top, width: 320, zIndex: 20,
      background: 'var(--bg-card)',
      border: '1px solid var(--line-strong)',
      borderTop: '3px solid ' + col,
      borderRadius: 6, padding: '16px 20px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
      pointerEvents: 'none'
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: col, marginBottom: 8
      }}>
        {HUB_LABEL_NICE[hover.parent]} · {d.kind}
      </div>

      <div style={{
        fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 17,
        lineHeight: 1.25, letterSpacing: '-0.01em',
        color: 'var(--fg)', marginBottom: 6
      }}>{d.label}</div>

      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
        color: 'var(--fg-muted)', letterSpacing: '0.06em', marginBottom: 8
      }}>{d.sub}</div>

      {d.extra && (
        <div style={{
          fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55,
          borderTop: '1px solid var(--line)', paddingTop: 8
        }}>{d.extra}</div>
      )}

      {d.tags && d.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
          {d.tags.slice(0, 5).map(t => (
            <span key={t} style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              padding: '2px 7px', border: '1px solid ' + col,
              borderRadius: 2, color: col, opacity: 0.85
            }}>{t}</span>
          ))}
        </div>
      )}

      <div style={{
        marginTop: 12, fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9, color: 'var(--fg-faint)',
        letterSpacing: '0.1em', textTransform: 'uppercase'
      }}>click to open · drag to reposition</div>
    </div>
  );
}

// Hub tooltip
function HubTooltip({ hover, pan, isDraggingNode }) {
  if (!hover || hover.kind !== 'hub' || isDraggingNode) return null;
  const col = HUB_COLOR[hover.id] || 'var(--accent)';
  return (
    <div style={{
      position: 'absolute', left: hover.x + pan.x + 18, top: hover.y + pan.y - 20,
      zIndex: 20, background: 'var(--bg-card)',
      border: '1px solid var(--line-strong)', borderRadius: 4,
      padding: '12px 16px', pointerEvents: 'none',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
        color: col, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4
      }}>section</div>
      <div style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: 20, letterSpacing: '-0.01em', color: 'var(--fg)'
      }}>{HUB_LABEL_NICE[hover.id]}</div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10, color: 'var(--fg-muted)', marginTop: 4
      }}>drag to move · click to enter →</div>
    </div>
  );
}

function NodeAtlas({ go, data }) {
  const wrapRef = useRefA(null);
  const [size,  setSize]  = useStateA({ w: 1400, h: 800 });
  const [pan,   setPan]   = useStateA({ x: 0, y: 0 });
  const [hover, setHover] = useStateA(null);
  const [tick,  setTick]  = useStateA(0);
  const rafRef = useRefA(0);

  // Per-node dragged positions
  const [hubOv, setHubOv] = useStateA({});
  const [satOv, setSatOv] = useStateA({});

  // Refs for event handlers (no stale closure risk)
  const panRef    = useRefA({ x: 0, y: 0 });
  const hubOvRef  = useRefA({});
  const satOvRef  = useRefA({});
  const layoutRef = useRefA(null);
  const goRef     = useRefA(go);

  // drag: mode = null | 'hub' | 'sat' | 'pan'
  const drag = useRefA({
    mode: null, moved: false, id: null, satKey: null, hubId: null,
    startMx: 0, startMy: 0, startNx: 0, startNy: 0, startPx: 0, startPy: 0
  });

  // Sync refs every render (synchronous)
  panRef.current   = pan;
  hubOvRef.current = hubOv;
  satOvRef.current = satOv;
  goRef.current    = go;

  // Resize observer
  useEffectA(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const r = e.contentRect;
        setSize({ w: Math.max(600, r.width), h: Math.max(400, r.height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Animation
  useEffectA(() => {
    let last = performance.now();
    const step = (now) => {
      setTick(t => t + (now - last) / 1000);
      last = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Satellite data (auto-rebuilds when data changes)
  const sats = useMemoA(() => buildSats(data), [data]);

  // Layout
  const layout = useMemoA(() => {
    const cx    = size.w * 0.68;
    const cy    = size.h * 0.52;
    const ringR = Math.min(size.w * 0.28, size.h * 0.36);

    const hubAngles = {
      publications: -1.5, research: -0.5, cv: 0.2,
      talks: 0.9, teaching: 1.6, labs: 2.4, blog: -2.5
    };

    const hubs = Object.entries(hubAngles).map(([id, angle]) => {
      const items = sats[id] || [];
      const hx    = cx + Math.cos(angle) * ringR;
      const hy    = cy + Math.sin(angle) * ringR;
      const out   = Math.atan2(hy - cy, hx - cx);
      const satR  = 90 + Math.min(15, items.length) * 4;

      const satNodes = items.map((it, i, arr) => {
        const total  = arr.length;
        const spread = Math.min(Math.PI * 1.2, 0.5 + total * 0.18);
        const a = out + (i / Math.max(1, total - 1) - 0.5) * spread;
        const r = satR + ((i % 2) ? 22 : 0);
        return {
          ...it,
          baseX:  hx + Math.cos(a) * r,
          baseY:  hy + Math.sin(a) * r,
          phase:  (i * 1.7 + angle * 3) % (Math.PI * 2),
          parent: id
        };
      });

      return { id, angle, x: hx, y: hy, satNodes, peerCount: items.length };
    });

    const result = { center: { x: cx, y: cy }, hubs };
    layoutRef.current = result;
    return result;
  }, [size, sats]);

  // Native event handlers — attached once, read from refs
  useEffectA(() => {
    const el = wrapRef.current;
    if (!el) return;

    const getHubP  = (h) => hubOvRef.current[h.id] ?? { x: h.x, y: h.y };
    const getSatBase = (h, s) => {
      const sk = h.id + '::' + s.id;
      const ov = satOvRef.current[sk];
      return { bx: ov ? ov.bx : s.baseX, by: ov ? ov.by : s.baseY, sk };
    };

    const onDown = (e) => {
      if (e.button !== 0) return;
      const rect = el.getBoundingClientRect();
      const p    = panRef.current;
      const lx   = e.clientX - rect.left - p.x;
      const ly   = e.clientY - rect.top  - p.y;
      const hubs = layoutRef.current ? layoutRef.current.hubs : [];

      // Hub hit (radius 28px)
      for (const h of hubs) {
        const { x: hx, y: hy } = getHubP(h);
        if (Math.hypot(lx - hx, ly - hy) < 28) {
          drag.current = {
            mode: 'hub', moved: false, id: h.id, satKey: null, hubId: h.id,
            startMx: e.clientX, startMy: e.clientY,
            startNx: hx, startNy: hy, startPx: p.x, startPy: p.y
          };
          el.style.cursor = 'grabbing';
          e.preventDefault(); return;
        }
      }

      // Satellite hit (radius 14px)
      for (const h of hubs) {
        for (const s of h.satNodes) {
          const { bx, by, sk } = getSatBase(h, s);
          if (Math.hypot(lx - bx, ly - by) < 14) {
            drag.current = {
              mode: 'sat', moved: false, id: s.id, satKey: sk, hubId: h.id,
              startMx: e.clientX, startMy: e.clientY,
              startNx: bx, startNy: by, startPx: p.x, startPy: p.y
            };
            el.style.cursor = 'grabbing';
            e.preventDefault(); return;
          }
        }
      }

      // Canvas pan
      drag.current = {
        mode: 'pan', moved: false, id: null, satKey: null, hubId: null,
        startMx: e.clientX, startMy: e.clientY,
        startNx: 0, startNy: 0, startPx: p.x, startPy: p.y
      };
      el.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const onMove = (e) => {
      const d  = drag.current;
      if (!d.mode) return;
      const dx = e.clientX - d.startMx;
      const dy = e.clientY - d.startMy;
      if (Math.hypot(dx, dy) > 4) d.moved = true;

      if (d.mode === 'hub') {
        setHubOv(prev => ({ ...prev, [d.id]: { x: d.startNx + dx, y: d.startNy + dy } }));
      } else if (d.mode === 'sat') {
        setSatOv(prev => ({ ...prev, [d.satKey]: { bx: d.startNx + dx, by: d.startNy + dy } }));
      } else if (d.mode === 'pan') {
        setPan({ x: d.startPx + dx, y: d.startPy + dy });
      }
    };

    const onUp = () => {
      const d    = drag.current;
      const hubs = layoutRef.current ? layoutRef.current.hubs : [];

      if (!d.moved) {
        if (d.mode === 'hub' && d.id) {
          goRef.current({ page: d.id });
        } else if (d.mode === 'sat' && d.hubId) {
          const h = hubs.find(h => h.id === d.hubId);
          if (h) {
            const s = h.satNodes.find(s => s.id === d.id);
            if (s) {
              const routeFn = SAT_ROUTE[d.hubId];
              if (routeFn) goRef.current(routeFn(s));
            }
          }
        }
      }
      drag.current.mode  = null;
      drag.current.moved = false;
      el.style.cursor = 'grab';
    };

    const onLeave = () => {
      drag.current.mode = null;
      el.style.cursor = 'grab';
      setHover(null);
    };

    el.addEventListener('mousedown',  onDown);
    el.addEventListener('mouseleave', onLeave);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      el.removeEventListener('mousedown',  onDown);
      el.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, []);

  // Render-time position helpers
  const hubPos = (h) => hubOv[h.id] ?? { x: h.x, y: h.y };

  const satPos = (s, sk) => {
    const ov = satOv[sk];
    const bx = ov ? ov.bx : s.baseX;
    const by = ov ? ov.by : s.baseY;
    if (drag.current.mode === 'sat' && drag.current.satKey === sk) return { x: bx, y: by };
    return {
      x: bx + Math.sin(tick * 0.6 + s.phase) * 4,
      y: by + Math.cos(tick * 0.5 + s.phase * 1.3) * 4
    };
  };

  const peerEdges = [
    ['research','publications'],['research','labs'],['blog','research'],
    ['labs','teaching'],['talks','research'],['talks','publications'],['cv','publications']
  ];

  const decorDots = useMemoA(() => {
    const arr = [];
    let s = 17;
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < 80; i++)
      arr.push({ x: r()*size.w*1.6 - size.w*0.3, y: r()*size.h*1.6 - size.h*0.3,
                 r: 0.6 + r()*1.4, phase: r()*6.28 });
    return arr;
  }, [size]);

  const isDraggingNode = drag.current.mode === 'hub' || drag.current.mode === 'sat';

  return (
    <div ref={wrapRef} className="atlas-canvas" style={{ cursor: 'grab' }}>
      <svg width={size.w} height={size.h} style={{ display: 'block', userSelect: 'none' }}>
        <g transform={`translate(${pan.x},${pan.y})`}>

          {/* Decorative background dots */}
          {decorDots.map((d, i) => (
            <circle key={'d'+i}
              cx={d.x + Math.sin(tick*0.3 + d.phase)*2}
              cy={d.y + Math.cos(tick*0.25 + d.phase)*2}
              r={d.r} fill="var(--node)" opacity="0.18" />
          ))}

          {/* Hub peer edges */}
          {peerEdges.map(([a, b], i) => {
            const ha = layout.hubs.find(h => h.id === a);
            const hb = layout.hubs.find(h => h.id === b);
            if (!ha || !hb) return null;
            const pa = hubPos(ha), pb = hubPos(hb);
            return <line key={'pe'+i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke="var(--edge)" strokeWidth="0.8" strokeDasharray="2 6" />;
          })}

          {/* Center to hub edges */}
          {layout.hubs.map(h => {
            const p = hubPos(h);
            return <line key={'c'+h.id}
              x1={layout.center.x} y1={layout.center.y} x2={p.x} y2={p.y}
              stroke="var(--edge)" strokeWidth="1" />;
          })}

          {/* Hub to satellite edges */}
          {layout.hubs.map(h =>
            h.satNodes.map(s => {
              const hp = hubPos(h);
              const sk = h.id + '::' + s.id;
              const sp = satPos(s, sk);
              const isHov = hover && hover.satKey === sk;
              return <line key={'hs'+sk}
                x1={hp.x} y1={hp.y} x2={sp.x} y2={sp.y}
                stroke={isHov ? 'var(--edge-hot)' : 'var(--edge)'}
                strokeWidth={isHov ? 1.6 : 0.6} />;
            })
          )}

          {/* Center node */}
          <g>
            <circle cx={layout.center.x} cy={layout.center.y} r={28}
              fill="var(--bg-elev)" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx={layout.center.x} cy={layout.center.y} r={6} fill="var(--accent)" />
            <text x={layout.center.x} y={layout.center.y-44} textAnchor="middle"
              fontFamily="'DM Sans', system-ui, sans-serif" fontSize="22"
              fill="var(--fg)" letterSpacing="-0.01em">Amith Gspn</text>
            <text x={layout.center.x} y={layout.center.y+50} textAnchor="middle"
              fontFamily="'IBM Plex Mono', monospace" fontSize="9"
              fill="var(--fg-muted)" letterSpacing="0.2em">AS14593 · USC</text>
          </g>

          {/* Hub nodes */}
          {layout.hubs.map(h => {
            const col = HUB_COLOR[h.id];
            const { x: hx, y: hy } = hubPos(h);
            const isHov    = hover && hover.kind === 'hub' && hover.id === h.id;
            const isDragged = drag.current.mode === 'hub' && drag.current.id === h.id;
            return (
              <g key={h.id}
                onMouseEnter={() => setHover({ kind: 'hub', id: h.id, x: hx, y: hy })}
                onMouseLeave={() => setHover(null)}>
                <circle cx={hx} cy={hy} r={isHov||isDragged ? 32 : 24} fill={col} opacity="0.12" />
                <circle cx={hx} cy={hy} r={isHov||isDragged ? 13 : 9}  fill={col} />
                <text x={hx} y={hy+30} textAnchor="middle"
                  fontFamily="'IBM Plex Mono', monospace" fontSize="10"
                  fill="var(--fg)" letterSpacing="0.2em" fontWeight="500">
                  {HUB_LABEL_NICE[h.id]}
                </text>
                <text x={hx} y={hy+44} textAnchor="middle"
                  fontFamily="'IBM Plex Mono', monospace" fontSize="9"
                  fill="var(--fg-muted)" letterSpacing="0.1em">
                  {h.peerCount} {h.peerCount === 1 ? 'item' : 'items'}
                </text>
              </g>
            );
          })}

          {/* Satellite nodes — one per content item */}
          {layout.hubs.map(h =>
            h.satNodes.map(s => {
              const sk    = h.id + '::' + s.id;
              const p     = satPos(s, sk);
              const col   = HUB_COLOR[h.id];
              const isHov    = hover && hover.satKey === sk;
              const isDragged = drag.current.mode === 'sat' && drag.current.satKey === sk;
              return (
                <g key={sk}
                  onMouseEnter={() => setHover({ kind: 'sat', satKey: sk, id: s.id, parent: h.id, x: p.x, y: p.y, data: s })}
                  onMouseLeave={() => setHover(null)}>
                  <circle cx={p.x} cy={p.y} r={isHov||isDragged ? 16 : 8}  fill={col} opacity="0.15" />
                  <circle cx={p.x} cy={p.y} r={isHov||isDragged ? 5.5 : 3} fill={col} />
                </g>
              );
            })
          )}
        </g>
      </svg>

      {/* Dialogue boxes */}
      <SatDialogue hover={hover} pan={pan} size={size} isDraggingNode={isDraggingNode} />
      <HubTooltip  hover={hover} pan={pan} isDraggingNode={isDraggingNode} />
    </div>
  );
}

window.NodeAtlas = NodeAtlas;

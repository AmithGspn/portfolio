// Node Atlas — fullscreen interactive network map.
// Each section is a colored hub node; each content item is a satellite.
// Click to navigate. Drag individual nodes to reposition. Drag empty space to pan.

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
  publications: 'PUBS',
  blog:         'JOURNAL',
  labs:         'LABS',
  teaching:     'TEACH',
  talks:        'TALKS',
  cv:           'CV'
};

function NodeAtlas({ go, data }) {
  const wrapRef = useRefA(null);
  const [size, setSize]         = useStateA({ w: 1400, h: 800 });
  const [pan,  setPan]          = useStateA({ x: 0, y: 0 });
  const [hover, setHover]       = useStateA(null);
  const [tick,  setTick]        = useStateA(0);
  const rafRef                  = useRefA(0);
  const mouseRef                = useRefA({ x: -9999, y: -9999, active: false });
  const panRef                  = useRefA({ x: 0, y: 0 });

  // per-node position overrides
  const [hubOverrides, setHubOverrides] = useStateA({});
  const [satOverrides, setSatOverrides] = useStateA({});
  const hubOvRef = useRefA({});
  const satOvRef = useRefA({});

  // all drag state in one ref — avoids stale closures completely
  // mode: null | 'pan' | 'hub' | 'sat'
  const drag = useRefA({ mode: null, moved: false,
    startMx: 0, startMy: 0, startNx: 0, startNy: 0,
    startPx: 0, startPy: 0, id: null, satKey: null });

  // keep mirror refs in sync
  useEffectA(() => { panRef.current = pan; }, [pan]);
  useEffectA(() => { hubOvRef.current = hubOverrides; }, [hubOverrides]);
  useEffectA(() => { satOvRef.current = satOverrides; }, [satOverrides]);

  // resize observer
  useEffectA(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const ent of entries) {
        const r = ent.contentRect;
        setSize({ w: Math.max(600, r.width), h: Math.max(400, r.height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // animation tick
  useEffectA(() => {
    let last = performance.now();
    const step = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setTick(t => t + dt);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // layout (initial positions)
  const layout = useMemoA(() => {
    const cx    = size.w * 0.68;
    const cy    = size.h * 0.52;
    const ringR = Math.min(size.w * 0.28, size.h * 0.36);

    const hubsRaw = [
      { id: 'publications', angle: -1.5, items: data.publications.map(p => ({ id: p.year + p.title.slice(0,4), label: p.title, sub: p.venue })) },
      { id: 'research',     angle: -0.5, items: data.research.map(r => ({ id: r.id, label: r.title, sub: r.year + ' · ' + r.status, tags: r.tags })) },
      { id: 'cv',           angle:  0.2, items: [] },
      { id: 'talks',        angle:  0.9, items: data.talks.map(t => ({ id: t.where + t.date, label: t.title, sub: t.where + ' · ' + t.date })) },
      { id: 'teaching',     angle:  1.6, items: data.teaching.map(t => ({ id: t.code + t.term, label: t.code + ' — ' + t.title, sub: t.term })) },
      { id: 'labs',         angle:  2.4, items: data.labs.map(l => ({ id: l.id, label: l.title, sub: l.time + ' · ' + (l.diff === 'beg' ? 'beginner' : l.diff === 'int' ? 'intermediate' : 'advanced'), tags: l.tools })) },
      { id: 'blog',         angle: -2.5, items: data.blog.map(b => ({ id: b.id, label: b.title, sub: b.date, tags: [b.tag].filter(Boolean) })) }
    ];

    const hubs = hubsRaw.map(h => {
      const hx  = cx + Math.cos(h.angle) * ringR;
      const hy  = cy + Math.sin(h.angle) * ringR;
      const out = Math.atan2(hy - cy, hx - cx);
      const satR = 90 + Math.min(15, h.items.length) * 4;
      const sats = h.items.slice(0, 12).map((it, i, arr) => {
        const total  = arr.length;
        const spread = Math.min(Math.PI * 1.2, 0.5 + total * 0.18);
        const a = out + (i / Math.max(1, total - 1) - 0.5) * spread;
        const r = satR + ((i % 2) ? 22 : 0);
        return { ...it, baseX: hx + Math.cos(a) * r, baseY: hy + Math.sin(a) * r,
                 phase: (i * 1.7 + h.angle * 3) % (Math.PI * 2), parent: h.id };
      });
      return { ...h, x: hx, y: hy, sats, peerCount: h.items.length };
    });
    return { center: { x: cx, y: cy }, hubs };
  }, [size, data]);

  // effective hub position (override or layout default)
  const hubPos = (h) => hubOverrides[h.id] ?? { x: h.x, y: h.y };

  // effective satellite position (override base + wobble, no wobble while dragging)
  const satPos = (s, sk, t) => {
    const ov = satOverrides[sk];
    const bx = ov ? ov.baseX : s.baseX;
    const by = ov ? ov.baseY : s.baseY;
    if (drag.current.mode === 'sat' && drag.current.satKey === sk) return { x: bx, y: by };
    return {
      x: bx + Math.sin(t * 0.6 + s.phase) * 4,
      y: by + Math.cos(t * 0.5 + s.phase * 1.3) * 4
    };
  };

  // ── single unified mousedown — checks proximity to nodes first ────────────
  const onDown = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const p    = panRef.current;
    const lx   = e.clientX - rect.left - p.x;  // local (inside SVG transform)
    const ly   = e.clientY - rect.top  - p.y;

    // 1. check hubs (hit radius 22px)
    for (const h of layout.hubs) {
      const ov = hubOvRef.current[h.id] ?? { x: h.x, y: h.y };
      if (Math.hypot(lx - ov.x, ly - ov.y) < 22) {
        drag.current = { mode: 'hub', moved: false, id: h.id, satKey: null,
          startMx: e.clientX, startMy: e.clientY,
          startNx: ov.x, startNy: ov.y,
          startPx: p.x, startPy: p.y };
        return;
      }
    }

    // 2. check satellites (hit radius 12px)
    for (const h of layout.hubs) {
      for (const s of h.sats) {
        const sk = h.id + '::' + s.id;
        const ov = satOvRef.current[sk];
        const bx = ov ? ov.baseX : s.baseX;
        const by = ov ? ov.baseY : s.baseY;
        if (Math.hypot(lx - bx, ly - by) < 12) {
          drag.current = { mode: 'sat', moved: false, id: s.id, satKey: sk,
            startMx: e.clientX, startMy: e.clientY,
            startNx: bx, startNy: by,
            startPx: p.x, startPy: p.y };
          return;
        }
      }
    }

    // 3. nothing hit — canvas pan
    drag.current = { mode: 'pan', moved: false, id: null, satKey: null,
      startMx: e.clientX - rect.left, startMy: e.clientY - rect.top,
      startNx: 0, startNy: 0,
      startPx: p.x, startPy: p.y };
  };

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const px   = e.clientX - rect.left;
    const py   = e.clientY - rect.top;
    const p    = panRef.current;
    mouseRef.current = { x: px - p.x, y: py - p.y, active: true };

    const d  = drag.current;
    if (!d.mode) return;

    const dx = e.clientX - d.startMx;
    const dy = e.clientY - d.startMy;
    if (Math.hypot(dx, dy) > 4) d.moved = true;

    if (d.mode === 'hub') {
      setHubOverrides(prev => ({ ...prev, [d.id]: { x: d.startNx + dx, y: d.startNy + dy } }));
    } else if (d.mode === 'sat') {
      setSatOverrides(prev => ({ ...prev, [d.satKey]: { baseX: d.startNx + dx, baseY: d.startNy + dy } }));
    } else if (d.mode === 'pan') {
      setPan({ x: d.startPx + (px - d.startMx), y: d.startPy + (py - d.startMy) });
    }
  };

  const onUp = () => {
    const d = drag.current;
    // short move = click → navigate
    if (!d.moved) {
      if (d.mode === 'hub') {
        go({ page: d.id });
      } else if (d.mode === 'sat') {
        for (const h of layout.hubs) {
          const s = h.sats.find(s => s.id === d.id);
          if (s) {
            go(({
              research:     { page: 'research-detail', id: s.id },
              blog:         { page: 'blog-detail',     id: s.id },
              labs:         { page: 'lab-detail',      id: s.id },
              publications: { page: 'publications' },
              teaching:     { page: 'teaching' },
              talks:        { page: 'talks' },
              cv:           { page: 'cv' }
            })[h.id]);
            break;
          }
        }
      }
    }
    drag.current = { ...drag.current, mode: null, moved: false };
  };

  const onLeave = () => {
    drag.current.mode = null;
    mouseRef.current.active = false;
    setHover(null);
  };

  // peer edges
  const peerEdges = [
    ['research', 'publications'], ['research', 'labs'], ['blog', 'research'],
    ['labs', 'teaching'], ['talks', 'research'], ['talks', 'publications'], ['cv', 'publications']
  ];

  // decor dots
  const decorDots = useMemoA(() => {
    const arr = [];
    let s = 17;
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < 80; i++)
      arr.push({ x: r() * size.w * 1.6 - size.w * 0.3, y: r() * size.h * 1.6 - size.h * 0.3,
                 r: 0.6 + r() * 1.4, phase: r() * 6.28 });
    return arr;
  }, [size]);

  const isDraggingNode = drag.current.mode === 'hub' || drag.current.mode === 'sat';

  return (
    <div
      ref={wrapRef}
      className="atlas-canvas"
      style={{ cursor: isDraggingNode || drag.current.mode === 'pan' ? 'grabbing' : 'grab' }}
      onMouseMove={onMove}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={onLeave}
    >
      <svg width={size.w} height={size.h} style={{ display: 'block', userSelect: 'none' }}>
        <g transform={`translate(${pan.x}, ${pan.y})`}>

          {/* decor dots */}
          {decorDots.map((d, i) => (
            <circle key={'d'+i}
              cx={d.x + Math.sin(tick * 0.3 + d.phase) * 2}
              cy={d.y + Math.cos(tick * 0.25 + d.phase) * 2}
              r={d.r} fill="var(--node)" opacity="0.18" />
          ))}

          {/* peer edges */}
          {peerEdges.map(([a, b], i) => {
            const ha = layout.hubs.find(h => h.id === a);
            const hb = layout.hubs.find(h => h.id === b);
            if (!ha || !hb) return null;
            const pa = hubPos(ha), pb = hubPos(hb);
            return <line key={'pe'+i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke="var(--edge)" strokeWidth="0.8" strokeDasharray="2 6" />;
          })}

          {/* center → hub edges */}
          {layout.hubs.map(h => {
            const p = hubPos(h);
            return <line key={'c'+h.id}
              x1={layout.center.x} y1={layout.center.y} x2={p.x} y2={p.y}
              stroke="var(--edge)" strokeWidth="1" />;
          })}

          {/* hub → sat edges */}
          {layout.hubs.map(h =>
            h.sats.map(s => {
              const hp = hubPos(h);
              const sk = h.id + '::' + s.id;
              const sp = satPos(s, sk, tick);
              const isHov = hover && hover.id === s.id;
              return <line key={'hs'+s.id}
                x1={hp.x} y1={hp.y} x2={sp.x} y2={sp.y}
                stroke={isHov ? 'var(--edge-hot)' : 'var(--edge)'}
                strokeWidth={isHov ? 1.4 : 0.6} />;
            })
          )}

          {/* center node */}
          <g>
            <circle cx={layout.center.x} cy={layout.center.y} r={28}
              fill="var(--bg-elev)" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx={layout.center.x} cy={layout.center.y} r={6} fill="var(--accent)" />
            <text x={layout.center.x} y={layout.center.y - 44} textAnchor="middle"
              fontFamily="'DM Sans', system-ui, sans-serif" fontSize="22"
              fill="var(--fg)" letterSpacing="-0.01em">Amith Gspn</text>
            <text x={layout.center.x} y={layout.center.y + 50} textAnchor="middle"
              fontFamily="'IBM Plex Mono', monospace" fontSize="9"
              fill="var(--fg-muted)" letterSpacing="0.2em">AS14593 · USC</text>
          </g>

          {/* hub nodes */}
          {layout.hubs.map(h => {
            const color = HUB_COLOR[h.id];
            const { x: hx, y: hy } = hubPos(h);
            const isHov    = hover && hover.kind === 'hub' && hover.id === h.id;
            const isDragged = drag.current.mode === 'hub' && drag.current.id === h.id;
            return (
              <g key={h.id}
                onMouseEnter={() => setHover({ kind: 'hub', id: h.id, x: hx, y: hy })}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: isDragged ? 'grabbing' : 'grab' }}>
                <circle cx={hx} cy={hy} r={isHov || isDragged ? 30 : 24} fill={color} opacity="0.12" />
                <circle cx={hx} cy={hy} r={isHov || isDragged ? 13 : 9}  fill={color} />
                <text x={hx} y={hy + 30} textAnchor="middle"
                  fontFamily="'IBM Plex Mono', monospace" fontSize="10"
                  fill="var(--fg)" letterSpacing="0.2em" fontWeight="500">
                  {HUB_LABEL_NICE[h.id]}
                </text>
                <text x={hx} y={hy + 44} textAnchor="middle"
                  fontFamily="'IBM Plex Mono', monospace" fontSize="9"
                  fill="var(--fg-muted)" letterSpacing="0.1em">
                  /{h.id} · {h.peerCount} {h.peerCount === 1 ? 'item' : 'items'}
                </text>
              </g>
            );
          })}

          {/* satellite nodes */}
          {layout.hubs.map(h =>
            h.sats.map(s => {
              const sk    = h.id + '::' + s.id;
              const p     = satPos(s, sk, tick);
              const color = HUB_COLOR[h.id];
              const isHov    = hover && hover.id === s.id;
              const isDragged = drag.current.mode === 'sat' && drag.current.satKey === sk;
              return (
                <g key={'s'+s.id}
                  onMouseEnter={() => setHover({ kind: 'sat', id: s.id, parent: h.id, x: p.x, y: p.y, data: s })}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: isDragged ? 'grabbing' : 'grab' }}>
                  <circle cx={p.x} cy={p.y} r={isHov || isDragged ? 14 : 8} fill={color} opacity="0.12" />
                  <circle cx={p.x} cy={p.y} r={isHov || isDragged ? 5  : 3} fill={color} />
                </g>
              );
            })
          )}
        </g>
      </svg>

      {/* tooltips */}
      {hover && hover.kind === 'sat' && !isDraggingNode && (
        <div className="atlas-tooltip" style={{ left: hover.x + pan.x, top: hover.y + pan.y }}>
          <div className="ttl">/{hover.parent}</div>
          <div className="ttitle">{hover.data.label}</div>
          <div className="tsub">{hover.data.sub}</div>
          {hover.data.tags && hover.data.tags.length > 0 && (
            <div className="ttags">
              {hover.data.tags.slice(0, 4).map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          )}
        </div>
      )}
      {hover && hover.kind === 'hub' && !isDraggingNode && (
        <div className="atlas-tooltip" style={{ left: hover.x + pan.x, top: hover.y + pan.y }}>
          <div className="ttl">section / {hover.id}</div>
          <div className="ttitle">Enter {HUB_LABEL_NICE[hover.id]}</div>
          <div className="tsub">drag to move · click to enter →</div>
        </div>
      )}
    </div>
  );
}

window.NodeAtlas = NodeAtlas;

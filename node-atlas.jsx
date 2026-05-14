// Node Atlas — fullscreen interactive network map.
// Each section is a colored hub node; each content item is a satellite.
// Click any node to navigate. Drag canvas to pan. Drag individual nodes to reposition.

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
  const wrapRef   = useRefA(null);
  const [size, setSize]       = useStateA({ w: 1400, h: 800 });
  const [pan,  setPan]        = useStateA({ x: 0, y: 0 });
  const [dragging, setDragging] = useStateA(false);
  const dragStart   = useRefA({ x: 0, y: 0, px: 0, py: 0, moved: false });
  const mouseRef    = useRefA({ x: -9999, y: -9999, active: false });
  const [hover, setHover]     = useStateA(null);
  const [tick,  setTick]      = useStateA(0);
  const rafRef = useRefA(0);

  // ── per-node position overrides (set when user drags a node) ──────────────
  // hubOverrides:  { [hubId]:  { x, y } }
  // satOverrides:  { [satKey]: { baseX, baseY } }  (key = hub.id + '::' + sat.id)
  const [hubOverrides, setHubOverrides] = useStateA({});
  const [satOverrides, setSatOverrides] = useStateA({});

  // dragNodeRef tracks the node currently being dragged (null = canvas pan)
  // { kind: 'hub'|'sat', id, satKey?, startMx, startMy, startNx, startNy }
  const dragNodeRef = useRefA(null);

  // ── resize observer ────────────────────────────────────────────────────────
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

  // ── animation tick ─────────────────────────────────────────────────────────
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

  // ── layout (initial positions only — overrides take precedence) ────────────
  const layout = useMemoA(() => {
    const cx = size.w * 0.68;
    const cy = size.h * 0.52;
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
        return {
          ...it,
          baseX:  hx + Math.cos(a) * r,
          baseY:  hy + Math.sin(a) * r,
          phase:  (i * 1.7 + h.angle * 3) % (Math.PI * 2),
          parent: h.id
        };
      });
      return { ...h, x: hx, y: hy, sats, peerCount: h.items.length };
    });

    return { center: { x: cx, y: cy }, hubs };
  }, [size, data]);

  // ── helpers ────────────────────────────────────────────────────────────────
  // Effective hub position (layout default + optional override)
  const hubPos = (h) => hubOverrides[h.id] ?? { x: h.x, y: h.y };

  // Effective satellite wobble position
  const wobble = (s, overrideKey) => {
    const ov = satOverrides[overrideKey];
    const bx = ov ? ov.baseX : s.baseX;
    const by = ov ? ov.baseY : s.baseY;
    // If this sat is currently being dragged, skip wobble
    if (dragNodeRef.current && dragNodeRef.current.satKey === overrideKey) {
      return { x: bx, y: by };
    }
    return {
      x: bx + Math.sin(tick * 0.6 + s.phase) * 4,
      y: by + Math.cos(tick * 0.5 + s.phase * 1.3) * 4
    };
  };

  // ── pointer events ─────────────────────────────────────────────────────────
  // Canvas background mousedown → start pan (only if no node drag is starting)
  const onCanvasDown = (e) => {
    if (dragNodeRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    dragStart.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      px: pan.x, py: pan.y, moved: false
    };
    setDragging(true);
  };

  // Node mousedown → start node drag
  const onNodeDown = (e, kind, id, satKey, currentX, currentY) => {
    e.stopPropagation(); // don't trigger canvas pan
    dragNodeRef.current = {
      kind, id, satKey,
      startMx: e.clientX,
      startMy: e.clientY,
      startNx: currentX,
      startNy: currentY
    };
    dragStart.current.moved = false;
  };

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    mouseRef.current = { x: px - pan.x, y: py - pan.y, active: true };

    // ── node drag ──
    const nd = dragNodeRef.current;
    if (nd) {
      const dx = e.clientX - nd.startMx;
      const dy = e.clientY - nd.startMy;
      if (Math.hypot(dx, dy) > 4) dragStart.current.moved = true;

      if (nd.kind === 'hub') {
        setHubOverrides(prev => ({
          ...prev,
          [nd.id]: { x: nd.startNx + dx, y: nd.startNy + dy }
        }));
      } else {
        setSatOverrides(prev => ({
          ...prev,
          [nd.satKey]: { baseX: nd.startNx + dx, baseY: nd.startNy + dy }
        }));
      }
      return;
    }

    // ── canvas pan ──
    if (dragging) {
      const dx = px - dragStart.current.x;
      const dy = py - dragStart.current.y;
      if (Math.hypot(dx, dy) > 4) dragStart.current.moved = true;
      setPan({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    }
  };

  const onUp = () => {
    dragNodeRef.current = null;
    setDragging(false);
  };

  const onLeave = () => {
    dragNodeRef.current = null;
    setDragging(false);
    mouseRef.current.active = false;
    setHover(null);
  };

  const handleNodeClick = (route) => {
    if (dragStart.current.moved) return;
    go(route);
  };

  // ── peer edges ─────────────────────────────────────────────────────────────
  const peerEdges = [
    ['research', 'publications'],
    ['research', 'labs'],
    ['blog',     'research'],
    ['labs',     'teaching'],
    ['talks',    'research'],
    ['talks',    'publications'],
    ['cv',       'publications']
  ];

  // ── background decor dots ──────────────────────────────────────────────────
  const decorDots = useMemoA(() => {
    const arr = [];
    let s = 17;
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < 80; i++) {
      arr.push({ x: r() * size.w * 1.6 - size.w * 0.3, y: r() * size.h * 1.6 - size.h * 0.3, r: 0.6 + r() * 1.4, phase: r() * 6.28 });
    }
    return arr;
  }, [size]);

  // ── cursor style ───────────────────────────────────────────────────────────
  const isDraggingNode = !!dragNodeRef.current;

  return (
    <div
      ref={wrapRef}
      className="atlas-canvas"
      style={{ cursor: isDraggingNode ? 'grabbing' : dragging ? 'grabbing' : 'grab' }}
      onMouseMove={onMove}
      onMouseDown={onCanvasDown}
      onMouseUp={onUp}
      onMouseLeave={onLeave}
    >
      <svg width={size.w} height={size.h} style={{ display: 'block', userSelect: 'none' }}>
        <g transform={`translate(${pan.x}, ${pan.y})`}>

          {/* decorative bg dots */}
          {decorDots.map((d, i) => {
            const x = d.x + Math.sin(tick * 0.3 + d.phase) * 2;
            const y = d.y + Math.cos(tick * 0.25 + d.phase) * 2;
            return <circle key={'d'+i} cx={x} cy={y} r={d.r} fill="var(--node)" opacity="0.18" />;
          })}

          {/* peer edges between hubs (use effective positions) */}
          {peerEdges.map(([a, b], i) => {
            const ha = layout.hubs.find(h => h.id === a);
            const hb = layout.hubs.find(h => h.id === b);
            if (!ha || !hb) return null;
            const pa = hubPos(ha), pb = hubPos(hb);
            return (
              <line key={'pe'+i}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke="var(--edge)" strokeWidth="0.8" strokeDasharray="2 6"
              />
            );
          })}

          {/* center → each hub */}
          {layout.hubs.map(h => {
            const p = hubPos(h);
            return (
              <line key={'c'+h.id}
                x1={layout.center.x} y1={layout.center.y}
                x2={p.x} y2={p.y}
                stroke="var(--edge)" strokeWidth="1"
              />
            );
          })}

          {/* hub → satellite edges */}
          {layout.hubs.map(h =>
            h.sats.map(s => {
              const hp = hubPos(h);
              const sk = h.id + '::' + s.id;
              const sp = wobble(s, sk);
              const isHovered = hover && hover.id === s.id;
              return (
                <line key={'hs'+s.id}
                  x1={hp.x} y1={hp.y} x2={sp.x} y2={sp.y}
                  stroke={isHovered ? 'var(--edge-hot)' : 'var(--edge)'}
                  strokeWidth={isHovered ? 1.4 : 0.6}
                />
              );
            })
          )}

          {/* center node */}
          <g>
            <circle cx={layout.center.x} cy={layout.center.y} r={28} fill="var(--bg-elev)" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx={layout.center.x} cy={layout.center.y} r={6}  fill="var(--accent)" />
            <text x={layout.center.x} y={layout.center.y - 44}
              textAnchor="middle" fontFamily="'DM Sans', system-ui, sans-serif"
              fontSize="22" fill="var(--fg)" letterSpacing="-0.01em">
              Amith Gspn
            </text>
            <text x={layout.center.x} y={layout.center.y + 50}
              textAnchor="middle" fontFamily="'IBM Plex Mono', monospace"
              fontSize="9" fill="var(--fg-muted)" letterSpacing="0.2em">
              AS14593 · USC
            </text>
          </g>

          {/* hub nodes */}
          {layout.hubs.map(h => {
            const color = HUB_COLOR[h.id];
            const isHovered = hover && hover.kind === 'hub' && hover.id === h.id;
            const { x: hx, y: hy } = hubPos(h);
            const isDragged = dragNodeRef.current && dragNodeRef.current.kind === 'hub' && dragNodeRef.current.id === h.id;
            return (
              <g
                key={h.id}
                onMouseEnter={() => setHover({ kind: 'hub', id: h.id, x: hx, y: hy })}
                onMouseLeave={() => setHover(null)}
                onMouseDown={(e) => onNodeDown(e, 'hub', h.id, null, hx, hy)}
                onClick={() => handleNodeClick({ page: h.id })}
                style={{ cursor: isDragged ? 'grabbing' : 'grab' }}
              >

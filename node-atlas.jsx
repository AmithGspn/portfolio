// Node Atlas — the home page is a fullscreen interactive network map.
// Each section is a colored hub node; each content item is a satellite around its hub.
// Click any node to navigate. Drag to pan. Mouse repels lightly. Tooltip on hover.

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA, useMemo: useMemoA } = React;

const HUB_COLOR = {
  research: 'var(--accent)',
  publications: 'var(--accent-2)',
  blog: 'var(--blue)',
  labs: 'var(--green)',
  teaching: 'var(--violet)',
  talks: 'var(--accent)',
  cv: 'var(--fg)'
};

const HUB_LABEL_NICE = {
  research: 'RESEARCH',
  publications: 'PUBS',
  blog: 'JOURNAL',
  labs: 'LABS',
  teaching: 'TEACH',
  talks: 'TALKS',
  cv: 'CV'
};

function NodeAtlas({ go, data }) {
  const wrapRef = useRefA(null);
  const [size, setSize] = useStateA({ w: 1400, h: 800 });
  const [pan, setPan] = useStateA({ x: 0, y: 0 });
  const [dragging, setDragging] = useStateA(false);
  const dragStart = useRefA({ x: 0, y: 0, px: 0, py: 0, moved: false });
  const mouseRef = useRefA({ x: -9999, y: -9999, active: false });
  const [hover, setHover] = useStateA(null);
  const [tick, setTick] = useStateA(0);
  const rafRef = useRefA(0);

  // Track size
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

  // Animation tick
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

  // Layout: place hubs around a central anchor "AMITH GSPN"
  const layout = useMemoA(() => {
    const cx = size.w * 0.68;  // pushed right to clear the headline
    const cy = size.h * 0.52;
    const ringR = Math.min(size.w * 0.28, size.h * 0.36);

    // hub angle positions (radians; SVG y-down, 0=right, +=clockwise)
    // We want LEFT side mostly empty (headline lives there).
    const hubsRaw = [
      { id: 'publications', angle: -1.5, items: data.publications.map(p => ({ id: p.year + p.title.slice(0,4), label: p.title, sub: p.venue })) },
      { id: 'research', angle: -0.5, items: data.research.map(r => ({ id: r.id, label: r.title, sub: r.year + ' · ' + r.status, tags: r.tags })) },
      { id: 'cv', angle: 0.2, items: [] },
      { id: 'talks', angle: 0.9, items: data.talks.map(t => ({ id: t.where + t.date, label: t.title, sub: t.where + ' · ' + t.date })) },
      { id: 'teaching', angle: 1.6, items: data.teaching.map(t => ({ id: t.code + t.term, label: t.code + ' — ' + t.title, sub: t.term })) },
      { id: 'labs', angle: 2.4, items: data.labs.map(l => ({ id: l.id, label: l.title, sub: l.time + ' · ' + (l.diff === 'beg' ? 'beginner' : l.diff === 'int' ? 'intermediate' : 'advanced'), tags: l.tools })) },
      { id: 'blog', angle: -2.5, items: data.blog.map(b => ({ id: b.id, label: b.title, sub: b.date, tags: [b.tag].filter(Boolean) })) }
    ];

    const hubs = hubsRaw.map(h => {
      const hx = cx + Math.cos(h.angle) * ringR;
      const hy = cy + Math.sin(h.angle) * ringR;
      // Place satellites in an arc around hub, biased outward from center
      const out = Math.atan2(hy - cy, hx - cx);
      const satR = 90 + Math.min(15, h.items.length) * 4;
      const sats = h.items.slice(0, 12).map((it, i, arr) => {
        const total = arr.length;
        const spread = Math.min(Math.PI * 1.2, 0.5 + total * 0.18);
        const a = out + (i / Math.max(1, total - 1) - 0.5) * spread;
        const r = satR + ((i % 2) ? 22 : 0);
        return {
          ...it,
          baseX: hx + Math.cos(a) * r,
          baseY: hy + Math.sin(a) * r,
          phase: (i * 1.7 + h.angle * 3) % (Math.PI * 2),
          parent: h.id
        };
      });
      return {
        ...h,
        x: hx, y: hy,
        sats,
        peerCount: h.items.length
      };
    });

    return { center: { x: cx, y: cy }, hubs };
  }, [size, data]);

  // Mouse events
  const screenToLocal = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - pan.x,
      y: e.clientY - rect.top - pan.y
    };
  };

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    mouseRef.current = { x: px - pan.x, y: py - pan.y, active: true };

    if (dragging) {
      const dx = px - dragStart.current.x;
      const dy = py - dragStart.current.y;
      if (Math.hypot(dx, dy) > 4) dragStart.current.moved = true;
      setPan({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    }
  };
  const onDown = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    dragStart.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      px: pan.x, py: pan.y, moved: false
    };
    setDragging(true);
  };
  const onUp = () => setDragging(false);
  const onLeave = () => {
    setDragging(false);
    mouseRef.current.active = false;
    setHover(null);
  };

  const handleNodeClick = (route) => {
    if (dragStart.current.moved) return;
    go(route);
  };

  // Build wobble positions
  const wobble = (n, amp = 4) => {
    return {
      x: n.baseX + Math.sin(tick * 0.6 + n.phase) * amp,
      y: n.baseY + Math.cos(tick * 0.5 + n.phase * 1.3) * amp
    };
  };

  // Find what's near mouse to highlight
  const mx = mouseRef.current.x;
  const my = mouseRef.current.y;
  const mouseActive = mouseRef.current.active;

  // Peer edges between hubs (sparse — gives the "AS peering" look)
  const peerEdges = [
    ['research', 'publications'],
    ['research', 'labs'],
    ['blog', 'research'],
    ['labs', 'teaching'],
    ['talks', 'research'],
    ['talks', 'publications'],
    ['cv', 'publications']
  ];

  // Background field of decorative dots (non-interactive)
  const decorDots = useMemoA(() => {
    const arr = [];
    let s = 17;
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < 80; i++) {
      arr.push({ x: r() * size.w * 1.6 - size.w * 0.3, y: r() * size.h * 1.6 - size.h * 0.3, r: 0.6 + r() * 1.4, phase: r() * 6.28 });
    }
    return arr;
  }, [size]);

  return (
    <div
      ref={wrapRef}
      className="atlas-canvas"
      onMouseMove={onMove}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={onLeave}
    >
      <svg
        width={size.w}
        height={size.h}
        style={{ display: 'block', userSelect: 'none' }}
      >
        <g transform={`translate(${pan.x}, ${pan.y})`}>
          {/* decorative bg dots */}
          {decorDots.map((d, i) => {
            const x = d.x + Math.sin(tick * 0.3 + d.phase) * 2;
            const y = d.y + Math.cos(tick * 0.25 + d.phase) * 2;
            return <circle key={'d'+i} cx={x} cy={y} r={d.r} fill="var(--node)" opacity="0.18" />;
          })}

          {/* peer edges between hubs */}
          {peerEdges.map(([a, b], i) => {
            const ha = layout.hubs.find(h => h.id === a);
            const hb = layout.hubs.find(h => h.id === b);
            if (!ha || !hb) return null;
            return (
              <line key={'pe'+i}
                x1={ha.x} y1={ha.y} x2={hb.x} y2={hb.y}
                stroke="var(--edge)" strokeWidth="0.8"
                strokeDasharray="2 6"
              />
            );
          })}

          {/* center hub to each hub */}
          {layout.hubs.map(h => (
            <line key={'c'+h.id}
              x1={layout.center.x} y1={layout.center.y}
              x2={h.x} y2={h.y}
              stroke="var(--edge)" strokeWidth="1"
            />
          ))}

          {/* hub-to-satellite edges */}
          {layout.hubs.map(h =>
            h.sats.map(s => {
              const p = wobble(s);
              const isHovered = hover && hover.id === s.id;
              return (
                <line key={'hs'+s.id}
                  x1={h.x} y1={h.y} x2={p.x} y2={p.y}
                  stroke={isHovered ? 'var(--edge-hot)' : 'var(--edge)'}
                  strokeWidth={isHovered ? 1.4 : 0.6}
                />
              );
            })
          )}

          {/* center node — AMITH GSPN */}
          <g>
            <circle cx={layout.center.x} cy={layout.center.y} r={28} fill="var(--bg-elev)" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx={layout.center.x} cy={layout.center.y} r={6} fill="var(--accent)" />
            <text
              x={layout.center.x} y={layout.center.y - 44}
              textAnchor="middle"
              fontFamily="'DM Sans', system-ui, sans-serif"
              fontSize="22"
              fill="var(--fg)"
              letterSpacing="-0.01em"
            >
              Amith Gspn
            </text>
            <text
              x={layout.center.x} y={layout.center.y + 50}
              textAnchor="middle"
              fontFamily="'IBM Plex Mono', monospace"
              fontSize="9"
              fill="var(--fg-muted)"
              letterSpacing="0.2em"
            >
              AS14593 · USC
            </text>
          </g>

          {/* hubs */}
          {layout.hubs.map(h => {
            const color = HUB_COLOR[h.id];
            const isHovered = hover && hover.kind === 'hub' && hover.id === h.id;
            return (
              <g
                key={h.id}
                onMouseEnter={() => setHover({ kind: 'hub', id: h.id, x: h.x, y: h.y })}
                onMouseLeave={() => setHover(null)}
                onClick={() => handleNodeClick({ page: h.id })}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={h.x} cy={h.y} r={isHovered ? 30 : 24} fill={color} opacity="0.12" />
                <circle cx={h.x} cy={h.y} r={isHovered ? 12 : 9} fill={color} />
                <text
                  x={h.x} y={h.y + 30}
                  textAnchor="middle"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize="10"
                  fill="var(--fg)"
                  letterSpacing="0.2em"
                  fontWeight="500"
                >
                  {HUB_LABEL_NICE[h.id]}
                </text>
                <text
                  x={h.x} y={h.y + 44}
                  textAnchor="middle"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize="9"
                  fill="var(--fg-muted)"
                  letterSpacing="0.1em"
                >
                  /{h.id} · {h.peerCount} {h.peerCount === 1 ? 'item' : 'items'}
                </text>
              </g>
            );
          })}

          {/* satellites */}
          {layout.hubs.map(h =>
            h.sats.map(s => {
              const p = wobble(s);
              const isHovered = hover && hover.id === s.id;
              const color = HUB_COLOR[h.id];
              const routeFor = {
                research: { page: 'research-detail', id: s.id },
                blog: { page: 'blog-detail', id: s.id },
                labs: { page: 'lab-detail', id: s.id },
                publications: { page: 'publications' },
                teaching: { page: 'teaching' },
                talks: { page: 'talks' },
                cv: { page: 'cv' }
              }[h.id];
              return (
                <g
                  key={'s'+s.id}
                  onMouseEnter={() => setHover({ kind: 'sat', id: s.id, parent: h.id, x: p.x, y: p.y, data: s })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => handleNodeClick(routeFor)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={p.x} cy={p.y} r={isHovered ? 12 : 8} fill={color} opacity="0.12" />
                  <circle cx={p.x} cy={p.y} r={isHovered ? 4.5 : 3} fill={color} />
                </g>
              );
            })
          )}
        </g>
      </svg>

      {/* tooltip */}
      {hover && hover.kind === 'sat' && (
        <div
          className="atlas-tooltip"
          style={{
            left: (hover.x + pan.x),
            top: (hover.y + pan.y)
          }}
        >
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
      {hover && hover.kind === 'hub' && (
        <div
          className="atlas-tooltip"
          style={{
            left: (hover.x + pan.x),
            top: (hover.y + pan.y)
          }}
        >
          <div className="ttl">section / {hover.id}</div>
          <div className="ttitle">Enter {HUB_LABEL_NICE[hover.id]}</div>
          <div className="tsub">click to enter →</div>
        </div>
      )}
    </div>
  );
}

window.NodeAtlas = NodeAtlas;

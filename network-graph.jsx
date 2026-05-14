// NetworkGraph — interactive force-directed motif used in hero + as section anchors
const { useState, useEffect, useRef, useMemo } = React;

function rand(min, max) { return min + Math.random() * (max - min); }

// Create a deterministic-feeling graph
function buildGraph(opts) {
  const { count, w, h, seed = 1, density = 0.18, padding = 40 } = opts;
  // Mulberry32 seeded RNG
  let s = seed >>> 0;
  const r = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: i,
      x: padding + r() * (w - padding * 2),
      y: padding + r() * (h - padding * 2),
      vx: 0, vy: 0,
      r: 2 + r() * 3.5,
      hot: r() < 0.12,
      label: null,
      phase: r() * Math.PI * 2,
      drift: 0.2 + r() * 0.4
    });
  }
  // Connect each node to k nearest neighbors
  const edges = new Set();
  const k = Math.max(2, Math.round(density * Math.sqrt(count)));
  for (const a of nodes) {
    const sorted = nodes
      .filter(b => b !== a)
      .map(b => ({ b, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .sort((x, y) => x.d - y.d)
      .slice(0, k);
    for (const { b } of sorted) {
      const key = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
      edges.add(key);
    }
  }
  const edgeList = Array.from(edges).map(k => {
    const [a, b] = k.split('-').map(Number);
    return { a, b };
  });
  return { nodes, edges: edgeList };
}

function NetworkGraph({
  count = 60,
  density = 0.18,
  height = 600,
  showLabels = false,
  labels = [],
  interactive = true,
  seed = 7,
  className = '',
  intensity = 1
}) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 1200, h: height });
  const graphRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef(0);
  const [, setTick] = useState(0);

  // Re-init graph when size changes
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const ent of entries) {
        const w = ent.contentRect.width;
        const h = ent.contentRect.height;
        setSize({ w: Math.max(300, w), h: Math.max(200, h) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    graphRef.current = buildGraph({
      count,
      w: size.w,
      h: size.h,
      seed,
      density,
      padding: Math.min(60, size.w * 0.06)
    });
    // Assign labels to specific (well-spaced) nodes
    if (showLabels && labels.length) {
      // pick widely spaced nodes
      const used = [];
      const picks = [];
      for (const l of labels) {
        // find node farthest from already-used nodes
        let best = null;
        let bestScore = -Infinity;
        for (const n of graphRef.current.nodes) {
          if (used.includes(n)) continue;
          let s = Infinity;
          for (const u of used) {
            s = Math.min(s, Math.hypot(n.x - u.x, n.y - u.y));
          }
          if (s === Infinity) s = n.x; // first one: pick most-left
          if (s > bestScore) { bestScore = s; best = n; }
        }
        if (best) {
          best.label = l;
          best.hot = true;
          best.r = 6;
          used.push(best);
          picks.push(best);
        }
      }
    }
  }, [size.w, size.h, count, density, seed, showLabels]);

  // Animation loop
  useEffect(() => {
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(33, now - last) / 16.67;
      last = now;
      const g = graphRef.current;
      if (!g) { rafRef.current = requestAnimationFrame(step); return; }
      const m = mouseRef.current;
      const tMs = now * 0.0008;
      for (const n of g.nodes) {
        // gentle drift via sine
        const drift = 0.12 * n.drift * intensity;
        n.vx += Math.cos(tMs * 0.8 + n.phase) * drift * 0.03;
        n.vy += Math.sin(tMs * 0.7 + n.phase * 1.3) * drift * 0.03;

        // mouse repel
        if (m.active && interactive) {
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const d2 = dx * dx + dy * dy;
          const range = 140;
          if (d2 < range * range) {
            const d = Math.sqrt(d2) || 0.01;
            const force = (1 - d / range) * 1.4;
            n.vx += (dx / d) * force;
            n.vy += (dy / d) * force;
          }
        }

        // soft return to origin -- light center anchor
        n.vx *= 0.86;
        n.vy *= 0.86;
        n.x += n.vx * dt;
        n.y += n.vy * dt;

        // bounds
        const pad = 16;
        if (n.x < pad) { n.x = pad; n.vx *= -0.5; }
        if (n.x > size.w - pad) { n.x = size.w - pad; n.vx *= -0.5; }
        if (n.y < pad) { n.y = pad; n.vy *= -0.5; }
        if (n.y > size.h - pad) { n.y = size.h - pad; n.vy *= -0.5; }
      }
      setTick(t => (t + 1) % 1000);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, intensity, interactive]);

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    };
  };
  const onLeave = () => {
    mouseRef.current.active = false;
    mouseRef.current.x = -9999;
    mouseRef.current.y = -9999;
  };

  const g = graphRef.current;

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onMouseMove={interactive ? onMove : undefined}
      onMouseLeave={interactive ? onLeave : undefined}
    >
      <svg
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${size.w} ${size.h}`}
        style={{ display: 'block' }}
      >
        {g && g.edges.map((e, i) => {
          const a = g.nodes[e.a];
          const b = g.nodes[e.b];
          if (!a || !b) return null;
          const m = mouseRef.current;
          let near = false;
          if (m.active && interactive) {
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const d = Math.hypot(mx - m.x, my - m.y);
            near = d < 120;
          }
          return (
            <line
              key={i}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={near ? 'var(--edge-hot)' : 'var(--edge)'}
              strokeWidth={near ? 1.2 : 0.6}
              style={{ transition: 'stroke 0.2s ease' }}
            />
          );
        })}
        {g && g.nodes.map((n) => {
          const m = mouseRef.current;
          let near = false;
          if (m.active && interactive) {
            near = Math.hypot(n.x - m.x, n.y - m.y) < 100;
          }
          const fill = n.hot ? 'var(--accent)' : 'var(--node)';
          return (
            <g key={n.id}>
              {(n.hot || near) && (
                <circle
                  cx={n.x} cy={n.y}
                  r={n.r * 2.5}
                  fill={n.hot ? 'var(--accent)' : 'var(--node)'}
                  opacity={near ? 0.18 : 0.1}
                />
              )}
              <circle
                cx={n.x} cy={n.y}
                r={near ? n.r * 1.3 : n.r}
                fill={fill}
                style={{ transition: 'r 0.2s ease' }}
              />
              {n.label && (
                <g transform={`translate(${n.x + 14}, ${n.y + 4})`}>
                  <text
                    x={0}
                    y={0}
                    fontSize="11"
                    fontFamily="'IBM Plex Mono', monospace"
                    fill="var(--fg)"
                    style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
                  >
                    {n.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

window.NetworkGraph = NetworkGraph;

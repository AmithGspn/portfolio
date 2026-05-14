// Command palette — opens with "/" or click. Type to filter, enter to navigate.
const { useState: useStateCP, useEffect: useEffectCP, useRef: useRefCP, useMemo: useMemoCP } = React;

function buildIndex(data) {
  const items = [];
  const SECT = [
    ['home', 'Home / Atlas', 'goto home', 'page'],
    ['research', 'Research projects', 'goto research', 'page'],
    ['publications', 'Publications', 'goto publications', 'page'],
    ['blog', 'Blog', 'goto blog', 'page'],
    ['labs', 'Labs', 'goto labs', 'page'],
    ['teaching', 'Teaching', 'goto teaching', 'page'],
    ['talks', 'Talks', 'goto talks', 'page'],
    ['cv', 'CV', 'goto cv', 'page']
  ];
  for (const [p, label, q, kind] of SECT) {
    items.push({ kind, label, q, route: { page: p }, meta: '' });
  }
  for (const b of data.blog) {
    items.push({
      kind: 'post', label: b.title, q: 'cat blog/' + b.id,
      route: { page: 'blog-detail', id: b.id }, meta: b.date
    });
  }
  for (const r of data.research) {
    items.push({
      kind: 'project', label: r.title, q: 'open project/' + r.id,
      route: { page: 'research-detail', id: r.id }, meta: r.year
    });
  }
  for (const l of data.labs) {
    items.push({
      kind: 'lab', label: l.title, q: 'run lab/' + l.id,
      route: { page: 'lab-detail', id: l.id }, meta: l.time
    });
  }
  for (const p of data.publications) {
    items.push({
      kind: 'paper', label: p.title, q: 'cite paper/' + p.year,
      route: { page: 'publications' }, meta: p.venue
    });
  }
  return items;
}

function fuzzy(haystack, needle) {
  if (!needle) return true;
  const n = needle.toLowerCase().trim();
  const h = haystack.toLowerCase();
  // simple substring + subsequence match
  if (h.includes(n)) return true;
  let i = 0;
  for (const c of h) { if (c === n[i]) i++; if (i >= n.length) return true; }
  return false;
}

function CommandPalette({ open, onClose, go, data }) {
  const [q, setQ] = useStateCP('');
  const [sel, setSel] = useStateCP(0);
  const inputRef = useRefCP(null);
  const index = useMemoCP(() => buildIndex(data), [data]);

  useEffectCP(() => {
    if (open) {
      setQ('');
      setSel(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
    }
  }, [open]);

  const filtered = useMemoCP(() => {
    if (!q) return index;
    return index.filter(it => fuzzy(it.label + ' ' + it.q + ' ' + it.kind, q));
  }, [q, index]);

  useEffectCP(() => {
    if (!open) return;
    const k = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(filtered.length-1, s+1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s-1)); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const pick = filtered[sel];
        if (pick) { go(pick.route); onClose(); }
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, filtered, sel, go, onClose]);

  if (!open) return null;
  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-box" onClick={e => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <span className="prompt">amith@gspn ~ $</span>
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="goto research · cat blog/p4-students · run lab/bgp-101"
            value={q}
            onChange={e => { setQ(e.target.value); setSel(0); }}
          />
          <span className="cmd-hint">{filtered.length} results</span>
        </div>
        <div className="cmd-results">
          {filtered.slice(0, 10).map((it, i) =>
            <div
              key={i}
              className={`cmd-result ${i === sel ? 'sel' : ''}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => { go(it.route); onClose(); }}
            >
              <div className="kind">[{it.kind}]</div>
              <div className="label">{it.label}</div>
              <div className="meta">{it.meta}</div>
            </div>
          )}
          {filtered.length === 0 &&
            <div style={{
              padding: 24, fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center'
            }}>
              no matches · try `goto`, `cat`, `run`
            </div>
          }
        </div>
        <div className="cmd-foot">
          <div>
            <kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>↵</kbd> select · <kbd>esc</kbd> close
          </div>
          <div>{filtered.length > 10 && `+${filtered.length-10} more`}</div>
        </div>
      </div>
    </div>
  );
}

window.CommandPalette = CommandPalette;

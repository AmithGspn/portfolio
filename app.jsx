// App shell — single unified nav bar
const { useState, useEffect, useRef } = React;

const INDUSTRY_NEWS = [
  'Agentic AI Replaces Network Copilots Industry-Wide',
  'Wi-Fi 7 Enterprise Adoption Accelerating Fastest Ever',
  'Nokia & Ericsson Split Virgin Media O2 5G Contract',
  'Data Center Networking Market Hits $103 Billion',
  'Belden-Ruckus Deal Reshapes IT/OT Networking',
  '$749B Projected for AI Infrastructure by 2028',
  'Telecom OSS/BSS Silos Finally Breaking Down',
];

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="2.8" />
      <line x1="8" y1="1" x2="8" y2="2.5" />
      <line x1="8" y1="13.5" x2="8" y2="15" />
      <line x1="1" y1="8" x2="2.5" y2="8" />
      <line x1="13.5" y1="8" x2="15" y2="8" />
      <line x1="2.93" y1="2.93" x2="4.0" y2="4.0" />
      <line x1="12.0" y1="12.0" x2="13.07" y2="13.07" />
      <line x1="13.07" y1="2.93" x2="12.0" y2="4.0" />
      <line x1="4.0" y1="12.0" x2="2.93" y2="13.07" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
      <path d="M12.3 10.9A6 6 0 0 1 5.1 3.7 6 6 0 1 0 12.3 10.9z" />
    </svg>
  );
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('amith-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('amith-theme', theme);
  }, [theme]);
  return [theme, setTheme];
}

function useRoute() {
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return { page: 'home' };
    const [page, id] = hash.split('/');
    return id ? { page, id } : { page };
  });
  useEffect(() => {
    const h = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) { setRoute({ page: 'home' }); return; }
      const [page, id] = hash.split('/');
      setRoute(id ? { page, id } : { page });
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return [route, setRoute];
}

const SECTIONS = [
  { key: 'research',     label: 'Research' },
  { key: 'publications', label: 'Publications' },
  { key: 'blog',         label: 'Blog' },
  { key: 'labs',         label: 'Labs' },
  { key: 'teaching',     label: 'Teaching' },
  { key: 'talks',        label: 'Talks' },
  { key: 'cv',           label: 'CV' }
];

function Nav({ route, go, theme, setTheme, onOpenCmd }) {
  const activeKey = route.page.split('-')[0];

  // UTC clock
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const utc = time.toISOString().slice(11, 19);

  // News ticker
  const [newsIdx, setNewsIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNewsIdx(i => (i + 1) % INDUSTRY_NEWS.length), 5000);
    return () => clearInterval(id);
  }, []);

  // Visitor count
  const [visitors, setVisitors] = useState(() => {
    const local = parseInt(localStorage.getItem('amith-visit-count') || '0', 10) + 1;
    localStorage.setItem('amith-visit-count', local);
    return local;
  });
  useEffect(() => {
    fetch('https://api.countapi.xyz/hit/amithgspn.tech/visits')
      .then(r => r.json())
      .then(d => { if (d && d.value > 0) setVisitors(d.value); })
      .catch(() => {});
  }, []);

  return (
    <nav className="nav">
      <div className="nav-inner">

        {/* ── Brand ── */}
        <div className="brand" onClick={() => go({ page: 'home' })}>
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <circle cx="5"  cy="6"  r="1.6" fill="var(--accent)" />
              <circle cx="19" cy="7"  r="1.6" fill="var(--fg)" />
              <circle cx="12" cy="12" r="2.4" fill="var(--accent)" />
              <circle cx="5"  cy="19" r="1.6" fill="var(--fg)" />
              <circle cx="19" cy="19" r="1.6" fill="var(--fg)" />
              <line x1="5"  y1="6"  x2="12" y2="12" stroke="var(--fg)" strokeWidth="0.6" />
              <line x1="19" y1="7"  x2="12" y2="12" stroke="var(--fg)" strokeWidth="0.6" />
              <line x1="12" y1="12" x2="5"  y2="19" stroke="var(--fg)" strokeWidth="0.6" />
              <line x1="12" y1="12" x2="19" y2="19" stroke="var(--fg)" strokeWidth="0.6" />
            </svg>
          </div>
          <span className="brand-name">Amith Gspn</span>
        </div>

        {/* ── Telemetry mini ── */}
        <div className="nav-telemetry">
          <span className="nav-tel-cell">UTC <span className="val">{utc}</span></span>
        </div>

        {/* ── NET NEWS center ── */}
        <div className="nav-news">
          <span className="nav-news-label">NET NEWS</span>
          <div className="nav-news-track">
            <span key={newsIdx} className="nav-news-item">{INDUSTRY_NEWS[newsIdx]}</span>
          </div>
          <span className="nav-news-count">{newsIdx + 1}/{INDUSTRY_NEWS.length}</span>
        </div>

        {/* ── Page links ── */}
        <div className="nav-center">
          {SECTIONS.map(s => (
            <div key={s.key} className={`nav-link ${activeKey === s.key ? 'active' : ''}`} onClick={() => go({ page: s.key })}>
              {s.label}
            </div>
          ))}
        </div>

        {/* ── Right controls ── */}
        <div className="nav-right">
          <div className="cmd-trigger" onClick={onOpenCmd} title="Open command palette">
            <span className="label">$ goto…</span>
            <kbd>/</kbd>
          </div>
          <button className="theme-icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <div className="nav-tel-cell" style={{ borderLeft: '1px solid var(--line)', paddingLeft: 12 }}>
            <span className="visitor-dot-inline">●</span> VISITORS <span className="val">{visitors.toLocaleString()}</span>
          </div>
          <div className="nav-tel-cell nav-uplink">
            UPLINK <span className="hot">●</span> <span className="val">UP</span>
          </div>
        </div>

      </div>
    </nav>
  );
}

function Footer({ go, data }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-ascii">{
`     ┌──┐
  ◉──┤  ├──◉
     │ya│
  ◉──┤..├──◉
     └──┘
`
          }</div>
          <div>
            <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 24, letterSpacing: '-0.02em', color: 'var(--fg)', marginBottom: 8 }}>
              Amith Gspn<span style={{ color: 'var(--accent)' }}>.</span>
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.7 }}>
              PhD candidate · USC<br/>
              {data.bio.email}<br/>
              <a onClick={() => go({ page: 'cv' })}>view full CV →</a>
            </div>
          </div>
          <div className="footer-meta">
            <div>UPTIME · <span>4y 7m</span></div>
            <div>BUILD · <span>v2.6.1</span></div>
            <div>LAST COMMIT · <span>3d ago</span></div>
            <div>TZ · <span>America/New_York</span></div>
            <div>© 2026 · <span>Columbia, SC</span></div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BgGraph() {
  return (
    <div className="bg-graph">
      <NetworkGraph count={45} density={0.18} seed={73} intensity={0.4} interactive={false} />
    </div>
  );
}

function App() {
  const [theme, setTheme] = useTheme();
  const [route, setRoute] = useRoute();
  const [tracing, setTracing] = useState(false);
  const [traceTarget, setTraceTarget] = useState('home');
  const [cmdOpen, setCmdOpen] = useState(false);
  const data = window.PORTFOLIO;

  const go = (r) => {
    if (r.page === route.page && r.id === route.id) return;
    setTraceTarget(r.page);
    setTracing(true);
    setTimeout(() => {
      const hash = r.id ? `${r.page}/${r.id}` : r.page;
      window.location.hash = hash;
      setRoute(r);
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(() => setTracing(false), 200);
    }, 650);
  };

  useEffect(() => {
    const k = (e) => {
      const t = e.target;
      const tag = t && t.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable);
      if (e.key === '/' && !isInput) { e.preventDefault(); setCmdOpen(true); }
      else if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const screenLabel = route.id ? `${route.page}/${route.id}` : route.page;
  const isHome = route.page === 'home';

  let body;
  switch (route.page) {
    case 'home':             body = <HomePage go={go} data={data} />; break;
    case 'research':         body = <ResearchPage go={go} data={data} />; break;
    case 'research-detail':  body = <ResearchDetail go={go} data={data} id={route.id} />; break;
    case 'publications':     body = <PublicationsPage data={data} />; break;
    case 'blog':             body = <BlogPage go={go} data={data} />; break;
    case 'blog-detail':      body = <BlogDetail go={go} data={data} id={route.id} />; break;
    case 'labs':             body = <LabsPage go={go} data={data} />; break;
    case 'lab-detail':       body = <LabDetail go={go} data={data} id={route.id} />; break;
    case 'teaching':         body = <TeachingPage data={data} />; break;
    case 'talks':            body = <TalksPage data={data} />; break;
    case 'cv':               body = <CVPage data={data} />; break;
    default:                 body = <HomePage go={go} data={data} />;
  }

  return (
    <div className="app" data-screen-label={screenLabel}>
      <Nav route={route} go={go} theme={theme} setTheme={setTheme} onOpenCmd={() => setCmdOpen(true)} />
      {!isHome && <BgGraph />}
      {body}
      {!isHome && <Footer go={go} data={data} />}
      <Traceroute active={tracing} target={traceTarget} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} go={go} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Live-feeling telemetry ribbon — news ticker, packet counter, ping latency, visitor count
const { useState: useStateT, useEffect: useEffectT } = React;

const INDUSTRY_NEWS = [
  'Agentic AI Replaces Network Copilots Industry-Wide',
  'Wi-Fi 7 Enterprise Adoption Accelerating Fastest Ever',
  'Nokia & Ericsson Split Virgin Media O2 5G Contract',
  'Data Center Networking Market Hits $103 Billion',
  'Belden-Ruckus Deal Reshapes IT/OT Networking',
  '$749B Projected for AI Infrastructure by 2028',
  'Telecom OSS/BSS Silos Finally Breaking Down',
];

function Telemetry() {
  const [pkts, setPkts] = useStateT(8392174);
  const [latency, setLatency] = useStateT([12, 14, 11, 18, 22, 15, 13, 16, 19, 14, 17, 12, 15, 14, 16, 13]);
  const [time, setTime] = useStateT(() => new Date());
  const [newsIdx, setNewsIdx] = useStateT(0);
  const [visitors, setVisitors] = useStateT(() => {
    const local = parseInt(localStorage.getItem('amith-visit-count') || '0', 10) + 1;
    localStorage.setItem('amith-visit-count', local);
    return local;
  });

  // ticking packet count + clock
  useEffectT(() => {
    const id = setInterval(() => {
      setPkts(p => p + Math.floor(180 + Math.random() * 240));
      setTime(new Date());
    }, 700);
    return () => clearInterval(id);
  }, []);

  // latency sparkline
  useEffectT(() => {
    const id = setInterval(() => {
      setLatency(prev => [...prev.slice(1), 8 + Math.random() * 18]);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  // news ticker — cycle every 5s
  useEffectT(() => {
    const id = setInterval(() => {
      setNewsIdx(i => (i + 1) % INDUSTRY_NEWS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // real visitor count from CountAPI
  useEffectT(() => {
    fetch('https://api.countapi.xyz/hit/amithgspn.tech/visits')
      .then(r => r.json())
      .then(d => { if (d && typeof d.value === 'number' && d.value > 0) setVisitors(d.value); })
      .catch(() => {});
  }, []);

  const utc = time.toISOString().slice(11, 19);

  return (
    <div className="telemetry">
      <div className="telemetry-cell live">
        AS<span className="val">14593</span>·GSPN
      </div>
      <div className="telemetry-cell">
        UTC <span className="val">{utc}</span>
      </div>
      <div className="telemetry-cell">
        PKTS/SESSION <span className="val">{pkts.toLocaleString()}</span>
        <div className="spark">
          {latency.slice(-12).map((v, i) =>
            <span key={i} style={{ height: Math.max(2, v) + 'px' }} />
          )}
        </div>
      </div>
      <div className="telemetry-cell">
        RTT <span className="val">{latency[latency.length-1].toFixed(0)}ms</span>
      </div>

      {/* ── Center: NET NEWS ticker ── */}
      <div className="telemetry-stream">
        <span className="telemetry-news-label">NET NEWS</span>
        <div className="telemetry-news-track">
          <span key={newsIdx} className="telemetry-news-item">
            {INDUSTRY_NEWS[newsIdx]}
          </span>
        </div>
        <span className="telemetry-news-counter">{newsIdx + 1}/{INDUSTRY_NEWS.length}</span>
      </div>

      {/* ── Visitors cell (left of UPLINK) ── */}
      <div className="telemetry-cell" style={{ borderLeft: '1px solid var(--line)' }}>
        <span className="visitor-dot-inline">●</span>
        VISITORS <span className="val">{visitors.toLocaleString()}</span>
      </div>

      <div className="telemetry-cell" style={{ borderRight: 'none', borderLeft: '1px solid var(--line)' }}>
        UPLINK <span className="hot">●</span> <span className="val">UP</span>
      </div>
    </div>
  );
}

window.Telemetry = Telemetry;

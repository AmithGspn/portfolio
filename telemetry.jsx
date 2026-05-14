// Live-feeling telemetry ribbon — BGP feed, packet counter, ping latency, sparkline
const { useState: useStateT, useEffect: useEffectT, useRef: useRefT } = React;

const SAMPLE_PREFIXES = [
  '192.0.2.0/24', '198.51.100.0/22', '203.0.113.0/24', '2001:db8::/32',
  '10.140.0.0/16', '172.16.0.0/14', '129.252.0.0/16', '128.31.0.0/16',
  '8.8.8.0/24', '1.1.1.0/24', '185.143.0.0/22', '141.101.64.0/22',
  '23.32.0.0/13', '199.232.0.0/16', '146.75.0.0/16', '208.67.222.0/24',
  '93.184.216.0/24', '52.85.0.0/16', '52.84.0.0/15', '104.16.0.0/13'
];
const SAMPLE_AS = [
  'AS13335', 'AS15169', 'AS32934', 'AS8075', 'AS16509', 'AS396982',
  'AS3356', 'AS1299', 'AS6939', 'AS174', 'AS2914', 'AS6453',
  'AS7018', 'AS701', 'AS3257', 'AS6762', 'AS9498', 'AS4837'
];

function randItem(a) { return a[Math.floor(Math.random() * a.length)]; }

function generateBgpEvent() {
  const op = Math.random() < 0.7 ? 'A' : 'W';
  const pfx = randItem(SAMPLE_PREFIXES);
  const asn = randItem(SAMPLE_AS);
  const path = Array.from({length: 2 + Math.floor(Math.random()*4)}, () => randItem(SAMPLE_AS)).join(' ');
  return { op, pfx, asn, path, id: Math.random().toString(36).slice(2) };
}

function Telemetry() {
  const [pkts, setPkts] = useStateT(8392174);
  const [bgpFeed, setBgpFeed] = useStateT(() =>
    Array.from({length: 14}, () => generateBgpEvent())
  );
  const [latency, setLatency] = useStateT([12, 14, 11, 18, 22, 15, 13, 16, 19, 14, 17, 12, 15, 14, 16, 13]);
  const [time, setTime] = useStateT(() => new Date());

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
      setLatency(prev => {
        const next = [...prev.slice(1), 8 + Math.random() * 18];
        return next;
      });
    }, 1200);
    return () => clearInterval(id);
  }, []);

  // bgp feed refresh
  useEffectT(() => {
    const id = setInterval(() => {
      setBgpFeed(prev => {
        return [...prev.slice(1), generateBgpEvent()];
      });
    }, 1800);
    return () => clearInterval(id);
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
      <div className="telemetry-stream">
        <div className="telemetry-stream-inner">
          {bgpFeed.map((b, i) =>
            <span key={b.id + i} className="telemetry-bgp">
              <span className={b.op === 'A' ? 'op-a' : 'op-w'}>
                {b.op === 'A' ? 'ANN' : 'WTH'}
              </span>
              <span className="pfx">{b.pfx}</span>
              <span>via</span>
              <span className="as">{b.asn}</span>
              <span style={{ color: 'var(--fg-faint)' }}>path</span>
              <span>{b.path}</span>
              <span style={{ color: 'var(--fg-faint)' }}>·</span>
            </span>
          )}
        </div>
      </div>
      <div className="telemetry-cell" style={{ borderRight: 'none', borderLeft: '1px solid var(--line)' }}>
        UPLINK <span className="hot">●</span> <span className="val">UP</span>
      </div>
    </div>
  );
}

window.Telemetry = Telemetry;

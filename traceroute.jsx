// Traceroute-style page-transition overlay
const { useState: useStateTR, useEffect: useEffectTR } = React;

const HOPS_BANK = [
  ['route.lo0', '10.0.0.1'],
  ['edge1.usc.sc', '129.252.1.4'],
  ['core-rtr.bb1', '192.168.10.1'],
  ['carolinanet.gw', '52.91.4.18'],
  ['as14593.peer', '198.51.100.32'],
  ['site.gspn.edge', '203.0.113.7']
];

function pageHostname(page) {
  const map = {
    home: 'atlas.gspn.local',
    research: 'research.gspn.local',
    publications: 'pubs.gspn.local',
    blog: 'journal.gspn.local',
    labs: 'labs.gspn.local',
    teaching: 'teaching.gspn.local',
    talks: 'talks.gspn.local',
    cv: 'cv.gspn.local',
    'research-detail': 'project.gspn.local',
    'blog-detail': 'post.gspn.local',
    'lab-detail': 'lab.gspn.local'
  };
  return map[page] || `${page}.gspn.local`;
}

function Traceroute({ active, target }) {
  const hostname = pageHostname(target || 'home');
  const hops = HOPS_BANK.slice(0, 4 + Math.floor(Math.random() * 2));
  return (
    <div className={`traceroute ${active ? 'on' : ''}`}>
      <div className="traceroute-card">
        <h4>establishing route</h4>
        <div className="traceroute-cmd">$ traceroute -q1 {hostname}</div>
        {hops.map((h, i) =>
          <div key={i} className="trace-hop">
            <span className="h">{i+1}</span>
            <span className="a">{h[0]} ({h[1]})</span>
            <span className="t">{(2 + Math.random() * 10).toFixed(1)} ms</span>
          </div>
        )}
        <div className="trace-hop" style={{ marginTop: 6 }}>
          <span className="h">→</span>
          <span className="a" style={{ color: 'var(--accent)' }}>{hostname}</span>
          <span className="t">arrived</span>
        </div>
      </div>
    </div>
  );
}

window.Traceroute = Traceroute;

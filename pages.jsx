// All inner pages — restyled with packet-inspector + AS-path breadcrumb headers
const { useState: useStateP, useEffect: useEffectP, useMemo: useMemoP } = React;

// ============ HOME (atlas) ============
function HomePage({ go, data }) {
  return (
    <div className="atlas">
      <div className="atlas-headline">
        <div className="eyebrow">PhD Candidate · University of South Carolina</div>
        <h1>
          A <em>network</em><br/>
          for studying<br/>
          networks.
        </h1>
        <p>
          <strong style={{ color: 'var(--fg)' }}>Amith Gspn</strong> — every node on this map is a piece of my research, writing, or teaching. Drag to pan. Hover to inspect. Click to enter.
        </p>
      </div>

      <NodeAtlas go={go} data={data} />

      <div className="atlas-hint">
        <div>drag<span className="key">canvas</span></div>
        <div>hover<span className="key">node</span></div>
        <div>command palette<span className="key">/</span></div>
      </div>

      <div className="atlas-legend">
        <div><span className="legend-dot" style={{ background: 'var(--accent)' }}></span>RESEARCH</div>
        <div><span className="legend-dot" style={{ background: 'var(--accent-2)' }}></span>PUBS</div>
        <div><span className="legend-dot" style={{ background: 'var(--blue)' }}></span>BLOG</div>
        <div><span className="legend-dot" style={{ background: 'var(--green)' }}></span>LABS</div>
        <div><span className="legend-dot" style={{ background: 'var(--violet)' }}></span>TEACH</div>
      </div>

      <div className="atlas-readout">
        <div>NODES <span className="val">{data.research.length + data.blog.length + data.labs.length + data.publications.length + data.talks.length + data.teaching.length}</span></div>
        <div>HUBS <span className="val">7</span> · PEERS <span className="val">7</span></div>
        <div>ORIGIN AS <span className="val">14593</span></div>
      </div>
    </div>
  );
}

// ============ Path breadcrumb ============
function PathBreadcrumb({ path }) {
  // path like ['atlas', 'research'] or ['atlas', 'blog', 'post-id']
  return (
    <div className="page-header-loc">
      $ <span className="as">traceroute</span> /
      {path.map((p, i) =>
        <span key={i}>{i > 0 && ' / '}<span style={{ color: 'var(--fg)' }}>{p}</span></span>
      )}
      <span style={{ marginLeft: 14, color: 'var(--fg-faint)' }}>
        · {Math.floor(2 + path.length * 1.5)} hops · {(8 + Math.random() * 6).toFixed(1)} ms
      </span>
    </div>
  );
}

// ============ RESEARCH ============
function ResearchPage({ go, data }) {
  const [filter, setFilter] = useStateP('All');
  const allTags = ['All', ...new Set(data.research.flatMap(r => r.tags))];
  const items = filter === 'All' ? data.research : data.research.filter(r => r.tags.includes(filter));

  return (
    <div className="container page">
      <header className="page-header">
        <PathBreadcrumb path={['atlas', 'research']} />
        <h1>What I'm<br/><em>working on.</em></h1>
        <p>
          A running list of research projects — ongoing and published. Most live at the intersection of network measurement, programmable data planes, and security.
        </p>
        <div className="page-header-meta">
          <div>ACTIVE · <span>{data.research.filter(r => r.status === 'ongoing').length}</span></div>
          <div>PUBLISHED · <span>{data.research.filter(r => r.status === 'published').length}</span></div>
          <div>TOTAL · <span>{data.research.length}</span></div>
        </div>
      </header>

      <div className="filter-row">
        <span className="filter-label">filter ›</span>
        {allTags.map(t => (
          <button key={t} className={`filter-pill ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>
            {t}
          </button>
        ))}
      </div>

      <div>
        {items.map(r => (
          <div key={r.id} className="research-row" onClick={() => go({ page: 'research-detail', id: r.id })}>
            <div className="research-tag-ascii">
              <span className="yr">{r.year}</span>
              ◉ status
              <span className="st" style={{ color: r.status === 'ongoing' ? 'var(--accent)' : 'var(--fg-muted)' }}>
                {r.status === 'ongoing' ? '● ACTIVE' : '○ PUB'}
              </span>
            </div>
            <div>
              <div className="research-title">{r.title}</div>
              <div className="research-sum">{r.summary}</div>
              <div className="research-meta">
                {r.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
            <div className="research-arrow">↗</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ PUBLICATIONS (packet inspector) ============
function PublicationsPage({ data }) {
  return (
    <div className="container page">
      <header className="page-header">
        <PathBreadcrumb path={['atlas', 'publications']} />
        <h1>Peer-<em>reviewed.</em></h1>
        <p>
          Selected publications in networking and security venues. Pre-prints linked where applicable; reach out for raw data.
        </p>
      </header>

      <div style={{ border: '1px solid var(--line)', borderRadius: 2, overflow: 'hidden' }}>
        <div className="pkt-head">
          <div>#</div>
          <div>YEAR</div>
          <div>TITLE</div>
          <div>AUTHORS</div>
          <div>VENUE</div>
          <div>FETCH</div>
        </div>
        {data.publications.map((p, i) => (
          <div key={i} className="pkt-row">
            <div className="seq">[{String(data.publications.length - i).padStart(2, '0')}]</div>
            <div className="yr">{p.year}</div>
            <div>
              <div className="title">{p.title}</div>
            </div>
            <div className="authors">
              {p.authors.map((a, j) => (
                <span key={j}>
                  {a.includes('Gspn') ? <strong>{a}</strong> : a}
                  {j < p.authors.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
            <div className="venue">{p.venue}</div>
            <div className="pkt-actions">
              <button className="pkt-btn">PDF</button>
              <button className="pkt-btn">BIB</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 32, fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.08em'
      }}>
        $ ls publications/ | wc -l<br/>
        <span style={{ color: 'var(--fg)' }}>{data.publications.length}</span> records · last appended <span style={{ color: 'var(--accent)' }}>2025-08-12</span>
      </div>
    </div>
  );
}

// ============ BLOG ============
function BlogPage({ go, data }) {
  return (
    <div className="container page">
      <header className="page-header">
        <PathBreadcrumb path={['atlas', 'blog']} />
        <h1>Notes, mostly<br/>about <em>networks.</em></h1>
        <p>
          Long-form posts on measurement, incidents, and the occasional rant about how DNS continues to be the universal scapegoat. {data.blog.length} posts.
        </p>
      </header>
      <div>
        {data.blog.map(b => (
          <div key={b.id} className="blog-row" onClick={() => go({ page: 'blog-detail', id: b.id })}>
            <div className="blog-date">{b.date}</div>
            <div>
              <div className="blog-title">{b.title}</div>
              <div className="blog-excerpt">{b.excerpt}</div>
              {b.tag && <div style={{ marginTop: 10 }}><span className="tag hot">{b.tag}</span></div>}
            </div>
            <div className="blog-read">{b.readTime}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ BLOG DETAIL ============
function BlogDetail({ go, data, id }) {
  const post = data.blog.find(b => b.id === id) || data.blog[0];
  return (
    <div className="container page">
      <div className="detail">
        <PathBreadcrumb path={['atlas', 'blog', post.id]} />
        <div className="detail-back" onClick={() => go({ page: 'blog' })}>← back to /journal</div>
        <div className="eyebrow">{post.tag || 'Field notes'} · {post.readTime}</div>
        <h1 className="detail-title">{post.title}</h1>
        <div className="detail-meta">
          <span>{post.date}</span>
          <span>· by Amith Gspn</span>
          <span>· University of South Carolina</span>
        </div>

        <div className="detail-content">
          {(post.content || [post.excerpt]).map((p, i) => <p key={i}>{p}</p>)}

          <h2>The detection pipeline</h2>
          <p>
            We run a small fleet of BGPmon collectors plus a custom diff engine over RIPE RIS dumps every 60 seconds. On a typical day it catches three or four small anomalies — most are benign. The interesting ones bubble up to a Mattermost channel that I am, regrettably, on call for.
          </p>
          <pre>
<span className="c"># detect divergence between announced and authorized origin</span>{'\n'}
<span className="k">def</span> divergent(prefix, observed_origin):{'\n'}
{'  '}roa = lookup_roa(prefix){'\n'}
{'  '}<span className="k">if</span> roa <span className="k">and</span> observed_origin <span className="k">not in</span> roa.origins:{'\n'}
{'    '}<span className="k">return</span> AnomalyReason.RPKI_INVALID{'\n'}
{'  '}<span className="k">if</span> observed_origin <span className="k">not in</span> historical_origins(prefix):{'\n'}
{'    '}<span className="k">return</span> AnomalyReason.HISTORICAL_DIVERGENCE{'\n'}
{'  '}<span className="k">return</span> <span className="k">None</span>
          </pre>
          <p>
            The model that ranks anomalies is a small temporal GNN — that's the topic of the GraphWatch paper if you want the math. Out of the lab, it does about 92% precision on holdout months from 2023–2024.
          </p>

          <h2>What we'd do differently</h2>
          <p>
            Three things, in priority order. First: route validation cannot live only at the announcing AS — there are too many "but my upstream is fine" failure modes. Second: RPKI tells you what's authorized; it does not tell you what's <em>plausible</em>. Plausibility is where the ML actually earns its keep. Third: eleven minutes is too long. We have a draft pipeline that gets first-flag to under 90 seconds; details in a future post.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ LABS ============
function LabsPage({ go, data }) {
  const [filter, setFilter] = useStateP('All');
  const items = filter === 'All' ? data.labs : data.labs.filter(l => {
    if (filter === 'Beginner') return l.diff === 'beg';
    if (filter === 'Intermediate') return l.diff === 'int';
    if (filter === 'Advanced') return l.diff === 'adv';
    return true;
  });

  return (
    <div className="container page">
      <header className="page-header">
        <PathBreadcrumb path={['atlas', 'labs']} />
        <h1>Learn networks<br/>by <em>breaking them.</em></h1>
        <p>
          Self-contained tutorials I've built (mostly) for my students. Each one runs locally in containers or a VM — no special hardware required.
        </p>
        <div className="page-header-meta">
          <div>LABS · <span>{data.labs.length}</span></div>
          <div>TOTAL RUNS · <span>3,635</span></div>
          <div>AVG. TIME · <span>2 hrs</span></div>
        </div>
      </header>

      <div className="filter-row">
        <span className="filter-label">level ›</span>
        {['All', 'Beginner', 'Intermediate', 'Advanced'].map(t => (
          <button key={t} className={`filter-pill ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-2">
        {items.map(l => (
          <div key={l.id} className="lab-card" onClick={() => go({ page: 'lab-detail', id: l.id })}>
            <div className="lab-head">
              <div>{l.tools.join(' · ')}</div>
              <div className={`lab-diff ${l.diff}`}>
                {l.diff === 'beg' ? 'Beginner' : l.diff === 'int' ? 'Intermediate' : 'Advanced'}
              </div>
            </div>
            <div className="lab-body">
              <div className="lab-title">{l.title}</div>
              <div className="lab-sum">{l.summary}</div>
              <div className="lab-meta">
                <div>TIME · <span>{l.time}</span></div>
                <div>RUNS · <span>{l.students}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ LAB DETAIL ============
function LabDetail({ go, data, id }) {
  const lab = data.labs.find(l => l.id === id) || data.labs[0];
  return (
    <div className="container page">
      <div className="detail">
        <PathBreadcrumb path={['atlas', 'labs', lab.id]} />
        <div className="detail-back" onClick={() => go({ page: 'labs' })}>← back to /labs</div>
        <div className="eyebrow">Lab · {lab.diff === 'beg' ? 'Beginner' : lab.diff === 'int' ? 'Intermediate' : 'Advanced'} · {lab.time}</div>
        <h1 className="detail-title">{lab.title}</h1>
        <div className="detail-meta">
          <span>Tools: {lab.tools.join(', ')}</span>
          <span>· {lab.students}</span>
        </div>

        <div className="detail-content">
          <p>{lab.summary}</p>

          <h2>What you'll learn</h2>
          <p>
            By the end of this lab you will have a working mental model of the relevant protocols and toolchain, plus a deployable artifact you can keep tinkering with. The instructions are step-by-step but each step explains the <em>why</em>, not just the <em>what</em>.
          </p>

          <h2>Setup</h2>
          <p>
            Clone the repo. Run the bootstrapper. Open the lab in your terminal of choice. Estimated cold-start: under five minutes on a recent laptop.
          </p>
          <pre>
<span className="c"># clone and start the lab</span>{'\n'}
git clone https://github.com/amithgspn/{lab.id}.git{'\n'}
<span className="k">cd</span> {lab.id}{'\n'}
./bootstrap.sh{'\n'}
{'\n'}
<span className="c"># verify the topology is up</span>{'\n'}
containerlab inspect --topo {lab.id}.clab.yml
          </pre>

          <h2>The work</h2>
          <p>
            Seven exercises, ordered by depth. Some have hidden bugs — that's on purpose. The lab passes when all seven assertions pass and you can explain (aloud, to a rubber duck or co-worker) what each step did.
          </p>

          <div style={{
            marginTop: 32, padding: 24, background: 'var(--accent-soft)',
            borderLeft: '3px solid var(--accent)', borderRadius: 2
          }}>
            <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 8 }}>Heads up</div>
            <p style={{ margin: 0, color: 'var(--fg)' }}>
              This lab assumes Docker and a recent Linux kernel. macOS works via Lima; Windows works via WSL2 but expect some friction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ RESEARCH DETAIL ============
function ResearchDetail({ go, data, id }) {
  const r = data.research.find(x => x.id === id) || data.research[0];
  return (
    <div className="container page">
      <div className="detail">
        <PathBreadcrumb path={['atlas', 'research', r.id]} />
        <div className="detail-back" onClick={() => go({ page: 'research' })}>← back to /research</div>
        <div className="eyebrow">{r.year} · {r.status.toUpperCase()}</div>
        <h1 className="detail-title">{r.title}</h1>
        <div className="detail-meta">
          {r.tags.map(t => <span key={t}>· {t}</span>)}
        </div>

        <div className="detail-content">
          <p>{r.summary}</p>

          <h2>Why this matters</h2>
          <p>
            Network operators spend more time arguing about what their network is doing than fixing it. The premise of this work is that measurement should be a first-class citizen of network design, not bolted on after deployment. If we know, with high confidence and low latency, what is happening on the wire, every other operational problem becomes easier.
          </p>

          <h2>Approach</h2>
          <p>
            We combine programmable data-plane primitives (in this case, P4 on Tofino) with a temporal modeling layer that consumes the resulting telemetry stream. The contribution is less the individual pieces — both have been studied — and more the discipline of treating them as a single system.
          </p>

          <h2>Status</h2>
          <p>
            {r.status === 'ongoing'
              ? "Active. We're targeting a SIGCOMM 2026 submission and would love collaborators with deployment access at scale."
              : "Published. Full paper, slides, and code linked below; data on request."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ TEACHING ============
function TeachingPage({ data }) {
  return (
    <div className="container page">
      <header className="page-header">
        <PathBreadcrumb path={['atlas', 'teaching']} />
        <h1>I teach <em>networks.</em></h1>
        <p>
          Mostly undergraduate networking and graduate programmable-networks. Course materials and (where allowed) lecture recordings are open.
        </p>
      </header>

      <div className="teach-grid">
        {data.teaching.map((t, i) => (
          <div key={i} className="teach-card">
            <div className="teach-code">{t.code}</div>
            <div className="teach-title">{t.title}</div>
            <div className="muted" style={{ fontSize: 14 }}>{t.role}</div>
            <div className="teach-meta">
              <div>{t.term.toUpperCase()}</div>
              <div><span>{t.enr}</span></div>
              {t.eval && <div>EVAL · <span>{t.eval}</span></div>}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 56, padding: 40, background: 'var(--bg-elev)',
        border: '1px solid var(--line)', borderRadius: 2
      }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Philosophy</div>
        <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 28, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
          Most students don't fail networking because the material is hard. They fail because the abstractions are taught before the artifacts. I try, where possible, to invert that order — capture a packet on day one, derive the protocol from it on day three.
        </p>
      </div>
    </div>
  );
}

// ============ TALKS ============
function TalksPage({ data }) {
  return (
    <div className="container page">
      <header className="page-header">
        <PathBreadcrumb path={['atlas', 'talks']} />
        <h1>Spoken<br/>about <em>this stuff.</em></h1>
        <p>
          A list of conferences, meetups, and invited talks. Slides and recordings linked where they exist; reach out for the rest.
        </p>
      </header>

      <div>
        {data.talks.map((t, i) => (
          <div key={i} className="talk-row">
            <div className="talk-num">[{String(data.talks.length - i).padStart(2, '0')}]</div>
            <div>
              <div className="talk-where">{t.where}</div>
              <div className="talk-title">{t.title}</div>
              <div className="talk-loc">{t.loc}</div>
            </div>
            <div className="talk-meta">
              <div className="date">{t.date.toUpperCase()}</div>
              <div className="kind">{t.kind.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ CV ============
function CVPage({ data }) {
  return (
    <div className="container page">
      <header className="page-header">
        <PathBreadcrumb path={['atlas', 'cv']} />
        <h1>The <em>long form.</em></h1>
        <p>
          A condensed CV. Download a PDF version, or reach out if you need a tailored academic or industry version.
        </p>
        <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
          <button className="pkt-btn">Download PDF</button>
          <button className="pkt-btn">Google Scholar</button>
          <button className="pkt-btn">ORCID</button>
        </div>
      </header>

      <div className="cv-grid">
        <div className="cv-sidebar">
          <div className="placeholder-img headshot">HEADSHOT 4:5</div>
          <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 28, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {data.bio.name}
          </div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
            {data.bio.short} · {data.bio.long}<br/>
            {data.bio.affiliation}<br/>
            {data.bio.location}
          </div>
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
            {data.bio.longBio}
          </div>

          <div className="cv-section" style={{ marginTop: 32 }}>
            <h3>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.cv.skills.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
        </div>

        <div>
          {[
            ['Education', data.cv.education],
            ['Industry experience', data.cv.experience],
            ['Awards & honors', data.cv.awards],
            ['Service', data.cv.service]
          ].map(([heading, items]) => (
            <div key={heading} className="cv-section">
              <h3>{heading}</h3>
              {items.map((e, i) => (
                <div key={i} className="cv-item">
                  <div className="cv-when">{e.when}</div>
                  <div className="cv-what">
                    <h4>{e.what}</h4>
                    <p>{e.where}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  HomePage, ResearchPage, PublicationsPage, BlogPage, BlogDetail,
  LabsPage, LabDetail, ResearchDetail, TeachingPage, TalksPage, CVPage,
  PathBreadcrumb
});

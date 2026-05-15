// All portfolio content lives here.
window.PORTFOLIO = {
  bio: {
    name: "Amith Gspn",
    short: "PhD Candidate",
    long: "Computer Networks & Security",
    affiliation: "University of South Carolina",
    location: "Columbia, SC",
    email: "amith@sc.edu",
    pronouns: "he/him",
    blurb:
      "I study how networks behave under stress — congestion, attack, and failure — and build tools that make the invisible structure of the internet legible. Currently a fifth-year PhD candidate at the University of South Carolina.",
    longBio:
      "My research sits at the intersection of measurement, programmable data planes, and security. I'm interested in the gap between how we believe networks behave and how they actually behave in the wild. Day-to-day that means writing P4 pipelines, running BGP testbeds, instrumenting traffic at scale, and occasionally teaching undergrads to ping things correctly."
  },

  blog: [
    {
      id: "bgp-route-leaks",
      featured: true,
      title: "Tracing a Route Leak in 11 Minutes",
      date: "Apr 28, 2026",
      readTime: "9 min read",
      tag: "Field notes",
      excerpt:
        "A regional ISP in central Europe announced a prefix it had no business announcing. By the time we noticed, traffic from three continents was already taking the scenic route. Here's how we found it, and what the post-mortem says about why this still keeps happening in 2026.",
      content: [
        "At 14:02 UTC on a Tuesday, an autonomous system in central Europe began announcing a /16 belonging to a North American cloud provider. By 14:13, our BGPmon instance had flagged the divergence. By 14:24, the announcement was withdrawn — but in the eleven minutes between, roughly 7% of inbound traffic to that prefix had been routed through equipment it should never have touched.",
        "This post walks through the detection pipeline, the forensic trail in our RIPE RIS snapshots, and why RPKI alone would not have caught it."
      ]
    },
    {
      id: "ebpf-vs-dpdk",
      title: "eBPF vs DPDK for line-rate monitoring: what we measured",
      date: "Mar 14, 2026",
      readTime: "12 min",
      excerpt:
        "Everyone has an opinion. We ran 40 Gbps through both and benchmarked the actual cost of each abstraction."
    },
    {
      id: "p4-students",
      title: "Teaching P4 to undergraduates (without breaking them)",
      date: "Feb 02, 2026",
      readTime: "7 min",
      excerpt:
        "A curriculum that starts with packet visualization, not headers. After three semesters, here's what worked."
    },
    {
      id: "dns-shadows",
      title: "The shape of a DNS amplification attack, visualized",
      date: "Jan 10, 2026",
      readTime: "5 min",
      excerpt:
        "A short post with interactive graphs of three real reflection events we caught on the campus edge."
    },
    {
      id: "phd-year-five",
      title: "On year five",
      date: "Dec 18, 2025",
      readTime: "4 min",
      excerpt:
        "A more personal one. What I'd tell year-one me. What I still don't know."
    },
    {
      id: "quic-in-the-wild",
      title: "QUIC adoption from one campus edge, 2022–2025",
      date: "Nov 24, 2025",
      readTime: "10 min",
      excerpt:
        "Three years of pcaps. Charts, not opinions. (Mostly.)"
    }
  ],

  research: [
    {
      id: "graphwatch",
      title: "GraphWatch: detecting BGP anomalies with temporal GNNs",
      year: "2025—",
      summary:
        "A graph-neural-network approach to spotting route hijacks, leaks, and policy violations in near-real-time. Trained on five years of RouteViews data; deployed on the SC research network.",
      tags: ["BGP", "ML", "Measurement"],
      status: "ongoing"
    },
    {
      id: "p4probe",
      title: "P4Probe: programmable in-band telemetry for campus networks",
      year: "2024",
      summary:
        "A P4 pipeline that piggybacks fine-grained latency and loss measurements onto live traffic, with under 0.4% overhead at 100 Gbps.",
      tags: ["P4", "INT", "Tofino"],
      status: "published"
    },
    {
      id: "quic-fingerprint",
      title: "Fingerprinting QUIC at scale without breaking it",
      year: "2024",
      summary:
        "Passive classification of QUIC flows using only initial-packet features. 96.4% accuracy across 28 implementations.",
      tags: ["QUIC", "Privacy"],
      status: "published"
    },
    {
      id: "iot-honeycomb",
      title: "Honeycomb: a low-interaction IoT honeynet at residential scale",
      year: "2023",
      summary:
        "Deployed 400 emulated IoT endpoints across three university apartment buildings. Caught two zero-day exploitation campaigns in the wild.",
      tags: ["IoT", "Security", "Honeypots"],
      status: "published"
    },
    {
      id: "dns-resolvers",
      title: "The long tail of DNS resolvers",
      year: "2023",
      summary:
        "An internet-scale survey of recursive resolvers — who runs them, what they leak, and how they age.",
      tags: ["DNS", "Measurement"],
      status: "published"
    },
    {
      id: "anomaly-baselines",
      title: "Anomaly baselines for ICS/SCADA traffic in water utilities",
      year: "2022",
      summary:
        "A joint project with a regional water authority establishing normal-traffic profiles to flag deviation. The data taught us that 'normal' is a moving target.",
      tags: ["ICS", "Security"],
      status: "published"
    }
  ],

  publications: [
    {
      title:
        "GraphWatch: Detecting BGP Hijacks via Temporal Graph Neural Networks",
      authors: ["A. Gspn", "L. Iyer", "R. Kowalski", "S. Ahmad"],
      venue: "USENIX Security 2025",
      year: "2025",
      featured: true
    },
    {
      title:
        "P4Probe: Low-Overhead In-Band Network Telemetry at 100 Gbps",
      authors: ["A. Gspn", "M. Park", "S. Ahmad"],
      venue: "ACM SIGCOMM 2024",
      year: "2024",
      featured: true
    },
    {
      title:
        "Passive Fingerprinting of QUIC Implementations from Initial Packets",
      authors: ["A. Gspn", "L. Iyer"],
      venue: "IMC 2024",
      year: "2024"
    },
    {
      title:
        "Honeycomb: A Residential-Scale IoT Honeynet",
      authors: ["A. Gspn", "T. Brown", "S. Ahmad"],
      venue: "NDSS 2023",
      year: "2023"
    },
    {
      title:
        "The Long Tail of Open DNS Resolvers",
      authors: ["R. Kowalski", "A. Gspn", "S. Ahmad"],
      venue: "PAM 2023",
      year: "2023"
    },
    {
      title:
        "Anomaly Baselining in ICS Networks: Lessons from a Water Utility",
      authors: ["A. Gspn", "J. Patel"],
      venue: "ACSAC 2022",
      year: "2022"
    },
    {
      title:
        "On the Stability of Inter-Domain Routing Under Stress",
      authors: ["A. Gspn"],
      venue: "ACM CoNEXT '21 Student Workshop",
      year: "2021"
    }
  ],

  labs: [
    {
      id: "bgp-101",
      title: "BGP from First Principles",
      diff: "beg",
      summary:
        "Build a 4-AS topology in containerlab and watch routes propagate. By the end you'll have triggered (and recovered from) your first route leak.",
      time: "90 min",
      tools: ["containerlab", "FRR"],
      students: "1,200+ runs"
    },
    {
      id: "p4-intro",
      title: "Your First P4 Program",
      diff: "int",
      summary:
        "Write a P4 pipeline that classifies traffic by destination prefix and counts bytes per category. Runs in bmv2; no hardware needed.",
      time: "2 hours",
      tools: ["P4", "bmv2", "Mininet"],
      students: "840 runs"
    },
    {
      id: "tls-handshake",
      title: "Reading a TLS 1.3 handshake the hard way",
      diff: "int",
      summary:
        "Wireshark + OpenSSL + a packet capture I generated for you. Annotate every field. You will hate ASN.1 by the end.",
      time: "75 min",
      tools: ["Wireshark", "OpenSSL"],
      students: "620 runs"
    },
    {
      id: "ddos-mitigate",
      title: "Mitigate a (simulated) DDoS at the campus edge",
      diff: "adv",
      summary:
        "You are the on-call. The pager goes off. You have 30 minutes of synthetic attack traffic and three mitigation tools. Make it stop without taking down the dorms.",
      time: "3 hours",
      tools: ["Suricata", "FastNetMon", "BGP RTBH"],
      students: "210 runs"
    },
    {
      id: "ipv6-deploy",
      title: "Deploy dual-stack across a small enterprise",
      diff: "int",
      summary:
        "From IPv6 address planning to DHCPv6 to debugging happy-eyeballs failures. Self-contained virtual lab.",
      time: "2.5 hours",
      tools: ["GNS3", "Cisco IOS-XR"],
      students: "470 runs"
    },
    {
      id: "ebpf-probe",
      title: "Write an eBPF probe to find slow TCP connections",
      diff: "adv",
      summary:
        "Hook into the TCP stack, measure RTT and retransmits, expose it over a perf buffer. Heads up — this lab is opinionated about kernel versions.",
      time: "2 hours",
      tools: ["eBPF", "bcc", "Python"],
      students: "295 runs"
    }
  ],

  talks: [
    {
      where: "USENIX Security",
      title: "GraphWatch: Detecting BGP Hijacks via Temporal GNNs",
      loc: "Philadelphia, PA",
      date: "Aug 2025",
      kind: "Paper talk"
    },
    {
      where: "NANOG 92",
      title: "What measurement actually tells us about RPKI",
      loc: "Atlanta, GA",
      date: "Jun 2025",
      kind: "Invited"
    },
    {
      where: "ACM SIGCOMM",
      title: "P4Probe: 100Gbps INT with under 0.5% overhead",
      loc: "Sydney, AU",
      date: "Aug 2024",
      kind: "Paper talk"
    },
    {
      where: "RSA Conference",
      title: "What three years of IoT honeypot data taught us",
      loc: "San Francisco, CA",
      date: "May 2024",
      kind: "Invited"
    },
    {
      where: "Internet2 TechEx",
      title: "Operational lessons from a campus-scale honeynet",
      loc: "Boston, MA",
      date: "Dec 2023",
      kind: "Tutorial"
    },
    {
      where: "Carolina Code Conf.",
      title: "How the internet actually finds you (and what could go wrong)",
      loc: "Columbia, SC",
      date: "Oct 2023",
      kind: "Keynote"
    }
  ],

  teaching: [
    {
      code: "CSCE 416",
      title: "Introduction to Computer Networks",
      role: "Instructor of Record",
      term: "Spring 2026",
      enr: "84 students",
      eval: "4.8 / 5.0"
    },
    {
      code: "CSCE 416",
      title: "Introduction to Computer Networks",
      role: "Instructor of Record",
      term: "Fall 2025",
      enr: "76 students",
      eval: "4.7 / 5.0"
    },
    {
      code: "CSCE 522",
      title: "Information Security Principles",
      role: "Teaching Assistant",
      term: "Spring 2024",
      enr: "62 students"
    },
    {
      code: "CSCE 716",
      title: "Programmable Networks (Graduate)",
      role: "Co-Instructor",
      term: "Fall 2024",
      enr: "18 students",
      eval: "4.9 / 5.0"
    }
  ],

  cv: {
    education: [
      {
        when: "Aug 2024 — Present",
        what: "Doctor of Philosophy (Ph.D.), Informatics",
        where: "University of South Carolina, Columbia · GPA: 4.0/4.0"
      },
      {
        when: "Aug 2022 — Dec 2023",
        what: "Master of Science (M.S.), Computer Engineering",
        where: "Illinois Institute of Technology, Chicago · GPA: 3.4/4.0"
      },
      {
        when: "Aug 2014 — May 2018",
        what: "Bachelor of Technology (B.Tech), Telecommunication Engineering",
        where: "BMS Institute of Technology, Bangalore · GPA: 3.2/4.0"
      }
    ],
    experience: [
      {
        when: "May 2023 — Aug 2023",
        what: "Software Engineer Intern",
        where: "Keysight Technologies, Calabasas, CA",
        bullets: [
          "Developed APIs for DASH (Disaggregated SONiC Hosts) as part of open-source project SONiC-net/DASH.",
          "Introduced support for fixed SAI (Switch Abstraction Interface) headers in DASH-libsai code generator using C++.",
          "Executed underlay routing table P4 logic for routing and tweaked functionality for optimal performance.",
          "Formulated test cases in Python using the pytest framework to validate static routing capabilities."
        ]
      },
      {
        when: "Jul 2018 — Jul 2022",
        what: "Software Engineer",
        where: "Opennets (Dhavala Enterprises), Bangalore",
        bullets: [
          "Engineered a cross-platform Web IDE for Data Plane programming supporting P4 and NPL languages using Angular 8+, NodeJS, MongoDB, REST, ExpressJS, Python and C++.",
          "Deployed a multi-user cloud-based compiler system on AWS with Auto Scaling, ELB, and Python orchestration scripts.",
          "Built interactive network emulation capabilities embedding terminals for each node using Xterm.js.",
          "Developed a lightweight Docker-based P4 compiler, reducing compilation time by 40%.",
          "Led and mentored a team of interns to extend the IDE with GUI-based network topology creation."
        ]
      }
    ],
    papers: [
      {
        when: "Submitted 2025",
        what: "Real-Time Encrypted Traffic Classification using P4-DPDK",
        where: "92% accuracy · 100 Gbps background traffic · FABRIC testbed · Random Forest model"
      },
      {
        when: "Oct 2025",
        what: "Evaluating Encryption Overhead and Offload Techniques in High-Speed Data Transfers",
        where: "Poster · FABRIC KNIT 11 · Salt Lake City, UT"
      },
      {
        when: "Mar 2025",
        what: "Real-Time Encrypted Traffic Classification with P4-DPDK",
        where: "Poster & Demo · FABRIC KNIT 10 · Chapel Hill, NC"
      }
    ],
    grants: [
      {
        when: "2024 — Present",
        what: "Lab Library: DPU Programming using DOCA",
        where: "NSF 2417823 CyberTraining Project · Five-lab series on NVIDIA DOCA framework covering initialization, device subsystem, memory management, task execution, and accelerator invocation."
      },
      {
        when: "2024 — Present",
        what: "Lab Library: DPU Programming using P4",
        where: "NSF 2417823 CyberTraining Project · Labs covering programmable pipelines, packet mirroring, match-action tables, externs, meters, and runtime rule updates on BlueField DPUs."
      }
    ],
    certifications: [
      { when: "Aug 2025", what: "Cisco Certified Network Associate (CCNA): CyberOps Associate", where: "Cisco" },
      { when: "Jun 2025", what: "Introducing Generative AI with AWS", where: "Amazon Web Services" },
      { when: "May 2025", what: "Cisco Certified Network Associate (CCNA): Introduction to Networks", where: "Cisco" },
      { when: "Jul 2024", what: "Supervised Machine Learning: Regression and Classification", where: "Coursera / Stanford" },
      { when: "May 2020", what: "Programming for Everybody (Python)", where: "Coursera / University of Michigan" },
      { when: "May 2020", what: "Python Data Structures", where: "Coursera / University of Michigan" }
    ],
    skills: [
      "P4", "NPL", "DOCA", "DPDK",
      "C", "C++", "Python", "JavaScript",
      "Zeek", "Suricata",
      "Pytest", "Angular 8+", "Node.JS", "Express.JS", "Xterm.JS",
      "Docker", "Git", "Mininet", "SQL", "MongoDB",
      "AWS", "VMware", "FABRIC", "Kubernetes", "NETLAB"
    ]
  }
};

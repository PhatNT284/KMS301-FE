import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Boxes,
  CheckCircle2,
  ClipboardList,
  DatabaseZap,
  FileClock,
  Gauge,
  Orbit,
  Radio,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import KnowledgeScene from "./components/KnowledgeScene.jsx";
import { fallbackData } from "./data/fallbackData.js";
import heroImage from "./assets/kms-hero.png";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api/kms";

const navItems = [
  { id: "overview", label: "Tổng quan", icon: BarChart3 },
  { id: "map", label: "Bản đồ tri thức", icon: Orbit },
  { id: "process", label: "SOPs", icon: ClipboardList },
  { id: "lessons", label: "Bài học", icon: BookOpenCheck },
  { id: "logs", label: "Báo cáo", icon: FileClock }
];

function Badge({ children, tone = "teal" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function ReactiveCard({ className = "", children }) {
  const onPointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
  };

  return (
    <article className={`reactive-card ${className}`} onPointerMove={onPointerMove}>
      {children}
    </article>
  );
}

export default function App() {
  const [data, setData] = useState(fallbackData);
  const [activeNav, setActiveNav] = useState("overview");
  const [query, setQuery] = useState("");
  const [apiState, setApiState] = useState("Local fallback");

  useEffect(() => {
    let mounted = true;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json();
      })
      .then((payload) => {
        if (!mounted) return;
        setData(payload);
        setApiState("Connected to BE");
      })
      .catch(() => {
        if (mounted) setApiState("Local fallback");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    const rows = [
      ...data.knowledgeAreas.map((item) => ({ type: "Area", title: item.title, body: item.description })),
      ...data.processes.map((item) => ({ type: "SOP", title: item.title, body: item.detail })),
      ...data.lessons.map((item) => ({ type: "Lesson", title: item.title, body: item.lesson })),
      ...data.reports.map((item) => ({ type: "Report", title: item.activity, body: item.evidence }))
    ];

    if (!term) return rows.slice(0, 4);
    return rows.filter((item) => `${item.type} ${item.title} ${item.body}`.toLowerCase().includes(term)).slice(0, 4);
  }, [data, query]);

  const scrollTo = (id) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onShellPointerMove = (event) => {
    event.currentTarget.style.setProperty("--mx", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY}px`);
  };

  return (
    <div className="app-shell" onPointerMove={onShellPointerMove}>
      <div className="background-field" />

      <header className="command-header">
        <button className="brand" type="button" onClick={() => scrollTo("overview")} title="KMS301 home">
          <span className="brand-mark">
            <Boxes size={21} />
          </span>
          <span>
            <strong>{data.project.course}</strong>
            <small>Knowledge Operations</small>
          </span>
        </button>

        <nav className="top-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={activeNav === item.id ? "nav-chip active" : "nav-chip"}
                onClick={() => scrollTo(item.id)}
                title={item.label}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="connection-pill">
          <ShieldCheck size={17} />
          <span>{apiState}</span>
        </div>
      </header>

      <main>
        <section className="hero-command" id="overview">
          <video className="hero-video" muted loop autoPlay playsInline poster={heroImage} src={data.media.videoUrl} />
          <img className="hero-image" src={heroImage} alt="KMS301 knowledge system visual" />
          <div className="hero-overlay" />

          <div className="hero-layout">
            <div className="hero-copy">
              <Badge tone="coral">KMS301 Project System</Badge>
              <h1>{data.project.name}</h1>
              <p>{data.project.subtitle}</p>

              <div className="hero-actions">
                <button type="button" className="primary-button" onClick={() => scrollTo("map")}>
                  <Sparkles size={18} />
                  Khám phá 3D map
                </button>
                <button type="button" className="secondary-button" onClick={() => scrollTo("process")}>
                  Xem SOP flow
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="search-console">
                <div className="search-shell">
                  <Search size={18} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Tìm SOP, lesson, báo cáo, insight..."
                    aria-label="Search project knowledge"
                  />
                </div>
                <div className="result-stack">
                  {searchResults.map((item) => (
                    <button key={`${item.type}-${item.title}`} type="button" className="result-row">
                      <span>{item.type}</span>
                      <strong>{item.title}</strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="visual-console" id="map">
              <div className="console-topline">
                <Badge tone="teal">Interactive 3D</Badge>
                <span>Move cursor to steer the knowledge hub</span>
              </div>
              <KnowledgeScene />
              <div className="signal-dock">
                {data.signals.map((signal) => (
                  <div className="signal-card" key={signal.label}>
                    <span>{signal.label}</span>
                    <strong>{signal.value}</strong>
                    <small>{signal.detail}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="metric-grid" aria-label="KMS metrics">
          {data.metrics.map((metric) => (
            <ReactiveCard className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.trend}</small>
            </ReactiveCard>
          ))}
        </section>

        <section className="content-section">
          <SectionHeader
            eyebrow="System model"
            title="Bản đồ tri thức của dự án"
            description="5 template chỉ còn là nền logic để hệ thống hiểu dự án. Người dùng nhìn thấy một cockpit vận hành, không phải một trang học thuộc template."
            action={<Badge tone="lime">Cursor reactive</Badge>}
          />
          <div className="area-grid">
            {data.knowledgeAreas.map((area, index) => (
              <ReactiveCard className="area-card" key={area.title}>
                <div className="area-index">{String(index + 1).padStart(2, "0")}</div>
                <Badge tone={index % 2 === 0 ? "teal" : "amber"}>{area.pulse}</Badge>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
              </ReactiveCard>
            ))}
          </div>
        </section>

        <section className="content-section process-section" id="process">
          <SectionHeader
            eyebrow="SOP engine"
            title="Quy Trình & SOPs"
            description="Luồng SOP được thiết kế như một pipeline vận hành: từ capture tri thức thô đến SOP có thể tái sử dụng."
            action={<Gauge size={22} />}
          />
          <div className="process-timeline">
            {data.processes.map((process) => (
              <ReactiveCard className="process-step" key={process.stage}>
                <div className="step-head">
                  <span>{process.stage}</span>
                  <Badge tone={process.status === "Cần review" ? "amber" : "teal"}>{process.status}</Badge>
                </div>
                <h3>{process.title}</h3>
                <p>{process.detail}</p>
                <small>Owner: {process.owner}</small>
              </ReactiveCard>
            ))}
          </div>
        </section>

        <section className="split-section">
          <div className="content-section lessons-section" id="lessons">
            <SectionHeader
              eyebrow="Learning loop"
              title="Bài học kinh nghiệm"
              description="Mỗi lesson cần ngắn, có nguồn và có mức tác động để nhóm có thể dùng lại."
            />
            <div className="lesson-stack">
              {data.lessons.map((item) => (
                <ReactiveCard className="lesson-card" key={item.title}>
                  <div className="lesson-topline">
                    <Badge tone={item.impact === "Cao" ? "coral" : "amber"}>Impact: {item.impact}</Badge>
                    <span>{item.source}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.lesson}</p>
                </ReactiveCard>
              ))}
            </div>
          </div>

          <div className="content-section live-panel">
            <SectionHeader
              eyebrow="Live media"
              title={data.media.videoTitle}
              description={data.media.posterHint}
              action={<Radio size={22} />}
            />
            <div className="video-frame">
              <video muted loop autoPlay playsInline controls poster={heroImage} src={data.media.videoUrl} />
            </div>
          </div>
        </section>

        <section className="content-section logs-section" id="logs">
          <SectionHeader
            eyebrow="Evidence trail"
            title="Nhật ký và Báo Cáo"
            description="Dòng thời gian chứng minh tiến độ, quyết định, owner và bằng chứng của dự án."
            action={<DatabaseZap size={22} />}
          />
          <div className="report-table" role="table" aria-label="Project report log">
            <div className="report-row report-head" role="row">
              <span>Ngày</span>
              <span>Hoạt động</span>
              <span>Owner</span>
              <span>Trạng thái</span>
              <span>Minh chứng</span>
            </div>
            {data.reports.map((report) => (
              <div className="report-row" role="row" key={`${report.date}-${report.activity}`}>
                <span>{report.date}</span>
                <strong>{report.activity}</strong>
                <span>{report.owner}</span>
                <Badge tone={report.status === "Done" ? "lime" : "amber"}>{report.status}</Badge>
                <span>{report.evidence}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileQuestion,
  Gauge,
  HelpCircle,
  History,
  Home,
  Library,
  Lightbulb,
  Lock,
  MessageSquareWarning,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  ThumbsDown,
  ThumbsUp,
  UserRound
} from "lucide-react";
import { dashboardStats, knowledgeItems, taxonomy, users } from "./data/fallbackData.js";

const ROLE_STORAGE = "labs-kms-current-role";
const RECENT_STORAGE = "labs-kms-recent-searches";
const FEEDBACK_STORAGE = "labs-kms-feedback-events";
const APPLICATION_STORAGE = "labs-kms-application-events";
const REQUEST_STORAGE = "labs-kms-request-draft";

const DEFAULT_SEARCH = {
  query: "",
  assetId: "",
  contentType: "ALL",
  assetType: "ALL",
  faultType: "ALL",
  categoryId: "ALL",
  status: "PUBLISHED",
  updatedRange: "ALL",
  sortBy: "RELEVANCE"
};

const navItems = [
  { id: "dashboard", label: "Bảng điều khiển", icon: Home },
  { id: "search", label: "Cơ sở tri thức", icon: Library },
  { id: "request", label: "Gửi yêu cầu", icon: FileQuestion },
  { id: "review", label: "Hàng đợi xét duyệt", icon: ClipboardCheck },
  { id: "sops", label: "Quy trình vận hành (SOP)", icon: BookOpen }
];

const statusLabels = {
  PUBLISHED: "Published",
  OUTDATED: "Outdated",
  SUPERSEDED: "Superseded",
  ARCHIVED: "Archived"
};

const contentTypeLabels = {
  SOP: "SOP",
  REPAIR_CASE: "Repair Case",
  LESSON_LEARNED: "Lesson Learned",
  ARTICLE: "Article"
};

const roleLabels = Object.fromEntries(users.map((user) => [user.role, user.label]));

function loadJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalize(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .trim();
}

function expandQuery(value) {
  return normalize(value)
    .replace(/\boffline\b/g, "mat ket noi connectivity loss")
    .replace(/\boutage\b/g, "mat ket noi su co")
    .replace(/\bsmartnode\b/g, "smart node")
    .replace(/\bcitytouch\b/g, "citytouch ctn")
    .replace(/\bnode\b/g, "node nut")
    .replace(/\s+/g, " ");
}

function statusTone(status) {
  if (status === "PUBLISHED") return "good";
  if (status === "OUTDATED") return "warning";
  if (status === "SUPERSEDED") return "neutral";
  return "danger";
}

function screenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const screen = params.get("screen");
  return screen || "dashboard";
}

function paramsFromSearch(searchParams) {
  const params = new URLSearchParams();
  params.set("screen", "search-results");
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && value !== "ALL" && !(key === "status" && value === "PUBLISHED")) {
      params.set(key, value);
    }
  });
  return `?${params.toString()}`;
}

function searchFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    ...DEFAULT_SEARCH,
    query: params.get("query") || "",
    assetId: params.get("assetId") || "",
    contentType: params.get("contentType") || "ALL",
    assetType: params.get("assetType") || "ALL",
    faultType: params.get("faultType") || "ALL",
    categoryId: params.get("categoryId") || "ALL",
    status: params.get("status") || "PUBLISHED",
    updatedRange: params.get("updatedRange") || "ALL",
    sortBy: params.get("sortBy") || "RELEVANCE"
  };
}

function isSearchValid(params) {
  return Boolean(
    params.query.trim() ||
      params.assetId.trim() ||
      params.contentType !== "ALL" ||
      params.assetType !== "ALL" ||
      params.faultType !== "ALL" ||
      params.categoryId !== "ALL" ||
      params.status !== "PUBLISHED" ||
      params.updatedRange !== "ALL"
  );
}

function canViewItem(item, role) {
  return item.allowedRoles.includes(role);
}

function visibleForSearch(item, role, searchParams) {
  if (!canViewItem(item, role)) return false;
  if (item.status === "ARCHIVED") return false;
  if (role === "FIELD_TECHNICIAN" && searchParams.status === "PUBLISHED" && item.status !== "PUBLISHED") return false;
  if (searchParams.status !== "ALL" && item.status !== searchParams.status) return false;
  return true;
}

function scoreItem(item, searchParams) {
  const query = expandQuery(searchParams.query);
  const assetId = normalize(searchParams.assetId);
  let score = Math.round((item.relevanceScore || 0) * 10);

  if (assetId && item.assetIds.some((id) => normalize(id) === assetId)) score += 50;
  if (query && normalize(item.title).includes(query)) score += 25;
  if (query && normalize(`${item.summary} ${item.faultType} ${item.categoryId}`).includes(query)) score += 15;
  if (item.contentType === "SOP") score += 5;
  if ((item.helpfulRate || 0) >= 80) score += 5;

  const haystack = expandQuery([
    item.title,
    item.summary,
    item.id,
    item.faultType,
    item.categoryId,
    item.assetTypes.join(" "),
    item.assetIds.join(" "),
    item.symptom,
    item.rootCause,
    item.lessonLearned,
    item.purpose
  ].join(" "));

  if (query) {
    const tokens = [...new Set(query.split(/\s+/).filter((token) => token.length > 2))];
    const matchedTokens = tokens.filter((token) => haystack.includes(token));
    score += matchedTokens.length * 10;
    if (matchedTokens.length === 0 && !haystack.includes(query)) score = 0;
  }
  if (assetId && !item.assetIds.some((id) => normalize(id).includes(assetId))) score = Math.max(0, score - 35);

  return score;
}

function searchItems(role, searchParams) {
  const results = knowledgeItems
    .filter((item) => visibleForSearch(item, role, searchParams))
    .filter((item) => searchParams.contentType === "ALL" || item.contentType === searchParams.contentType)
    .filter((item) => searchParams.assetType === "ALL" || item.assetTypes.includes(searchParams.assetType))
    .filter((item) => searchParams.faultType === "ALL" || item.faultType === searchParams.faultType)
    .filter((item) => searchParams.categoryId === "ALL" || item.categoryId === searchParams.categoryId)
    .map((item) => ({ ...item, computedScore: scoreItem(item, searchParams) }))
    .filter((item) => {
      if (!searchParams.query.trim() && !searchParams.assetId.trim()) return true;
      return item.computedScore > 0;
    });

  if (searchParams.sortBy === "UPDATED") {
    results.sort((a, b) => new Date(b.updatedDate.split("/").reverse().join("-")) - new Date(a.updatedDate.split("/").reverse().join("-")));
  } else if (searchParams.sortBy === "HELPFUL") {
    results.sort((a, b) => b.helpfulRate - a.helpfulRate);
  } else {
    results.sort((a, b) => b.computedScore - a.computedScore || b.helpfulRate - a.helpfulRate);
  }
  return results;
}

function App() {
  const [screen, setScreen] = useState(screenFromUrl);
  const [searchParams, setSearchParams] = useState(searchFromUrl);
  const [currentRole, setCurrentRole] = useState(() => window.localStorage.getItem(ROLE_STORAGE) || "FIELD_TECHNICIAN");
  const [recentSearches, setRecentSearches] = useState(() => loadJson(RECENT_STORAGE, []));
  const [feedbackEvents, setFeedbackEvents] = useState(() => loadJson(FEEDBACK_STORAGE, {}));
  const [applicationEvents, setApplicationEvents] = useState(() => loadJson(APPLICATION_STORAGE, {}));
  const [requestDraft, setRequestDraft] = useState(() => loadJson(REQUEST_STORAGE, null));
  const [toast, setToast] = useState("");
  const [applyItem, setApplyItem] = useState(null);
  const [applyOutcome, setApplyOutcome] = useState("RESOLVED_FULLY");
  const [applyComment, setApplyComment] = useState("");
  const [validationError, setValidationError] = useState("");

  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get("id");
  const selectedItem = selectedId ? knowledgeItems.find((item) => item.id === selectedId) : null;
  const results = useMemo(() => searchItems(currentRole, searchParams), [currentRole, searchParams]);
  const activeNav = screen.includes("search") || screen.includes("detail") || screen === "access-denied" ? "search" : screen === "request" ? "request" : screen === "sops" ? "sops" : "dashboard";
  const currentUser = users.find((user) => user.role === currentRole) || users[0];

  useEffect(() => {
    window.localStorage.setItem(ROLE_STORAGE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    saveJson(RECENT_STORAGE, recentSearches);
  }, [recentSearches]);

  useEffect(() => {
    saveJson(FEEDBACK_STORAGE, feedbackEvents);
  }, [feedbackEvents]);

  useEffect(() => {
    saveJson(APPLICATION_STORAGE, applicationEvents);
  }, [applicationEvents]);

  useEffect(() => {
    if (requestDraft) saveJson(REQUEST_STORAGE, requestDraft);
  }, [requestDraft]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function navigate(nextScreen, extra = {}) {
    const params = new URLSearchParams();
    params.set("screen", nextScreen);
    Object.entries(extra).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    window.history.pushState(null, "", `?${params.toString()}`);
    setScreen(nextScreen);
  }

  function runSearch(nextParams = searchParams) {
    if (!isSearchValid(nextParams)) {
      setValidationError("Nhập từ khóa, Asset ID hoặc chọn ít nhất một bộ lọc.");
      return;
    }
    setValidationError("");
    setSearchParams(nextParams);
    const label = nextParams.query || nextParams.assetId || "Bộ lọc nâng cao";
    setRecentSearches((items) => [label, ...items.filter((item) => item !== label)].slice(0, 5));
    const url = paramsFromSearch(nextParams);
    window.history.pushState(null, "", url);
    setScreen("search-results");
  }

  function openItem(item) {
    const targetScreen = canViewItem(item, currentRole)
      ? item.contentType === "SOP"
        ? "sop-detail"
        : "knowledge-detail"
      : "access-denied";
    navigate(targetScreen, { id: item.id });
  }

  function createKnowledgeRequest(draftSource = searchParams) {
    const draft = {
      query: draftSource.query,
      assetId: draftSource.assetId,
      filters: draftSource,
      requesterId: currentUser.id,
      createdAt: new Date().toISOString()
    };
    setRequestDraft(draft);
    navigate("request");
  }

  function submitApply() {
    if (!applyItem) return;
    const nextEvents = {
      ...applicationEvents,
      [applyItem.id]: {
        contentId: applyItem.id,
        version: applyItem.version,
        applicationOutcome: applyOutcome,
        comment: applyComment,
        appliedAt: new Date().toISOString()
      }
    };
    setApplicationEvents(nextEvents);
    setApplyItem(null);
    setApplyComment("");
    setToast("Đã ghi nhận việc áp dụng tri thức.");
  }

  function submitFeedback(item, value) {
    if (feedbackEvents[item.id]?.value === value) return;
    setFeedbackEvents((events) => ({
      ...events,
      [item.id]: {
        contentId: item.id,
        version: item.version,
        value,
        createdAt: new Date().toISOString()
      }
    }));
    setToast(value === "HELPFUL" ? "Đã ghi nhận Helpful." : "Đã ghi nhận Not Helpful.");
  }

  function reportItem(item, type) {
    setFeedbackEvents((events) => ({
      ...events,
      [`${item.id}:${type}`]: {
        contentId: item.id,
        version: item.version,
        value: type,
        createdAt: new Date().toISOString()
      }
    }));
    setToast(type === "OUTDATED" ? "Đã mô phỏng báo cáo nội dung lỗi thời." : "Đã mô phỏng báo cáo nội dung chưa chính xác.");
  }

  function resetDemo() {
    [ROLE_STORAGE, RECENT_STORAGE, FEEDBACK_STORAGE, APPLICATION_STORAGE, REQUEST_STORAGE].forEach((key) => window.localStorage.removeItem(key));
    setCurrentRole("FIELD_TECHNICIAN");
    setRecentSearches([]);
    setFeedbackEvents({});
    setApplicationEvents({});
    setRequestDraft(null);
    setSearchParams(DEFAULT_SEARCH);
    navigate("dashboard");
    setToast("Đã reset demo data.");
  }

  let content;
  if (screen === "dashboard") content = <Dashboard searchParams={searchParams} setSearchParams={setSearchParams} runSearch={runSearch} openItem={openItem} navigate={navigate} />;
  else if (screen === "search") content = <AdvancedSearch searchParams={searchParams} setSearchParams={setSearchParams} runSearch={runSearch} validationError={validationError} recentSearches={recentSearches} />;
  else if (screen === "search-results") content = <SearchResults searchParams={searchParams} setSearchParams={setSearchParams} runSearch={runSearch} results={results} openItem={openItem} createKnowledgeRequest={createKnowledgeRequest} currentRole={currentRole} />;
  else if (screen === "knowledge-detail") content = selectedItem && canViewItem(selectedItem, currentRole) ? <KnowledgeDetail item={selectedItem} openItem={openItem} navigate={navigate} feedbackEvents={feedbackEvents} submitFeedback={submitFeedback} reportItem={reportItem} setApplyItem={setApplyItem} applicationEvents={applicationEvents} currentRole={currentRole} /> : <AccessDenied navigate={navigate} currentRole={currentRole} />;
  else if (screen === "sop-detail") content = selectedItem && canViewItem(selectedItem, currentRole) ? <SopDetail item={selectedItem} openItem={openItem} navigate={navigate} feedbackEvents={feedbackEvents} submitFeedback={submitFeedback} reportItem={reportItem} setApplyItem={setApplyItem} applicationEvents={applicationEvents} currentRole={currentRole} /> : <AccessDenied navigate={navigate} currentRole={currentRole} />;
  else if (screen === "access-denied") content = <AccessDenied navigate={navigate} currentRole={currentRole} />;
  else if (screen === "request") content = <KnowledgeRequest draft={requestDraft} setDraft={setRequestDraft} setToast={setToast} navigate={navigate} />;
  else if (screen === "sops") content = <SopLibrary openItem={openItem} />;
  else content = <Placeholder title="Hàng đợi xét duyệt" description="Luồng này nằm ngoài FL-01; prototype hiện tập trung Search và sử dụng tri thức." />;

  return (
    <div className="app-shell">
      <Sidebar activeNav={activeNav} navigate={navigate} />
      <main className="workspace">
        <TopBar currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser} resetDemo={resetDemo} />
        {content}
      </main>
      {applyItem && (
        <ApplyModal
          item={applyItem}
          outcome={applyOutcome}
          setOutcome={setApplyOutcome}
          comment={applyComment}
          setComment={setApplyComment}
          close={() => setApplyItem(null)}
          confirm={submitApply}
        />
      )}
      <div className={toast ? "toast show" : "toast"} aria-live="polite">{toast}</div>
    </div>
  );
}

function Sidebar({ activeNav, navigate }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-icon"><Lightbulb size={22} /></div>
        <div>
          <h1>Cục Chiếu sáng Đường phố LA</h1>
          <p>Hệ thống Quản lý Tri thức</p>
        </div>
      </div>
      <nav className="side-nav" aria-label="Điều hướng chính">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={activeNav === item.id ? "nav-item active" : "nav-item"} onClick={() => navigate(item.id === "search" ? "search" : item.id)} type="button">
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item" type="button"><HelpCircle size={18} /><span>Trung tâm Trợ giúp</span></button>
      </div>
    </aside>
  );
}

function TopBar({ currentRole, setCurrentRole, currentUser, resetDemo }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <strong>FL-01</strong>
        <span>Tìm kiếm và sử dụng tri thức</span>
      </div>
      <div className="topbar-actions">
        <label className="role-switcher">
          <UserRound size={16} />
          <select value={currentRole} onChange={(event) => setCurrentRole(event.target.value)}>
            {users.map((user) => <option key={user.id} value={user.role}>{user.label}</option>)}
          </select>
        </label>
        <button className="ghost-btn" onClick={resetDemo} type="button"><RotateCcw size={16} />Reset Demo</button>
        <div className="profile-chip">{currentUser.name}</div>
      </div>
    </header>
  );
}

function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="header-actions">{children}</div>}
    </div>
  );
}

function Dashboard({ searchParams, setSearchParams, runSearch, openItem, navigate }) {
  const recentItems = knowledgeItems.filter((item) => item.status === "PUBLISHED").slice(0, 3);
  const recommendedItems = knowledgeItems.filter((item) => item.contentType === "SOP").slice(0, 3);

  return (
    <section className="page">
      <PageHeader title="Tìm kiếm tri thức LABSL" description="Điểm vào nhanh cho Field Technician tìm SOP, repair case và bài học đã kiểm chứng." />
      <div className="hero-search">
        <div>
          <h3>Nhập từ khóa, Asset ID hoặc triệu chứng</h3>
          <p>Ví dụ demo: CityTouch node offline, CTN-1108, quantum relay mismatch.</p>
        </div>
        <form className="dashboard-search-form" onSubmit={(event) => { event.preventDefault(); runSearch(searchParams); }}>
          <Search size={20} />
          <input
            value={searchParams.query}
            onChange={(event) => setSearchParams({ ...searchParams, query: event.target.value })}
            placeholder="Nhập từ khóa, Asset ID hoặc triệu chứng"
          />
          <button className="primary-btn" type="submit">Search Knowledge</button>
        </form>
      </div>
      <div className="metric-grid">
        {dashboardStats.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </div>
      <div className="two-column">
        <CardList title="Tài liệu gần đây" items={recentItems} openItem={openItem} />
        <CardList title="Được đề xuất cho bạn" items={recommendedItems} openItem={openItem} />
      </div>
      <button className="secondary-btn wide" type="button" onClick={() => navigate("search")}>Mở tìm kiếm nâng cao</button>
    </section>
  );
}

function CardList({ title, items, openItem }) {
  return (
    <article className="panel">
      <div className="panel-head"><h3>{title}</h3></div>
      <div className="compact-list">
        {items.map((item) => (
          <button className="compact-row" key={item.id} onClick={() => openItem(item)} type="button">
            <span>
              <strong>{item.title}</strong>
              <small>{contentTypeLabels[item.contentType]} - {item.id}</small>
            </span>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
    </article>
  );
}

function AdvancedSearch({ searchParams, setSearchParams, runSearch, validationError, recentSearches }) {
  return (
    <section className="page">
      <PageHeader title="Tìm kiếm nâng cao" description="Thu thập query và filter có cấu trúc trước khi render kết quả." />
      <SearchForm searchParams={searchParams} setSearchParams={setSearchParams} runSearch={runSearch} validationError={validationError} />
      {recentSearches.length > 0 && (
        <article className="panel">
          <h3>Tìm kiếm gần đây</h3>
          <div className="recent-chips">
            {recentSearches.map((item) => <button type="button" key={item} onClick={() => setSearchParams({ ...searchParams, query: item })}>{item}</button>)}
          </div>
        </article>
      )}
    </section>
  );
}

function SearchForm({ searchParams, setSearchParams, runSearch, validationError, compact = false }) {
  return (
    <form className={compact ? "search-form compact" : "search-form"} onSubmit={(event) => { event.preventDefault(); runSearch(searchParams); }}>
      <div className="form-main">
        <label>
          <span>Từ khóa</span>
          <input value={searchParams.query} onChange={(event) => setSearchParams({ ...searchParams, query: event.target.value })} maxLength={200} placeholder="CityTouch node offline" />
        </label>
        <label>
          <span>Asset ID</span>
          <input value={searchParams.assetId} onChange={(event) => setSearchParams({ ...searchParams, assetId: event.target.value.toUpperCase() })} placeholder="CTN-1108" />
        </label>
      </div>
      <div className="filter-grid">
        <SelectField label="Loại nội dung" value={searchParams.contentType} field="contentType" options={taxonomy.contentTypes} setSearchParams={setSearchParams} searchParams={searchParams} />
        <SelectField label="Loại thiết bị" value={searchParams.assetType} field="assetType" options={taxonomy.assetTypes} setSearchParams={setSearchParams} searchParams={searchParams} />
        <SelectField label="Loại lỗi" value={searchParams.faultType} field="faultType" options={taxonomy.faultTypes} setSearchParams={setSearchParams} searchParams={searchParams} />
        <SelectField label="Danh mục" value={searchParams.categoryId} field="categoryId" options={taxonomy.categories} setSearchParams={setSearchParams} searchParams={searchParams} />
        <SelectField label="Trạng thái" value={searchParams.status} field="status" options={[{ value: "PUBLISHED", label: "Published" }, { value: "OUTDATED", label: "Outdated" }, { value: "SUPERSEDED", label: "Superseded" }, { value: "ALL", label: "Tất cả trạng thái" }]} setSearchParams={setSearchParams} searchParams={searchParams} />
        <SelectField label="Sắp xếp" value={searchParams.sortBy} field="sortBy" options={taxonomy.sortOptions} setSearchParams={setSearchParams} searchParams={searchParams} />
      </div>
      {validationError && <div className="validation-error">{validationError}</div>}
      <div className="form-actions">
        <button className="ghost-btn" type="button" onClick={() => setSearchParams(DEFAULT_SEARCH)}>Xóa bộ lọc</button>
        <button className="primary-btn" type="submit"><Search size={17} />Tìm kiếm</button>
      </div>
    </form>
  );
}

function SelectField({ label, value, field, options, searchParams, setSearchParams }) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => setSearchParams({ ...searchParams, [field]: event.target.value })}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function SearchResults({ searchParams, setSearchParams, runSearch, results, openItem, createKnowledgeRequest, currentRole }) {
  return (
    <section className="page">
      <PageHeader
        eyebrow={roleLabels[currentRole]}
        title="Kết quả tìm kiếm"
        description={`${results.length} kết quả cho ${searchParams.query || searchParams.assetId || "bộ lọc hiện tại"}. Visibility được lọc trước khi render.`}
      />
      <SearchForm compact searchParams={searchParams} setSearchParams={setSearchParams} runSearch={runSearch} />
      {results.length === 0 ? (
        <NoResult searchParams={searchParams} createKnowledgeRequest={createKnowledgeRequest} />
      ) : (
        <div className="results-layout">
          <aside className="facet-panel">
            <SlidersHorizontal size={20} />
            <strong>Bộ lọc đang dùng</strong>
            <p>Content: {searchParams.contentType}</p>
            <p>Asset: {searchParams.assetType}</p>
            <p>Fault: {searchParams.faultType}</p>
            <p>Status: {searchParams.status}</p>
          </aside>
          <div className="result-list">
            {results.map((item) => <KnowledgeCard key={item.id} item={item} openItem={openItem} />)}
          </div>
        </div>
      )}
    </section>
  );
}

function KnowledgeCard({ item, openItem }) {
  const restricted = item.securityLevel === "RESTRICTED";
  return (
    <article className="knowledge-card">
      <div className="card-badges">
        <Badge>{contentTypeLabels[item.contentType]}</Badge>
        <Badge tone={statusTone(item.status)} icon={item.status === "PUBLISHED" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}>{statusLabels[item.status]}</Badge>
        {restricted && <Badge tone="danger" icon={<Lock size={13} />}>Restricted</Badge>}
        <Badge tone="neutral">{item.version}</Badge>
      </div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <dl className="card-meta">
        <div><dt>Owner</dt><dd>{item.knowledgeManagerName}</dd></div>
        <div><dt>Updated</dt><dd>{item.updatedDate}</dd></div>
        <div><dt>Helpful</dt><dd>{item.feedbackCount >= 5 ? `${item.helpfulRate}%` : "N/A"}</dd></div>
        <div><dt>Match</dt><dd>{item.computedScore >= 70 ? "High match" : item.computedScore >= 35 ? "Medium match" : "Low match"}</dd></div>
      </dl>
      <button className="primary-btn" type="button" onClick={() => openItem(item)}>Mở nội dung <ChevronRight size={16} /></button>
    </article>
  );
}

function NoResult({ searchParams, createKnowledgeRequest }) {
  return (
    <article className="empty-state">
      <Search size={34} />
      <h3>Không tìm thấy kết quả phù hợp.</h3>
      <p>Không khẳng định là chưa có tri thức; chỉ là không có kết quả theo query/filter hiện tại.</p>
      <ul>
        <li>Kiểm tra Asset ID hoặc bỏ bớt filter.</li>
        <li>Dùng từ khóa liên quan như CityTouch, node offline, gateway.</li>
        <li>Tạo Knowledge Request để ghi nhận khoảng trống tri thức.</li>
      </ul>
      <button className="primary-btn" type="button" onClick={() => createKnowledgeRequest(searchParams)}>Yêu cầu bổ sung tri thức</button>
    </article>
  );
}

function KnowledgeDetail({ item, openItem, navigate, feedbackEvents, submitFeedback, reportItem, setApplyItem, applicationEvents, currentRole }) {
  return (
    <section className="page detail-page">
      <BackRow navigate={navigate} />
      <DetailHeader item={item} />
      <StateBanner item={item} openItem={openItem} />
      <div className="detail-layout">
        <article className="panel article">
          <Section title="Summary"><p>{item.summary}</p></Section>
          <Section title="Context">
            <InfoGrid rows={[["Asset ID", item.assetIds.join(", ")], ["Asset Type", item.assetTypes.join(", ")], ["Location", item.location], ["Incident Date", item.incidentDate], ["Symptom", item.symptom]]} />
          </Section>
          <Section title="Diagnosis"><p>{item.diagnosisMethod}</p><p><strong>Root cause:</strong> {item.rootCause}</p></Section>
          <Section title="Resolution"><p>{item.repairAction}</p><p><strong>Outcome:</strong> {item.outcome}</p></Section>
          <Section title="Lesson Learned"><div className="lesson-box">{item.lessonLearned}</div></Section>
          <Section title="Evidence"><div className="evidence-grid">{[...(item.evidence || []), ...(item.telemetry || [])].map((entry) => <span key={entry}>{entry}</span>)}</div></Section>
        </article>
        <DetailAside item={item} openItem={openItem} feedbackEvents={feedbackEvents} submitFeedback={submitFeedback} reportItem={reportItem} setApplyItem={setApplyItem} applicationEvents={applicationEvents} currentRole={currentRole} />
      </div>
    </section>
  );
}

function SopDetail(props) {
  const { item, openItem, navigate } = props;
  return (
    <section className="page detail-page">
      <BackRow navigate={navigate} />
      <DetailHeader item={item} />
      <StateBanner item={item} openItem={openItem} />
      <div className="detail-layout">
        <article className="panel article">
          <Section title="Applicability">
            <InfoGrid rows={[["Purpose", item.purpose], ["Scope", item.scope], ["Assets", item.applicableAssets.join(", ")], ["Intended roles", item.intendedRoles.join(", ")]]} />
          </Section>
          <SafetyBanner item={item} />
          <Section title="Preconditions"><Checklist items={[...(item.preconditions || []), ...(item.requiredTools || [])]} /></Section>
          <Section title="Procedure Steps">
            <ol className="procedure-list">
              {item.steps.map((step, index) => (
                <li key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.instruction}</p>
                    <small>Kết quả mong đợi: {step.expectedResult}</small>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
          {item.decisionPoints.length > 0 && <Section title="Decision Points">{item.decisionPoints.map((point) => <div className="decision-card" key={point.condition}><strong>{point.condition}</strong><p>Có: {point.yesAction}</p><p>Không: {point.noAction}</p></div>)}</Section>}
          <Section title="Completion"><Checklist items={item.completionCriteria} /></Section>
        </article>
        <DetailAside {...props} />
      </div>
    </section>
  );
}

function DetailHeader({ item }) {
  return (
    <PageHeader eyebrow={`${contentTypeLabels[item.contentType]} - ${item.id}`} title={item.title} description={`${item.knowledgeManagerName} - ${item.updatedDate}`}>
      <Badge tone={statusTone(item.status)}>{statusLabels[item.status]}</Badge>
      <Badge tone="neutral">{item.version}</Badge>
    </PageHeader>
  );
}

function StateBanner({ item, openItem }) {
  if (item.status === "OUTDATED") {
    return <div className="warning-banner"><AlertTriangle size={20} /><span>Quá ngày review: {item.reviewDate}. Nội dung có thể không còn phù hợp.</span>{item.replacementId && <button onClick={() => openItem(knowledgeItems.find((x) => x.id === item.replacementId))}>View replacement</button>}</div>;
  }
  if (item.status === "SUPERSEDED") {
    return <div className="warning-banner neutral"><History size={20} /><span>Phiên bản này đã bị thay thế.</span>{item.currentVersionId && <button onClick={() => openItem(knowledgeItems.find((x) => x.id === item.currentVersionId))}>View Current Version</button>}</div>;
  }
  return null;
}

function DetailAside({ item, openItem, feedbackEvents, submitFeedback, reportItem, setApplyItem, applicationEvents, currentRole }) {
  const applied = applicationEvents[item.id];
  const feedback = feedbackEvents[item.id]?.value;
  const canApply = item.status === "PUBLISHED" && currentRole !== "ADMINISTRATOR";
  return (
    <aside className="detail-aside">
      <article className="panel action-panel">
        <h3>Apply & Feedback</h3>
        <button className="primary-btn wide" disabled={!canApply} onClick={() => setApplyItem(item)} type="button">Mark as Applied</button>
        {!canApply && <p className="hint">Không thể apply với trạng thái/role hiện tại.</p>}
        {applied && <p className="success-note">Đã áp dụng: {applied.applicationOutcome}</p>}
        <div className="feedback-row">
          <button className={feedback === "HELPFUL" ? "feedback active" : "feedback"} onClick={() => submitFeedback(item, "HELPFUL")}><ThumbsUp size={16} />Helpful</button>
          <button className={feedback === "NOT_HELPFUL" ? "feedback active" : "feedback"} onClick={() => submitFeedback(item, "NOT_HELPFUL")}><ThumbsDown size={16} />Not Helpful</button>
        </div>
        <button className="ghost-btn wide" onClick={() => reportItem(item, "INCORRECT")}><MessageSquareWarning size={16} />Report Incorrect</button>
        <button className="ghost-btn wide" onClick={() => reportItem(item, "OUTDATED")}><AlertTriangle size={16} />Report Outdated</button>
      </article>
      <article className="panel governance">
        <h3>Governance</h3>
        <InfoGrid rows={[["Security", item.securityLevel], ["Effective", item.effectiveDate], ["Review", item.reviewDate], ["Views", String(item.viewCount)], ["Reuse", String(item.reuseCount + (applied ? 1 : 0))]]} />
      </article>
      <article className="panel">
        <h3>Related</h3>
        <div className="compact-list">
          {(item.relatedItems || []).map((id) => {
            const related = knowledgeItems.find((entry) => entry.id === id);
            if (!related) return null;
            return <button className="compact-row" key={id} onClick={() => openItem(related)}><span><strong>{related.title}</strong><small>{related.id}</small></span><ChevronRight size={16} /></button>;
          })}
        </div>
      </article>
    </aside>
  );
}

function BackRow({ navigate }) {
  return <button className="back-btn" type="button" onClick={() => navigate("search-results")}><ArrowLeft size={16} />Quay lại kết quả</button>;
}

function SafetyBanner({ item }) {
  return (
    <section className={item.riskLevel === "Cao" ? "safety-banner danger" : "safety-banner"}>
      <ShieldAlert size={22} />
      <div>
        <strong>Safety / PPE - Rủi ro {item.riskLevel}</strong>
        <p>{item.warnings.join(" ")}</p>
        <div className="ppe-list">{item.ppe.map((ppe) => <span key={ppe}>{ppe}</span>)}</div>
      </div>
    </section>
  );
}

function Section({ title, children }) {
  return <section className="detail-section"><h3>{title}</h3>{children}</section>;
}

function InfoGrid({ rows }) {
  return <dl className="info-grid">{rows.filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

function Checklist({ items }) {
  return <ul className="checklist">{items.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul>;
}

function AccessDenied({ navigate, currentRole }) {
  return (
    <section className="page">
      <article className="access-denied">
        <Lock size={42} />
        <h2>Bạn không có quyền xem nội dung này với vai trò hiện tại.</h2>
        <p>Role hiện tại: {roleLabels[currentRole]}. Prototype không render title/summary nhạy cảm từ resource bị giới hạn.</p>
        <div className="form-actions">
          <button className="secondary-btn" onClick={() => navigate("search-results")} type="button">Back to Search</button>
          <button className="primary-btn" onClick={() => navigate("dashboard")} type="button">Back to Dashboard</button>
        </div>
      </article>
    </section>
  );
}

function KnowledgeRequest({ draft, setDraft, setToast, navigate }) {
  const [title, setTitle] = useState(draft?.query ? `Yêu cầu tri thức cho: ${draft.query}` : "");
  const [assetId, setAssetId] = useState(draft?.assetId || "");
  const [description, setDescription] = useState(draft ? `Query: ${draft.query || "-"}\nFilter: ${JSON.stringify(draft.filters)}` : "");
  return (
    <section className="page">
      <PageHeader title="Gửi yêu cầu bổ sung tri thức" description="Mock FL-04 entry: query/filter từ no-result được pre-fill." />
      <form className="request-form" onSubmit={(event) => { event.preventDefault(); setDraft({ title, assetId, description, submittedAt: new Date().toISOString() }); setToast("Đã mô phỏng tạo Knowledge Request."); navigate("search"); }}>
        <label><span>Tiêu đề yêu cầu</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label><span>Asset ID</span><input value={assetId} onChange={(event) => setAssetId(event.target.value)} /></label>
        <label><span>Mô tả / query pre-fill</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <button className="primary-btn" type="submit"><Send size={17} />Gửi yêu cầu</button>
      </form>
    </section>
  );
}

function SopLibrary({ openItem }) {
  const sops = knowledgeItems.filter((item) => item.contentType === "SOP");
  return (
    <section className="page">
      <PageHeader title="Quy trình vận hành (SOP)" description="Danh sách SOP liên quan FL-01; dùng để mở SOP Detail và Mark as Applied." />
      <div className="result-list">{sops.map((item) => <KnowledgeCard key={item.id} item={item} openItem={openItem} />)}</div>
    </section>
  );
}

function Placeholder({ title, description }) {
  return <section className="page"><PageHeader title={title} description={description} /></section>;
}

function ApplyModal({ item, outcome, setOutcome, comment, setComment, close, confirm }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="apply-title">
        <h2 id="apply-title">Mark as Applied</h2>
        <p>{item.title}</p>
        <label><span>Application outcome</span><select value={outcome} onChange={(event) => setOutcome(event.target.value)}><option value="RESOLVED_FULLY">Resolved Fully</option><option value="HELPED_PARTIALLY">Helped Partially</option><option value="DID_NOT_RESOLVE">Did Not Resolve</option><option value="REFERENCE_ONLY">Reference Only</option></select></label>
        <label><span>Comment</span><textarea maxLength={500} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Ghi chú work order hoặc kết quả áp dụng..." /></label>
        <div className="form-actions"><button className="ghost-btn" onClick={close} type="button">Hủy</button><button className="primary-btn" onClick={confirm} type="button">Confirm Apply</button></div>
      </section>
    </div>
  );
}

function Badge({ children, tone = "primary", icon }) {
  return <span className={`badge ${tone}`}>{icon}{children}</span>;
}

export default App;

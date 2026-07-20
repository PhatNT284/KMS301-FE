import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  ExternalLink,
  FilePlus2,
  Filter,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  Library,
  Lightbulb,
  LogOut,
  Menu,
  Plus,
  Printer,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  XCircle
} from "lucide-react";
import { fallbackData } from "./data/fallbackData.js";

const views = [
  { id: "dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { id: "knowledge", label: "Cơ sở tri thức", icon: Library },
  { id: "submit", label: "Gửi yêu cầu", icon: FilePlus2 },
  { id: "review", label: "Hàng đợi xét duyệt", icon: ClipboardCheck },
  { id: "sops", label: "Quy trình vận hành (SOP)", icon: BookOpen }
];

const toneClass = {
  good: "tone-good",
  warning: "tone-warning",
  danger: "tone-danger",
  primary: "tone-primary",
  neutral: "tone-neutral"
};

function Chip({ children, tone = "neutral" }) {
  return <span className={`chip ${toneClass[tone] || toneClass.neutral}`}>{children}</span>;
}

function Shell({ activeView, setActiveView, children }) {
  return (
    <div className="kms-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-icon">
            <Lightbulb size={22} />
          </div>
          <div>
            <h1>Cục Chiếu sáng Đường phố LA</h1>
            <p>Hệ thống Quản lý Tri thức</p>
          </div>
        </div>

        <nav className="side-nav" aria-label="Prototype navigation">
          {views.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeView === item.id ? "nav-item active" : "nav-item"}
                key={item.id}
                onClick={() => setActiveView(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" type="button">
            <HelpCircle size={18} />
            <span>Trung tâm Trợ giúp</span>
          </button>
          <button className="nav-item" type="button">
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="workspace">
        <TopBar />
        {children}
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <button className="icon-button mobile-only" type="button" aria-label="Open menu">
        <Menu size={20} />
      </button>
      <label className="global-search">
        <Search size={18} />
        <input placeholder="Tìm kiếm cơ sở tri thức hoặc tài sản..." />
      </label>

      <div className="topbar-actions">
        <button className="icon-button has-dot" type="button" aria-label="Notifications">
          <Bell size={19} />
        </button>
        <button className="icon-button" type="button" aria-label="Settings">
          <Settings size={19} />
        </button>
        <div className="profile">
          <div>
            <strong>{fallbackData.user.name}</strong>
            <span>{fallbackData.user.role}</span>
          </div>
          <div className="avatar">AC</div>
        </div>
      </div>
    </header>
  );
}

function PageTitle({ eyebrow, title, description, children }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="title-actions">{children}</div>}
    </div>
  );
}

function Dashboard({ setActiveView, openKnowledge }) {
  return (
    <div className="page dashboard-page">
      <PageTitle
        title="Tổng quan hệ thống"
        description="Các chỉ số hiệu suất và trạng thái tài sản theo thời gian thực cho mạng lưới toàn thành phố."
      >
        <button className="secondary-btn" type="button">
          <CalendarDays size={17} />
          30 ngày qua
        </button>
        <button className="primary-btn" type="button">
          <Download size={17} />
          Xuất báo cáo
        </button>
      </PageTitle>

      <section className="kpi-grid">
        {fallbackData.kpis.map((item) => (
          <article className={`kpi-card ${item.tone}`} key={item.label}>
            <div className="kpi-top">
              <span>{item.label}</span>
              <Chip tone={item.tone === "warning" ? "danger" : item.tone}>{item.trend}</Chip>
            </div>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel incidents-panel">
          <div className="panel-head">
            <h3>Các sự cố gần đây</h3>
            <button className="text-btn" type="button" onClick={() => setActiveView("knowledge")}>
              Xem tất cả
            </button>
          </div>
          <div className="data-table">
            <div className="table-row table-head">
              <span>ID Tài sản</span>
              <span>Loại lỗi</span>
              <span>Trạng thái</span>
              <span>Ngày</span>
              <span>Hành động</span>
            </div>
            {fallbackData.recentIncidents.map((incident) => (
              <button className="table-row clickable-row" key={incident.id} onClick={() => openKnowledge(0)} type="button">
                <span className="mono">{incident.id}</span>
                <strong>{incident.type}</strong>
                <Chip tone={incident.status === "Nghiêm trọng" ? "danger" : incident.status === "Đã giải quyết" ? "good" : "warning"}>
                  {incident.status}
                </Chip>
                <span>{incident.date}</span>
                <ExternalLink size={16} />
              </button>
            ))}
          </div>
        </article>

        <aside className="side-stack">
          <article className="panel">
            <div className="panel-head compact">
              <h3>Cảnh báo nút thông minh</h3>
              <Gauge size={20} />
            </div>
            <div className="alert-list">
              {fallbackData.alerts.map((alert, index) => (
                <div className="alert-item" key={alert}>
                  <span className={index === 0 ? "alert-dot danger" : "alert-dot"} />
                  <p>{alert}</p>
                </div>
              ))}
            </div>
            <button className="secondary-btn full" type="button">
              Phân tích xu hướng
            </button>
          </article>

          <article className="panel dark-panel">
            <div className="panel-head compact">
              <h3>Bài học hàng đầu</h3>
              <Lightbulb size={20} />
            </div>
            <p>Logic đứt lại bộ điều khiển LED</p>
            <p className="subtle">Quy trình tiêu chuẩn đã khớp với 52% ca lỗi lặp trong tháng.</p>
          </article>
        </aside>
      </section>

      <section className="panel knowledge-map">
        <div>
          <h3>Lập bản đồ Đồ thị Tri thức</h3>
          <p>Mối quan hệ giữa các yêu cầu đang hoạt động và các giải pháp SOP đã giải quyết.</p>
        </div>
        <div className="map-card">
          <div className="network">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>Cấu trúc Mạng Nút Trực tiếp</strong>
            <p>Tình trạng kết nối: 98.2% trên tất cả các quận thành phố.</p>
          </div>
        </div>
        <ul className="activity-list">
          {fallbackData.activity.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function KnowledgeBase({ openKnowledge }) {
  return (
    <div className="page">
      <PageTitle title="Cơ sở tri thức" description="Tra cứu các giải pháp kỹ thuật và quy trình tiêu chuẩn.">
        <select>
          <option>Danh mục: Tất cả</option>
          <option>Điện & Mạch</option>
          <option>Cơ sở hạ tầng</option>
          <option>Phần mềm</option>
        </select>
        <select>
          <option>Loại tài sản: Tất cả</option>
          <option>Đèn LED</option>
          <option>Tủ điều khiển</option>
          <option>Cột đèn</option>
        </select>
        <select>
          <option>Trạng thái: Đã phê duyệt</option>
          <option>Đang chờ duyệt</option>
          <option>Bản nháp</option>
        </select>
      </PageTitle>

      <section className="knowledge-grid">
        {fallbackData.knowledgeItems.map((item, index) => (
          <article className="knowledge-card" key={item.id}>
            <div className="card-top">
              <div className="tag-group">
                <Chip tone="primary">{item.category}</Chip>
                <Chip tone={item.severity === "Lỗi nghiêm trọng" ? "danger" : "warning"}>{item.severity}</Chip>
              </div>
              <Chip tone="good">
                <CheckCircle2 size={14} />
                {item.status}
              </Chip>
            </div>
            <h3>{item.title}</h3>
            <InfoBlock label="Triệu chứng" text={item.symptom} />
            <InfoBlock label="Nguyên nhân gốc rễ" text={item.rootCause} danger />
            <div className="card-footer">
              <span className="mono">Cập nhật: {item.updated}</span>
              <button className="primary-btn compact" type="button" onClick={() => openKnowledge(index)}>
                Xem chi tiết & SOP
                <ChevronRight size={17} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function InfoBlock({ label, text, danger = false }) {
  return (
    <div className={danger ? "info-block danger" : "info-block"}>
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

function KnowledgeDetail({ item, setActiveView }) {
  return (
    <div className="page detail-page">
      <div className="breadcrumbs">
        <button type="button" onClick={() => setActiveView("knowledge")}>
          Cơ sở tri thức
        </button>
        <ChevronRight size={15} />
        <span>{item.id}</span>
      </div>

      <PageTitle eyebrow={item.category} title={item.title} description={`Chủ sở hữu tri thức: ${item.owner} · Cập nhật ${item.updated}`}>
        <button className="secondary-btn" type="button">
          <Printer size={17} />
          In
        </button>
        <button className="primary-btn" type="button">
          <Share2 size={17} />
          Chia sẻ
        </button>
      </PageTitle>

      <div className="detail-layout">
        <article className="panel article-panel">
          <Section title="Triệu chứng" icon={<AlertTriangle size={20} />}>
            <p>{item.symptom}</p>
          </Section>
          <Section title="Root Cause" icon={<ShieldCheck size={20} />}>
            <p>{item.rootCause}</p>
          </Section>
          <Section title="Repair Action" icon={<ClipboardCheck size={20} />}>
            <p>{item.repairAction}</p>
          </Section>
          <Section title="Lessons Learned" icon={<Lightbulb size={20} />}>
            <p>{item.lesson}</p>
          </Section>
        </article>

        <aside className="detail-aside">
          <article className="panel meta-panel">
            <h3>Chi tiết kỹ thuật</h3>
            <dl>
              <div>
                <dt>Asset type</dt>
                <dd>{item.assetType}</dd>
              </div>
              <div>
                <dt>Severity</dt>
                <dd>{item.severity}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{item.status}</dd>
              </div>
              <div>
                <dt>Knowledge ID</dt>
                <dd className="mono">{item.id}</dd>
              </div>
            </dl>
          </article>
          <article className="panel">
            <h3>SOP liên quan</h3>
            {fallbackData.sops.slice(0, 2).map((sop) => (
              <button className="related-row" key={sop.code} type="button" onClick={() => setActiveView("sopDetail")}>
                <span>
                  <strong>{sop.title}</strong>
                  <small>{sop.code}</small>
                </span>
                <ExternalLink size={16} />
              </button>
            ))}
          </article>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section className="article-section">
      <h3>
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function SubmitCase() {
  return (
    <div className="page">
      <PageTitle title="Mẫu gửi tri thức" description="Ghi lại case thực địa sau khi sửa chữa để reviewer chuẩn hóa thành tài sản tri thức." />

      <form className="form-layout">
        <section className="panel form-panel">
          <h3>Thông tin sự cố</h3>
          <div className="form-grid">
            <Field label="Asset ID" placeholder="VD: SL-8921-W" />
            <Field label="Loại tài sản" placeholder="Smart Node, Đèn LED, Tủ điều khiển..." />
            <Field label="Fault Type" placeholder="Mất kết nối, sụt áp, nước vào móng..." />
            <Field label="Mức độ ưu tiên" as="select" options={["Cao", "Trung bình", "Thấp"]} />
            <Field className="wide" label="Triệu chứng quan sát" placeholder="Mô tả tín hiệu cảnh báo, dữ liệu đo, điều kiện hiện trường..." textarea />
            <Field className="wide" label="Nguyên nhân gốc rễ" placeholder="Ghi giả định/kiểm chứng nguyên nhân..." textarea />
            <Field className="wide" label="Repair Action" placeholder="Các bước đã thực hiện để xử lý..." textarea />
            <Field className="wide" label="Lessons Learned" placeholder="Bài học ngắn để đội khác có thể tái sử dụng..." textarea />
          </div>
        </section>

        <aside className="submit-aside">
          <section className="panel">
            <h3>Checklist chất lượng</h3>
            {["Có Asset ID rõ ràng", "Có bằng chứng hiện trường", "Có root cause", "Có lesson learned"].map((item) => (
              <label className="check-row" key={item}>
                <input type="checkbox" defaultChecked={item !== "Có bằng chứng hiện trường"} />
                <span>{item}</span>
              </label>
            ))}
          </section>
          <section className="panel upload-panel">
            <FilePlus2 size={32} />
            <strong>Tải ảnh/minh chứng</strong>
            <p>Prototype: mock upload, chưa lưu file thật.</p>
          </section>
          <button className="primary-btn full" type="button">
            <Send size={17} />
            Gửi để xét duyệt
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, placeholder, textarea = false, as, options = [], className = "" }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {textarea ? (
        <textarea placeholder={placeholder} />
      ) : as === "select" ? (
        <select defaultValue="">
          <option value="" disabled>
            Chọn...
          </option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input placeholder={placeholder} />
      )}
    </label>
  );
}

function ReviewQueue() {
  const [selected, setSelected] = useState(fallbackData.reviewQueue[0]);

  return (
    <div className="review-layout">
      <section className="queue-column">
        <div className="queue-head">
          <h2>Hàng đợi <span>(12)</span></h2>
          <button className="icon-button" type="button">
            <Filter size={18} />
          </button>
        </div>
        {fallbackData.reviewQueue.map((item) => (
          <button
            className={selected.id === item.id ? "queue-card active" : "queue-card"}
            key={item.id}
            onClick={() => setSelected(item)}
            type="button"
          >
            <div>
              <Chip tone={item.priority === "Cao" ? "danger" : "warning"}>{item.category}</Chip>
              <span className="mono">{item.age}</span>
            </div>
            <strong>{item.title}</strong>
            <p>Được gửi bởi: {item.submittedBy}</p>
            <small>
              <Clock3 size={14} />
              Mức độ ưu tiên: {item.priority}
            </small>
          </button>
        ))}
      </section>

      <section className="review-detail">
        <div className="review-title">
          <div>
            <Chip tone="primary">{selected.category}</Chip>
            <h2>{selected.title}</h2>
            <p>Submission ID {selected.id} · Người gửi {selected.submittedBy}</p>
          </div>
          <div className="title-actions">
            <button className="icon-button" type="button"><Printer size={18} /></button>
            <button className="icon-button" type="button"><Share2 size={18} /></button>
          </div>
        </div>

        <div className="review-content-grid">
          <InfoBlock label="Triệu chứng" text={selected.symptom} />
          <InfoBlock label="Root Cause" text={selected.rootCause} />
          <InfoBlock label="Repair Action" text={selected.repairAction} />
          <InfoBlock label="Lessons Learned" text={selected.lesson} />
        </div>

        <label className="field review-comment">
          <span>Phản hồi của người duyệt</span>
          <textarea placeholder="Add your comments or reasons for revision here..." />
        </label>

        <div className="review-actions">
          <button className="danger-btn" type="button">
            <XCircle size={18} />
            Từ chối
          </button>
          <button className="warning-btn" type="button">
            <Clock3 size={18} />
            Yêu cầu sửa
          </button>
          <button className="success-btn" type="button">
            <CheckCircle2 size={18} />
            Phê duyệt
          </button>
        </div>
      </section>
    </div>
  );
}

function SOPLibrary({ setActiveView }) {
  return (
    <div className="page">
      <PageTitle title="Thư viện SOP" description="Truy cập 142 quy trình vận hành tiêu chuẩn được ủy quyền cho các hoạt động của Cục.">
        <button className="primary-btn" type="button" onClick={() => setActiveView("createSop")}>
          <Plus size={17} />
          Tạo SOP mới
        </button>
      </PageTitle>

      <section className="panel filter-panel">
        <label className="global-search embedded">
          <Search size={18} />
          <input placeholder="Tìm kiếm theo mã SOP, Tiêu đề hoặc Từ khóa..." />
        </label>
        <select><option>Tất cả danh mục</option><option>An toàn</option><option>Kỹ thuật</option></select>
        <select><option>Loại tài sản</option><option>Máy biến áp</option><option>Smart Node</option></select>
        <button className="icon-button" type="button"><SlidersHorizontal size={18} /></button>
      </section>

      <div className="sop-layout">
        <section className="sop-grid">
          {fallbackData.sops.map((sop) => (
            <article className="sop-card" key={sop.code}>
              <div className="sop-card-head">
                <Chip tone={sop.risk === "Cao" ? "danger" : "primary"}>{sop.category}</Chip>
                <span className="mono">{sop.code}</span>
              </div>
              <h3>{sop.title}</h3>
              <p>{sop.summary}</p>
              <dl>
                <div><dt>Owner</dt><dd>{sop.owner}</dd></div>
                <div><dt>Cập nhật</dt><dd>{sop.updated}</dd></div>
                <div><dt>Review</dt><dd>{sop.reviewCycle}</dd></div>
              </dl>
              <div className="card-footer">
                <button className="icon-button" type="button"><Download size={18} /></button>
                <button className="secondary-btn compact" type="button" onClick={() => setActiveView("sopDetail")}>
                  Xem toàn bộ SOP
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className="side-stack">
          <article className="panel">
            <h3>Vừa thêm gần đây</h3>
            {fallbackData.activity.slice(0, 3).map((item) => (
              <p className="activity-note" key={item}>{item}</p>
            ))}
          </article>
          <article className="panel callout-panel">
            <ShieldCheck size={24} />
            <h3>Đánh giá bắt buộc</h3>
            <p>3 SOP an toàn cao thế cần reviewer xác minh trước khi đưa vào training.</p>
          </article>
        </aside>
      </div>
    </div>
  );
}

function SOPDetail({ setActiveView }) {
  const sop = fallbackData.sops[0];

  return (
    <div className="page detail-page">
      <div className="breadcrumbs">
        <button type="button" onClick={() => setActiveView("sops")}>SOPs</button>
        <ChevronRight size={15} />
        <span>{sop.code}</span>
      </div>
      <PageTitle eyebrow={sop.status} title={sop.title} description={`${sop.owner} · ${sop.updated} · Chu kỳ review: ${sop.reviewCycle}`}>
        <button className="primary-btn" type="button"><Download size={17} />Tải xuống PDF</button>
        <button className="secondary-btn" type="button"><Printer size={17} />In</button>
      </PageTitle>

      <div className="detail-layout">
        <article className="panel article-panel">
          <Section title="Cảnh báo an toàn" icon={<AlertTriangle size={20} />}>
            <div className="danger-callout">
              <strong>NGUY HIỂM ĐIỆN CAO THẾ</strong>
              <p>Chỉ kỹ thuật viên được chứng nhận mới được thực hiện. Bắt buộc LOTO và PPE đầy đủ.</p>
            </div>
          </Section>
          <Section title="Thiết bị bắt buộc" icon={<ShieldCheck size={20} />}>
            <div className="ppe-grid">
              {["Găng tay cách điện", "Mặt nạ", "Bút thử điện", "Áo chống hồ quang"].map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </Section>
          <Section title="Các bước thực hiện" icon={<ClipboardCheck size={20} />}>
            <ol className="step-list">
              {sop.steps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{step}</strong>
                    <p>Ghi nhận kết quả, ảnh minh chứng và trạng thái kiểm tra trước khi chuyển bước tiếp theo.</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </article>

        <aside className="detail-aside">
          <article className="panel meta-panel">
            <h3>Tuân thủ SOP</h3>
            <dl>
              <div><dt>Trạng thái</dt><dd>{sop.status}</dd></div>
              <div><dt>Rủi ro</dt><dd>{sop.risk}</dd></div>
              <div><dt>Danh mục</dt><dd>{sop.category}</dd></div>
              <div><dt>Mã SOP</dt><dd className="mono">{sop.code}</dd></div>
            </dl>
          </article>
          <article className="panel callout-panel">
            <BookOpen size={24} />
            <h3>Đề xuất chỉnh sửa</h3>
            <p>Gửi phản hồi để reviewer cập nhật phiên bản SOP tiếp theo.</p>
            <button className="primary-btn full" type="button">Cung cấp phản hồi</button>
          </article>
        </aside>
      </div>
    </div>
  );
}

function CreateSOP() {
  return (
    <div className="page">
      <PageTitle title="Tạo Quy Trình Chuẩn (SOP) Mới" description="Mẫu mock để reviewer hoặc expert chuẩn hóa tri thức thành SOP có thể tái sử dụng.">
        <button className="secondary-btn" type="button">Lưu nháp</button>
        <button className="primary-btn" type="button"><Send size={17} />Gửi xét duyệt</button>
      </PageTitle>
      <form className="form-layout">
        <section className="panel form-panel">
          <h3>Thông tin cơ bản</h3>
          <div className="form-grid">
            <Field label="Mã SOP" placeholder="VD: SOP-MNT-2024-001" />
            <Field label="Danh mục" as="select" options={["An toàn", "Kỹ thuật", "Vận hành", "Khẩn cấp"]} />
            <Field className="wide" label="Tên quy trình" placeholder="Nhập tên rõ ràng, ngắn gọn cho quy trình..." />
            <Field className="wide" label="Loại tài sản liên quan" placeholder="VD: Cột đèn LED loại A, Tủ điện điều khiển..." />
          </div>
          <h3>Nội dung quy trình</h3>
          <div className="editor-toolbar">
            <button type="button">B</button>
            <button type="button">I</button>
            <button type="button">1.</button>
            <button type="button">•</button>
            <button type="button">Ảnh</button>
          </div>
          <textarea className="rich-editor" placeholder="Soạn các bước SOP..." />
        </section>
        <aside className="submit-aside">
          <section className="panel">
            <h3>An toàn & phân loại</h3>
            <Field label="Mức độ rủi ro" as="select" options={["Cao", "Trung bình", "Thấp"]} />
            {["Găng tay cách điện", "Mặt nạ", "Bút thử điện", "Áo phản quang"].map((item) => (
              <label className="check-row" key={item}>
                <input type="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </section>
          <section className="panel upload-panel">
            <FilePlus2 size={32} />
            <strong>Đính kèm tài liệu</strong>
            <p>Ảnh hiện trường, PDF kỹ thuật hoặc checklist liên quan.</p>
          </section>
        </aside>
      </form>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedKnowledgeIndex, setSelectedKnowledgeIndex] = useState(0);

  const selectedKnowledge = useMemo(
    () => fallbackData.knowledgeItems[selectedKnowledgeIndex] || fallbackData.knowledgeItems[0],
    [selectedKnowledgeIndex]
  );

  const openKnowledge = (index) => {
    setSelectedKnowledgeIndex(index);
    setActiveView("knowledgeDetail");
  };

  let content;
  if (activeView === "dashboard") content = <Dashboard setActiveView={setActiveView} openKnowledge={openKnowledge} />;
  if (activeView === "knowledge") content = <KnowledgeBase openKnowledge={openKnowledge} />;
  if (activeView === "knowledgeDetail") content = <KnowledgeDetail item={selectedKnowledge} setActiveView={setActiveView} />;
  if (activeView === "submit") content = <SubmitCase />;
  if (activeView === "review") content = <ReviewQueue />;
  if (activeView === "sops") content = <SOPLibrary setActiveView={setActiveView} />;
  if (activeView === "sopDetail") content = <SOPDetail setActiveView={setActiveView} />;
  if (activeView === "createSop") content = <CreateSOP />;

  return (
    <Shell activeView={activeView} setActiveView={setActiveView}>
      {content}
      <button className="fab" type="button" onClick={() => setActiveView("submit")} aria-label="Submit new knowledge">
        <Plus size={26} />
      </button>
    </Shell>
  );
}

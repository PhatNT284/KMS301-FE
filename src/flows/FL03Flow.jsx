import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileClock,
  FileText,
  History,
  ListChecks,
  Plus,
  Save,
  Send,
  ShieldAlert
} from "lucide-react";
import { sopAuthoringSteps, sopWorkflowLabels, sopWorkflowTones } from "../data/fl03Data.js";

const reviewerStatuses = ["SUBMITTED", "RESUBMITTED", "IN_REVIEW"];
const editableStatuses = ["DRAFT", "CHANGES_REQUESTED"];

const defaultChecklist = {
  technicalAccuracy: false,
  safetyComplete: false,
  sourceTraceability: false,
  versionValid: false,
  usableInField: false
};

const checklistLabels = {
  technicalAccuracy: "Nội dung kỹ thuật chính xác",
  safetyComplete: "An toàn/PPE/điều kiện dừng đầy đủ",
  sourceTraceability: "Có traceability tới case hoặc nguồn chính thức",
  versionValid: "Version và loại thay đổi hợp lệ",
  usableInField: "Kỹ thuật viên có thể áp dụng ngoài hiện trường"
};

const riskOptions = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "CRITICAL", label: "Nghiêm trọng" }
];

const securityOptions = [
  { value: "INTERNAL", label: "Nội bộ" },
  { value: "RESTRICTED", label: "Giới hạn" },
  { value: "PUBLIC", label: "Công khai" }
];

const changeLevelOptions = [
  { value: "MAJOR", label: "Major - thay đổi phạm vi/bước/rủi ro" },
  { value: "MINOR", label: "Minor - chỉnh sửa nhỏ" }
];

const roleOptions = [
  { value: "FIELD_TECHNICIAN", label: "Kỹ thuật viên hiện trường" },
  { value: "CONTRIBUTOR", label: "Người đóng góp tri thức" },
  { value: "KNOWLEDGE_MANAGER", label: "Quản lý tri thức" }
];

function nowIso() {
  return new Date().toISOString();
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function reviewDateInput() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function normalizeVersion(version = "v1.0") {
  const clean = String(version).replace(/^v/i, "");
  const [major = "1", minor = "0"] = clean.split(".");
  return { major: Number(major) || 1, minor: Number(minor) || 0 };
}

export function calculateNextVersion(currentVersion, changeLevel = "MAJOR") {
  const parsed = normalizeVersion(currentVersion || "v0.0");
  if (changeLevel === "MINOR") return `v${parsed.major}.${parsed.minor + 1}`;
  return `v${parsed.major + 1}.0`;
}

export function buildSopTaskFromRequest(request, currentUser) {
  return {
    id: makeId("SOPTASK"),
    sourceRequestId: request.id,
    type: request.type || "UPDATE_EXISTING",
    status: "OPEN",
    priority: "HIGH",
    title: request.type === "NEW_SOP" ? "Chuẩn hóa case thành SOP mới" : "Cập nhật SOP từ case đã kiểm chứng",
    proposedTitle: request.type === "NEW_SOP" ? "SOP mới từ tri thức hiện trường" : "Chẩn đoán nhiều Smart Node mất kết nối đồng thời",
    existingSopId: request.targetSopId || request.appliedSopRef?.sopId || "",
    currentVersion: request.appliedSopRef?.version || "",
    requestedVersionIntent: "MAJOR",
    assignedTo: "KC-001",
    createdBy: currentUser?.id || "KM-001",
    sourceKnowledgeIds: [request.sourceKnowledgeId].filter(Boolean),
    sourceSubmissionId: request.sourceSubmissionId || "",
    relatedAssetTypes: ["CITYTOUCH_NODE", "SMART_NODE"],
    relatedFaultType: "CONNECTIVITY_LOSS",
    businessReason: request.gapSummary || request.proposedChange || "Yêu cầu cập nhật SOP được chuyển tiếp từ bản gửi hiện trường.",
    requestedChanges: [request.gapSummary, request.proposedChange].filter(Boolean),
    dueDate: reviewDateInput(),
    createdAt: nowIso()
  };
}

export function buildDraftFromTask(task, currentUser, baseSop) {
  const updateMode = task.type === "UPDATE_EXISTING";
  const sopId = updateMode ? task.existingSopId : makeId("SOP");
  const proposedVersion = updateMode ? calculateNextVersion(baseSop?.version || task.currentVersion || "v0.0", task.requestedVersionIntent) : "v1.0";
  const baseSteps = baseSop?.steps?.length ? baseSop.steps : [
    { title: "Xác định điều kiện áp dụng", instruction: "Xác nhận bối cảnh, tài sản và triệu chứng trước khi thao tác.", expectedResult: "Biết quy trình có phù hợp với trường hợp hiện tại hay không." },
    { title: "Thực hiện kiểm tra chính", instruction: "Thực hiện các bước kỹ thuật theo phạm vi SOP.", expectedResult: "Có kết quả kiểm tra có thể ghi nhận." }
  ];
  return {
    id: makeId("SOPD"),
    taskId: task.id,
    type: task.type,
    status: "DRAFT",
    authorId: currentUser.id,
    reviewerId: "KM-001",
    sopId,
    previousVersion: updateMode ? baseSop?.version || task.currentVersion : "",
    proposedVersion,
    changeLevel: task.requestedVersionIntent || "MAJOR",
    title: task.proposedTitle || baseSop?.title || "",
    summary: updateMode
      ? `Cập nhật từ ${baseSop?.version || task.currentVersion || "phiên bản hiện hành"}: ${task.businessReason}`
      : task.businessReason,
    categoryId: baseSop?.categoryId || "TROUBLESHOOTING",
    securityLevel: baseSop?.securityLevel || "INTERNAL",
    domain: "Smart Street Lighting",
    assetTypes: task.relatedAssetTypes?.length ? task.relatedAssetTypes : baseSop?.assetTypes || [],
    faultType: task.relatedFaultType || baseSop?.faultType || "CONNECTIVITY_LOSS",
    intendedRoles: ["FIELD_TECHNICIAN", "CONTRIBUTOR"],
    purpose: baseSop?.purpose || "Chuẩn hóa quy trình thao tác để người dùng áp dụng nhất quán trong các trường hợp tương tự.",
    scope: baseSop?.scope || "Áp dụng cho hệ thống chiếu sáng thông minh trong phạm vi vận hành đô thị.",
    exclusions: "",
    trigger: "Khi phát sinh work order hoặc triệu chứng đúng phạm vi SOP.",
    completionCriteria: baseSop?.completionCriteria || ["Có bằng chứng hoàn tất", "Kết quả được ghi nhận trong work order"],
    preconditions: baseSop?.preconditions || ["Có work order hợp lệ"],
    tools: baseSop?.requiredTools || ["Thiết bị đo kiểm phù hợp", "Ứng dụng vận hành"],
    ppe: baseSop?.ppe || ["Găng tay bảo hộ", "Kính bảo hộ"],
    hazards: baseSop?.warnings || ["Nguy cơ thao tác sai khi chưa xác định phạm vi lỗi"],
    controls: ["Xác minh điều kiện an toàn trước khi thao tác", "Dừng nếu phát hiện nguy cơ ngoài phạm vi SOP"],
    emergencyAction: "Dừng thao tác và báo quản lý tri thức hoặc đội an toàn nếu xuất hiện rủi ro bất thường.",
    riskLevel: baseSop?.riskLevel === "Cao" ? "HIGH" : "MEDIUM",
    stopConditions: baseSop?.stopConditions || ["Không đủ điều kiện an toàn để tiếp tục"],
    procedureSteps: baseSteps.map((step, index) => ({
      id: `STEP-${String(index + 1).padStart(2, "0")}`,
      title: step.title,
      instruction: step.instruction,
      expectedResult: step.expectedResult,
      responsibleRole: "Kỹ thuật viên hiện trường",
      warning: ""
    })),
    decisionPoints: baseSop?.decisionPoints?.map((point, index) => ({
      id: `DEC-${String(index + 1).padStart(2, "0")}`,
      condition: point.condition,
      yesAction: point.yesAction,
      noAction: point.noAction,
      exception: ""
    })) || [],
    sourceKnowledgeIds: task.sourceKnowledgeIds || [],
    sourceSubmissionIds: [task.sourceSubmissionId].filter(Boolean),
    externalReferences: [],
    changeSummary: updateMode ? task.requestedChanges?.join(" ") || task.businessReason : "Tạo SOP mới từ nguồn đã kiểm chứng.",
    relatedSopIds: updateMode ? [task.existingSopId].filter(Boolean) : [],
    confirmation: false,
    reviewChecklist: { ...defaultChecklist },
    reviewComments: [],
    history: [
      { id: makeId("SOPD-EVT"), action: "DRAFT_CREATED", actorId: currentUser.id, comment: "Tạo bản nháp SOP.", createdAt: nowIso() }
    ],
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

export function createPublishedSopFromDraft(draft, publishForm, manager, baseSop) {
  const effectiveDate = new Date(publishForm.effectiveDate || todayInput()).toLocaleDateString("vi-VN");
  const reviewDate = new Date(publishForm.reviewDate || reviewDateInput()).toLocaleDateString("vi-VN");
  return {
    id: draft.sopId,
    contentType: "SOP",
    sourceDraftId: draft.id,
    sourceTaskId: draft.taskId,
    sourceKnowledgeIds: draft.sourceKnowledgeIds,
    sourceSubmissionId: draft.sourceSubmissionIds?.[0] || "",
    previousVersion: draft.previousVersion,
    title: draft.title,
    summary: draft.summary,
    status: "PUBLISHED",
    version: publishForm.version || draft.proposedVersion,
    effectiveDate,
    reviewDate,
    updatedDate: new Date().toLocaleDateString("vi-VN"),
    securityLevel: publishForm.securityLevel || draft.securityLevel,
    allowedRoles: ["FIELD_TECHNICIAN", "CONTRIBUTOR", "KNOWLEDGE_MANAGER", "ADMINISTRATOR"],
    categoryId: draft.categoryId,
    assetTypes: draft.assetTypes,
    assetIds: baseSop?.assetIds || ["CTN-1108", "SN-4217"],
    faultType: draft.faultType,
    knowledgeManagerName: manager.name,
    knowledgeManagerId: manager.id,
    helpfulRate: baseSop?.helpfulRate || 0,
    feedbackCount: baseSop?.feedbackCount || 0,
    reuseCount: baseSop?.reuseCount || 0,
    viewCount: baseSop?.viewCount || 1,
    relevanceScore: 0.94,
    purpose: draft.purpose,
    scope: draft.scope,
    applicableAssets: draft.assetTypes,
    intendedRoles: draft.intendedRoles,
    riskLevel: draft.riskLevel === "CRITICAL" || draft.riskLevel === "HIGH" ? "Cao" : "Trung bình",
    ppe: draft.ppe,
    warnings: draft.hazards,
    stopConditions: draft.stopConditions,
    requiredTools: draft.tools,
    preconditions: draft.preconditions,
    steps: draft.procedureSteps.map(({ title, instruction, expectedResult }) => ({ title, instruction, expectedResult })),
    decisionPoints: draft.decisionPoints.map(({ condition, yesAction, noAction }) => ({ condition, yesAction, noAction })),
    completionCriteria: draft.completionCriteria,
    relatedItems: [...new Set([...(draft.sourceKnowledgeIds || []), ...(draft.relatedSopIds || []), ...(baseSop?.relatedItems || [])].filter(Boolean))],
    publishedAt: nowIso(),
    changeSummary: draft.changeSummary
  };
}

export function createVersionFromDraft(draft, publishForm, manager) {
  return {
    versionId: `${draft.sopId}-${publishForm.version || draft.proposedVersion}`.replace(/\s+/g, "-"),
    sopId: draft.sopId,
    version: publishForm.version || draft.proposedVersion,
    status: "PUBLISHED",
    title: draft.title,
    effectiveDate: publishForm.effectiveDate,
    reviewDate: publishForm.reviewDate,
    authorId: draft.authorId,
    approvedBy: manager.id,
    sourceDraftId: draft.id,
    changeSummary: draft.changeSummary,
    createdAt: nowIso()
  };
}

export function SopWorkspace({
  tab,
  navigate,
  openItem,
  knowledgeCatalog,
  sopTasks,
  sopDrafts,
  sopVersions,
  currentUser,
  currentRole,
  startAuthoringFromTask,
  startVersionFromSop,
  startNewSop
}) {
  const activeTab = ["library", "tasks", "drafts", "review", "versions"].includes(tab) ? tab : "library";
  const publishedSops = knowledgeCatalog.filter((item) => item.contentType === "SOP");
  const myDrafts = sopDrafts.filter((draft) => draft.authorId === currentUser.id || currentRole === "KNOWLEDGE_MANAGER");
  const reviewDrafts = sopDrafts.filter((draft) => reviewerStatuses.includes(draft.status));
  const canAuthor = ["CONTRIBUTOR", "KNOWLEDGE_MANAGER"].includes(currentRole);
  return (
    <section className="page">
      <PageHeader title="Quy trình vận hành (SOP)" description="Không gian chung cho thư viện SOP, nhiệm vụ biên soạn, bản nháp, duyệt SOP và lịch sử phiên bản.">
        {canAuthor && <button className="primary-btn" type="button" onClick={startNewSop}><Plus size={16} />Tạo SOP mới</button>}
        <button className="secondary-btn" type="button" onClick={() => navigate("sops", { tab: "tasks" })}><FileClock size={16} />Nhiệm vụ SOP</button>
      </PageHeader>
      <div className="subtab-row" role="tablist" aria-label="Không gian SOP">
        <TabButton active={activeTab === "library"} onClick={() => navigate("sops", { tab: "library" })}>Thư viện SOP</TabButton>
        <TabButton active={activeTab === "tasks"} onClick={() => navigate("sops", { tab: "tasks" })}>Nhiệm vụ SOP</TabButton>
        <TabButton active={activeTab === "drafts"} onClick={() => navigate("sops", { tab: "drafts" })}>Draft SOP của tôi</TabButton>
        <TabButton active={activeTab === "review"} onClick={() => navigate("sops", { tab: "review" })}>Hàng đợi duyệt SOP</TabButton>
        <TabButton active={activeTab === "versions"} onClick={() => navigate("sops", { tab: "versions" })}>Lịch sử phiên bản</TabButton>
      </div>
      {activeTab === "library" && <SopLibraryPanel sops={publishedSops} openItem={openItem} navigate={navigate} currentRole={currentRole} startVersionFromSop={startVersionFromSop} />}
      {activeTab === "tasks" && <SopTasksPanel tasks={sopTasks} drafts={sopDrafts} currentUser={currentUser} currentRole={currentRole} navigate={navigate} startAuthoringFromTask={startAuthoringFromTask} />}
      {activeTab === "drafts" && <MySopDraftsPanel drafts={myDrafts} navigate={navigate} />}
      {activeTab === "review" && <SopReviewQueuePanel drafts={reviewDrafts} navigate={navigate} currentRole={currentRole} />}
      {activeTab === "versions" && <SopVersionHistoryPanel versions={sopVersions} navigate={navigate} />}
    </section>
  );
}

function PageHeader({ eyebrow, title, description, children }) {
  const visibleEyebrow = eyebrow && !/^FL-\d/i.test(String(eyebrow)) ? eyebrow : "";
  return (
    <header className="page-header">
      <div>
        {visibleEyebrow && <p className="eyebrow">{visibleEyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="header-actions">{children}</div>}
    </header>
  );
}

function TabButton({ active, onClick, children }) {
  return <button className={active ? "subtab active" : "subtab"} type="button" onClick={onClick}>{children}</button>;
}

function SopLibraryPanel({ sops, openItem, navigate, currentRole, startVersionFromSop }) {
  const canAuthor = ["CONTRIBUTOR", "KNOWLEDGE_MANAGER"].includes(currentRole);
  return (
    <div className="sop-library-grid">
      {sops.map((item) => (
        <article className="knowledge-card" key={item.id}>
          <div className="card-badges">
            <Badge>SOP</Badge>
            <Badge tone={item.status === "PUBLISHED" ? "good" : "warning"}>{item.status === "PUBLISHED" ? "Đã xuất bản" : item.status}</Badge>
            <Badge tone="neutral">{item.version}</Badge>
          </div>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
          <dl className="card-meta">
            <div><dt>Owner</dt><dd>{item.knowledgeManagerName}</dd></div>
            <div><dt>Cập nhật</dt><dd>{item.updatedDate}</dd></div>
            <div><dt>Review</dt><dd>{item.reviewDate}</dd></div>
            <div><dt>Helpful</dt><dd>{item.feedbackCount >= 5 ? `${item.helpfulRate}%` : "N/A"}</dd></div>
          </dl>
          <div className="form-actions">
            <button className="secondary-btn" type="button" onClick={() => navigate("sop-version-history", { id: item.id })}><History size={16} />Lịch sử</button>
            {canAuthor && <button className="secondary-btn" type="button" onClick={() => startVersionFromSop(item)}><Plus size={16} />Tạo phiên bản mới</button>}
            <button className="primary-btn" type="button" onClick={() => openItem(item)}>Mở SOP <ChevronRight size={16} /></button>
          </div>
        </article>
      ))}
    </div>
  );
}

function SopTasksPanel({ tasks, drafts, currentUser, currentRole, navigate, startAuthoringFromTask }) {
  const visibleTasks = tasks.filter((task) => task.assignedTo === currentUser.id || currentRole === "KNOWLEDGE_MANAGER");
  if (!visibleTasks.length) return <EmptyState icon={<FileClock size={34} />} title="Chưa có nhiệm vụ SOP" description="Khi quản lý tri thức tạo yêu cầu chuẩn hóa, nhiệm vụ sẽ hiển thị ở đây." />;
  return (
    <div className="task-grid">
      {visibleTasks.map((task) => {
        const draft = drafts.find((item) => item.taskId === task.id);
        return (
          <article className="panel sop-task-card" key={task.id}>
            <div className="card-badges">
              <Badge tone={task.priority === "HIGH" ? "danger" : "warning"}>{task.priority}</Badge>
              <Badge>{task.type === "UPDATE_EXISTING" ? "Cập nhật SOP" : "SOP mới"}</Badge>
              <Badge tone="neutral">{task.status === "OPEN" ? "Đang mở" : task.status}</Badge>
            </div>
            <h3>{task.title}</h3>
            <p>{task.businessReason}</p>
            <InfoGrid rows={[
              ["Task", task.id],
              ["SOP mục tiêu", task.existingSopId || "SOP mới"],
              ["Nguồn", [...(task.sourceKnowledgeIds || []), task.sourceSubmissionId].filter(Boolean).join(", ")],
              ["Hạn demo", task.dueDate]
            ]} />
            <div className="form-actions">
              <button className="secondary-btn" type="button" onClick={() => navigate("sop-task-detail", { id: task.id })}>Xem chi tiết</button>
              <button className="primary-btn" type="button" onClick={() => draft ? navigate("sop-editor", { id: draft.id, step: "metadata" }) : startAuthoringFromTask(task)}>
                {draft ? "Tiếp tục soạn" : "Soạn nội dung SOP"} <ChevronRight size={16} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MySopDraftsPanel({ drafts, navigate }) {
  if (!drafts.length) return <EmptyState icon={<FileText size={34} />} title="Chưa có Draft SOP" description="Các bản nháp tạo từ task hoặc từ thư viện SOP sẽ nằm ở đây." />;
  return (
    <div className="result-list">
      {drafts.map((draft) => (
        <article className="panel sop-row-card" key={draft.id}>
          <div>
            <div className="card-badges">
              <Badge tone={sopWorkflowTones[draft.status]}>{sopWorkflowLabels[draft.status] || draft.status}</Badge>
              <Badge>{draft.type === "UPDATE_EXISTING" ? `${draft.previousVersion} -> ${draft.proposedVersion}` : draft.proposedVersion}</Badge>
            </div>
            <h3>{draft.title}</h3>
            <p>{draft.summary}</p>
          </div>
          <div className="sop-row-actions">
            <button className="secondary-btn" type="button" onClick={() => navigate("sop-version-compare", { id: draft.id })}>So sánh</button>
            <button className="primary-btn" type="button" onClick={() => navigate(editableStatuses.includes(draft.status) ? "sop-editor" : "sop-review-detail", { id: draft.id, step: "metadata" })}>
              {editableStatuses.includes(draft.status) ? "Mở editor" : "Xem trạng thái"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function SopReviewQueuePanel({ drafts, navigate, currentRole }) {
  if (!["KNOWLEDGE_MANAGER", "ADMINISTRATOR"].includes(currentRole)) {
    return <EmptyState icon={<ShieldAlert size={34} />} title="Chỉ quản lý tri thức xử lý hàng đợi duyệt SOP" description="Bạn vẫn có thể đổi vai trò ở thanh trên để demo bước duyệt." />;
  }
  if (!drafts.length) return <EmptyState icon={<ClipboardCheck size={34} />} title="Không có SOP đang chờ duyệt" description="Khi người biên soạn gửi hoặc gửi lại, bản nháp sẽ xuất hiện ở đây." />;
  return (
    <div className="result-list">
      {drafts.map((draft) => (
        <article className="panel sop-row-card" key={draft.id}>
          <div>
            <div className="card-badges">
              <Badge tone={sopWorkflowTones[draft.status]}>{sopWorkflowLabels[draft.status]}</Badge>
              <Badge>{draft.type === "UPDATE_EXISTING" ? "Cập nhật SOP" : "SOP mới"}</Badge>
              <Badge tone="neutral">{draft.proposedVersion}</Badge>
            </div>
            <h3>{draft.title}</h3>
            <p>{draft.changeSummary}</p>
          </div>
          <button className="primary-btn" type="button" onClick={() => navigate("sop-review-detail", { id: draft.id })}>Duyệt SOP <ChevronRight size={16} /></button>
        </article>
      ))}
    </div>
  );
}

function SopVersionHistoryPanel({ versions, navigate }) {
  const grouped = versions.reduce((acc, version) => {
    acc[version.sopId] = [...(acc[version.sopId] || []), version];
    return acc;
  }, {});
  return (
    <div className="version-stack">
      {Object.entries(grouped).map(([sopId, items]) => (
        <article className="panel" key={sopId}>
          <div className="panel-head">
            <div>
              <h3>{sopId}</h3>
              <p>{items[0]?.title}</p>
            </div>
            <button className="secondary-btn" type="button" onClick={() => navigate("sop-version-history", { id: sopId })}>Mở timeline</button>
          </div>
          <VersionTimeline versions={items} />
        </article>
      ))}
    </div>
  );
}

export function SopTaskDetail({ task, drafts, navigate, knowledgeCatalog, startAuthoringFromTask }) {
  if (!task) return <Placeholder title="Không tìm thấy nhiệm vụ SOP" description="Task này không còn trong mock data." />;
  const draft = drafts.find((item) => item.taskId === task.id);
  const sources = knowledgeCatalog.filter((item) => task.sourceKnowledgeIds?.includes(item.id));
  return (
    <section className="page">
      <BackButton label="Quay lại nhiệm vụ SOP" onClick={() => navigate("sops", { tab: "tasks" })} />
      <PageHeader eyebrow="SOP Proposal / Change Request" title={task.title} description={task.businessReason}>
        <Badge tone={task.priority === "HIGH" ? "danger" : "warning"}>{task.priority}</Badge>
        <Badge>{task.type === "UPDATE_EXISTING" ? "Cập nhật SOP" : "SOP mới"}</Badge>
      </PageHeader>
      <div className="two-column">
        <article className="panel article">
          <Section title="Thông tin nhiệm vụ">
            <InfoGrid rows={[
              ["Task ID", task.id],
              ["SOP mục tiêu", task.existingSopId || "Tạo SOP mới"],
              ["Version hiện tại", task.currentVersion],
              ["Loại version đề xuất", task.requestedVersionIntent],
              ["Nguồn hiện trường", [task.sourceRequestId, task.sourceSubmissionId].filter(Boolean).join(", ")],
              ["Hạn demo", task.dueDate]
            ]} />
          </Section>
          <Section title="Nội dung cần xử lý">
            <ul className="checklist">{(task.requestedChanges || []).map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul>
          </Section>
          <Section title="Nguồn liên quan">
            {sources.length ? sources.map((item) => <SourceCard key={item.id} item={item} navigate={navigate} />) : <p className="hint">Nguồn có thể được tạo từ bản gửi hiện trường trong phiên demo.</p>}
          </Section>
        </article>
        <aside className="detail-aside">
          <article className="panel action-panel">
            <h3>Hành động</h3>
            {draft && <p className="success-note">Đã có draft: {draft.id}</p>}
            <button className="primary-btn wide" type="button" onClick={() => draft ? navigate("sop-editor", { id: draft.id, step: "metadata" }) : startAuthoringFromTask(task)}>
              {draft ? "Tiếp tục soạn SOP" : "Soạn nội dung SOP"}
            </button>
            <button className="secondary-btn wide" type="button" onClick={() => navigate("sops", { tab: "versions" })}>Xem lịch sử phiên bản</button>
          </article>
        </aside>
      </div>
    </section>
  );
}

export function SopEditor({ draft, step, updateDraft, navigate, setToast, taxonomy }) {
  if (!draft) return <Placeholder title="Không tìm thấy Draft SOP" description="Draft này không còn trong mock data." />;
  const currentStep = sopAuthoringSteps.some((item) => item.id === step) ? step : "metadata";
  const currentIndex = sopAuthoringSteps.findIndex((item) => item.id === currentStep);
  const [showErrors, setShowErrors] = useState(false);
  const errors = validateSopDraft(draft, currentStep);
  const visibleErrors = showErrors ? errors : {};

  function change(path, value) {
    updateDraft(draft.id, (item) => setDeep(item, path, value));
  }

  function next() {
    const stepErrors = validateSopDraft(draft, currentStep);
    if (Object.keys(stepErrors).length) {
      setShowErrors(true);
      setToast("Kiểm tra lại các trường bắt buộc của bước hiện tại.");
      return;
    }
    setShowErrors(false);
    const nextStep = sopAuthoringSteps[Math.min(currentIndex + 1, sopAuthoringSteps.length - 1)].id;
    navigate("sop-editor", { id: draft.id, step: nextStep });
  }

  function back() {
    const prevStep = sopAuthoringSteps[Math.max(currentIndex - 1, 0)].id;
    navigate("sop-editor", { id: draft.id, step: prevStep });
  }

  function saveExit() {
    setToast("Đã lưu Draft SOP.");
    navigate("sops", { tab: "drafts" });
  }

  function submit() {
    const allErrors = validateSopDraft(draft, "review", true);
    if (Object.keys(allErrors).length) {
      setShowErrors(true);
      setToast("Draft SOP chưa hợp lệ. Vui lòng kiểm tra phần Xem lại.");
      return;
    }
    updateDraft(draft.id, (item) => ({
      ...item,
      status: item.status === "CHANGES_REQUESTED" ? "RESUBMITTED" : "SUBMITTED",
      submittedAt: nowIso(),
      history: [
        ...(item.history || []),
        { id: makeId("SOPD-EVT"), action: item.status === "CHANGES_REQUESTED" ? "RESUBMITTED" : "SUBMITTED", actorId: item.authorId, comment: "Gửi kiểm duyệt SOP.", createdAt: nowIso() }
      ]
    }));
    navigate("sop-submit-success", { id: draft.id });
  }

  return (
    <section className="page">
      <BackButton label="Quay lại Draft SOP" onClick={() => navigate("sops", { tab: "drafts" })} />
      <PageHeader eyebrow="SOP Editor" title={draft.title || "Draft SOP"} description={`${draft.id} - ${sopWorkflowLabels[draft.status] || draft.status}`}>
        <Badge tone={sopWorkflowTones[draft.status]}>{sopWorkflowLabels[draft.status] || draft.status}</Badge>
      </PageHeader>
      <ol className="stepper" aria-label="Tiến trình soạn SOP">
        {sopAuthoringSteps.map((item, index) => <li key={item.id} className={index === currentIndex ? "active" : index < currentIndex ? "done" : ""} aria-current={index === currentIndex ? "step" : undefined}><span>{index + 1}</span>{item.label}</li>)}
      </ol>
      {showErrors && Object.keys(errors).length > 0 && <ErrorSummary errors={errors} />}
      <form className="submission-form" onSubmit={(event) => event.preventDefault()}>
        {currentStep === "metadata" && <MetadataStep draft={draft} change={change} errors={visibleErrors} taxonomy={taxonomy} />}
        {currentStep === "scope" && <ScopeStep draft={draft} change={change} errors={visibleErrors} />}
        {currentStep === "safety" && <SafetyStep draft={draft} change={change} errors={visibleErrors} />}
        {currentStep === "procedure" && <ProcedureStep draft={draft} change={change} errors={visibleErrors} />}
        {currentStep === "references" && <ReferencesStep draft={draft} change={change} errors={visibleErrors} />}
        {currentStep === "review" && <SopPreviewStep draft={draft} change={change} errors={visibleErrors} navigate={navigate} />}
        <div className="sticky-actions">
          <button className="ghost-btn" type="button" onClick={saveExit}><Save size={16} />Lưu nháp và thoát</button>
          {currentIndex > 0 && <button className="secondary-btn" type="button" onClick={back}><ArrowLeft size={16} />Quay lại</button>}
          {currentStep !== "review" ? <button className="primary-btn" type="button" onClick={next}>Tiếp tục <ChevronRight size={16} /></button> : <button className="primary-btn" type="button" onClick={submit}><Send size={16} />Gửi duyệt SOP</button>}
        </div>
      </form>
    </section>
  );
}

function MetadataStep({ draft, change, errors, taxonomy }) {
  return (
    <article className="panel form-panel">
      <h3>Bước 1/6 - Thông tin và version</h3>
      <div className="form-main">
        <label><span>Mã SOP</span><input value={draft.sopId} onChange={(event) => change("sopId", event.target.value.toUpperCase())} /></label>
        <NativeSelect label="Loại thay đổi" value={draft.changeLevel} onChange={(value) => change("changeLevel", value)} options={changeLevelOptions} error={errors.changeLevel} />
      </div>
      <div className="form-main">
        <label><span>Version trước</span><input value={draft.previousVersion || "SOP mới"} disabled /></label>
        <label><span>Version đề xuất *</span><input value={draft.proposedVersion} onChange={(event) => change("proposedVersion", event.target.value)} /><FieldError id="proposedVersion" errors={errors} /></label>
      </div>
      <label><span>Tiêu đề SOP *</span><input value={draft.title} onChange={(event) => change("title", event.target.value)} /><FieldError id="title" errors={errors} /></label>
      <label><span>Tóm tắt *</span><textarea value={draft.summary} onChange={(event) => change("summary", event.target.value)} /><FieldError id="summary" errors={errors} /></label>
      <div className="filter-grid">
        <NativeSelect label="Danh mục *" value={draft.categoryId} onChange={(value) => change("categoryId", value)} options={taxonomy.categories.filter((item) => item.value !== "ALL")} error={errors.categoryId} />
        <NativeSelect label="Loại lỗi *" value={draft.faultType} onChange={(value) => change("faultType", value)} options={taxonomy.faultTypes.filter((item) => item.value !== "ALL")} error={errors.faultType} />
        <NativeSelect label="Security *" value={draft.securityLevel} onChange={(value) => change("securityLevel", value)} options={securityOptions} />
      </div>
      <CheckboxGroup label="Loại tài sản áp dụng *" values={draft.assetTypes} onChange={(values) => change("assetTypes", values)} options={taxonomy.assetTypes.filter((item) => item.value !== "ALL")} error={errors.assetTypes} />
    </article>
  );
}

function ScopeStep({ draft, change, errors }) {
  return (
    <article className="panel form-panel">
      <h3>Bước 2/6 - Mục đích, phạm vi và áp dụng</h3>
      <label><span>Mục đích *</span><textarea value={draft.purpose} onChange={(event) => change("purpose", event.target.value)} /><FieldError id="purpose" errors={errors} /></label>
      <label><span>Phạm vi *</span><textarea value={draft.scope} onChange={(event) => change("scope", event.target.value)} /><FieldError id="scope" errors={errors} /></label>
      <label><span>Ngoại lệ / ngoài phạm vi</span><textarea value={draft.exclusions} onChange={(event) => change("exclusions", event.target.value)} /></label>
      <label><span>Điều kiện kích hoạt *</span><textarea value={draft.trigger} onChange={(event) => change("trigger", event.target.value)} /><FieldError id="trigger" errors={errors} /></label>
      <CheckboxGroup label="Role được áp dụng *" values={draft.intendedRoles} onChange={(values) => change("intendedRoles", values)} options={roleOptions} error={errors.intendedRoles} />
      <RepeatableTextarea label="Tiêu chí hoàn tất *" values={draft.completionCriteria} onChange={(values) => change("completionCriteria", values)} error={errors.completionCriteria} />
    </article>
  );
}

function SafetyStep({ draft, change, errors }) {
  const highRisk = ["HIGH", "CRITICAL"].includes(draft.riskLevel);
  return (
    <article className="panel form-panel">
      <h3>Bước 3/6 - Điều kiện, nguồn lực và an toàn</h3>
      <NativeSelect label="Mức rủi ro *" value={draft.riskLevel} onChange={(value) => change("riskLevel", value)} options={riskOptions} />
      {highRisk && <div className="warning-banner"><AlertTriangle size={18} /><span>Rủi ro cao yêu cầu PPE, mối nguy, biện pháp kiểm soát và hành động khẩn cấp.</span></div>}
      <RepeatableTextarea label="Điều kiện trước khi thực hiện *" values={draft.preconditions} onChange={(values) => change("preconditions", values)} error={errors.preconditions} />
      <RepeatableTextarea label="Công cụ / nguồn lực *" values={draft.tools} onChange={(values) => change("tools", values)} error={errors.tools} />
      <RepeatableTextarea label="PPE *" values={draft.ppe} onChange={(values) => change("ppe", values)} error={errors.ppe} />
      <RepeatableTextarea label="Mối nguy *" values={draft.hazards} onChange={(values) => change("hazards", values)} error={errors.hazards} />
      <RepeatableTextarea label="Biện pháp kiểm soát *" values={draft.controls} onChange={(values) => change("controls", values)} error={errors.controls} />
      <RepeatableTextarea label="Điều kiện dừng *" values={draft.stopConditions} onChange={(values) => change("stopConditions", values)} error={errors.stopConditions} />
      <label><span>Hành động khẩn cấp *</span><textarea value={draft.emergencyAction} onChange={(event) => change("emergencyAction", event.target.value)} /><FieldError id="emergencyAction" errors={errors} /></label>
    </article>
  );
}

function ProcedureStep({ draft, change, errors }) {
  function updateStep(index, field, value) {
    const next = draft.procedureSteps.map((step, itemIndex) => itemIndex === index ? { ...step, [field]: value } : step);
    change("procedureSteps", next);
  }
  function addStep() {
    const index = draft.procedureSteps.length + 1;
    change("procedureSteps", [...draft.procedureSteps, { id: `STEP-${String(index).padStart(2, "0")}`, title: "", responsibleRole: "Kỹ thuật viên hiện trường", instruction: "", expectedResult: "", warning: "" }]);
  }
  function removeStep(index) {
    change("procedureSteps", draft.procedureSteps.filter((_, itemIndex) => itemIndex !== index));
  }
  return (
    <article className="panel form-panel">
      <div className="panel-head">
        <h3>Bước 4/6 - Procedure steps và điểm quyết định</h3>
        <button className="secondary-btn" type="button" onClick={addStep}><Plus size={16} />Thêm bước</button>
      </div>
      {errors.procedureSteps && <small className="field-error">{errors.procedureSteps}</small>}
      <div className="procedure-editor">
        {draft.procedureSteps.map((step, index) => (
          <section className="nested-panel" key={`${step.id}-${index}`}>
            <div className="panel-head">
              <h4>{step.id}</h4>
              <button className="ghost-btn" type="button" onClick={() => removeStep(index)}>Xóa</button>
            </div>
            <div className="form-main">
              <label><span>Tên bước *</span><input value={step.title} onChange={(event) => updateStep(index, "title", event.target.value)} /></label>
              <label><span>Role phụ trách *</span><input value={step.responsibleRole} onChange={(event) => updateStep(index, "responsibleRole", event.target.value)} /></label>
            </div>
            <label><span>Hướng dẫn thao tác *</span><textarea value={step.instruction} onChange={(event) => updateStep(index, "instruction", event.target.value)} /></label>
            <label><span>Kết quả mong đợi *</span><textarea value={step.expectedResult} onChange={(event) => updateStep(index, "expectedResult", event.target.value)} /></label>
            <label><span>Cảnh báo trong bước</span><input value={step.warning || ""} onChange={(event) => updateStep(index, "warning", event.target.value)} /></label>
          </section>
        ))}
      </div>
      <DecisionEditor draft={draft} change={change} errors={errors} />
    </article>
  );
}

function DecisionEditor({ draft, change, errors }) {
  function updateDecision(index, field, value) {
    change("decisionPoints", draft.decisionPoints.map((point, itemIndex) => itemIndex === index ? { ...point, [field]: value } : point));
  }
  function addDecision() {
    const index = draft.decisionPoints.length + 1;
    change("decisionPoints", [...draft.decisionPoints, { id: `DEC-${String(index).padStart(2, "0")}`, condition: "", yesAction: "", noAction: "", exception: "" }]);
  }
  return (
    <section className="nested-panel">
      <div className="panel-head">
        <h4>Điểm quyết định / ngoại lệ</h4>
        <button className="secondary-btn" type="button" onClick={addDecision}><Plus size={16} />Thêm decision</button>
      </div>
      {errors.decisionPoints && <small className="field-error">{errors.decisionPoints}</small>}
      {draft.decisionPoints.map((point, index) => (
        <div className="decision-edit" key={`${point.id}-${index}`}>
          <label><span>Điều kiện</span><input value={point.condition} onChange={(event) => updateDecision(index, "condition", event.target.value)} /></label>
          <label><span>Nếu có</span><input value={point.yesAction} onChange={(event) => updateDecision(index, "yesAction", event.target.value)} /></label>
          <label><span>Nếu không</span><input value={point.noAction} onChange={(event) => updateDecision(index, "noAction", event.target.value)} /></label>
          <label><span>Ngoại lệ</span><input value={point.exception || ""} onChange={(event) => updateDecision(index, "exception", event.target.value)} /></label>
        </div>
      ))}
    </section>
  );
}

function ReferencesStep({ draft, change, errors }) {
  return (
    <article className="panel form-panel">
      <h3>Bước 5/6 - Nguồn, liên kết và mô tả thay đổi</h3>
      <RepeatableTextarea label="Source Knowledge ID *" values={draft.sourceKnowledgeIds} onChange={(values) => change("sourceKnowledgeIds", values)} error={errors.sourceKnowledgeIds} />
      <RepeatableTextarea label="Source Submission ID" values={draft.sourceSubmissionIds} onChange={(values) => change("sourceSubmissionIds", values)} />
      <RepeatableTextarea label="Nguồn ngoài / evidence" values={draft.externalReferences} onChange={(values) => change("externalReferences", values)} />
      <RepeatableTextarea label="SOP liên quan" values={draft.relatedSopIds} onChange={(values) => change("relatedSopIds", values)} />
      <label><span>Mô tả thay đổi *</span><textarea value={draft.changeSummary} onChange={(event) => change("changeSummary", event.target.value)} /><FieldError id="changeSummary" errors={errors} /></label>
    </article>
  );
}

function SopPreviewStep({ draft, change, errors, navigate }) {
  const allErrors = validateSopDraft(draft, "review", true);
  return (
    <article className="panel form-panel">
      <h3>Bước 6/6 - Preview và xác nhận gửi duyệt</h3>
      {Object.keys(allErrors).length ? <ErrorSummary errors={allErrors} /> : <p className="success-note">Bản nháp đã đạt kiểm tra hợp lệ.</p>}
      <SopPreview draft={draft} />
      <div className="form-actions">
        <button className="secondary-btn" type="button" onClick={() => navigate("sop-version-compare", { id: draft.id })}>Xem version compare</button>
      </div>
      <label className="check-row confirmation-row"><input type="checkbox" checked={draft.confirmation} onChange={(event) => change("confirmation", event.target.checked)} />Tôi xác nhận bản nháp SOP có đủ nguồn, cấu trúc và điều kiện an toàn để gửi quản lý tri thức duyệt.</label>
      <FieldError id="confirmation" errors={errors} />
    </article>
  );
}

export function SopSubmitSuccess({ draft, navigate }) {
  if (!draft) return <Placeholder title="Không tìm thấy Draft SOP" description="Không có Draft SOP tương ứng." />;
  return (
    <section className="page">
      <article className="success-screen">
        <CheckCircle2 size={42} />
        <h2>Đã gửi Draft SOP vào hàng đợi duyệt</h2>
        <p>{draft.title} - {draft.proposedVersion}</p>
        <div className="form-actions">
          <button className="secondary-btn" type="button" onClick={() => navigate("sops", { tab: "drafts" })}>Xem Draft SOP của tôi</button>
          <button className="primary-btn" type="button" onClick={() => navigate("sops", { tab: "review" })}>Sang hàng đợi duyệt SOP</button>
        </div>
      </article>
    </section>
  );
}

export function SopReviewDetail({ draft, updateDraft, navigate, currentUser, currentRole, setToast, publishDraft }) {
  const [decisionComment, setDecisionComment] = useState("");
  const [sectionComment, setSectionComment] = useState("Tổng thể");
  const [showPublish, setShowPublish] = useState(false);
  const [publishForm, setPublishForm] = useState({
    version: draft?.proposedVersion || "",
    effectiveDate: todayInput(),
    reviewDate: reviewDateInput(),
    securityLevel: draft?.securityLevel || "INTERNAL",
    ownerId: currentUser.id,
    confirm: false
  });

  if (!draft) return <Placeholder title="Không tìm thấy Draft SOP" description="Không có item trong hàng đợi duyệt SOP." />;
  if (!["KNOWLEDGE_MANAGER", "ADMINISTRATOR"].includes(currentRole)) return <Placeholder title="Chỉ quản lý tri thức được duyệt SOP" description="Prototype cho phép đổi vai trò ở thanh trên để demo bước duyệt." />;

  const checklist = { ...defaultChecklist, ...(draft.reviewChecklist || {}) };
  const allChecklistPass = Object.values(checklist).every(Boolean);
  const separationOfDuty = currentUser.id !== draft.authorId;
  const canPublish = allChecklistPass && separationOfDuty && publishForm.confirm && publishForm.version && publishForm.effectiveDate && publishForm.reviewDate;

  function markChecklist(key, value) {
    updateDraft(draft.id, (item) => ({ ...item, reviewChecklist: { ...defaultChecklist, ...(item.reviewChecklist || {}), [key]: value }, updatedAt: nowIso() }));
  }

  function beginReview() {
    updateDraft(draft.id, (item) => ({
      ...item,
      status: "IN_REVIEW",
      history: [...(item.history || []), { id: makeId("SOPD-EVT"), action: "IN_REVIEW", actorId: currentUser.id, comment: "Quản lý tri thức bắt đầu kiểm duyệt.", createdAt: nowIso() }]
    }));
    setToast("Đã chuyển SOP sang trạng thái đang duyệt.");
  }

  function requestChanges() {
    if (decisionComment.trim().length < 12) {
      setToast("Nhập comment rõ ràng trước khi yêu cầu chỉnh sửa.");
      return;
    }
    updateDraft(draft.id, (item) => ({
      ...item,
      status: "CHANGES_REQUESTED",
      reviewComments: [...(item.reviewComments || []), { id: makeId("REV"), actorId: currentUser.id, section: sectionComment, comment: decisionComment, createdAt: nowIso() }],
      history: [...(item.history || []), { id: makeId("SOPD-EVT"), action: "REQUEST_CHANGES", actorId: currentUser.id, comment: decisionComment, createdAt: nowIso() }],
      updatedAt: nowIso()
    }));
    setToast("Đã gửi yêu cầu chỉnh sửa cho người biên soạn.");
    navigate("sops", { tab: "review" });
  }

  function reject() {
    if (decisionComment.trim().length < 12) {
      setToast("Nhập lý do trước khi từ chối.");
      return;
    }
    updateDraft(draft.id, (item) => ({
      ...item,
      status: "REJECTED",
      reviewComments: [...(item.reviewComments || []), { id: makeId("REV"), actorId: currentUser.id, section: "Quyết định", comment: decisionComment, createdAt: nowIso() }],
      history: [...(item.history || []), { id: makeId("SOPD-EVT"), action: "REJECT", actorId: currentUser.id, comment: decisionComment, createdAt: nowIso() }],
      updatedAt: nowIso()
    }));
    setToast("Đã từ chối Draft SOP trong mock workflow.");
    navigate("sops", { tab: "review" });
  }

  function approvePublish() {
    if (!canPublish) {
      setToast("Cần pass checklist, đúng SoD và xác nhận metadata publish.");
      return;
    }
    publishDraft(draft, publishForm);
  }

  return (
    <section className="page">
      <BackButton label="Quay lại hàng đợi duyệt SOP" onClick={() => navigate("sops", { tab: "review" })} />
      <PageHeader eyebrow="SOP Review Detail" title={draft.title} description={`${draft.id} - ${draft.proposedVersion}`}>
        <Badge tone={sopWorkflowTones[draft.status]}>{sopWorkflowLabels[draft.status] || draft.status}</Badge>
      </PageHeader>
      <div className="two-column">
        <article className="panel article">
          <div className="form-actions">
            {reviewerStatuses.includes(draft.status) && draft.status !== "IN_REVIEW" && <button className="secondary-btn" type="button" onClick={beginReview}>Bắt đầu kiểm duyệt</button>}
            <button className="secondary-btn" type="button" onClick={() => navigate("sop-version-compare", { id: draft.id })}>So sánh version</button>
          </div>
          <SopPreview draft={draft} />
          <Section title="Review comments">
            {(draft.reviewComments || []).length ? draft.reviewComments.map((comment) => <div className="decision-card" key={comment.id}><strong>{comment.section}</strong><p>{comment.comment}</p><small>{comment.actorId} - {new Date(comment.createdAt).toLocaleString("vi-VN")}</small></div>) : <p className="hint">Chưa có comment.</p>}
          </Section>
        </article>
        <aside className="detail-aside">
          <article className="panel action-panel">
            <h3>Checklist duyệt</h3>
            <div className="review-checklist">
              {Object.entries(checklistLabels).map(([key, label]) => <label className="check-row" key={key}><input type="checkbox" checked={Boolean(checklist[key])} onChange={(event) => markChecklist(key, event.target.checked)} />{label}</label>)}
            </div>
            {!separationOfDuty && <p className="validation-error">Người biên soạn không được tự phê duyệt SOP này.</p>}
          </article>
          <article className="panel action-panel">
            <h3>Quyết định</h3>
            <NativeSelect label="Section comment" value={sectionComment} onChange={setSectionComment} options={["Tổng thể", "Metadata", "An toàn", "Procedure", "Nguồn"].map((value) => ({ value, label: value }))} />
            <label><span>Comment / lý do</span><textarea value={decisionComment} onChange={(event) => setDecisionComment(event.target.value)} placeholder="Nhập phản hồi review..." /></label>
            <button className="secondary-btn wide" type="button" onClick={requestChanges}>Yêu cầu chỉnh sửa</button>
            <button className="ghost-btn wide" type="button" onClick={reject}>Từ chối</button>
            <button className="primary-btn wide" type="button" disabled={!allChecklistPass || !separationOfDuty} onClick={() => setShowPublish(true)}>Duyệt và chuẩn bị xuất bản</button>
          </article>
        </aside>
      </div>
      {showPublish && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true">
            <h2>Xác nhận xuất bản SOP</h2>
            <div className="form-main">
              <label><span>Version *</span><input value={publishForm.version} onChange={(event) => setPublishForm({ ...publishForm, version: event.target.value })} /></label>
              <NativeSelect label="Security" value={publishForm.securityLevel} onChange={(value) => setPublishForm({ ...publishForm, securityLevel: value })} options={securityOptions} />
            </div>
            <div className="form-main">
              <label><span>Effective Date *</span><input type="date" value={publishForm.effectiveDate} onChange={(event) => setPublishForm({ ...publishForm, effectiveDate: event.target.value })} /></label>
              <label><span>Review Date *</span><input type="date" value={publishForm.reviewDate} onChange={(event) => setPublishForm({ ...publishForm, reviewDate: event.target.value })} /></label>
            </div>
            <label className="check-row confirmation-row"><input type="checkbox" checked={publishForm.confirm} onChange={(event) => setPublishForm({ ...publishForm, confirm: event.target.checked })} />Tôi xác nhận SOP được publish, version cũ sẽ chuyển Superseded nếu đây là update.</label>
            <div className="form-actions">
              <button className="ghost-btn" type="button" onClick={() => setShowPublish(false)}>Hủy</button>
              <button className="primary-btn" type="button" disabled={!canPublish} onClick={approvePublish}>Xuất bản SOP</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export function SopVersionCompare({ draft, baseSop, navigate }) {
  if (!draft) return <Placeholder title="Không tìm thấy Draft SOP" description="Không thể mở version compare." />;
  const baseSteps = baseSop?.steps || [];
  return (
    <section className="page">
      <BackButton label="Quay lại SOP" onClick={() => navigate(draft.status === "DRAFT" || draft.status === "CHANGES_REQUESTED" ? "sop-editor" : "sop-review-detail", { id: draft.id, step: "review" })} />
      <PageHeader eyebrow="Version Compare" title={draft.title} description={`${draft.previousVersion || "SOP mới"} -> ${draft.proposedVersion}`} />
      <div className="compare-layout">
        <article className="panel">
          <h3>Phiên bản hiện tại</h3>
          {baseSteps.length ? baseSteps.map((step, index) => <CompareStep key={`${step.title}-${index}`} label={`STEP-${String(index + 1).padStart(2, "0")}`} title={step.title} body={step.instruction} />) : <p className="hint">Không có phiên bản trước vì đây là SOP mới.</p>}
        </article>
        <article className="panel">
          <h3>Draft đề xuất</h3>
          {draft.procedureSteps.map((step, index) => <CompareStep key={`${step.id}-${index}`} label={step.id} title={step.title} body={step.instruction} added={!baseSteps[index] || baseSteps[index].title !== step.title} />)}
        </article>
      </div>
      <article className="panel traceability-panel">
        <h3>Tóm tắt thay đổi</h3>
        <p>{draft.changeSummary}</p>
        <InfoGrid rows={[
          ["Nguồn tri thức", draft.sourceKnowledgeIds.join(", ")],
          ["Submission nguồn", draft.sourceSubmissionIds.join(", ")],
          ["Evidence", draft.externalReferences.join(", ")]
        ]} />
      </article>
    </section>
  );
}

function CompareStep({ label, title, body, added }) {
  return (
    <div className={added ? "compare-step added" : "compare-step"}>
      <span>{label}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

export function SopVersionHistory({ sopId, versions, knowledgeCatalog, navigate, openItem }) {
  const items = versions.filter((version) => version.sopId === sopId);
  const current = knowledgeCatalog.find((item) => item.id === sopId);
  return (
    <section className="page">
      <BackButton label="Quay lại thư viện SOP" onClick={() => navigate("sops", { tab: "versions" })} />
      <PageHeader eyebrow="Version History" title={current?.title || sopId} description="Timeline mock cho vòng đời version và trạng thái superseded/published." />
      <article className="panel">
        <VersionTimeline versions={items} />
        {current && <div className="form-actions"><button className="primary-btn" type="button" onClick={() => openItem(current)}>Mở phiên bản hiện hành</button></div>}
      </article>
    </section>
  );
}

function VersionTimeline({ versions }) {
  const sorted = [...versions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (!sorted.length) return <p className="hint">Chưa có version history trong mock data.</p>;
  return (
    <ol className="timeline version-timeline">
      {sorted.map((version) => (
        <li key={version.versionId}>
          <strong>{version.version} - {version.status === "PUBLISHED" ? "Đã xuất bản" : version.status}</strong>
          <span>{version.effectiveDate} den review {version.reviewDate}</span>
          <p>{version.changeSummary}</p>
        </li>
      ))}
    </ol>
  );
}

function SopPreview({ draft }) {
  return (
    <div className="sop-preview">
      <div className="card-badges">
        <Badge>{draft.type === "UPDATE_EXISTING" ? "Cập nhật SOP" : "SOP mới"}</Badge>
        <Badge tone="neutral">{draft.proposedVersion}</Badge>
        <Badge tone={draft.riskLevel === "CRITICAL" || draft.riskLevel === "HIGH" ? "danger" : "warning"}>{draft.riskLevel}</Badge>
      </div>
      <h3>{draft.title}</h3>
      <p>{draft.summary}</p>
      <InfoGrid rows={[
        ["Mục đích", draft.purpose],
        ["Phạm vi", draft.scope],
        ["Role áp dụng", draft.intendedRoles.join(", ")],
        ["Trigger", draft.trigger]
      ]} />
      <Section title="Safety">
        <Checklist items={[...draft.ppe, ...draft.hazards, ...draft.stopConditions]} />
      </Section>
      <Section title="Procedure">
        <ol className="procedure-list">
          {draft.procedureSteps.map((step) => (
            <li key={step.id}>
              <span>{step.id.replace("STEP-", "")}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.instruction}</p>
                <small>Kết quả mong đợi: {step.expectedResult}</small>
              </div>
            </li>
          ))}
        </ol>
      </Section>
      {draft.decisionPoints.length > 0 && <Section title="Decision points">{draft.decisionPoints.map((point) => <div className="decision-card" key={point.id}><strong>{point.condition}</strong><p>Có: {point.yesAction}</p><p>Không: {point.noAction}</p></div>)}</Section>}
    </div>
  );
}

function SourceCard({ item, navigate }) {
  return (
    <button className="compact-row" type="button" onClick={() => navigate(item.contentType === "SOP" ? "sop-detail" : "knowledge-detail", { id: item.id })}>
      <span><strong>{item.title}</strong><small>{item.id} - {item.contentType}</small></span>
      <ChevronRight size={16} />
    </button>
  );
}

function validateSopDraft(draft, step = "review", all = false) {
  const errors = {};
  const should = (...steps) => all || steps.includes(step);
  if (should("metadata")) {
    if ((draft.sopId || "").trim().length < 5) errors.sopId = "Mã SOP cần tối thiểu 5 ký tự.";
    if ((draft.proposedVersion || "").trim().length < 3) errors.proposedVersion = "Nhập version đề xuất.";
    if ((draft.title || "").trim().length < 10) errors.title = "Tiêu đề SOP tối thiểu 10 ký tự.";
    if ((draft.summary || "").trim().length < 30) errors.summary = "Tóm tắt tối thiểu 30 ký tự.";
    if (!draft.categoryId) errors.categoryId = "Chọn danh mục.";
    if (!draft.faultType) errors.faultType = "Chọn loại lỗi.";
    if (!draft.assetTypes?.length) errors.assetTypes = "Chọn ít nhất một loại tài sản.";
  }
  if (should("scope")) {
    if ((draft.purpose || "").trim().length < 20) errors.purpose = "Mục đích tối thiểu 20 ký tự.";
    if ((draft.scope || "").trim().length < 20) errors.scope = "Phạm vi tối thiểu 20 ký tự.";
    if ((draft.trigger || "").trim().length < 15) errors.trigger = "Điều kiện kích hoạt tối thiểu 15 ký tự.";
    if (!draft.intendedRoles?.length) errors.intendedRoles = "Chọn role áp dụng.";
    if (!validList(draft.completionCriteria, 1, 5)) errors.completionCriteria = "Cần ít nhất một tiêu chí hoàn tất rõ ràng.";
  }
  if (should("safety")) {
    if (!validList(draft.preconditions, 1, 5)) errors.preconditions = "Cần điều kiện trước khi thực hiện.";
    if (!validList(draft.tools, 1, 3)) errors.tools = "Cần công cụ hoặc nguồn lực.";
    if (!validList(draft.stopConditions, 1, 5)) errors.stopConditions = "Cần điều kiện dừng.";
    if (["HIGH", "CRITICAL"].includes(draft.riskLevel)) {
      if (!validList(draft.ppe, 1, 3)) errors.ppe = "Rủi ro cao cần PPE.";
      if (!validList(draft.hazards, 1, 5)) errors.hazards = "Rủi ro cao cần mối nguy.";
      if (!validList(draft.controls, 1, 5)) errors.controls = "Rủi ro cao cần biện pháp kiểm soát.";
      if ((draft.emergencyAction || "").trim().length < 15) errors.emergencyAction = "Rủi ro cao cần hành động khẩn cấp.";
    }
  }
  if (should("procedure")) {
    if (!draft.procedureSteps?.length || draft.procedureSteps.length < 2) errors.procedureSteps = "SOP cần ít nhất hai bước.";
    if (draft.procedureSteps?.some((item) => !item.title || !item.instruction || !item.expectedResult || !item.responsibleRole)) errors.procedureSteps = "Mỗi bước cần tên, hướng dẫn, kết quả mong đợi và role.";
    if (draft.decisionPoints?.some((item) => item.condition && (!item.yesAction || !item.noAction))) errors.decisionPoints = "Decision point cần đủ nhánh Có và Không.";
  }
  if (should("references")) {
    if (!draft.sourceKnowledgeIds?.length && !draft.sourceSubmissionIds?.length && !draft.externalReferences?.length) errors.sourceKnowledgeIds = "Cần ít nhất một nguồn traceability.";
    if (draft.type === "UPDATE_EXISTING" && (draft.changeSummary || "").trim().length < 20) errors.changeSummary = "Update SOP cần mô tả thay đổi tối thiểu 20 ký tự.";
  }
  if (should("review") && !draft.confirmation) errors.confirmation = "Cần xác nhận trước khi gửi duyệt.";
  return errors;
}

function validList(items = [], minItems, minChars) {
  return items.filter((item) => String(item || "").trim().length >= minChars).length >= minItems;
}

function setDeep(item, path, value) {
  const next = structuredClone(item);
  const keys = path.split(".");
  let cursor = next;
  keys.slice(0, -1).forEach((key) => {
    cursor = cursor[key];
  });
  cursor[keys.at(-1)] = value;
  next.updatedAt = nowIso();
  return next;
}

function RepeatableTextarea({ label, values = [], onChange, error }) {
  function update(index, value) {
    onChange(values.map((item, itemIndex) => itemIndex === index ? value : item));
  }
  return (
    <section className="repeatable-field">
      <div className="panel-head">
        <label><span>{label}</span></label>
        <button className="ghost-btn" type="button" onClick={() => onChange([...values, ""])}><Plus size={15} />Thêm</button>
      </div>
      {values.map((value, index) => (
        <div className="repeat-row" key={`${label}-${index}`}>
          <textarea value={value} onChange={(event) => update(index, event.target.value)} />
          <button className="ghost-btn" type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}>Xóa</button>
        </div>
      ))}
      {!values.length && <button className="secondary-btn" type="button" onClick={() => onChange([""])}>Thêm dòng đầu tiên</button>}
      {error && <small className="field-error">{error}</small>}
    </section>
  );
}

function NativeSelect({ label, value, onChange, options, error }) {
  return (
    <label>
      <span>{label}</span>
      <select value={value || ""} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

function CheckboxGroup({ label, options, values = [], onChange, error }) {
  return (
    <fieldset className="checkbox-group">
      <legend>{label}</legend>
      {options.map((option) => (
        <label className="check-row" key={option.value}>
          <input
            type="checkbox"
            checked={values.includes(option.value)}
            onChange={(event) => {
              const next = event.target.checked ? [...values, option.value] : values.filter((value) => value !== option.value);
              onChange(next);
            }}
          />
          {option.label}
        </label>
      ))}
      {error && <small className="field-error">{error}</small>}
    </fieldset>
  );
}

function FieldError({ id, errors }) {
  return errors[id] ? <small className="field-error">{errors[id]}</small> : null;
}

function ErrorSummary({ errors }) {
  return (
    <article className="error-summary" role="alert">
      <strong>Cần kiểm tra lại {Object.keys(errors).length} mục</strong>
      <ul>{Object.entries(errors).map(([key, message]) => <li key={key}>{message}</li>)}</ul>
    </article>
  );
}

function Checklist({ items }) {
  return <ul className="checklist">{items.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul>;
}

function Section({ title, children }) {
  return <section className="detail-section"><h3>{title}</h3>{children}</section>;
}

function InfoGrid({ rows }) {
  return <dl className="info-grid">{rows.filter(([, value]) => value || value === 0).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{Array.isArray(value) ? value.join(", ") : value}</dd></div>)}</dl>;
}

function EmptyState({ icon, title, description }) {
  return <article className="empty-state">{icon}<h3>{title}</h3><p>{description}</p></article>;
}

function Placeholder({ title, description }) {
  return <section className="page"><PageHeader title={title} description={description} /></section>;
}

function BackButton({ label, onClick }) {
  return <button className="back-btn" type="button" onClick={onClick}><ArrowLeft size={16} />{label}</button>;
}

function Badge({ children, tone = "primary", icon }) {
  return <span className={`badge ${tone}`}>{icon}{children}</span>;
}

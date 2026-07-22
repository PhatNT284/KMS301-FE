import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Archive,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileClock,
  FileText,
  GitBranch,
  History,
  Link2,
  ListChecks,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import {
  changeTypeOptions,
  decisionLabels,
  defaultReviewChecklist,
  issueTypeLabels,
  issueTypeOptions,
  lifecycleStatusLabels,
  lifecycleStatusTones,
  makeLifecycleId,
  nextReviewDate,
  nowIso,
  priorityLabels,
  reviewTaskStatusLabels,
  severityOptions,
  triggerTypeLabels,
  visibilityActionOptions
} from "../data/fl05Data.js";

const activeReviewStatuses = ["OPEN", "IN_PROGRESS", "WAITING_FOR_REVISION", "IN_REVIEW", "CHANGES_REQUESTED"];
const contributorStatuses = ["ASSIGNED", "IN_PROGRESS", "CHANGES_REQUESTED"];

function displayDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function personName(users, id) {
  return users.find((user) => user.id === id)?.name || id || "-";
}

function optionLabel(options, value) {
  return options.find((item) => item.value === value)?.label || value || "-";
}

function eventFor(entityType, entityId, action, actorId, metadata = {}) {
  return {
    eventId: makeLifecycleId("LC-EVT"),
    entityType,
    entityId,
    action,
    actorId,
    timestamp: nowIso(),
    metadata
  };
}

export function FL05Flow({
  screen,
  id,
  currentUser,
  currentRole,
  users,
  taxonomy,
  navigate,
  knowledgeCatalog,
  lifecycleItems,
  setLifecycleItems,
  reviewTasks,
  setReviewTasks,
  issueReports,
  setIssueReports,
  revisionTasks,
  setRevisionTasks,
  lifecycleDecisions,
  setLifecycleDecisions,
  lifecycleEvents,
  setLifecycleEvents,
  reviewPolicies,
  setReviewPolicies,
  createFieldSubmission,
  startLifecycleSopRevision,
  publishLifecycleArticleRevision,
  openItem,
  setToast
}) {
  const reviewTask = id ? reviewTasks.find((item) => item.reviewTaskId === id) : null;
  const revisionTask = id ? revisionTasks.find((item) => item.revisionTaskId === id) : null;
  const knowledgeItem = reviewTask
    ? knowledgeCatalog.find((item) => item.id === reviewTask.knowledgeId)
    : revisionTask
      ? knowledgeCatalog.find((item) => item.id === revisionTask.knowledgeId)
      : id
        ? knowledgeCatalog.find((item) => item.id === id)
        : null;

  function patchLifecycleItem(knowledgeId, updater) {
    setLifecycleItems((items) => {
      const existing = items.find((item) => item.knowledgeId === knowledgeId);
      const base = existing || {
        knowledgeId,
        status: "PUBLISHED",
        currentVersion: knowledgeCatalog.find((item) => item.id === knowledgeId)?.version || "v1.0",
        knowledgeManagerId: "KM-001",
        authorId: "KC-001",
        nextReviewDate: nextReviewDate(),
        reviewPolicyId: "RP-SOP-HIGH",
        usageStats: {},
        relations: []
      };
      const next = typeof updater === "function" ? updater(base) : { ...base, ...updater };
      return [next, ...items.filter((item) => item.knowledgeId !== knowledgeId)];
    });
  }

  function patchReviewTask(taskId, updater) {
    setReviewTasks((items) => items.map((item) => {
      if (item.reviewTaskId !== taskId) return item;
      const next = typeof updater === "function" ? updater(item) : { ...item, ...updater };
      return { ...next };
    }));
  }

  function patchRevisionTask(taskId, updater) {
    setRevisionTasks((items) => items.map((item) => {
      if (item.revisionTaskId !== taskId) return item;
      const next = typeof updater === "function" ? updater(item) : { ...item, ...updater };
      return { ...next, updatedAt: nowIso() };
    }));
  }

  function addEvent(entityType, entityId, action, metadata = {}) {
    const event = eventFor(entityType, entityId, action, currentUser.id, metadata);
    setLifecycleEvents((items) => [event, ...items]);
    return event;
  }

  function makeDecision(task, decisionType, reason, extras = {}) {
    const decision = {
      decisionId: makeLifecycleId("LCD"),
      reviewTaskId: task.reviewTaskId,
      knowledgeId: task.knowledgeId,
      decisionType,
      reason,
      nextReviewDate: extras.nextReviewDate || "",
      replacementKnowledgeId: extras.replacementKnowledgeId || "",
      revisionTaskId: extras.revisionTaskId || "",
      actorId: currentUser.id,
      createdAt: nowIso()
    };
    setLifecycleDecisions((items) => [decision, ...items]);
    patchReviewTask(task.reviewTaskId, {
      status: extras.taskStatus || "COMPLETED",
      decisionId: decision.decisionId,
      revisionTaskId: extras.revisionTaskId || task.revisionTaskId || null,
      completedAt: extras.taskStatus ? "" : nowIso()
    });
    addEvent("LIFECYCLE_DECISION", decision.decisionId, decisionType, { reason, knowledgeId: task.knowledgeId });
    return decision;
  }

  function beginReview(task) {
    patchReviewTask(task.reviewTaskId, { status: "IN_PROGRESS", startedAt: nowIso() });
    patchLifecycleItem(task.knowledgeId, { status: "UNDER_REVIEW" });
    addEvent("REVIEW_TASK", task.reviewTaskId, "START_REVIEW", { knowledgeId: task.knowledgeId });
    setToast("Đã bắt đầu rà soát vòng đời.");
  }

  function reconfirm(task, form) {
    makeDecision(task, "RECONFIRM", form.reason, { nextReviewDate: form.nextReviewDate });
    patchLifecycleItem(task.knowledgeId, {
      status: "PUBLISHED",
      lastReviewedAt: nowIso(),
      nextReviewDate: form.nextReviewDate
    });
    setToast("Đã xác nhận lại nội dung và đặt ngày rà soát tiếp theo.");
    navigate("lifecycle-success", { eventId: task.reviewTaskId });
  }

  function createRevision(task, form) {
    const item = knowledgeCatalog.find((entry) => entry.id === task.knowledgeId);
    const revision = {
      revisionTaskId: makeLifecycleId("RT"),
      sourceReviewTaskId: task.reviewTaskId,
      knowledgeId: task.knowledgeId,
      contentType: item?.contentType || "ARTICLE",
      changeType: form.changeType,
      requiredChanges: form.requiredChanges.split("\n").map((entry) => entry.trim()).filter(Boolean),
      assignedContributorId: form.assignedContributorId,
      visibilityAction: form.visibilityAction,
      targetVersion: form.targetVersion,
      status: "ASSIGNED",
      targetFlow: item?.contentType === "SOP" ? "FL-03" : "FL-05",
      draft: {
        title: item?.title || "",
        summary: item?.summary || "",
        changeSummary: form.requiredChanges
      },
      sopTaskId: "",
      submittedDraftId: "",
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    setRevisionTasks((items) => [revision, ...items]);
    makeDecision(task, "REVISE", form.reason, { revisionTaskId: revision.revisionTaskId, taskStatus: "WAITING_FOR_REVISION" });
    patchLifecycleItem(task.knowledgeId, {
      status: form.visibilityAction === "SUSPEND_OLD" ? "SUSPENDED" : "UPDATE_REQUIRED",
      suspendedAt: form.visibilityAction === "SUSPEND_OLD" ? nowIso() : "",
      revisionTaskId: revision.revisionTaskId
    });
    addEvent("REVISION_TASK", revision.revisionTaskId, "REVISION_TASK_CREATED", { targetFlow: revision.targetFlow });
    setToast(item?.contentType === "SOP" ? "Đã tạo revision task SOP, Contributor sẽ mở FL-03." : "Đã tạo revision task cho Contributor.");
    navigate("lifecycle-success", { eventId: revision.revisionTaskId });
  }

  function suspend(task, form) {
    makeDecision(task, "SUSPEND", form.reason, { taskStatus: "WAITING_FOR_REVISION" });
    patchLifecycleItem(task.knowledgeId, {
      status: "SUSPENDED",
      suspendedAt: nowIso(),
      suspensionWarning: form.warning,
      replacementKnowledgeId: form.replacementKnowledgeId
    });
    setToast("Đã tạm ngừng nội dung và cập nhật visibility FL-01.");
    navigate("lifecycle-success", { eventId: task.reviewTaskId });
  }

  function supersede(task, form) {
    makeDecision(task, "SUPERSEDE", form.reason, { replacementKnowledgeId: form.replacementKnowledgeId });
    patchLifecycleItem(task.knowledgeId, {
      status: "SUPERSEDED",
      supersededById: form.replacementKnowledgeId,
      replacementKnowledgeId: form.replacementKnowledgeId
    });
    patchLifecycleItem(form.replacementKnowledgeId, (item) => ({
      ...item,
      status: item.status || "PUBLISHED",
      relations: [...(item.relations || []), { type: "replaces", id: task.knowledgeId }]
    }));
    setToast("Đã đánh dấu nội dung cũ bị thay thế.");
    navigate("lifecycle-success", { eventId: task.reviewTaskId });
  }

  function archiveContent(task, form) {
    makeDecision(task, "ARCHIVE", form.reason);
    patchLifecycleItem(task.knowledgeId, {
      status: "ARCHIVED",
      archivedAt: nowIso(),
      archiveReason: form.reason
    });
    setToast("Đã lưu trữ nội dung trong mock lifecycle.");
    navigate("lifecycle-success", { eventId: task.reviewTaskId });
  }

  function startRevisionWork(task) {
    patchRevisionTask(task.revisionTaskId, { status: "IN_PROGRESS" });
    patchLifecycleItem(task.knowledgeId, { status: "UNDER_REVISION" });
    addEvent("REVISION_TASK", task.revisionTaskId, "START_REVISION", { knowledgeId: task.knowledgeId });
    setToast("Đã bắt đầu xử lý revision task.");
  }

  function openSopRevision(task) {
    const review = reviewTasks.find((entry) => entry.reviewTaskId === task.sourceReviewTaskId);
    const item = knowledgeCatalog.find((entry) => entry.id === task.knowledgeId);
    const sopTask = startLifecycleSopRevision(task, review, item);
    patchRevisionTask(task.revisionTaskId, { status: "IN_PROGRESS", sopTaskId: sopTask.id });
    patchLifecycleItem(task.knowledgeId, { status: "UNDER_REVISION" });
  }

  function submitArticleRevision(task, form) {
    patchRevisionTask(task.revisionTaskId, {
      status: "SUBMITTED",
      draft: form
    });
    patchReviewTask(task.sourceReviewTaskId, { status: "IN_REVIEW" });
    addEvent("REVISION_TASK", task.revisionTaskId, "REVISION_SUBMITTED", { knowledgeId: task.knowledgeId });
    setToast("Đã gửi revision để Knowledge Manager tái duyệt.");
    navigate("lifecycle-rereview", { taskId: task.revisionTaskId });
  }

  function approveRevision(task) {
    const review = reviewTasks.find((entry) => entry.reviewTaskId === task.sourceReviewTaskId);
    const item = knowledgeCatalog.find((entry) => entry.id === task.knowledgeId);
    const published = publishLifecycleArticleRevision(task, item);
    patchRevisionTask(task.revisionTaskId, { status: "APPROVED", submittedDraftId: published.id });
    if (review) {
      makeDecision(review, "APPROVE_REVISION", `Phê duyệt revision ${task.targetVersion}.`, { taskStatus: "COMPLETED" });
      patchReviewTask(review.reviewTaskId, { completedAt: nowIso() });
    }
    patchLifecycleItem(task.knowledgeId, {
      status: "SUPERSEDED",
      supersededById: published.id
    });
    patchLifecycleItem(published.id, {
      status: "PUBLISHED",
      currentVersion: published.version,
      lastReviewedAt: nowIso(),
      nextReviewDate: nextReviewDate(365),
      knowledgeManagerId: currentUser.id,
      authorId: task.assignedContributorId,
      relations: [{ type: "replaces", id: task.knowledgeId }]
    });
    setToast("Đã publish bản revision và cập nhật FL-01.");
    navigate("lifecycle-success", { eventId: task.revisionTaskId });
  }

  function requestRevisionChanges(task, note) {
    patchRevisionTask(task.revisionTaskId, {
      status: "CHANGES_REQUESTED",
      changeRequestNote: note
    });
    patchReviewTask(task.sourceReviewTaskId, { status: "CHANGES_REQUESTED" });
    addEvent("REVISION_TASK", task.revisionTaskId, "CHANGES_REQUESTED", { note });
    setToast("Đã yêu cầu Contributor chỉnh sửa revision.");
  }

  if (screen === "lifecycle-dashboard" || screen === "lifecycle-entry") {
    return <LifecycleDashboard currentRole={currentRole} knowledgeCatalog={knowledgeCatalog} lifecycleItems={lifecycleItems} reviewTasks={reviewTasks} decisions={lifecycleDecisions} events={lifecycleEvents} navigate={navigate} />;
  }
  if (screen === "lifecycle-review-queue") {
    return <LifecycleReviewQueue tasks={reviewTasks} lifecycleItems={lifecycleItems} knowledgeCatalog={knowledgeCatalog} users={users} currentRole={currentRole} navigate={navigate} />;
  }
  if (screen === "lifecycle-review-detail" || screen === "lifecycle-checklist") {
    return reviewTask && knowledgeItem
      ? <LifecycleReviewDetail task={reviewTask} knowledgeItem={knowledgeItem} lifecycleItem={lifecycleItems.find((item) => item.knowledgeId === reviewTask.knowledgeId)} issueReports={issueReports} users={users} currentRole={currentRole} navigate={navigate} beginReview={beginReview} reconfirm={reconfirm} createRevision={createRevision} suspend={suspend} supersede={supersede} archiveContent={archiveContent} createFieldSubmission={createFieldSubmission} knowledgeCatalog={knowledgeCatalog} />
      : <MissingLifecycle navigate={navigate} title="Không tìm thấy review task" />;
  }
  if (screen === "my-revision-tasks") {
    return <ContributorRevisionQueue tasks={revisionTasks} reviewTasks={reviewTasks} knowledgeCatalog={knowledgeCatalog} currentUser={currentUser} users={users} navigate={navigate} startRevisionWork={startRevisionWork} openSopRevision={openSopRevision} />;
  }
  if (screen === "lifecycle-revision-workspace") {
    return revisionTask && knowledgeItem
      ? <RevisionWorkspace task={revisionTask} knowledgeItem={knowledgeItem} users={users} navigate={navigate} startRevisionWork={startRevisionWork} openSopRevision={openSopRevision} submitArticleRevision={submitArticleRevision} />
      : <MissingLifecycle navigate={navigate} title="Không tìm thấy revision task" />;
  }
  if (screen === "lifecycle-rereview") {
    return revisionTask && knowledgeItem
      ? <LifecycleRereview task={revisionTask} knowledgeItem={knowledgeItem} users={users} currentUser={currentUser} navigate={navigate} approveRevision={approveRevision} requestRevisionChanges={requestRevisionChanges} />
      : <MissingLifecycle navigate={navigate} title="Không tìm thấy revision để tái duyệt" />;
  }
  if (screen === "lifecycle-version-compare") {
    return <LifecycleVersionCompare knowledgeItem={knowledgeItem} revisionTask={revisionTask} navigate={navigate} />;
  }
  if (screen === "lifecycle-history") {
    return <LifecycleHistory id={id} knowledgeCatalog={knowledgeCatalog} lifecycleItems={lifecycleItems} reviewTasks={reviewTasks} revisionTasks={revisionTasks} issueReports={issueReports} decisions={lifecycleDecisions} events={lifecycleEvents} navigate={navigate} openItem={openItem} />;
  }
  if (screen === "lifecycle-policy-settings") {
    return <LifecyclePolicySettings policies={reviewPolicies} setPolicies={setReviewPolicies} currentRole={currentRole} navigate={navigate} setToast={setToast} />;
  }
  if (screen === "lifecycle-success") {
    return <LifecycleSuccess id={id} navigate={navigate} />;
  }
  return <LifecycleDashboard currentRole={currentRole} knowledgeCatalog={knowledgeCatalog} lifecycleItems={lifecycleItems} reviewTasks={reviewTasks} decisions={lifecycleDecisions} events={lifecycleEvents} navigate={navigate} />;
}

export function IssueReportForm({ item, currentUser, submitIssueReport, close }) {
  const [form, setForm] = useState({
    issueType: "OUTDATED",
    severity: "MEDIUM",
    description: "Nội dung hiện tại không còn phù hợp với tình huống thực tế.",
    observedImpact: "",
    workOrderId: "",
    attachments: []
  });
  const [showErrors, setShowErrors] = useState(false);
  const errors = {};
  if (!form.description.trim()) errors.description = "Nhập mô tả vấn đề.";
  if (form.issueType === "UNSAFE" && form.severity !== "CRITICAL") errors.severity = "Vấn đề không an toàn nên dùng mức Nghiêm trọng để demo FL-05.";

  function submit(event) {
    event.preventDefault();
    if (Object.keys(errors).length) {
      setShowErrors(true);
      return;
    }
    submitIssueReport(item, form);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal large-modal" role="dialog" aria-modal="true" aria-labelledby="issue-title">
        <h2 id="issue-title">Báo vấn đề nội dung</h2>
        <p>{item.id} - {item.title} - phiên bản {item.version}. Báo cáo này sẽ tạo Issue Report và Review Task trong FL-05.</p>
        {showErrors && Object.keys(errors).length > 0 && <ErrorBox errors={errors} />}
        <form className="submission-form" onSubmit={submit}>
          <div className="form-main">
            <SelectField label="Loại vấn đề" value={form.issueType} onChange={(value) => setForm({ ...form, issueType: value, severity: value === "UNSAFE" ? "CRITICAL" : form.severity })} options={issueTypeOptions} />
            <SelectField label="Mức độ" value={form.severity} onChange={(value) => setForm({ ...form, severity: value })} options={severityOptions} />
            <label><span>Work order</span><input value={form.workOrderId} onChange={(event) => setForm({ ...form, workOrderId: event.target.value })} placeholder="WO-2026-00991" /></label>
            <label><span>Bằng chứng mock</span><input value={form.attachments.join(", ")} onChange={(event) => setForm({ ...form, attachments: event.target.value.split(",").map((entry) => entry.trim()).filter(Boolean) })} placeholder="photo.jpg, telemetry.png" /></label>
          </div>
          <label><span>Mô tả vấn đề *</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label><span>Tác động quan sát được</span><textarea value={form.observedImpact} onChange={(event) => setForm({ ...form, observedImpact: event.target.value })} placeholder="Ví dụ: có nguy cơ kỹ thuật viên thao tác trong điều kiện không an toàn." /></label>
          <div className="form-actions">
            <button className="ghost-btn" type="button" onClick={close}>Đóng</button>
            <button className="primary-btn" type="submit"><Send size={16} />Gửi issue report</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function LifecycleDashboard({ currentRole, knowledgeCatalog, lifecycleItems, reviewTasks, decisions, events, navigate }) {
  const enriched = lifecycleItems.map((item) => ({ ...item, knowledge: knowledgeCatalog.find((entry) => entry.id === item.knowledgeId) })).filter((item) => item.knowledge);
  const openTasks = reviewTasks.filter((item) => activeReviewStatuses.includes(item.status));
  const criticalTasks = openTasks.filter((item) => item.priority === "CRITICAL").length;
  const overdueTasks = openTasks.filter((item) => item.dueDate && new Date(item.dueDate) < new Date()).length;
  const suspended = lifecycleItems.filter((item) => item.status === "SUSPENDED").length;
  const recentEvents = events.slice(0, 5);

  return (
    <section className="page">
      <PageHeading eyebrow="FL-05" title="Vòng đời tri thức" description="Theo dõi review date, issue report, nội dung bị gắn cờ và quyết định vòng đời sau khi tri thức đã publish.">
        <button className="primary-btn" type="button" onClick={() => navigate("lifecycle-review-queue")}><ListChecks size={16} />Mở hàng đợi rà soát</button>
      </PageHeading>
      {currentRole !== "KNOWLEDGE_MANAGER" && currentRole !== "ADMINISTRATOR" && <div className="warning-banner neutral"><AlertTriangle size={18} /><span>Prototype vẫn cho xem dashboard, nhưng quyết định vòng đời thuộc vai trò Knowledge Manager.</span></div>}
      <div className="metric-grid">
        <Metric label="Task đang mở" value={openTasks.length} detail="Review task chưa hoàn tất" />
        <Metric label="Critical" value={criticalTasks} detail="Cần xử lý rủi ro an toàn" tone="danger" />
        <Metric label="Quá hạn" value={overdueTasks} detail="Due date trước hôm nay" tone="warning" />
        <Metric label="Tạm ngừng" value={suspended} detail="Ẩn khỏi search mặc định" tone="danger" />
      </div>
      <div className="two-column">
        <article className="panel">
          <div className="panel-head"><h3>Content Health</h3><button className="secondary-btn" type="button" onClick={() => navigate("lifecycle-policy-settings")}>Policy</button></div>
          <div className="lifecycle-health-grid">
            {["PUBLISHED", "REVIEW_DUE", "FLAGGED", "UNDER_REVIEW", "SUSPENDED", "SUPERSEDED", "ARCHIVED"].map((status) => (
              <button className="compact-row" type="button" key={status} onClick={() => navigate("lifecycle-review-queue")}>
                <span><strong>{lifecycleStatusLabels[status]}</strong><small>{enriched.filter((item) => item.status === status).length} nội dung</small></span>
                <StatusBadge status={status} />
              </button>
            ))}
          </div>
        </article>
        <article className="panel">
          <div className="panel-head"><h3>Lifecycle gần đây</h3></div>
          <Timeline events={recentEvents} />
        </article>
      </div>
      <article className="panel">
        <div className="panel-head"><h3>Nội dung cần chú ý</h3></div>
        <div className="submission-list">
          {enriched.slice(0, 5).map((item) => (
            <article className="submission-card" key={item.knowledgeId}>
              <div>
                <div className="card-badges"><StatusBadge status={item.status} /><Badge>{item.knowledge.contentType}</Badge></div>
                <h3>{item.knowledge.title}</h3>
                <p>Review tiếp theo: {item.nextReviewDate || item.knowledge.reviewDate}. Helpful: {item.usageStats?.helpfulRate || item.knowledge.helpfulRate}%.</p>
              </div>
              <div className="submission-actions">
                <button className="secondary-btn" type="button" onClick={() => navigate("lifecycle-history", { id: item.knowledgeId })}>History</button>
                <button className="primary-btn" type="button" onClick={() => navigate("knowledge-detail", { id: item.knowledgeId })}>Mở nội dung</button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}

function LifecycleReviewQueue({ tasks, lifecycleItems, knowledgeCatalog, users, currentRole, navigate }) {
  const queue = tasks.filter((item) => activeReviewStatuses.includes(item.status));
  return (
    <section className="page">
      <PageHeading eyebrow="FL-05" title="Hàng đợi rà soát vòng đời" description="Knowledge Manager xử lý review task từ review date, issue report, source change hoặc tín hiệu FL-02/FL-04." />
      {currentRole !== "KNOWLEDGE_MANAGER" && currentRole !== "ADMINISTRATOR" && <div className="warning-banner"><AlertTriangle size={18} /><span>Chỉ Knowledge Manager được thực hiện Reconfirm, Revise, Suspend, Supersede hoặc Archive.</span></div>}
      <div className="queue-filters">
        <span>Đang mở <strong>{queue.length}</strong></span>
        <span>Critical <strong>{queue.filter((item) => item.priority === "CRITICAL").length}</strong></span>
        <span>Chờ revision <strong>{queue.filter((item) => item.status === "WAITING_FOR_REVISION").length}</strong></span>
      </div>
      <div className="submission-list">
        {queue.map((task) => {
          const item = knowledgeCatalog.find((entry) => entry.id === task.knowledgeId);
          const lifecycle = lifecycleItems.find((entry) => entry.knowledgeId === task.knowledgeId);
          return (
            <article className="submission-card" key={task.reviewTaskId}>
              <div>
                <div className="card-badges">
                  <Badge tone={task.priority === "CRITICAL" ? "danger" : task.priority === "HIGH" ? "warning" : "neutral"}>{priorityLabels[task.priority]}</Badge>
                  <Badge>{reviewTaskStatusLabels[task.status]}</Badge>
                  {lifecycle && <StatusBadge status={lifecycle.status} />}
                </div>
                <h3>{item?.title || task.knowledgeId}</h3>
                <p>{triggerTypeLabels[task.triggerType]} - hạn {task.dueDate} - Manager: {personName(users, task.assignedManagerId)}</p>
                <small>{task.reviewTaskId} - {task.knowledgeId} {task.version}</small>
              </div>
              <button className="primary-btn" type="button" onClick={() => navigate("lifecycle-review-detail", { id: task.reviewTaskId })}>Mở rà soát</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LifecycleReviewDetail({ task, knowledgeItem, lifecycleItem, issueReports, users, currentRole, navigate, beginReview, reconfirm, createRevision, suspend, supersede, archiveContent, createFieldSubmission, knowledgeCatalog }) {
  const issues = issueReports.filter((item) => task.triggerEvidenceIds?.includes(item.issueReportId));
  const hasCriticalFail = task.checklistResults?.some((item) => item.critical && item.result === "FAIL");
  const [reconfirmForm, setReconfirmForm] = useState({ reason: "Nội dung vẫn chính xác và nguồn còn hiệu lực.", nextReviewDate: nextReviewDate(180) });
  const [revisionForm, setRevisionForm] = useState({
    reason: hasCriticalFail ? "Checklist an toàn FAIL, cần cập nhật nội dung." : "Cần cập nhật nội dung theo kết quả rà soát.",
    changeType: hasCriticalFail ? "MAJOR" : "MINOR",
    assignedContributorId: "KC-001",
    visibilityAction: hasCriticalFail ? "SUSPEND_OLD" : "KEEP_WITH_WARNING",
    targetVersion: hasCriticalFail ? "v2.0" : "v1.1",
    requiredChanges: task.checklistResults?.filter((item) => item.result === "FAIL").map((item) => `${item.label}: ${item.note || "Cần cập nhật"}`).join("\n") || "Cập nhật nội dung theo review."
  });
  const [suspendForm, setSuspendForm] = useState({
    reason: "Có rủi ro an toàn, cần tạm ngừng trước khi revision.",
    warning: "Không sử dụng nội dung này cho tác nghiệp hiện trường cho đến khi có bản cập nhật.",
    replacementKnowledgeId: ""
  });
  const [supersedeForm, setSupersedeForm] = useState({ reason: "Đã có nội dung Published thay thế chính thức.", replacementKnowledgeId: knowledgeCatalog.find((item) => item.id !== knowledgeItem.id && item.status === "PUBLISHED")?.id || "" });
  const [archiveForm, setArchiveForm] = useState({ reason: "Nội dung không còn dùng trong vận hành hiện tại và không có dependency đang mở." });
  const canDecide = currentRole === "KNOWLEDGE_MANAGER" || currentRole === "ADMINISTRATOR";

  return (
    <section className="page detail-page">
      <BackButton label="Quay lại hàng đợi" onClick={() => navigate("lifecycle-review-queue")} />
      <PageHeading eyebrow={`Review Task - ${task.reviewTaskId}`} title={knowledgeItem.title} description={`${triggerTypeLabels[task.triggerType]} - ${reviewTaskStatusLabels[task.status]}`}>
        <Badge tone={task.priority === "CRITICAL" ? "danger" : "warning"}>{priorityLabels[task.priority]}</Badge>
        {lifecycleItem && <StatusBadge status={lifecycleItem.status} />}
      </PageHeading>
      <div className="detail-layout">
        <article className="panel article">
          <Section title="Metadata & Health">
            <InfoGrid rows={[
              ["Knowledge ID", knowledgeItem.id],
              ["Version", task.version],
              ["Content type", knowledgeItem.contentType],
              ["Owner", personName(users, lifecycleItem?.knowledgeManagerId || "KM-001")],
              ["Next review", lifecycleItem?.nextReviewDate || knowledgeItem.reviewDate],
              ["Helpful", `${lifecycleItem?.usageStats?.helpfulRate || knowledgeItem.helpfulRate}%`]
            ]} />
            <p>{knowledgeItem.summary}</p>
          </Section>
          <Section title="Issue report / nguồn kích hoạt">
            {issues.length ? issues.map((issue) => (
              <div className="nested-panel" key={issue.issueReportId}>
                <div className="card-badges"><Badge tone={issue.severity === "CRITICAL" ? "danger" : "warning"}>{priorityLabels[issue.severity]}</Badge><Badge>{issueTypeLabels[issue.issueType]}</Badge></div>
                <h4>{issue.issueReportId}</h4>
                <p>{issue.description}</p>
                <small>Reporter: {personName(users, issue.reporterId)} - {displayDateTime(issue.createdAt)}</small>
              </div>
            )) : <p className="hint">Task được tạo từ review date hoặc manual review, không có issue report.</p>}
          </Section>
          <Section title="Checklist rà soát">
            <ReviewChecklist items={task.checklistResults || defaultReviewChecklist} />
          </Section>
          <Section title="Hành động hỗ trợ">
            <div className="form-actions">
              <button className="secondary-btn" type="button" onClick={() => createFieldSubmission({ appliedItem: knowledgeItem, symptom: `Xác minh hiện trường cho ${task.reviewTaskId}` })}>Yêu cầu xác minh hiện trường (FL-02)</button>
              <button className="ghost-btn" type="button" onClick={() => navigate("lifecycle-history", { id: knowledgeItem.id })}>Xem lifecycle history</button>
            </div>
          </Section>
        </article>
        <aside className="detail-aside">
          <article className="panel action-panel decision-panel">
            <h3>Quyết định vòng đời</h3>
            {task.status === "OPEN" && <button className="secondary-btn wide" disabled={!canDecide} type="button" onClick={() => beginReview(task)}>Bắt đầu rà soát</button>}
            {hasCriticalFail && <div className="warning-banner"><ShieldAlert size={18} /><span>Checklist có FAIL critical. Không nên Reconfirm; hãy Suspend hoặc tạo Revision.</span></div>}
            <label><span>Lý do Reconfirm</span><textarea value={reconfirmForm.reason} onChange={(event) => setReconfirmForm({ ...reconfirmForm, reason: event.target.value })} /></label>
            <label><span>Ngày review tiếp theo</span><input type="date" value={reconfirmForm.nextReviewDate} onChange={(event) => setReconfirmForm({ ...reconfirmForm, nextReviewDate: event.target.value })} /></label>
            <button className="secondary-btn wide" disabled={!canDecide || hasCriticalFail} type="button" onClick={() => reconfirm(task, reconfirmForm)}>Reconfirm</button>
          </article>
          <article className="panel action-panel">
            <h3>Tạo revision</h3>
            <SelectField label="Change type" value={revisionForm.changeType} onChange={(value) => setRevisionForm({ ...revisionForm, changeType: value })} options={changeTypeOptions} />
            <SelectField label="Contributor" value={revisionForm.assignedContributorId} onChange={(value) => setRevisionForm({ ...revisionForm, assignedContributorId: value })} options={users.filter((user) => user.role === "CONTRIBUTOR").map((user) => ({ value: user.id, label: user.name }))} />
            <SelectField label="Visibility bản cũ" value={revisionForm.visibilityAction} onChange={(value) => setRevisionForm({ ...revisionForm, visibilityAction: value })} options={visibilityActionOptions} />
            <label><span>Target version</span><input value={revisionForm.targetVersion} onChange={(event) => setRevisionForm({ ...revisionForm, targetVersion: event.target.value })} /></label>
            <label><span>Required changes</span><textarea value={revisionForm.requiredChanges} onChange={(event) => setRevisionForm({ ...revisionForm, requiredChanges: event.target.value })} /></label>
            <button className="primary-btn wide" disabled={!canDecide} type="button" onClick={() => createRevision(task, revisionForm)}>Tạo Revision Task</button>
          </article>
          <article className="panel action-panel">
            <h3>Suspend / Supersede / Archive</h3>
            <label><span>Warning khi suspend</span><textarea value={suspendForm.warning} onChange={(event) => setSuspendForm({ ...suspendForm, warning: event.target.value })} /></label>
            <button className="primary-btn danger-btn wide" disabled={!canDecide} type="button" onClick={() => suspend(task, suspendForm)}>Suspend ngay</button>
            <SelectField label="Replacement Published" value={supersedeForm.replacementKnowledgeId} onChange={(value) => setSupersedeForm({ ...supersedeForm, replacementKnowledgeId: value })} options={knowledgeCatalog.filter((item) => item.id !== knowledgeItem.id && item.status === "PUBLISHED").map((item) => ({ value: item.id, label: `${item.id} - ${item.title}` }))} />
            <button className="secondary-btn wide" disabled={!canDecide || !supersedeForm.replacementKnowledgeId} type="button" onClick={() => supersede(task, supersedeForm)}>Supersede</button>
            <label><span>Lý do archive</span><textarea value={archiveForm.reason} onChange={(event) => setArchiveForm({ reason: event.target.value })} /></label>
            <button className="ghost-btn wide" disabled={!canDecide} type="button" onClick={() => archiveContent(task, archiveForm)}>Archive</button>
          </article>
        </aside>
      </div>
    </section>
  );
}

function ContributorRevisionQueue({ tasks, reviewTasks, knowledgeCatalog, currentUser, users, navigate, startRevisionWork, openSopRevision }) {
  const mine = tasks.filter((item) => item.assignedContributorId === currentUser.id || currentUser.role === "ADMINISTRATOR");
  return (
    <section className="page">
      <PageHeading eyebrow="FL-05" title="Revision task của tôi" description="Contributor xử lý revision từ lifecycle review. SOP sẽ mở sang FL-03, Article/Case xử lý trong workspace FL-05." />
      <div className="submission-list">
        {mine.map((task) => {
          const item = knowledgeCatalog.find((entry) => entry.id === task.knowledgeId);
          const review = reviewTasks.find((entry) => entry.reviewTaskId === task.sourceReviewTaskId);
          return (
            <article className="submission-card" key={task.revisionTaskId}>
              <div>
                <div className="card-badges"><Badge>{task.targetFlow}</Badge><Badge>{task.status}</Badge><Badge tone={task.changeType === "MAJOR" ? "warning" : "neutral"}>{task.changeType}</Badge></div>
                <h3>{item?.title || task.knowledgeId}</h3>
                <p>{task.requiredChanges.join("; ")}</p>
                <small>{task.revisionTaskId} - Review {review?.reviewTaskId} - Assignee {personName(users, task.assignedContributorId)}</small>
              </div>
              <div className="submission-actions">
                <button className="secondary-btn" type="button" onClick={() => startRevisionWork(task)}>Bắt đầu</button>
                {task.targetFlow === "FL-03" ? <button className="primary-btn" type="button" onClick={() => openSopRevision(task)}>Mở FL-03</button> : <button className="primary-btn" type="button" onClick={() => navigate("lifecycle-revision-workspace", { taskId: task.revisionTaskId })}>Mở workspace</button>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RevisionWorkspace({ task, knowledgeItem, users, navigate, startRevisionWork, openSopRevision, submitArticleRevision }) {
  const [form, setForm] = useState({
    title: task.draft?.title || knowledgeItem.title,
    summary: task.draft?.summary || knowledgeItem.summary,
    changeSummary: task.draft?.changeSummary || task.requiredChanges.join("\n")
  });
  return (
    <section className="page detail-page">
      <BackButton label="Quay lại revision tasks" onClick={() => navigate("my-revision-tasks")} />
      <PageHeading eyebrow={`Revision - ${task.revisionTaskId}`} title={knowledgeItem.title} description={`Target: ${task.targetVersion} - ${task.targetFlow}`}>
        <Badge>{task.status}</Badge>
      </PageHeading>
      <div className="detail-layout">
        <article className="panel article">
          <Section title="Yêu cầu thay đổi">
            <Checklist items={task.requiredChanges} />
          </Section>
          {task.targetFlow === "FL-03" ? (
            <Section title="Route SOP sang FL-03">
              <div className="trace-note"><strong>SOP không sửa trực tiếp trong FL-05.</strong> Bấm mở FL-03 để tạo SOP task và soạn version mới.</div>
              <button className="primary-btn" type="button" onClick={() => openSopRevision(task)}><BookOpen size={16} />Mở FL-03 SOP Update</button>
            </Section>
          ) : (
            <Section title="Revision editor">
              <label><span>Tiêu đề</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              <label><span>Tóm tắt</span><textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} /></label>
              <label><span>Change summary</span><textarea value={form.changeSummary} onChange={(event) => setForm({ ...form, changeSummary: event.target.value })} /></label>
              <div className="form-actions">
                <button className="secondary-btn" type="button" onClick={() => startRevisionWork(task)}>Lưu tiến độ</button>
                <button className="primary-btn" type="button" onClick={() => submitArticleRevision(task, form)}>Gửi tái duyệt</button>
              </div>
            </Section>
          )}
        </article>
        <aside className="detail-aside">
          <article className="panel">
            <h3>Traceability</h3>
            <InfoGrid rows={[
              ["Review task", task.sourceReviewTaskId],
              ["Contributor", personName(users, task.assignedContributorId)],
              ["Visibility bản cũ", task.visibilityAction],
              ["SOP task", task.sopTaskId]
            ]} />
          </article>
        </aside>
      </div>
    </section>
  );
}

function LifecycleRereview({ task, knowledgeItem, users, currentUser, navigate, approveRevision, requestRevisionChanges }) {
  const [note, setNote] = useState("Cần làm rõ thêm source reference và tác động hiện trường.");
  const isAuthor = currentUser.id === task.assignedContributorId;
  return (
    <section className="page detail-page">
      <BackButton label="Quay lại hàng đợi" onClick={() => navigate("lifecycle-review-queue")} />
      <PageHeading eyebrow={`Re-review - ${task.revisionTaskId}`} title={knowledgeItem.title} description={`Contributor: ${personName(users, task.assignedContributorId)} - ${task.targetVersion}`}>
        <Badge>{task.status}</Badge>
      </PageHeading>
      <div className="detail-layout">
        <article className="panel article">
          <Section title="Bản sửa đề xuất">
            <InfoGrid rows={[
              ["Title", task.draft?.title],
              ["Summary", task.draft?.summary],
              ["Change type", task.changeType],
              ["Target version", task.targetVersion]
            ]} />
            <div className="lesson-box">{task.draft?.changeSummary || task.requiredChanges.join("; ")}</div>
          </Section>
          <Section title="Version compare">
            <div className="compare-grid">
              <div className="nested-panel"><h4>Phiên bản hiện tại</h4><p>{knowledgeItem.summary}</p></div>
              <div className="nested-panel"><h4>Bản sửa</h4><p>{task.draft?.summary || "-"}</p></div>
            </div>
          </Section>
        </article>
        <aside className="detail-aside">
          <article className="panel action-panel">
            <h3>Quyết định tái duyệt</h3>
            {isAuthor && <div className="warning-banner"><AlertTriangle size={18} /><span>SoD: người biên soạn revision không được tự phê duyệt.</span></div>}
            <label><span>Ghi chú chỉnh sửa</span><textarea value={note} onChange={(event) => setNote(event.target.value)} /></label>
            <button className="secondary-btn wide" type="button" onClick={() => requestRevisionChanges(task, note)}>Yêu cầu chỉnh sửa</button>
            <button className="primary-btn wide" disabled={isAuthor} type="button" onClick={() => approveRevision(task)}><ShieldCheck size={16} />Approve & Publish</button>
          </article>
        </aside>
      </div>
    </section>
  );
}

function LifecycleVersionCompare({ knowledgeItem, revisionTask, navigate }) {
  return (
    <section className="page">
      <BackButton label="Quay lại" onClick={() => navigate("lifecycle-dashboard")} />
      <PageHeading eyebrow="Version Compare" title={knowledgeItem?.title || "So sánh phiên bản"} description="So sánh mock giữa bản hiện hành và bản revision." />
      <div className="compare-grid">
        <article className="panel"><h3>Bản hiện tại</h3><p>{knowledgeItem?.summary}</p></article>
        <article className="panel"><h3>Bản mới</h3><p>{revisionTask?.draft?.summary || "Chưa có draft revision."}</p></article>
      </div>
    </section>
  );
}

function LifecycleHistory({ id, knowledgeCatalog, lifecycleItems, reviewTasks, revisionTasks, issueReports, decisions, events, navigate, openItem }) {
  const item = knowledgeCatalog.find((entry) => entry.id === id);
  const lifecycle = lifecycleItems.find((entry) => entry.knowledgeId === id);
  const relatedReviews = reviewTasks.filter((entry) => entry.knowledgeId === id);
  const relatedRevisions = revisionTasks.filter((entry) => entry.knowledgeId === id);
  const relatedIssues = issueReports.filter((entry) => entry.knowledgeId === id);
  const relatedDecisions = decisions.filter((entry) => entry.knowledgeId === id);
  const relatedEvents = events.filter((entry) => JSON.stringify(entry).includes(id) || relatedReviews.some((task) => task.reviewTaskId === entry.entityId) || relatedRevisions.some((task) => task.revisionTaskId === entry.entityId));
  return (
    <section className="page">
      <BackButton label="Quay lại dashboard lifecycle" onClick={() => navigate("lifecycle-dashboard")} />
      <PageHeading eyebrow="Lifecycle History" title={item?.title || id} description="Audit timeline mock cho vòng đời tri thức.">
        {lifecycle && <StatusBadge status={lifecycle.status} />}
      </PageHeading>
      <div className="two-column">
        <article className="panel">
          <h3>Quan hệ vòng đời</h3>
          <InfoGrid rows={[
            ["Knowledge ID", id],
            ["Status", lifecycleStatusLabels[lifecycle?.status] || item?.status],
            ["Current version", lifecycle?.currentVersion || item?.version],
            ["Review tasks", relatedReviews.map((task) => task.reviewTaskId).join(", ")],
            ["Revision tasks", relatedRevisions.map((task) => task.revisionTaskId).join(", ")],
            ["Issue reports", relatedIssues.map((issue) => issue.issueReportId).join(", ")],
            ["Decisions", relatedDecisions.map((decision) => decision.decisionType).join(", ")]
          ]} />
          {item && <button className="primary-btn" type="button" onClick={() => openItem(item)}>Mở nội dung trong FL-01</button>}
        </article>
        <article className="panel">
          <h3>Audit Trail</h3>
          <Timeline events={relatedEvents} />
        </article>
      </div>
    </section>
  );
}

function LifecyclePolicySettings({ policies, setPolicies, currentRole, navigate, setToast }) {
  const [localPolicies, setLocalPolicies] = useState(policies);
  function update(index, field, value) {
    setLocalPolicies((items) => items.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  }
  function save() {
    setPolicies(localPolicies);
    setToast("Đã lưu policy mock cho FL-05.");
  }
  return (
    <section className="page">
      <BackButton label="Quay lại Lifecycle Dashboard" onClick={() => navigate("lifecycle-dashboard")} />
      <PageHeading eyebrow="Admin" title="Review Policy Settings" description="Cấu hình mock policy phục vụ demo, không phải scheduler thật." />
      {currentRole !== "ADMINISTRATOR" && <div className="warning-banner neutral"><AlertTriangle size={18} /><span>Chỉ Administrator được xem đây là màn hình cấu hình. Prototype vẫn cho chỉnh để demo.</span></div>}
      <div className="submission-list">
        {localPolicies.map((policy, index) => (
          <article className="submission-card" key={policy.policyId}>
            <div>
              <h3>{policy.policyId}</h3>
              <p>{policy.contentType} - Risk {policy.riskLevel}</p>
            </div>
            <div className="form-main">
              <label><span>Frequency days</span><input value={policy.reviewFrequencyDays} onChange={(event) => update(index, "reviewFrequencyDays", Number(event.target.value) || 0)} /></label>
              <label><span>Lead time days</span><input value={policy.leadTimeDays} onChange={(event) => update(index, "leadTimeDays", Number(event.target.value) || 0)} /></label>
            </div>
          </article>
        ))}
      </div>
      <div className="form-actions">
        <button className="primary-btn" type="button" onClick={save}><Save size={16} />Lưu policy mock</button>
      </div>
    </section>
  );
}

function LifecycleSuccess({ id, navigate }) {
  return (
    <section className="page">
      <div className="success-screen">
        <CheckCircle2 size={48} />
        <h2>Đã ghi nhận quyết định vòng đời</h2>
        <p>Event/Task: {id}. Mock data đã được lưu trong localStorage và sẽ giữ sau khi reload.</p>
        <div className="form-actions">
          <button className="secondary-btn" type="button" onClick={() => navigate("lifecycle-dashboard")}>Lifecycle Dashboard</button>
          <button className="primary-btn" type="button" onClick={() => navigate("lifecycle-review-queue")}>Hàng đợi rà soát</button>
        </div>
      </div>
    </section>
  );
}

function ReviewChecklist({ items }) {
  return (
    <div className="submission-list">
      {items.map((item) => (
        <div className="compact-row" key={item.itemId}>
          <span><strong>{item.label}</strong><small>{item.note || "Không có ghi chú."}</small></span>
          <Badge tone={item.result === "PASS" ? "good" : item.critical ? "danger" : "warning"}>{item.result}{item.critical ? " - critical" : ""}</Badge>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value, detail, tone }) {
  return <article className={`metric-card ${tone || ""}`}><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>;
}

function PageHeading({ eyebrow, title, description, children }) {
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

function Section({ title, children }) {
  return <section className="detail-section"><h3>{title}</h3>{children}</section>;
}

function InfoGrid({ rows }) {
  return <dl className="info-grid">{rows.filter(([, value]) => value !== undefined && value !== "").map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{String(value)}</dd></div>)}</dl>;
}

function Timeline({ events = [] }) {
  if (!events.length) return <p className="hint">Chưa có event lifecycle.</p>;
  return <ol className="timeline">{events.map((event) => <li key={event.eventId || event.id}><strong>{event.action}</strong><span>{displayDateTime(event.timestamp || event.createdAt)} - {event.actorId}</span><p>{event.metadata ? Object.entries(event.metadata).map(([key, value]) => `${key}: ${value}`).join("; ") : event.comment}</p></li>)}</ol>;
}

function Checklist({ items = [] }) {
  return <ul className="checklist">{items.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul>;
}

function Badge({ children, tone = "primary" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function StatusBadge({ status }) {
  return <Badge tone={lifecycleStatusTones[status] || "neutral"}>{lifecycleStatusLabels[status] || status}</Badge>;
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label>
      <span>{label}</span>
      <select value={value || ""} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function BackButton({ label, onClick }) {
  return <button className="back-btn" type="button" onClick={onClick}><ArrowLeft size={16} />{label}</button>;
}

function ErrorBox({ errors }) {
  return (
    <div className="error-summary">
      <strong>Kiểm tra lại form</strong>
      <ul>{Object.values(errors).map((error) => <li key={error}>{error}</li>)}</ul>
    </div>
  );
}

function MissingLifecycle({ navigate, title }) {
  return (
    <section className="page">
      <article className="empty-state">
        <FileClock size={34} />
        <h3>{title}</h3>
        <p>Object này không còn trong mock data hoặc localStorage đã được reset.</p>
        <button className="primary-btn" type="button" onClick={() => navigate("lifecycle-dashboard")}>Lifecycle Dashboard</button>
      </article>
    </section>
  );
}

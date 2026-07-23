import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileQuestion,
  FileText,
  GitBranch,
  Library,
  Link2,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck
} from "lucide-react";
import {
  articleDraftStatusLabels,
  createPublishedArticleFromDraft,
  deliverableLabels,
  deliverableOptions,
  emptyArticleDraft,
  knowledgeRequestOriginLabels,
  knowledgeRequestStatusLabels,
  knowledgeRequestStatusTones,
  priorityLabels,
  requestImpactOptions,
  requestOrigins,
  requestPriorityOptions
} from "../data/fl04Data.js";

const managerStatuses = ["SUBMITTED", "TRIAGING", "NEEDS_INFORMATION", "ASSIGNED", "IN_PROGRESS", "IN_REVIEW", "CHANGES_REQUESTED"];
const resolvedStatuses = ["RESOLVED", "REJECTED", "CANCELLED", "TRANSFERRED_FL03"];

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

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

function optionLabel(options, value) {
  return options.find((item) => item.value === value)?.label || value || "-";
}

function taxonomyLabel(taxonomy, group, value) {
  return taxonomy[group]?.find((item) => item.value === value)?.label || value || "-";
}

function personName(users, id) {
  return users.find((user) => user.id === id)?.name || id || "-";
}

function appendEvent(request, actorId, action, comment) {
  return {
    ...request,
    events: [
      ...(request.events || []),
      { id: makeId("KR-EVT"), action, actorId, comment, createdAt: nowIso() }
    ],
    updatedAt: nowIso()
  };
}

function updateRequestStatus(request, actorId, status, comment, extras = {}) {
  return appendEvent({ ...request, ...extras, status }, actorId, status, comment);
}

export function FL04Flow({
  screen,
  tab,
  id,
  currentUser,
  currentRole,
  users,
  taxonomy,
  navigate,
  requestDraft,
  setRequestDraft,
  knowledgeRequests,
  setKnowledgeRequests,
  articleDrafts,
  setArticleDrafts,
  knowledgeCatalog,
  setPublishedOutputs,
  setToast,
  createFieldSubmission,
  transferKnowledgeRequestToSop,
  openItem
}) {
  const request = id ? knowledgeRequests.find((item) => item.id === id) : null;
  const articleDraft = request ? articleDrafts.find((item) => item.requestId === request.id) : null;

  function patchRequest(requestId, updater) {
    setKnowledgeRequests((items) => items.map((item) => {
      if (item.id !== requestId) return item;
      const next = typeof updater === "function" ? updater(item) : { ...item, ...updater };
      return { ...next, updatedAt: nowIso() };
    }));
  }

  function patchArticleDraft(draftId, updater) {
    setArticleDrafts((items) => items.map((item) => {
      if (item.id !== draftId) return item;
      const next = typeof updater === "function" ? updater(item) : { ...item, ...updater };
      return { ...next, updatedAt: nowIso() };
    }));
  }

  function submitKnowledgeRequest(payload) {
    const submitted = updateRequestStatus(
      { ...payload, confirmation: true },
      currentUser.id,
      payload.status === "DRAFT" ? "SUBMITTED" : payload.status,
      "Gửi yêu cầu bổ sung tri thức."
    );
    setKnowledgeRequests((items) => [submitted, ...items.filter((item) => item.id !== submitted.id)]);
    setRequestDraft(null);
    setToast("Đã gửi yêu cầu bổ sung tri thức.");
    navigate("knowledge-request-success", { id: submitted.id });
  }

  function ensureArticleDraft(targetRequest) {
    const existing = articleDrafts.find((item) => item.requestId === targetRequest.id);
    if (existing) return existing;
    const draft = emptyArticleDraft(targetRequest, currentUser);
    setArticleDrafts((items) => [draft, ...items]);
    return draft;
  }

  function assignRequest(targetRequest, form) {
    const next = updateRequestStatus(
      targetRequest,
      currentUser.id,
      form.deliverableType === "SOP" ? "TRIAGING" : "ASSIGNED",
      form.deliverableType === "SOP" ? "Chọn hướng xử lý SOP, chờ tạo nhiệm vụ biên soạn." : `Giao cho ${personName(users, form.assigneeId)} biên soạn.`,
      {
        deliverableType: form.deliverableType,
        assigneeId: form.assigneeId,
        priority: form.priority,
        dueDate: form.dueDate,
        resolutionNote: form.note
      }
    );
    patchRequest(targetRequest.id, next);
    if (form.deliverableType === "KNOWLEDGE_ARTICLE") ensureArticleDraft(next);
    setToast("Đã cập nhật phân loại yêu cầu.");
    navigate(form.deliverableType === "KNOWLEDGE_ARTICLE" ? "knowledge-request-detail" : "knowledge-request-triage", { id: targetRequest.id });
  }

  function resolveDuplicate(targetRequest, duplicateKnowledgeId, note) {
    patchRequest(targetRequest.id, (item) => updateRequestStatus(item, currentUser.id, "RESOLVED", "Resolve bằng nội dung đã tồn tại.", {
      deliverableType: "DUPLICATE",
      duplicateKnowledgeId,
      resultKnowledgeId: duplicateKnowledgeId,
      relatedKnowledgeIds: [...new Set([...(item.relatedKnowledgeIds || []), duplicateKnowledgeId])],
      resolutionNote: note
    }));
    setToast("Đã đóng request bằng nội dung trùng lặp.");
    navigate("resolved-request", { id: targetRequest.id });
  }

  function rejectRequest(targetRequest, reason) {
    patchRequest(targetRequest.id, (item) => updateRequestStatus(item, currentUser.id, "REJECTED", "Từ chối yêu cầu.", {
      deliverableType: "REJECT",
      rejectionReason: reason
    }));
    setToast("Đã từ chối yêu cầu.");
    navigate("knowledge-request-detail", { id: targetRequest.id });
  }

  function requestMoreInfo(targetRequest, note) {
    patchRequest(targetRequest.id, (item) => updateRequestStatus(item, currentUser.id, "NEEDS_INFORMATION", note || "Cần bổ sung thông tin trước khi xử lý tiếp.", {
      resolutionNote: note || item.resolutionNote
    }));
    setToast("Đã chuyển request sang trạng thái cần bổ sung.");
    navigate("knowledge-request-detail", { id: targetRequest.id });
  }

  function supplementRequest(targetRequest, payload) {
    patchRequest(targetRequest.id, (item) => updateRequestStatus(item, currentUser.id, "SUBMITTED", "Requester đã bổ sung thông tin.", {
      attemptedActions: payload.attemptedActions,
      attachments: payload.attachments,
      description: payload.description,
      resolutionNote: ""
    }));
    setToast("Đã bổ sung và gửi lại yêu cầu.");
    navigate("knowledge-request-detail", { id: targetRequest.id });
  }

  function startContributorWork(targetRequest) {
    const draft = ensureArticleDraft(targetRequest);
    patchRequest(targetRequest.id, (item) => updateRequestStatus(item, currentUser.id, "IN_PROGRESS", "Người biên soạn bắt đầu biên soạn bài viết tri thức."));
    setToast("Đã mở workspace biên soạn.");
    navigate("knowledge-article-editor", { id: targetRequest.id });
    return draft;
  }

  function submitArticleDraft(targetDraft) {
    patchArticleDraft(targetDraft.id, (item) => ({ ...item, status: "SUBMITTED" }));
    patchRequest(targetDraft.requestId, (item) => updateRequestStatus(item, currentUser.id, "IN_REVIEW", "Người biên soạn gửi bài viết tri thức để quản lý tri thức duyệt."));
    setToast("Đã gửi bài viết tri thức để duyệt.");
    navigate("knowledge-request-review-detail", { id: targetDraft.requestId });
  }

  function requestArticleChanges(targetDraft, note) {
    patchArticleDraft(targetDraft.id, (item) => ({
      ...item,
      status: "CHANGES_REQUESTED",
      comments: [...(item.comments || []), { id: makeId("KRA-CMT"), actorId: currentUser.id, comment: note, createdAt: nowIso() }]
    }));
    patchRequest(targetDraft.requestId, (item) => updateRequestStatus(item, currentUser.id, "CHANGES_REQUESTED", note || "Yêu cầu chỉnh sửa bài viết."));
    setToast("Đã yêu cầu chỉnh sửa bài viết.");
    navigate("knowledge-request-review-detail", { id: targetDraft.requestId });
  }

  function approveArticle(targetRequest, targetDraft) {
    const published = createPublishedArticleFromDraft(targetRequest, targetDraft, currentUser);
    setPublishedOutputs((items) => [published, ...items.filter((item) => item.id !== published.id)]);
    patchArticleDraft(targetDraft.id, (item) => ({ ...item, status: "PUBLISHED" }));
    patchRequest(targetRequest.id, (item) => updateRequestStatus(item, currentUser.id, "RESOLVED", "Phê duyệt và xuất bản bài viết tri thức.", {
      status: "RESOLVED",
      resultKnowledgeId: published.id,
      resolutionNote: `Đã xuất bản bài viết tri thức ${published.id}.`
    }));
    setToast("Đã xuất bản bài viết tri thức và đưa vào kho tri thức.");
    navigate("resolved-request", { id: targetRequest.id });
  }

  function transferToSop(targetRequest) {
    const task = transferKnowledgeRequestToSop(targetRequest);
    patchRequest(targetRequest.id, (item) => updateRequestStatus(item, currentUser.id, "TRANSFERRED_FL03", "Chuyển thành nhiệm vụ SOP.", {
      deliverableType: "SOP",
      sopTaskId: task.id,
      resolutionNote: `Đã tạo nhiệm vụ SOP ${task.id}.`
    }));
  }

  if (screen === "knowledge-request-success") {
    return <KnowledgeRequestSuccess request={request} navigate={navigate} />;
  }
  if (screen === "my-knowledge-requests") {
    return <MyKnowledgeRequests requests={knowledgeRequests} currentUser={currentUser} navigate={navigate} />;
  }
  if (screen === "knowledge-request-detail" || screen === "resolved-request") {
    return request
      ? <KnowledgeRequestDetail request={request} currentUser={currentUser} users={users} knowledgeCatalog={knowledgeCatalog} articleDraft={articleDraft} navigate={navigate} openItem={openItem} supplementRequest={supplementRequest} />
      : <MissingRequest navigate={navigate} />;
  }
  if (screen === "knowledge-request-queue") {
    return <KnowledgeRequestQueue requests={knowledgeRequests} users={users} currentRole={currentRole} navigate={navigate} />;
  }
  if (screen === "knowledge-request-triage") {
    return request
      ? <KnowledgeRequestTriage request={request} users={users} taxonomy={taxonomy} knowledgeCatalog={knowledgeCatalog} navigate={navigate} assignRequest={assignRequest} resolveDuplicate={resolveDuplicate} rejectRequest={rejectRequest} requestMoreInfo={requestMoreInfo} transferToSop={transferToSop} createFieldSubmission={createFieldSubmission} />
      : <MissingRequest navigate={navigate} />;
  }
  if (screen === "contributor-request-queue") {
    return <ContributorRequestQueue requests={knowledgeRequests} articleDrafts={articleDrafts} currentUser={currentUser} users={users} navigate={navigate} startContributorWork={startContributorWork} />;
  }
  if (screen === "request-workspace") {
    return request
      ? <ContributorWorkspace request={request} articleDraft={articleDraft} users={users} navigate={navigate} startContributorWork={startContributorWork} />
      : <MissingRequest navigate={navigate} />;
  }
  if (screen === "knowledge-article-editor") {
    return request
      ? articleDraft
        ? <KnowledgeArticleEditor request={request} draft={articleDraft} taxonomy={taxonomy} updateDraft={patchArticleDraft} navigate={navigate} submitArticleDraft={submitArticleDraft} />
        : <MissingRequest navigate={navigate} title="Chưa có draft bài viết" />
      : <MissingRequest navigate={navigate} />;
  }
  if (screen === "knowledge-article-preview") {
    return request
      ? <KnowledgeArticlePreview request={request} draft={articleDraft} users={users} navigate={navigate} submitArticleDraft={submitArticleDraft} />
      : <MissingRequest navigate={navigate} />;
  }
  if (screen === "knowledge-request-review-detail") {
    return request
      ? <KnowledgeRequestReviewDetail request={request} draft={articleDraft} users={users} navigate={navigate} approveArticle={approveArticle} requestArticleChanges={requestArticleChanges} />
      : <MissingRequest navigate={navigate} />;
  }

  return (
    <KnowledgeRequestHub
      tab={tab}
      requestDraft={requestDraft}
      setRequestDraft={setRequestDraft}
      currentUser={currentUser}
      users={users}
      taxonomy={taxonomy}
      navigate={navigate}
      submitKnowledgeRequest={submitKnowledgeRequest}
      knowledgeRequests={knowledgeRequests}
      articleDrafts={articleDrafts}
      createFieldSubmission={createFieldSubmission}
      startContributorWork={startContributorWork}
    />
  );
}

function KnowledgeRequestHub({ tab, requestDraft, setRequestDraft, currentUser, users, taxonomy, navigate, submitKnowledgeRequest, knowledgeRequests, articleDrafts, createFieldSubmission, startContributorWork }) {
  const activeTab = ["knowledge-request", "field-capture", "my-requests", "triage-queue", "contributor-queue"].includes(tab) ? tab : "hub";
  const myCount = knowledgeRequests.filter((item) => item.requesterId === currentUser.id || currentUser.role === "ADMINISTRATOR").length;
  const triageCount = knowledgeRequests.filter((item) => managerStatuses.includes(item.status)).length;
  const contributorCount = knowledgeRequests.filter((item) => item.assigneeId === currentUser.id && ["ASSIGNED", "IN_PROGRESS", "CHANGES_REQUESTED"].includes(item.status)).length;

  return (
    <section className="page">
      <PageHeading title="Gửi yêu cầu" description="Một điểm vào chung cho yêu cầu bổ sung tri thức, gửi tri thức hiện trường và theo dõi xử lý." />
      <div className="subtab-row" role="tablist" aria-label="Nhánh gửi yêu cầu">
        <TabButton active={activeTab === "hub"} onClick={() => navigate("request")}>Tổng quan</TabButton>
        <TabButton active={activeTab === "knowledge-request"} onClick={() => navigate("request", { tab: "knowledge-request" })}>Tạo yêu cầu tri thức</TabButton>
        <TabButton active={activeTab === "my-requests"} onClick={() => navigate("request", { tab: "my-requests" })}>Yêu cầu của tôi ({myCount})</TabButton>
        <TabButton active={activeTab === "triage-queue"} onClick={() => navigate("request", { tab: "triage-queue" })}>Hàng đợi phân loại ({triageCount})</TabButton>
        <TabButton active={activeTab === "contributor-queue"} onClick={() => navigate("request", { tab: "contributor-queue" })}>Công việc biên soạn ({contributorCount})</TabButton>
        <TabButton active={activeTab === "field-capture"} onClick={() => navigate("request", { tab: "field-capture" })}>Gửi tri thức hiện trường</TabButton>
      </div>

      {activeTab === "knowledge-request" && (
        <KnowledgeRequestForm
          draft={requestDraft}
          setDraft={setRequestDraft}
          currentUser={currentUser}
          taxonomy={taxonomy}
          submitKnowledgeRequest={submitKnowledgeRequest}
          navigate={navigate}
        />
      )}
      {activeTab === "my-requests" && <MyKnowledgeRequests requests={knowledgeRequests} currentUser={currentUser} navigate={navigate} embedded />}
      {activeTab === "triage-queue" && <KnowledgeRequestQueue requests={knowledgeRequests} users={users} currentRole={currentUser.role} navigate={navigate} embedded />}
      {activeTab === "contributor-queue" && <ContributorRequestQueue requests={knowledgeRequests} articleDrafts={articleDrafts} currentUser={currentUser} users={users} navigate={navigate} startContributorWork={startContributorWork} embedded />}
      {activeTab === "field-capture" && <FieldCaptureBridge createFieldSubmission={createFieldSubmission} navigate={navigate} />}
      {activeTab === "hub" && (
        <div className="choice-grid">
          <article className="choice-card">
            <FileQuestion size={28} />
            <h3>Yêu cầu bổ sung tri thức</h3>
            <p>Tạo yêu cầu khi tìm kiếm không có kết quả, nội dung hiện có chưa đủ dùng, hoặc cần tri thức mới cho tình huống lặp lại.</p>
            <button className="primary-btn" type="button" onClick={() => navigate("request", { tab: "knowledge-request" })}><Plus size={17} />Tạo yêu cầu tri thức</button>
          </article>
          <article className="choice-card">
            <UserCheck size={28} />
            <h3>Manager phân loại</h3>
            <p>Kiểm tra trùng lặp, yêu cầu bổ sung thông tin, giao người biên soạn hoặc tạo nhiệm vụ SOP khi cần.</p>
            <button className="secondary-btn" type="button" onClick={() => navigate("knowledge-request-queue")}>Mở hàng đợi phân loại</button>
          </article>
          <article className="choice-card">
            <FileText size={28} />
            <h3>Người biên soạn</h3>
            <p>Nhận công việc từ quản lý tri thức, soạn bài viết tri thức và gửi duyệt trước khi xuất bản vào kho tri thức.</p>
            <button className="secondary-btn" type="button" onClick={() => navigate("contributor-request-queue")}>Mở công việc biên soạn</button>
          </article>
          <article className="choice-card">
            <ClipboardList size={28} />
            <h3>Gửi tri thức hiện trường</h3>
            <p>Đi tiếp phần gửi tri thức hiện trường khi yêu cầu cần ảnh, bằng chứng thực tế hoặc ca thực tế để quản lý tri thức kiểm chứng.</p>
            <button className="secondary-btn" type="button" onClick={() => navigate("request", { tab: "field-capture" })}>Mở gửi tri thức hiện trường</button>
          </article>
        </div>
      )}
    </section>
  );
}

function KnowledgeRequestForm({ draft, setDraft, currentUser, taxonomy, submitKnowledgeRequest, navigate }) {
  const [form, setForm] = useState(() => draft || {
    id: makeId("KR"),
    status: "DRAFT",
    origin: "DIRECT_REQUEST",
    title: "",
    description: "",
    expectedOutcome: "",
    requesterId: currentUser.id,
    requesterRole: currentUser.role,
    requesterName: currentUser.name,
    sourceContext: { origin: "DIRECT_REQUEST", searchedAt: nowIso() },
    assetId: "",
    assetType: "CITYTOUCH_NODE",
    faultType: "CONNECTIVITY_LOSS",
    area: "District 7",
    attemptedActions: "",
    impact: "MEDIUM",
    priority: "MEDIUM",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    deliverableType: "KNOWLEDGE_ARTICLE",
    assigneeId: "",
    relatedKnowledgeIds: [],
    attachments: [],
    confirmation: false,
    events: [{ id: makeId("KR-EVT"), action: "DRAFT_CREATED", actorId: currentUser.id, comment: "Tạo bản nháp yêu cầu bổ sung tri thức.", createdAt: nowIso() }],
    createdAt: nowIso(),
    updatedAt: nowIso()
  });
  const [showErrors, setShowErrors] = useState(false);
  const errors = validateRequestForm(form);

  function change(field, value) {
    const next = { ...form, [field]: value };
    setForm(next);
    setDraft(next);
  }

  function submit(event) {
    event.preventDefault();
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    submitKnowledgeRequest({ ...form, confirmation: true });
  }

  return (
    <form className="request-form fl04-form" onSubmit={submit}>
      <PageHeading title="Tạo yêu cầu tri thức" description="Form được điền sẵn nếu đi từ kết quả rỗng hoặc phản hồi nội dung." />
      <div className="status-tabs">
        <span>Nguồn <strong>{knowledgeRequestOriginLabels[form.origin] || form.origin}</strong></span>
        <span>Người gửi <strong>{currentUser.name}</strong></span>
        <span>Ưu tiên <strong>{priorityLabels[form.priority]}</strong></span>
      </div>
      {form.sourceContext?.query && (
        <div className="trace-note">
          <strong>Ngữ cảnh tìm kiếm:</strong> từ khóa "{form.sourceContext.query}", Asset ID {form.sourceContext.assetId || "-"}, số kết quả {form.sourceContext.resultCount ?? "-"}, thời điểm {displayDateTime(form.sourceContext.searchedAt)}.
        </div>
      )}
      {showErrors && Object.keys(errors).length > 0 && <ErrorBox errors={errors} />}
      <label><span>Tiêu đề yêu cầu *</span><input value={form.title} onChange={(event) => change("title", event.target.value)} placeholder="Cần bổ sung tri thức cho..." /></label>
      <label><span>Mô tả khoảng trống tri thức *</span><textarea value={form.description} onChange={(event) => change("description", event.target.value)} placeholder="Mô tả tình huống, vì sao nội dung hiện tại chưa đủ..." /></label>
      <label><span>Kết quả mong muốn *</span><textarea value={form.expectedOutcome} onChange={(event) => change("expectedOutcome", event.target.value)} placeholder="Bạn kỳ vọng có bài viết, hướng dẫn, bằng chứng hay SOP?" /></label>
      <div className="form-main">
        <SelectField label="Nguồn tạo request" value={form.origin} onChange={(value) => change("origin", value)} options={requestOrigins} />
        <SelectField label="Mức ảnh hưởng" value={form.impact} onChange={(value) => change("impact", value)} options={requestImpactOptions} />
        <label><span>Asset ID</span><input value={form.assetId} onChange={(event) => change("assetId", event.target.value.toUpperCase())} placeholder="CTN-1108" /></label>
        <label><span>Khu vực</span><input value={form.area} onChange={(event) => change("area", event.target.value)} placeholder="District 7" /></label>
        <SelectField label="Loại thiết bị" value={form.assetType} onChange={(value) => change("assetType", value)} options={taxonomy.assetTypes.filter((item) => item.value !== "ALL")} />
        <SelectField label="Loại lỗi" value={form.faultType} onChange={(value) => change("faultType", value)} options={taxonomy.faultTypes.filter((item) => item.value !== "ALL")} />
        <SelectField label="Ưu tiên" value={form.priority} onChange={(value) => change("priority", value)} options={requestPriorityOptions} />
        <label><span>Ngày cần phản hồi</span><input type="date" value={form.dueDate} onChange={(event) => change("dueDate", event.target.value)} /></label>
      </div>
      <label><span>Đã thử xử lý gì?</span><textarea value={form.attemptedActions} onChange={(event) => change("attemptedActions", event.target.value)} placeholder="Reset node, kiểm tra nguồn, đo telemetry..." /></label>
      <label><span>File/bằng chứng mẫu</span><input value={(form.attachments || []).join(", ")} onChange={(event) => change("attachments", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder="telemetry.png, photo.jpg" /></label>
      <label className="check-row"><input type="checkbox" checked={form.confirmation} onChange={(event) => change("confirmation", event.target.checked)} />Tôi xác nhận thông tin này dùng cho prototype và có thể được quản lý tri thức xử lý.</label>
      <div className="sticky-actions">
        <button className="ghost-btn" type="button" onClick={() => navigate("request")}>Hủy</button>
        <button className="secondary-btn" type="button" onClick={() => { setDraft(form); navigate("request", { tab: "my-requests" }); }}><Save size={16} />Lưu nháp</button>
        <button className="primary-btn" type="submit"><Send size={16} />Gửi yêu cầu</button>
      </div>
    </form>
  );
}

function validateRequestForm(form) {
  const errors = {};
  if (!form.title?.trim()) errors.title = "Nhập tiêu đề yêu cầu.";
  if (!form.description?.trim()) errors.description = "Nhập mô tả khoảng trống tri thức.";
  if (!form.expectedOutcome?.trim()) errors.expectedOutcome = "Nhập kết quả mong muốn.";
  if (!form.confirmation) errors.confirmation = "Cần xác nhận trước khi gửi.";
  return errors;
}

function MyKnowledgeRequests({ requests, currentUser, navigate, embedded = false }) {
  const mine = requests.filter((item) => item.requesterId === currentUser.id || currentUser.role === "ADMINISTRATOR");
  const groups = [
    ["Đang xử lý", mine.filter((item) => !resolvedStatuses.includes(item.status)).length],
    ["Cần bổ sung", mine.filter((item) => item.status === "NEEDS_INFORMATION").length],
    ["Hoàn tất", mine.filter((item) => item.status === "RESOLVED").length],
    ["Chuyển SOP", mine.filter((item) => item.status === "TRANSFERRED_FL03").length]
  ];

  return (
    <section className={embedded ? "embedded-section" : "page"}>
      {!embedded && <PageHeading title="Yêu cầu tri thức của tôi" description="Theo dõi trạng thái, bổ sung thông tin và mở kết quả đã publish." />}
      <div className="status-tabs">{groups.map(([label, count]) => <span key={label}>{label}<strong>{count}</strong></span>)}</div>
      <div className="submission-list">
        {mine.map((request) => <RequestCard key={request.id} request={request} navigate={navigate} actionLabel="Xem chi tiết" />)}
      </div>
    </section>
  );
}

function KnowledgeRequestQueue({ requests, users, currentRole, navigate, embedded = false }) {
  const queue = requests.filter((item) => managerStatuses.includes(item.status));
  return (
    <section className={embedded ? "embedded-section" : "page"}>
      {!embedded && <PageHeading title="Hàng đợi phân loại" description="Quản lý tri thức kiểm tra yêu cầu, gắn hướng xử lý và quyết định bài viết/SOP/trùng lặp." />}
      {currentRole !== "KNOWLEDGE_MANAGER" && currentRole !== "ADMINISTRATOR" && <div className="warning-banner"><AlertTriangle size={18} /><span>Prototype vẫn cho xem, nhưng thao tác phân loại thuộc vai trò quản lý tri thức.</span></div>}
      <div className="queue-filters">
        <span>Chờ phân loại <strong>{queue.filter((item) => ["SUBMITTED", "TRIAGING"].includes(item.status)).length}</strong></span>
        <span>Đã giao <strong>{queue.filter((item) => ["ASSIGNED", "IN_PROGRESS"].includes(item.status)).length}</strong></span>
        <span>Chờ duyệt <strong>{queue.filter((item) => item.status === "IN_REVIEW").length}</strong></span>
      </div>
      <div className="submission-list">
        {queue.map((request) => (
          <article className="submission-card" key={request.id}>
            <div>
              <div className="card-badges">
                <StatusBadge status={request.status} />
                <Badge>{deliverableLabels[request.deliverableType] || request.deliverableType}</Badge>
                <Badge tone={request.priority === "HIGH" || request.priority === "CRITICAL" ? "warning" : "neutral"}>{priorityLabels[request.priority]}</Badge>
              </div>
              <h3>{request.title}</h3>
              <p>{request.description}</p>
              <small>Người gửi: {personName(users, request.requesterId)} - Hạn: {request.dueDate}</small>
            </div>
            <div className="submission-actions">
              <button className="primary-btn" type="button" onClick={() => navigate("knowledge-request-triage", { id: request.id })}>Phân loại</button>
              {request.status === "IN_REVIEW" && <button className="secondary-btn" type="button" onClick={() => navigate("knowledge-request-review-detail", { id: request.id })}>Duyệt bài</button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContributorRequestQueue({ requests, articleDrafts, currentUser, users, navigate, startContributorWork, embedded = false }) {
  const queue = requests.filter((item) => item.assigneeId === currentUser.id || currentUser.role === "ADMINISTRATOR");
  const active = queue.filter((item) => ["ASSIGNED", "IN_PROGRESS", "CHANGES_REQUESTED"].includes(item.status));
  return (
    <section className={embedded ? "embedded-section" : "page"}>
      {!embedded && <PageHeading title="Công việc biên soạn" description="Người biên soạn nhận yêu cầu đã được phân loại để soạn bài viết tri thức." />}
      <div className="submission-list">
        {active.map((request) => {
          const draft = articleDrafts.find((item) => item.requestId === request.id);
          return (
            <article className="submission-card" key={request.id}>
              <div>
                <div className="card-badges">
                  <StatusBadge status={request.status} />
                  <Badge tone="neutral">Assignee: {personName(users, request.assigneeId)}</Badge>
                  <Badge>{draft ? articleDraftStatusLabels[draft.status] : "Chưa có draft"}</Badge>
                </div>
                <h3>{request.title}</h3>
                <p>{request.expectedOutcome}</p>
                <small>Nguồn: {knowledgeRequestOriginLabels[request.origin]} - Hạn: {request.dueDate}</small>
              </div>
              <div className="submission-actions">
                <button className="primary-btn" type="button" onClick={() => draft ? navigate("knowledge-article-editor", { id: request.id }) : startContributorWork(request)}>
                  {draft ? "Mở editor" : "Bắt đầu biên soạn"}
                </button>
                <button className="secondary-btn" type="button" onClick={() => navigate("request-workspace", { id: request.id })}>Workspace</button>
              </div>
            </article>
          );
        })}
        {active.length === 0 && <EmptyPanel title="Chưa có công việc biên soạn" description="Chuyển sang vai trò người biên soạn hoặc nhờ quản lý tri thức giao yêu cầu." />}
      </div>
    </section>
  );
}

function KnowledgeRequestDetail({ request, currentUser, users, knowledgeCatalog, articleDraft, navigate, openItem, supplementRequest }) {
  const [supplement, setSupplement] = useState({
    description: request.description,
    attemptedActions: request.attemptedActions,
    attachments: request.attachments || []
  });
  const canSupplement = request.status === "NEEDS_INFORMATION" && (request.requesterId === currentUser.id || currentUser.role === "ADMINISTRATOR");
  const result = request.resultKnowledgeId ? knowledgeCatalog.find((item) => item.id === request.resultKnowledgeId) : null;

  return (
    <section className="page detail-page">
      <BackButton onClick={() => navigate("request", { tab: "my-requests" })} label="Quay lại yêu cầu của tôi" />
      <PageHeading eyebrow={request.id} title={request.title} description={`${knowledgeRequestOriginLabels[request.origin]} - ${personName(users, request.requesterId)}`}>
        <StatusBadge status={request.status} />
      </PageHeading>
      <div className="detail-layout">
        <article className="panel article">
          <Section title="Nội dung yêu cầu">
            <InfoGrid rows={[
              ["Trạng thái", knowledgeRequestStatusLabels[request.status]],
              ["Kết quả cần có", deliverableLabels[request.deliverableType]],
              ["Ưu tiên", priorityLabels[request.priority]],
              ["Hạn xử lý", request.dueDate]
            ]} />
            <p>{request.description}</p>
            <div className="lesson-box">{request.expectedOutcome}</div>
          </Section>
          <Section title="Bối cảnh tìm kiếm">
            <InfoGrid rows={[
              ["Query", request.sourceContext?.query],
              ["Asset ID", request.assetId],
              ["Loại thiết bị", request.assetType],
              ["Loại lỗi", request.faultType],
              ["Khu vực", request.area],
              ["Result count", request.sourceContext?.resultCount === 0 ? "0" : request.sourceContext?.resultCount]
            ]} />
          </Section>
          <Section title="Timeline xử lý">
            <Timeline events={request.events} />
          </Section>
          {canSupplement && (
            <Section title="Bổ sung thông tin">
              <label><span>Mô tả cập nhật</span><textarea value={supplement.description} onChange={(event) => setSupplement({ ...supplement, description: event.target.value })} /></label>
              <label><span>Thao tác đã thử</span><textarea value={supplement.attemptedActions} onChange={(event) => setSupplement({ ...supplement, attemptedActions: event.target.value })} /></label>
              <label><span>Bằng chứng bổ sung</span><input value={supplement.attachments.join(", ")} onChange={(event) => setSupplement({ ...supplement, attachments: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
              <button className="primary-btn" type="button" onClick={() => supplementRequest(request, supplement)}>Gửi bổ sung</button>
            </Section>
          )}
        </article>
        <aside className="detail-aside">
          <article className="panel action-panel">
            <h3>Thao tác</h3>
            {["SUBMITTED", "TRIAGING", "NEEDS_INFORMATION"].includes(request.status) && <button className="primary-btn wide" type="button" onClick={() => navigate("knowledge-request-triage", { id: request.id })}>Mở phân loại</button>}
            {["ASSIGNED", "IN_PROGRESS", "CHANGES_REQUESTED"].includes(request.status) && <button className="primary-btn wide" type="button" onClick={() => navigate("knowledge-article-editor", { id: request.id })}>Mở bài viết tri thức</button>}
            {request.status === "IN_REVIEW" && <button className="primary-btn wide" type="button" onClick={() => navigate("knowledge-request-review-detail", { id: request.id })}>Mở màn hình duyệt</button>}
            {result && <button className="secondary-btn wide" type="button" onClick={() => openItem(result)}><Library size={16} />Mở kết quả trong kho tri thức</button>}
            {request.sopTaskId && <button className="secondary-btn wide" type="button" onClick={() => navigate("sop-task-detail", { id: request.sopTaskId })}><BookOpen size={16} />Mở nhiệm vụ SOP</button>}
          </article>
          <article className="panel">
            <h3>Traceability</h3>
            <InfoGrid rows={[
              ["Requester", personName(users, request.requesterId)],
              ["Assignee", personName(users, request.assigneeId)],
              ["Bài viết draft", articleDraft?.id],
              ["Kết quả", request.resultKnowledgeId || request.sopTaskId || request.duplicateKnowledgeId]
            ]} />
          </article>
        </aside>
      </div>
    </section>
  );
}

function KnowledgeRequestTriage({ request, users, taxonomy, knowledgeCatalog, navigate, assignRequest, resolveDuplicate, rejectRequest, requestMoreInfo, transferToSop, createFieldSubmission }) {
  const contributors = users.filter((user) => user.role === "CONTRIBUTOR");
  const [form, setForm] = useState({
    deliverableType: request.deliverableType || "KNOWLEDGE_ARTICLE",
    assigneeId: request.assigneeId || contributors[0]?.id || "",
    priority: request.priority || "MEDIUM",
    dueDate: request.dueDate || "",
    note: request.resolutionNote || ""
  });
  const [duplicateId, setDuplicateId] = useState(request.duplicateKnowledgeId || knowledgeCatalog[0]?.id || "");
  const [decisionNote, setDecisionNote] = useState(request.resolutionNote || "");
  const [rejectReason, setRejectReason] = useState(request.rejectionReason || "");

  return (
    <section className="page detail-page">
      <BackButton onClick={() => navigate("knowledge-request-queue")} label="Quay lại hàng đợi phân loại" />
      <PageHeading eyebrow={`Phân loại - ${request.id}`} title={request.title} description="Quản lý tri thức quyết định hướng xử lý yêu cầu.">
        <StatusBadge status={request.status} />
      </PageHeading>
      <div className="detail-layout">
        <article className="panel article">
          <Section title="Snapshot yêu cầu">
            <InfoGrid rows={[
              ["Nguồn", knowledgeRequestOriginLabels[request.origin]],
              ["Từ khóa tìm kiếm", request.sourceContext?.query],
              ["Asset", request.assetId],
              ["Thiết bị", taxonomyLabel(taxonomy, "assetTypes", request.assetType)],
              ["Loại lỗi", taxonomyLabel(taxonomy, "faultTypes", request.faultType)],
              ["Impact", optionLabel(requestImpactOptions, request.impact)]
            ]} />
            <p>{request.description}</p>
            <div className="trace-note"><strong>Kết quả mong muốn:</strong> {request.expectedOutcome}</div>
          </Section>
          <Section title="Chọn hướng xử lý">
            <div className="form-main">
              <SelectField label="Kết quả cần tạo" value={form.deliverableType} onChange={(value) => setForm({ ...form, deliverableType: value })} options={deliverableOptions} />
              <SelectField label="Người xử lý" value={form.assigneeId} onChange={(value) => setForm({ ...form, assigneeId: value })} options={contributors.map((user) => ({ value: user.id, label: user.name }))} />
              <SelectField label="Ưu tiên" value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} options={requestPriorityOptions} />
              <label><span>Hạn xử lý</span><input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label>
            </div>
            <label><span>Ghi chú phân loại</span><textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label>
            <div className="form-actions">
              <button className="secondary-btn" type="button" onClick={() => requestMoreInfo(request, form.note || "Cần bổ sung ảnh, bối cảnh hoặc thao tác đã thử.")}>Yêu cầu bổ sung</button>
              <button className="primary-btn" type="button" onClick={() => form.deliverableType === "SOP" ? transferToSop(request) : assignRequest(request, form)}>
                {form.deliverableType === "SOP" ? "Chuyển thành nhiệm vụ SOP" : "Giao biên soạn bài viết"}
              </button>
            </div>
          </Section>
          <Section title="Duplicate resolution">
            <div className="form-main">
              <SelectField label="Nội dung đã tồn tại" value={duplicateId} onChange={setDuplicateId} options={knowledgeCatalog.map((item) => ({ value: item.id, label: `${item.id} - ${item.title}` }))} />
              <label><span>Lý do phù hợp</span><input value={decisionNote} onChange={(event) => setDecisionNote(event.target.value)} placeholder="Giải thích vì sao nội dung này trả lời request" /></label>
            </div>
            <button className="secondary-btn" type="button" onClick={() => resolveDuplicate(request, duplicateId, decisionNote || "Nội dung hiện có đã bao phủ yêu cầu.")}><Link2 size={16} />Resolve bằng nội dung hiện có</button>
          </Section>
        </article>
        <aside className="detail-aside">
          <article className="panel action-panel decision-panel">
            <h3>Nhánh đặc biệt</h3>
            <button className="secondary-btn wide" type="button" onClick={() => createFieldSubmission({ assetId: request.assetId, assetType: request.assetType, faultType: request.faultType, symptom: request.description })}>Tạo bản gửi hiện trường lấy bằng chứng</button>
            <label><span>Lý do từ chối</span><textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} /></label>
            <button className="primary-btn danger-btn wide" type="button" onClick={() => rejectRequest(request, rejectReason || "Ngoài phạm vi xử lý của KMS prototype.")}>Từ chối request</button>
          </article>
          <article className="panel">
            <h3>Timeline</h3>
            <Timeline events={request.events} />
          </article>
        </aside>
      </div>
    </section>
  );
}

function ContributorWorkspace({ request, articleDraft, users, navigate, startContributorWork }) {
  return (
    <section className="page">
      <BackButton onClick={() => navigate("contributor-request-queue")} label="Quay lại công việc biên soạn" />
      <PageHeading eyebrow={`Workspace - ${request.id}`} title={request.title} description={`Assignee: ${personName(users, request.assigneeId)}`}>
        <StatusBadge status={request.status} />
      </PageHeading>
      <div className="two-column">
        <article className="panel article">
          <Section title="Request brief">
            <p>{request.description}</p>
            <div className="lesson-box">{request.expectedOutcome}</div>
            <InfoGrid rows={[
              ["Asset ID", request.assetId],
              ["Loại thiết bị", request.assetType],
              ["Loại lỗi", request.faultType],
              ["Bằng chứng", (request.attachments || []).join(", ")]
            ]} />
          </Section>
          <Section title="Nguồn tham chiếu">
            <Timeline events={request.events} />
          </Section>
        </article>
        <article className="panel action-panel">
          <h3>Bài viết tri thức</h3>
          <InfoGrid rows={[
            ["Draft", articleDraft?.id],
            ["Trạng thái", articleDraft ? articleDraftStatusLabels[articleDraft.status] : "Chưa có"],
            ["Reviewer", articleDraft?.reviewerId || "KM-001"]
          ]} />
          <button className="primary-btn wide" type="button" onClick={() => articleDraft ? navigate("knowledge-article-editor", { id: request.id }) : startContributorWork(request)}>
            {articleDraft ? "Mở editor" : "Tạo draft bài viết"}
          </button>
        </article>
      </div>
    </section>
  );
}

function KnowledgeArticleEditor({ request, draft, taxonomy, updateDraft, navigate, submitArticleDraft }) {
  const [localDraft, setLocalDraft] = useState(draft);

  function change(field, value) {
    const next = { ...localDraft, [field]: value };
    setLocalDraft(next);
    updateDraft(draft.id, next);
  }

  function changeChecklist(field, value) {
    change("reviewChecklist", { ...localDraft.reviewChecklist, [field]: value });
  }

  return (
    <section className="page detail-page">
      <BackButton onClick={() => navigate("request-workspace", { id: request.id })} label="Quay lại workspace" />
      <PageHeading eyebrow={`Bài viết tri thức - ${draft.id}`} title={localDraft.title} description={`${request.id} - ${articleDraftStatusLabels[localDraft.status]}`}>
        <Badge>{articleDraftStatusLabels[localDraft.status]}</Badge>
      </PageHeading>
      <form className="submission-form">
        <label><span>Tiêu đề bài viết</span><input value={localDraft.title} onChange={(event) => change("title", event.target.value)} /></label>
        <label><span>Tóm tắt</span><textarea value={localDraft.summary} onChange={(event) => change("summary", event.target.value)} /></label>
        <label><span>Vấn đề cần giải quyết</span><textarea value={localDraft.problemStatement} onChange={(event) => change("problemStatement", event.target.value)} /></label>
        <label><span>Nguyên nhân/giả thuyết</span><textarea value={localDraft.cause} onChange={(event) => change("cause", event.target.value)} /></label>
        <label><span>Các bước xử lý</span><textarea value={(localDraft.solutionSteps || []).join("\n")} onChange={(event) => change("solutionSteps", event.target.value.split("\n").filter(Boolean))} /></label>
        <label><span>Giới hạn áp dụng</span><textarea value={localDraft.limitations} onChange={(event) => change("limitations", event.target.value)} /></label>
        <div className="form-main">
          <SelectField label="Danh mục" value={localDraft.categoryId} onChange={(value) => change("categoryId", value)} options={taxonomy.categories.filter((item) => item.value !== "ALL")} />
          <SelectField label="Loại lỗi" value={localDraft.faultType} onChange={(value) => change("faultType", value)} options={taxonomy.faultTypes.filter((item) => item.value !== "ALL")} />
          <label><span>Asset types</span><input value={(localDraft.assetTypes || []).join(", ")} onChange={(event) => change("assetTypes", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></label>
          <label><span>Tags</span><input value={(localDraft.tags || []).join(", ")} onChange={(event) => change("tags", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></label>
          <label><span>Ngày hiệu lực</span><input type="date" value={localDraft.effectiveDate} onChange={(event) => change("effectiveDate", event.target.value)} /></label>
          <label><span>Ngày review</span><input type="date" value={localDraft.reviewDate} onChange={(event) => change("reviewDate", event.target.value)} /></label>
        </div>
        <div className="nested-panel">
          <h4>Checklist trước khi gửi duyệt</h4>
          <label className="check-row"><input type="checkbox" checked={localDraft.reviewChecklist.technicalAccuracy} onChange={(event) => changeChecklist("technicalAccuracy", event.target.checked)} />Nội dung chính xác về kỹ thuật</label>
          <label className="check-row"><input type="checkbox" checked={localDraft.reviewChecklist.sourceTraceability} onChange={(event) => changeChecklist("sourceTraceability", event.target.checked)} />Có traceability về request/bằng chứng</label>
          <label className="check-row"><input type="checkbox" checked={localDraft.reviewChecklist.reusableInField} onChange={(event) => changeChecklist("reusableInField", event.target.checked)} />Có thể dùng lại ngoài hiện trường</label>
          <label className="check-row"><input type="checkbox" checked={localDraft.reviewChecklist.noHiddenSop} onChange={(event) => changeChecklist("noHiddenSop", event.target.checked)} />Không biến bài viết thành SOP ẩn</label>
        </div>
        <div className="sticky-actions">
          <button className="secondary-btn" type="button" onClick={() => navigate("knowledge-article-preview", { id: request.id })}><Search size={16} />Xem preview</button>
          <button className="primary-btn" type="button" onClick={() => submitArticleDraft(localDraft)}><Send size={16} />Gửi duyệt</button>
        </div>
      </form>
    </section>
  );
}

function KnowledgeArticlePreview({ request, draft, users, navigate, submitArticleDraft }) {
  if (!draft) return <MissingRequest navigate={navigate} title="Chưa có draft bài viết" />;
  return (
    <section className="page detail-page">
      <BackButton onClick={() => navigate("knowledge-article-editor", { id: request.id })} label="Quay lại editor" />
      <PageHeading eyebrow={`Preview - ${draft.id}`} title={draft.title} description={`Tác giả: ${personName(users, draft.authorId)} - Request nguồn ${request.id}`}>
        <Badge>{articleDraftStatusLabels[draft.status]}</Badge>
      </PageHeading>
      <article className="panel article">
        <Section title="Tóm tắt"><p>{draft.summary}</p></Section>
        <Section title="Vấn đề"><p>{draft.problemStatement}</p></Section>
        <Section title="Nguyên nhân"><p>{draft.cause}</p></Section>
        <Section title="Các bước xử lý"><Checklist items={draft.solutionSteps} /></Section>
        <Section title="Giới hạn"><div className="warning-banner neutral"><AlertTriangle size={18} /><span>{draft.limitations}</span></div></Section>
      </article>
      <div className="sticky-actions">
        <button className="secondary-btn" type="button" onClick={() => navigate("knowledge-article-editor", { id: request.id })}>Tiếp tục chỉnh sửa</button>
        <button className="primary-btn" type="button" onClick={() => submitArticleDraft(draft)}>Gửi duyệt</button>
      </div>
    </section>
  );
}

function KnowledgeRequestReviewDetail({ request, draft, users, navigate, approveArticle, requestArticleChanges }) {
  const [changeNote, setChangeNote] = useState("Bổ sung thêm bằng chứng nguồn và điều kiện không áp dụng.");
  if (!draft) return <MissingRequest navigate={navigate} title="Chưa có bài viết để duyệt" />;
  const checklistPassed = Object.values(draft.reviewChecklist || {}).every(Boolean);

  return (
    <section className="page detail-page">
      <BackButton onClick={() => navigate("knowledge-request-queue")} label="Quay lại hàng đợi phân loại" />
      <PageHeading eyebrow={`Duyệt bài viết - ${request.id}`} title={draft.title} description={`Người biên soạn: ${personName(users, draft.authorId)}`}>
        <StatusBadge status={request.status} />
      </PageHeading>
      <div className="detail-layout">
        <article className="panel article">
          <Section title="Preview bài viết">
            <p>{draft.summary}</p>
            <InfoGrid rows={[
              ["Vấn đề", draft.problemStatement],
              ["Nguyên nhân", draft.cause],
              ["Nguồn", (draft.sourceRefs || []).join(", ")],
              ["No hidden SOP", draft.reviewChecklist?.noHiddenSop ? "Đạt" : "Chưa đạt"]
            ]} />
            <Checklist items={draft.solutionSteps} />
          </Section>
          <Section title="Checklist duyệt">
            <Checklist items={[
              draft.reviewChecklist?.technicalAccuracy ? "Đã kiểm tra độ chính xác kỹ thuật" : "Chưa xác nhận độ chính xác kỹ thuật",
              draft.reviewChecklist?.sourceTraceability ? "Có traceability nguồn" : "Thiếu traceability nguồn",
              draft.reviewChecklist?.reusableInField ? "Có thể dùng ngoài hiện trường" : "Chưa rõ khả năng tái sử dụng",
              draft.reviewChecklist?.noHiddenSop ? "Không phải SOP ẩn" : "Có nguy cơ là SOP ẩn"
            ]} />
          </Section>
        </article>
        <aside className="detail-aside">
          <article className="panel action-panel decision-panel">
            <h3>Quyết định</h3>
            {!checklistPassed && <p className="hint">Prototype vẫn cho duyệt, nhưng checklist đang còn mục chưa đạt để bạn demo nhánh request changes.</p>}
            <label><span>Ghi chú chỉnh sửa</span><textarea value={changeNote} onChange={(event) => setChangeNote(event.target.value)} /></label>
            <button className="secondary-btn wide" type="button" onClick={() => requestArticleChanges(draft, changeNote)}>Yêu cầu chỉnh sửa</button>
            <button className="primary-btn wide" type="button" onClick={() => approveArticle(request, draft)}><ShieldCheck size={16} />Approve & Publish</button>
          </article>
          <article className="panel">
            <h3>Request nguồn</h3>
            <p>{request.description}</p>
          </article>
        </aside>
      </div>
    </section>
  );
}

function KnowledgeRequestSuccess({ request, navigate }) {
  return (
    <section className="page">
      <div className="success-screen">
        <CheckCircle2 size={48} />
        <h2>Đã gửi yêu cầu bổ sung tri thức</h2>
        <p>{request ? `${request.id} đã được đưa vào hàng đợi phân loại của quản lý tri thức.` : "Yêu cầu đã được gửi trong dữ liệu mẫu."}</p>
        <div className="form-actions">
          <button className="secondary-btn" type="button" onClick={() => navigate("my-knowledge-requests")}>Xem yêu cầu của tôi</button>
          {request && <button className="primary-btn" type="button" onClick={() => navigate("knowledge-request-detail", { id: request.id })}>Mở chi tiết request</button>}
        </div>
      </div>
    </section>
  );
}

function FieldCaptureBridge({ createFieldSubmission, navigate }) {
  return (
    <div className="choice-grid">
      <article className="choice-card">
        <ClipboardList size={28} />
        <h3>Bắt đầu gửi tri thức hiện trường</h3>
        <p>Tạo bản gửi hiện trường khi yêu cầu cần thêm bằng chứng, ảnh, telemetry hoặc ca thực tế.</p>
        <button className="primary-btn" type="button" onClick={() => createFieldSubmission({})}>Tạo bản gửi hiện trường</button>
      </article>
      <article className="choice-card">
        <GitBranch size={28} />
        <h3>Quay lại yêu cầu tri thức</h3>
        <p>Sau khi có bằng chứng, quản lý tri thức tiếp tục phân loại và giao xử lý yêu cầu tri thức.</p>
        <button className="secondary-btn" type="button" onClick={() => navigate("knowledge-request-queue")}>Mở hàng đợi phân loại</button>
      </article>
    </div>
  );
}

function RequestCard({ request, navigate, actionLabel }) {
  return (
    <article className="submission-card">
      <div>
        <div className="card-badges">
          <StatusBadge status={request.status} />
          <Badge>{knowledgeRequestOriginLabels[request.origin] || request.origin}</Badge>
          <Badge tone={request.priority === "HIGH" || request.priority === "CRITICAL" ? "warning" : "neutral"}>{priorityLabels[request.priority]}</Badge>
        </div>
        <h3>{request.title}</h3>
        <p>{request.expectedOutcome}</p>
        <small>{request.id} - cập nhật {displayDateTime(request.updatedAt)}</small>
      </div>
      <div className="submission-actions">
        <button className="primary-btn" type="button" onClick={() => navigate("knowledge-request-detail", { id: request.id })}>{actionLabel}</button>
        {request.status === "TRANSFERRED_FL03" && request.sopTaskId && <button className="secondary-btn" type="button" onClick={() => navigate("sop-task-detail", { id: request.sopTaskId })}>Mở nhiệm vụ SOP</button>}
      </div>
    </article>
  );
}

function PageHeading({ eyebrow, title, description, children }) {
  const visibleEyebrow = eyebrow && !/^FL-\d/i.test(String(eyebrow)) ? eyebrow : "";
  return (
    <div className="page-header">
      <div>
        {visibleEyebrow && <p className="eyebrow">{visibleEyebrow}</p>}
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
  if (!events.length) return <p className="hint">Chưa có event xử lý.</p>;
  return <ol className="timeline">{events.map((event) => <li key={event.id}><strong>{event.action}</strong><span>{displayDateTime(event.createdAt)} - {event.actorId}</span><p>{event.comment}</p></li>)}</ol>;
}

function Checklist({ items = [] }) {
  return <ul className="checklist">{items.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul>;
}

function Badge({ children, tone = "primary" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function StatusBadge({ status }) {
  return <Badge tone={knowledgeRequestStatusTones[status] || "neutral"}>{knowledgeRequestStatusLabels[status] || status}</Badge>;
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

function TabButton({ active, onClick, children }) {
  return <button className={active ? "subtab active" : "subtab"} onClick={onClick} type="button">{children}</button>;
}

function BackButton({ onClick, label }) {
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

function EmptyPanel({ title, description }) {
  return (
    <article className="empty-state">
      <Sparkles size={34} />
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function MissingRequest({ navigate, title = "Không tìm thấy request" }) {
  return (
    <section className="page">
      <EmptyPanel title={title} description="Request này không còn trong mock data hoặc localStorage đã được reset." />
      <button className="secondary-btn" type="button" onClick={() => navigate("request")}>Quay lại Gửi yêu cầu</button>
    </section>
  );
}

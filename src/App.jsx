import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Archive,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Eye,
  FileClock,
  FileQuestion,
  FileText,
  Gauge,
  HelpCircle,
  History,
  Home,
  Library,
  Lightbulb,
  Lock,
  MessageSquareWarning,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  ThumbsDown,
  ThumbsUp,
  UserCog,
  UserRound
} from "lucide-react";
import { dashboardStats, knowledgeItems, taxonomy as baseTaxonomy, users } from "./data/fallbackData.js";
import { currentWorkOrder, seedFieldSubmissions, seedSopRequests, sopCatalog } from "./data/fl02Data.js";
import { seedSopDrafts, seedSopTasks, seedSopVersions } from "./data/fl03Data.js";
import { buildSopTaskFromKnowledgeRequest, emptyKnowledgeRequest, seedArticleDrafts, seedKnowledgeRequests } from "./data/fl04Data.js";
import {
  buildSopTaskFromLifecycleRevision,
  lifecycleStatusLabels,
  lifecycleStatusTones,
  makeIssueReport,
  makeReviewTaskFromIssue,
  seedIssueReports,
  seedLifecycleDecisions,
  seedLifecycleEvents,
  seedLifecycleItems,
  seedLifecycleReviewTasks,
  seedReviewPolicies,
  seedRevisionTasks
} from "./data/fl05Data.js";
import {
  buildDraftFromTask,
  buildSopTaskFromRequest,
  createPublishedSopFromDraft,
  createVersionFromDraft,
  SopEditor,
  SopReviewDetail,
  SopSubmitSuccess,
  SopTaskDetail,
  SopVersionCompare,
  SopVersionHistory,
  SopWorkspace
} from "./flows/FL03Flow.jsx";
import { FL04Flow } from "./flows/FL04Flow.jsx";
import { FL05Flow, IssueReportForm } from "./flows/FL05Flow.jsx";
import {
  adminNowIso,
  adminRoleLabels,
  adminScreenIds,
  buildAdminSynonymPhrases,
  buildRuntimeTaxonomy,
  cloneAdminAuditEvents,
  cloneAdminConfig,
  makeAdminId
} from "./data/fl06Data.js";
import { FL06Flow } from "./flows/FL06Flow.jsx";

const taxonomy = baseTaxonomy;

const ROLE_STORAGE = "labs-kms-current-role";
const RECENT_STORAGE = "labs-kms-recent-searches";
const FEEDBACK_STORAGE = "labs-kms-feedback-events";
const APPLICATION_STORAGE = "labs-kms-application-events";
const REQUEST_STORAGE = "labs-kms-request-draft";
const FIELD_SUBMISSIONS_STORAGE = "labs-kms-field-submissions";
const PUBLISHED_OUTPUT_STORAGE = "labs-kms-published-output";
const SOP_REQUESTS_STORAGE = "labs-kms-sop-requests";
const SOP_TASKS_STORAGE = "labs-kms-sop-tasks";
const SOP_DRAFTS_STORAGE = "labs-kms-sop-drafts";
const SOP_VERSIONS_STORAGE = "labs-kms-sop-versions";
const KNOWLEDGE_REQUESTS_STORAGE = "labs-kms-knowledge-requests";
const ARTICLE_DRAFTS_STORAGE = "labs-kms-article-drafts";
const LIFECYCLE_ITEMS_STORAGE = "labs-kms-lifecycle-items";
const LIFECYCLE_REVIEW_TASKS_STORAGE = "labs-kms-lifecycle-review-tasks";
const LIFECYCLE_ISSUE_REPORTS_STORAGE = "labs-kms-lifecycle-issue-reports";
const LIFECYCLE_REVISION_TASKS_STORAGE = "labs-kms-lifecycle-revision-tasks";
const LIFECYCLE_DECISIONS_STORAGE = "labs-kms-lifecycle-decisions";
const LIFECYCLE_EVENTS_STORAGE = "labs-kms-lifecycle-events";
const LIFECYCLE_POLICIES_STORAGE = "labs-kms-lifecycle-policies";
const ADMIN_CONFIG_STORAGE = "labs-kms-admin-config";
const ADMIN_AUDIT_STORAGE = "labs-kms-admin-audit";
const ADMIN_SIMULATION_STORAGE = "labs-kms-admin-simulation";

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
  { id: "review", label: "Hàng đợi xét duyệt", icon: ClipboardCheck, screen: "review-queue" },
  { id: "sops", label: "Quy trình vận hành (SOP)", icon: BookOpen },
  { id: "lifecycle", label: "Vòng đời tri thức", icon: ShieldCheck, screen: "lifecycle-dashboard" },
  { id: "admin", label: "Quản trị hệ thống", icon: UserCog, screen: "admin-dashboard", allowedRoles: ["ADMINISTRATOR"] }
];

const statusLabels = {
  PUBLISHED: "Published",
  OUTDATED: "Outdated",
  REVIEW_DUE: "Đến hạn rà soát",
  FLAGGED: "Bị gắn cờ",
  UNDER_REVIEW: "Đang rà soát",
  UPDATE_REQUIRED: "Cần cập nhật",
  UNDER_REVISION: "Đang cập nhật",
  SUSPENDED: "Tạm ngừng",
  SUPERSEDED: "Đã được thay thế",
  ARCHIVED: "Đã lưu trữ"
};

const contentTypeLabels = {
  SOP: "SOP",
  REPAIR_CASE: "Repair Case",
  LESSON_LEARNED: "Lesson Learned",
  ARTICLE: "Article"
};

const roleLabels = Object.fromEntries(users.map((user) => [user.role, user.label]));

const workflowLabels = {
  DRAFT: "Bản nháp",
  SUBMITTED: "Chờ kiểm duyệt",
  IN_REVIEW: "Đang kiểm duyệt",
  CHANGES_REQUESTED: "Cần bổ sung",
  RESUBMITTED: "Đã gửi lại",
  REJECTED: "Từ chối",
  APPROVED: "Đã phê duyệt",
  PUBLISHED: "Đã xuất bản",
  WITHDRAWN: "Đã rút"
};

const workflowTones = {
  DRAFT: "neutral",
  SUBMITTED: "warning",
  IN_REVIEW: "warning",
  CHANGES_REQUESTED: "danger",
  RESUBMITTED: "warning",
  REJECTED: "danger",
  APPROVED: "good",
  PUBLISHED: "good",
  WITHDRAWN: "neutral"
};

const selectOptions = {
  districts: ["District 1", "District 3", "District 7", "North Corridor", "Citywide"],
  severity: [
    { value: "LOW", label: "Thấp" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HIGH", label: "Cao" },
    { value: "CRITICAL", label: "Nghiêm trọng" }
  ],
  impactScope: [
    { value: "SINGLE_ASSET", label: "Một tài sản" },
    { value: "MULTIPLE_ASSETS", label: "Nhiều tài sản" },
    { value: "AREA_OUTAGE", label: "Mất sáng theo khu vực" }
  ],
  outcome: [
    { value: "RESOLVED", label: "Đã xử lý" },
    { value: "PARTIAL", label: "Xử lý một phần" },
    { value: "TEMPORARY", label: "Tạm thời" },
    { value: "UNRESOLVED", label: "Chưa xử lý" }
  ],
  sopUsage: [
    { value: "USED", label: "Đã dùng SOP" },
    { value: "NOT_USED", label: "Không dùng SOP" },
    { value: "NOT_FOUND", label: "Không tìm thấy SOP" },
    { value: "NOT_APPLICABLE", label: "Không áp dụng" }
  ],
  sopFeedback: [
    { value: "HELPFUL", label: "Hữu ích" },
    { value: "INCOMPLETE", label: "Còn thiếu" },
    { value: "OUTDATED", label: "Lỗi thời" },
    { value: "CONFLICTING", label: "Mâu thuẫn thực tế" }
  ],
  reusableScope: [
    { value: "ONE_ASSET", label: "Chỉ tài sản này" },
    { value: "SAME_MODEL", label: "Cùng model/thiết bị" },
    { value: "SAME_AREA", label: "Cùng khu vực" },
    { value: "ORGANIZATION_WIDE", label: "Toàn tổ chức" }
  ],
  sopProposal: [
    { value: "NO_CHANGE", label: "Không đề xuất thay đổi SOP" },
    { value: "UPDATE_EXISTING", label: "Cập nhật SOP hiện có" },
    { value: "NEW_SOP", label: "Đề xuất SOP mới" },
    { value: "UNSURE", label: "Chưa chắc chắn" }
  ],
  changeType: [
    { value: "ADD_STEP", label: "Thêm bước" },
    { value: "MODIFY_STEP", label: "Sửa bước" },
    { value: "REMOVE_STEP", label: "Xóa bước" },
    { value: "SAFETY_CONTROL", label: "Bổ sung kiểm soát an toàn" },
    { value: "DECISION_RULE", label: "Bổ sung luật quyết định" },
    { value: "OTHER", label: "Khác" }
  ],
  publicationType: [
    { value: "REPAIR_CASE", label: "Ca sửa chữa đã kiểm chứng" },
    { value: "LESSON_LEARNED", label: "Bài học kinh nghiệm" }
  ]
};

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

function expandQuery(value, synonymPhrases = []) {
  let expanded = normalize(value)
    .replace(/\boffline\b/g, "mat ket noi connectivity loss")
    .replace(/\boutage\b/g, "mat ket noi su co")
    .replace(/\bsmartnode\b/g, "smart node")
    .replace(/\bcitytouch\b/g, "citytouch ctn")
    .replace(/\bnode\b/g, "node nut");
  synonymPhrases.forEach((phrase) => {
    if (phrase.from && expanded.includes(phrase.from) && !expanded.includes(phrase.to)) {
      expanded = `${expanded} ${phrase.to}`;
    }
  });
  return expanded.replace(/\s+/g, " ");
}

function statusTone(status) {
  if (lifecycleStatusTones[status]) return lifecycleStatusTones[status];
  if (status === "PUBLISHED") return "good";
  if (status === "OUTDATED") return "warning";
  if (status === "SUPERSEDED") return "neutral";
  return "danger";
}

function nowLocalInput() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function nowIso() {
  return new Date().toISOString();
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
  return options.find((option) => option.value === value)?.label || value || "-";
}

function taxonomyLabel(group, value, taxonomySource = baseTaxonomy) {
  return taxonomySource[group]?.find((option) => option.value === value)?.label || value || "-";
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function sopById(sopId) {
  return sopCatalog.find((sop) => sop.sopId === sopId);
}

function sopStepLabels(sopId, stepIds = []) {
  const sop = sopById(sopId);
  if (!sop) return stepIds.join(", ");
  return stepIds.map((id) => sop.steps.find((step) => step.id === id)?.label || id).join(", ");
}

function emptySubmission(currentUser, prefill = {}) {
  const applied = prefill.appliedItem;
  const appliedSop = applied?.contentType === "SOP" ? sopById(applied.id) : null;
  const id = makeId("SUB");
  const createdAt = nowIso();
  return {
    id,
    status: "DRAFT",
    submittedBy: currentUser.id,
    workOrderId: prefill.workOrderId || currentWorkOrder.id,
    context: {
      assetId: prefill.assetId || applied?.assetIds?.[0] || currentWorkOrder.assetId,
      assetType: prefill.assetType || applied?.assetTypes?.[0] || currentWorkOrder.assetType,
      incidentDateTime: prefill.incidentDateTime || nowLocalInput(),
      location: prefill.location || currentWorkOrder.location,
      district: "District 7",
      faultType: prefill.faultType || applied?.faultType || currentWorkOrder.faultType,
      severity: prefill.severity || "HIGH",
      impactScope: prefill.impactScope || "MULTIPLE_ASSETS",
      safetyFlag: false,
      safetyDescription: "",
      sensitiveInfoFlag: false
    },
    resolution: {
      symptomSummary: prefill.symptom || currentWorkOrder.symptom,
      errorCode: "",
      diagnosisSteps: ["Kiểm tra dữ liệu telemetry và xác định phạm vi ảnh hưởng"],
      rootCause: "",
      repairAction: "",
      parts: [],
      outcome: "RESOLVED",
      verificationMethod: "",
      nextAction: "",
      downtimeMinutes: 0,
      relatedKnowledgeIds: applied && applied.contentType !== "SOP" ? [applied.id] : [],
      sopUsage: {
        status: appliedSop ? "USED" : "NOT_FOUND",
        appliedSopId: appliedSop?.sopId || "",
        appliedSopVersion: appliedSop?.version || "",
        appliedSopStepIds: appliedSop?.steps?.slice(0, 2).map((step) => step.id) || [],
        feedback: appliedSop ? "HELPFUL" : "",
        deviationFlag: false,
        deviationReason: ""
      }
    },
    knowledge: {
      lessonLearned: "",
      recommendation: "",
      reusableScope: "SAME_MODEL",
      sopProposal: {
        action: appliedSop ? "UPDATE_EXISTING" : "NO_CHANGE",
        targetSopId: appliedSop?.sopId || "",
        affectedStepIds: appliedSop?.steps?.slice(-1).map((step) => step.id) || [],
        gapSummary: "",
        changeType: "MODIFY_STEP",
        proposedChange: "",
        targetSopRationale: ""
      },
      tags: []
    },
    attachments: [],
    reviewHistory: [],
    confirmation: false,
    createdAt,
    updatedAt: createdAt
  };
}

function mergeKnowledgeItems(baseItems, publishedOutputs) {
  const byId = new Map(baseItems.map((item) => [item.id, item]));
  publishedOutputs.forEach((item) => byId.set(item.id, item));
  return [...byId.values()];
}

function applyLifecycleOverlay(items, lifecycleItems) {
  const overlay = new Map(lifecycleItems.map((item) => [item.knowledgeId, item]));
  return items.map((item) => {
    const lifecycle = overlay.get(item.id);
    if (!lifecycle) return item;
    return {
      ...item,
      status: lifecycle.status || item.status,
      version: lifecycle.currentVersion || item.version,
      reviewDate: lifecycle.nextReviewDate || item.reviewDate,
      lifecycle
    };
  });
}

function makePublishedKnowledge(submission, publishForm, manager) {
  const idPrefix = publishForm.publicationType === "LESSON_LEARNED" ? "LL-FL02" : "CASE-FL02";
  const id = makeId(idPrefix);
  const applied = submission.resolution.sopUsage;
  const proposal = submission.knowledge.sopProposal;
  const hasSopRequest = publishForm.sopPotential !== "NONE";
  return {
    id,
    contentType: publishForm.publicationType,
    sourceSubmissionId: submission.id,
    title: publishForm.title,
    summary: publishForm.summary,
    status: "PUBLISHED",
    version: "v1.0",
    effectiveDate: new Date().toLocaleDateString("vi-VN"),
    reviewDate: publishForm.reviewDate,
    updatedDate: new Date().toLocaleDateString("vi-VN"),
    securityLevel: publishForm.securityLevel,
    allowedRoles: publishForm.allowedRoles,
    categoryId: publishForm.categoryId,
    assetTypes: [submission.context.assetType],
    assetIds: [submission.context.assetId],
    faultType: submission.context.faultType,
    knowledgeManagerName: manager.name,
    knowledgeManagerId: manager.id,
    helpfulRate: 0,
    feedbackCount: 0,
    reuseCount: 0,
    viewCount: 1,
    relevanceScore: 0.9,
    location: submission.context.location,
    incidentDate: submission.context.incidentDateTime,
    symptom: submission.resolution.symptomSummary,
    diagnosisMethod: submission.resolution.diagnosisSteps.join("; "),
    rootCause: submission.resolution.rootCause,
    repairAction: submission.resolution.repairAction,
    outcome: submission.resolution.outcome,
    lessonLearned: submission.knowledge.lessonLearned,
    telemetry: ["Mock telemetry từ submission hiện trường"],
    evidence: submission.attachments.map((attachment) => attachment.name),
    submittedBy: submission.submittedBy,
    publishedAt: nowIso(),
    appliedSopRefs: applied.status === "USED" ? [{ sopId: applied.appliedSopId, version: applied.appliedSopVersion, stepIds: applied.appliedSopStepIds }] : [],
    sopPotential: publishForm.sopPotential,
    targetSopId: publishForm.targetSopId || proposal.targetSopId,
    affectedSopStepIds: publishForm.affectedSopStepIds || proposal.affectedStepIds,
    sopGapSummary: publishForm.sopGapSummary || proposal.gapSummary,
    proposedSopChange: publishForm.proposedSopChange || proposal.proposedChange,
    sopChangeRequestId: hasSopRequest ? makeId("SOPREQ") : "",
    relatedItems: [...new Set([...(submission.resolution.relatedKnowledgeIds || []), applied.appliedSopId].filter(Boolean))]
  };
}

function validateSubmission(submission, step = "review", all = false) {
  const errors = {};
  const should = (...steps) => all || steps.includes(step);
  const context = submission.context;
  const resolution = submission.resolution;
  const sopUsage = resolution.sopUsage;
  const knowledge = submission.knowledge;
  const proposal = knowledge.sopProposal;

  if (should("context")) {
    if (!/^[A-Z]{2,8}-[A-Z0-9-]{3,24}$/.test(context.assetId || "")) errors.assetId = "Asset ID cần đúng dạng CTN-1108.";
    if (!context.assetType) errors.assetType = "Chọn loại thiết bị.";
    if (!context.incidentDateTime) errors.incidentDateTime = "Nhập thời điểm xảy ra.";
    if (context.incidentDateTime && new Date(context.incidentDateTime) > new Date()) errors.incidentDateTime = "Thời điểm không được lớn hơn hiện tại.";
    if ((context.location || "").trim().length < 5) errors.location = "Vị trí cần tối thiểu 5 ký tự.";
    if (!context.faultType) errors.faultType = "Chọn loại lỗi.";
    if (!context.severity) errors.severity = "Chọn mức độ.";
    if (!context.impactScope) errors.impactScope = "Chọn phạm vi ảnh hưởng.";
    if (context.safetyFlag && (context.safetyDescription || "").trim().length < 20) errors.safetyDescription = "Mô tả nguy cơ an toàn tối thiểu 20 ký tự.";
  }

  if (should("resolution")) {
    if ((resolution.symptomSummary || "").trim().length < 20) errors.symptomSummary = "Triệu chứng cần tối thiểu 20 ký tự.";
    if (!resolution.diagnosisSteps?.length || resolution.diagnosisSteps.some((entry) => entry.trim().length < 5)) errors.diagnosisSteps = "Cần ít nhất một bước chẩn đoán rõ ràng.";
    if ((resolution.rootCause || "").trim().length < 20) errors.rootCause = "Nguyên nhân gốc rễ cần tối thiểu 20 ký tự.";
    if ((resolution.repairAction || "").trim().length < 20) errors.repairAction = "Hành động sửa chữa cần tối thiểu 20 ký tự.";
    if (!resolution.outcome) errors.outcome = "Chọn kết quả xử lý.";
    if ((resolution.verificationMethod || "").trim().length < 10) errors.verificationMethod = "Cần nêu cách xác minh kết quả.";
    if (resolution.outcome !== "RESOLVED" && (resolution.nextAction || "").trim().length < 10) errors.nextAction = "Outcome chưa resolved cần hành động tiếp theo.";
    if (!sopUsage.status) errors.sopUsage = "Chọn tình trạng sử dụng SOP.";
    if (sopUsage.status === "USED") {
      if (!sopUsage.appliedSopId) errors.appliedSopId = "Chọn SOP chuẩn đã sử dụng.";
      if (!sopUsage.appliedSopVersion) errors.appliedSopVersion = "Cần lưu snapshot phiên bản SOP.";
      if (!sopUsage.appliedSopStepIds?.length) errors.appliedSopStepIds = "Chọn ít nhất một bước SOP đã áp dụng/liên quan.";
      if (!sopUsage.feedback) errors.sopFeedback = "Đánh giá SOP đã dùng.";
      if (sopUsage.deviationFlag && (sopUsage.deviationReason || "").trim().length < 20) errors.deviationReason = "Giải thích sai khác tối thiểu 20 ký tự.";
    }
  }

  if (should("evidence")) {
    const needsPhoto = context.severity === "CRITICAL" || context.safetyFlag;
    if (needsPhoto && !submission.attachments.some((attachment) => attachment.category === "FIELD_PHOTO")) errors.attachments = "Sự cố Critical/Safety cần ít nhất một ảnh hiện trường.";
    if ((knowledge.lessonLearned || "").trim().length < 20) errors.lessonLearned = "Bài học kinh nghiệm cần tối thiểu 20 ký tự.";
    if (!knowledge.reusableScope) errors.reusableScope = "Chọn phạm vi tái sử dụng.";
    if (!proposal.action) errors.sopProposal = "Chọn đề xuất đối với SOP.";
    if (proposal.action === "UPDATE_EXISTING") {
      if (!proposal.targetSopId) errors.targetSopId = "Chọn SOP mục tiêu cần cập nhật.";
      if (!proposal.affectedStepIds?.length) errors.affectedStepIds = "Chọn bước SOP bị ảnh hưởng.";
      if ((proposal.gapSummary || "").trim().length < 20) errors.gapSummary = "Mô tả khoảng trống tối thiểu 20 ký tự.";
      if ((proposal.proposedChange || "").trim().length < 20) errors.proposedChange = "Nêu nội dung đề xuất thay đổi tối thiểu 20 ký tự.";
      if (proposal.targetSopId !== sopUsage.appliedSopId && (proposal.targetSopRationale || "").trim().length < 20) errors.targetSopRationale = "Khi SOP mục tiêu khác SOP đã dùng, cần giải thích lý do.";
    }
    if (proposal.action === "NEW_SOP" && (proposal.proposedChange || "").trim().length < 20) errors.proposedChange = "Đề xuất SOP mới cần nội dung thay đổi cụ thể.";
  }

  if (should("review") && !submission.confirmation) {
    errors.confirmation = "Cần xác nhận nội dung trước khi gửi.";
  }

  return errors;
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
  if (["ARCHIVED", "SUSPENDED", "SUPERSEDED"].includes(item.status) && !["KNOWLEDGE_MANAGER", "ADMINISTRATOR"].includes(role)) return false;
  if (searchParams.status === "PUBLISHED") {
    const defaultVisible = ["PUBLISHED", "REVIEW_DUE", "FLAGGED", "UNDER_REVIEW"];
    if (!defaultVisible.includes(item.status)) return false;
  }
  if (searchParams.status !== "ALL" && item.status !== searchParams.status) return false;
  return true;
}

function scoreItem(item, searchParams, synonymPhrases = []) {
  const query = expandQuery(searchParams.query, synonymPhrases);
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
  ].join(" "), synonymPhrases);

  if (query) {
    const tokens = [...new Set(query.split(/\s+/).filter((token) => token.length > 2))];
    const matchedTokens = tokens.filter((token) => haystack.includes(token));
    score += matchedTokens.length * 10;
    if (matchedTokens.length === 0 && !haystack.includes(query)) score = 0;
  }
  if (assetId && !item.assetIds.some((id) => normalize(id).includes(assetId))) score = Math.max(0, score - 35);

  return score;
}

function searchItems(items, role, searchParams, synonymPhrases = []) {
  const results = items
    .filter((item) => visibleForSearch(item, role, searchParams))
    .filter((item) => searchParams.contentType === "ALL" || item.contentType === searchParams.contentType)
    .filter((item) => searchParams.assetType === "ALL" || item.assetTypes.includes(searchParams.assetType))
    .filter((item) => searchParams.faultType === "ALL" || item.faultType === searchParams.faultType)
    .filter((item) => searchParams.categoryId === "ALL" || item.categoryId === searchParams.categoryId)
    .map((item) => ({ ...item, computedScore: scoreItem(item, searchParams, synonymPhrases) }))
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
  const [fieldSubmissions, setFieldSubmissions] = useState(() => loadJson(FIELD_SUBMISSIONS_STORAGE, seedFieldSubmissions));
  const [publishedOutputs, setPublishedOutputs] = useState(() => loadJson(PUBLISHED_OUTPUT_STORAGE, []));
  const [sopRequests, setSopRequests] = useState(() => loadJson(SOP_REQUESTS_STORAGE, seedSopRequests));
  const [sopTasks, setSopTasks] = useState(() => loadJson(SOP_TASKS_STORAGE, seedSopTasks));
  const [sopDrafts, setSopDrafts] = useState(() => loadJson(SOP_DRAFTS_STORAGE, seedSopDrafts));
  const [sopVersions, setSopVersions] = useState(() => loadJson(SOP_VERSIONS_STORAGE, seedSopVersions));
  const [knowledgeRequests, setKnowledgeRequests] = useState(() => loadJson(KNOWLEDGE_REQUESTS_STORAGE, seedKnowledgeRequests));
  const [articleDrafts, setArticleDrafts] = useState(() => loadJson(ARTICLE_DRAFTS_STORAGE, seedArticleDrafts));
  const [lifecycleItems, setLifecycleItems] = useState(() => loadJson(LIFECYCLE_ITEMS_STORAGE, seedLifecycleItems));
  const [lifecycleReviewTasks, setLifecycleReviewTasks] = useState(() => loadJson(LIFECYCLE_REVIEW_TASKS_STORAGE, seedLifecycleReviewTasks));
  const [lifecycleIssueReports, setLifecycleIssueReports] = useState(() => loadJson(LIFECYCLE_ISSUE_REPORTS_STORAGE, seedIssueReports));
  const [lifecycleRevisionTasks, setLifecycleRevisionTasks] = useState(() => loadJson(LIFECYCLE_REVISION_TASKS_STORAGE, seedRevisionTasks));
  const [lifecycleDecisions, setLifecycleDecisions] = useState(() => loadJson(LIFECYCLE_DECISIONS_STORAGE, seedLifecycleDecisions));
  const [lifecycleEvents, setLifecycleEvents] = useState(() => loadJson(LIFECYCLE_EVENTS_STORAGE, seedLifecycleEvents));
  const [reviewPolicies, setReviewPolicies] = useState(() => loadJson(LIFECYCLE_POLICIES_STORAGE, seedReviewPolicies));
  const [adminConfig, setAdminConfig] = useState(() => loadJson(ADMIN_CONFIG_STORAGE, cloneAdminConfig()));
  const [adminAuditEvents, setAdminAuditEvents] = useState(() => loadJson(ADMIN_AUDIT_STORAGE, cloneAdminAuditEvents()));
  const [adminSimulation, setAdminSimulation] = useState(() => loadJson(ADMIN_SIMULATION_STORAGE, null));
  const [toast, setToast] = useState("");
  const [applyItem, setApplyItem] = useState(null);
  const [issueReportItem, setIssueReportItem] = useState(null);
  const [applyOutcome, setApplyOutcome] = useState("RESOLVED_FULLY");
  const [applyComment, setApplyComment] = useState("");
  const [validationError, setValidationError] = useState("");

  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get("id");
  const selectedSubmissionId = params.get("id");
  const currentStep = params.get("step") || "context";
  const requestTab = params.get("tab") || "hub";
  const sopTab = params.get("tab") || "library";
  const runtimeTaxonomy = useMemo(() => buildRuntimeTaxonomy(baseTaxonomy, adminConfig), [adminConfig]);
  const adminSynonymPhrases = useMemo(() => buildAdminSynonymPhrases(adminConfig), [adminConfig]);
  const knowledgeCatalog = useMemo(() => applyLifecycleOverlay(mergeKnowledgeItems(knowledgeItems, publishedOutputs), lifecycleItems), [publishedOutputs, lifecycleItems]);
  const selectedItem = selectedId ? knowledgeCatalog.find((item) => item.id === selectedId) : null;
  const selectedSubmission = selectedSubmissionId ? fieldSubmissions.find((item) => item.id === selectedSubmissionId) : null;
  const selectedSopTask = selectedId ? sopTasks.find((item) => item.id === selectedId) : null;
  const selectedSopDraft = selectedId ? sopDrafts.find((item) => item.id === selectedId) : null;
  const results = useMemo(() => searchItems(knowledgeCatalog, currentRole, searchParams, adminSynonymPhrases), [knowledgeCatalog, currentRole, searchParams, adminSynonymPhrases]);
  const activeNav = screen.includes("search") || screen === "knowledge-detail" || screen === "access-denied"
    ? "search"
    : ["request", "field-submission", "submission-success", "my-submissions", "submission-detail", "knowledge-request-success", "my-knowledge-requests", "knowledge-request-detail", "knowledge-request-queue", "knowledge-request-triage", "contributor-request-queue", "request-workspace", "knowledge-article-editor", "knowledge-article-preview", "knowledge-request-review-detail", "resolved-request"].includes(screen)
      ? "request"
      : ["review", "review-queue", "review-detail"].includes(screen)
        ? "review"
        : ["sops", "sop-detail", "sop-task-detail", "sop-editor", "sop-submit-success", "my-sop-drafts", "sop-review-queue", "sop-review-detail", "sop-version-compare", "sop-version-history"].includes(screen)
          ? "sops"
          : screen.startsWith("lifecycle") || screen === "my-revision-tasks"
            ? "lifecycle"
            : screen.startsWith("admin")
              ? "admin"
              : "dashboard";
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
    else window.localStorage.removeItem(REQUEST_STORAGE);
  }, [requestDraft]);

  useEffect(() => {
    saveJson(FIELD_SUBMISSIONS_STORAGE, fieldSubmissions);
  }, [fieldSubmissions]);

  useEffect(() => {
    saveJson(PUBLISHED_OUTPUT_STORAGE, publishedOutputs);
  }, [publishedOutputs]);

  useEffect(() => {
    saveJson(SOP_REQUESTS_STORAGE, sopRequests);
  }, [sopRequests]);

  useEffect(() => {
    saveJson(SOP_TASKS_STORAGE, sopTasks);
  }, [sopTasks]);

  useEffect(() => {
    saveJson(SOP_DRAFTS_STORAGE, sopDrafts);
  }, [sopDrafts]);

  useEffect(() => {
    saveJson(SOP_VERSIONS_STORAGE, sopVersions);
  }, [sopVersions]);

  useEffect(() => {
    saveJson(KNOWLEDGE_REQUESTS_STORAGE, knowledgeRequests);
  }, [knowledgeRequests]);

  useEffect(() => {
    saveJson(ARTICLE_DRAFTS_STORAGE, articleDrafts);
  }, [articleDrafts]);

  useEffect(() => {
    saveJson(LIFECYCLE_ITEMS_STORAGE, lifecycleItems);
  }, [lifecycleItems]);

  useEffect(() => {
    saveJson(LIFECYCLE_REVIEW_TASKS_STORAGE, lifecycleReviewTasks);
  }, [lifecycleReviewTasks]);

  useEffect(() => {
    saveJson(LIFECYCLE_ISSUE_REPORTS_STORAGE, lifecycleIssueReports);
  }, [lifecycleIssueReports]);

  useEffect(() => {
    saveJson(LIFECYCLE_REVISION_TASKS_STORAGE, lifecycleRevisionTasks);
  }, [lifecycleRevisionTasks]);

  useEffect(() => {
    saveJson(LIFECYCLE_DECISIONS_STORAGE, lifecycleDecisions);
  }, [lifecycleDecisions]);

  useEffect(() => {
    saveJson(LIFECYCLE_EVENTS_STORAGE, lifecycleEvents);
  }, [lifecycleEvents]);

  useEffect(() => {
    saveJson(ADMIN_CONFIG_STORAGE, adminConfig);
  }, [adminConfig]);

  useEffect(() => {
    saveJson(ADMIN_AUDIT_STORAGE, adminAuditEvents);
  }, [adminAuditEvents]);

  useEffect(() => {
    if (adminSimulation) saveJson(ADMIN_SIMULATION_STORAGE, adminSimulation);
    else window.localStorage.removeItem(ADMIN_SIMULATION_STORAGE);
  }, [adminSimulation]);

  useEffect(() => {
    saveJson(LIFECYCLE_POLICIES_STORAGE, reviewPolicies);
  }, [reviewPolicies]);

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

  function verifySearchFromAdmin(query) {
    runSearch({ ...DEFAULT_SEARCH, query });
  }

  function openItem(item) {
    const targetScreen = canViewItem(item, currentRole)
      ? item.contentType === "SOP"
        ? "sop-detail"
        : "knowledge-detail"
      : "access-denied";
    navigate(targetScreen, { id: item.id });
  }

  function updateSubmission(id, updater) {
    setFieldSubmissions((items) => items.map((item) => {
      if (item.id !== id) return item;
      const next = typeof updater === "function" ? updater(item) : { ...item, ...updater };
      return { ...next, updatedAt: nowIso() };
    }));
  }

  function updateSopDraft(id, updater) {
    setSopDrafts((items) => items.map((item) => {
      if (item.id !== id) return item;
      const next = typeof updater === "function" ? updater(item) : { ...item, ...updater };
      return { ...next, updatedAt: nowIso() };
    }));
  }

  function startAuthoringFromTask(task) {
    const existingDraft = sopDrafts.find((draft) => draft.taskId === task.id);
    if (existingDraft) {
      navigate("sop-editor", { id: existingDraft.id, step: "metadata" });
      return;
    }
    const baseSop = knowledgeCatalog.find((item) => item.id === task.existingSopId);
    const draft = buildDraftFromTask(task, currentUser, baseSop);
    setSopDrafts((items) => [draft, ...items]);
    setSopTasks((items) => items.map((item) => item.id === task.id ? { ...item, status: "ACCEPTED" } : item));
    setToast("Đã tạo Draft SOP từ nhiệm vụ.");
    navigate("sop-editor", { id: draft.id, step: "metadata" });
  }

  function startVersionFromSop(sop) {
    const task = {
      id: makeId("SOPTASK"),
      type: "UPDATE_EXISTING",
      status: "ACCEPTED",
      priority: "MEDIUM",
      title: `Tạo phiên bản mới cho ${sop.id}`,
      proposedTitle: sop.title,
      existingSopId: sop.id,
      currentVersion: sop.version,
      requestedVersionIntent: "MAJOR",
      assignedTo: currentUser.id,
      createdBy: currentUser.id,
      sourceKnowledgeIds: [sop.id],
      sourceSubmissionId: "",
      relatedAssetTypes: sop.assetTypes,
      relatedFaultType: sop.faultType,
      businessReason: "Contributor tạo version mới từ thư viện SOP để cập nhật nội dung đã xuất bản.",
      requestedChanges: ["Rà soát và cập nhật SOP theo feedback hoặc yêu cầu nghiệp vụ mới."],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      createdAt: nowIso()
    };
    const draft = buildDraftFromTask(task, currentUser, sop);
    setSopTasks((items) => [task, ...items]);
    setSopDrafts((items) => [draft, ...items]);
    setToast("Đã tạo Draft SOP version mới.");
    navigate("sop-editor", { id: draft.id, step: "metadata" });
  }

  function ensureSopTaskFromRequest(request) {
    const existingTask = sopTasks.find((task) => task.sourceRequestId === request.id);
    if (existingTask) {
      navigate("sop-task-detail", { id: existingTask.id });
      return;
    }
    const task = buildSopTaskFromRequest(request, currentUser);
    setSopTasks((items) => [task, ...items]);
    setToast("Đã tạo nhiệm vụ chuẩn hóa SOP từ yêu cầu FL-02.");
    navigate("sop-task-detail", { id: task.id });
  }

  function transferKnowledgeRequestToSop(request) {
    const existingTask = sopTasks.find((task) => task.sourceRequestId === request.id);
    if (existingTask) {
      setToast("Nhiệm vụ SOP cho request này đã tồn tại.");
      navigate("sop-task-detail", { id: existingTask.id });
      return existingTask;
    }
    const task = buildSopTaskFromKnowledgeRequest(request, currentUser);
    setSopTasks((items) => [task, ...items]);
    setToast("Đã chuyển thành nhiệm vụ SOP (FL-03).");
    navigate("sop-task-detail", { id: task.id });
    return task;
  }

  function startLifecycleSopRevision(revisionTask, reviewTask, knowledgeItem) {
    const existingTask = sopTasks.find((task) => task.sourceRevisionTaskId === revisionTask.revisionTaskId || task.sourceLifecycleReviewId === revisionTask.sourceReviewTaskId);
    if (existingTask) {
      setToast("Nhiệm vụ SOP từ FL-05 đã tồn tại.");
      navigate("sop-task-detail", { id: existingTask.id });
      return existingTask;
    }
    const task = buildSopTaskFromLifecycleRevision(revisionTask, reviewTask, knowledgeItem, currentUser);
    setSopTasks((items) => [task, ...items]);
    setToast("Đã tạo nhiệm vụ SOP từ FL-05 và chuyển sang FL-03.");
    navigate("sop-task-detail", { id: task.id });
    return task;
  }

  function publishLifecycleArticleRevision(revisionTask, baseItem) {
    const published = {
      ...baseItem,
      id: makeId("LC-KN"),
      title: revisionTask.draft?.title || baseItem.title,
      summary: revisionTask.draft?.summary || baseItem.summary,
      status: "PUBLISHED",
      version: revisionTask.targetVersion || "v1.1",
      updatedDate: new Date().toLocaleDateString("vi-VN"),
      effectiveDate: new Date().toLocaleDateString("vi-VN"),
      reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN"),
      replacementId: "",
      currentVersionId: "",
      sourceLifecycleRevisionId: revisionTask.revisionTaskId,
      relatedItems: [...new Set([...(baseItem.relatedItems || []), baseItem.id])]
    };
    setPublishedOutputs((items) => [published, ...items]);
    return published;
  }

  function publishSopDraft(draft, publishForm) {
    const baseSop = knowledgeCatalog.find((item) => item.id === draft.sopId);
    const published = createPublishedSopFromDraft(draft, publishForm, currentUser, baseSop);
    const nextVersion = createVersionFromDraft(draft, publishForm, currentUser);
    setPublishedOutputs((items) => [published, ...items.filter((item) => item.id !== published.id)]);
    setSopVersions((items) => [
      nextVersion,
      ...items.map((item) => item.sopId === draft.sopId && item.status === "PUBLISHED" ? { ...item, status: "SUPERSEDED" } : item)
    ]);
    updateSopDraft(draft.id, (item) => ({
      ...item,
      status: "PUBLISHED",
      publishedAt: nowIso(),
      reviewChecklist: draft.reviewChecklist,
      history: [
        ...(item.history || []),
        { id: makeId("SOPD-EVT"), action: "APPROVE_AND_PUBLISH", actorId: currentUser.id, comment: `Xuất bản ${publishForm.version}.`, createdAt: nowIso() }
      ]
    }));
    setToast("Đã xuất bản SOP và cập nhật FL-01/SOP Library.");
    navigate("sop-detail", { id: draft.sopId });
  }

  function createFieldSubmission(prefill = {}) {
    const draft = emptySubmission(currentUser, prefill);
    setFieldSubmissions((items) => [draft, ...items]);
    navigate("field-submission", { id: draft.id, step: "context" });
    setToast("Đã tạo bản nháp tri thức hiện trường.");
  }

  function createKnowledgeRequest(draftSource = searchParams) {
    const origin = draftSource.origin || "NEW_GAP";
    const sourceContext = {
      ...draftSource,
      origin,
      query: draftSource.query || draftSource.title || searchParams.query,
      assetId: draftSource.assetId || searchParams.assetId,
      assetType: draftSource.assetType || searchParams.assetType,
      faultType: draftSource.faultType || searchParams.faultType,
      filters: draftSource.filters || searchParams,
      resultCount: draftSource.resultCount ?? 0,
      searchedAt: draftSource.searchedAt || new Date().toISOString()
    };
    const draft = emptyKnowledgeRequest(currentUser, sourceContext);
    setRequestDraft(draft);
    navigate("request", { tab: "knowledge-request" });
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

  function submitIssueReport(item, payload) {
    const issue = makeIssueReport(item, currentUser, payload);
    const existingTask = lifecycleReviewTasks.find((task) => task.knowledgeId === item.id && task.version === item.version && ["OPEN", "IN_PROGRESS"].includes(task.status));
    let linkedTask = existingTask;
    setLifecycleIssueReports((items) => [issue, ...items]);
    if (existingTask) {
      linkedTask = {
        ...existingTask,
        priority: issue.severity === "CRITICAL" ? "CRITICAL" : existingTask.priority,
        risk: issue.severity === "CRITICAL" ? "CRITICAL" : existingTask.risk,
        triggerEvidenceIds: [...new Set([...(existingTask.triggerEvidenceIds || []), issue.issueReportId])]
      };
      setLifecycleReviewTasks((items) => items.map((task) => task.reviewTaskId === existingTask.reviewTaskId ? linkedTask : task));
    } else {
      linkedTask = makeReviewTaskFromIssue(item, issue);
      setLifecycleReviewTasks((items) => [linkedTask, ...items]);
    }
    setLifecycleItems((items) => {
      const existing = items.find((entry) => entry.knowledgeId === item.id);
      const next = {
        ...(existing || {
          knowledgeId: item.id,
          currentVersion: item.version,
          knowledgeManagerId: "KM-001",
          authorId: "KC-001",
          nextReviewDate: item.reviewDate,
          reviewPolicyId: item.contentType === "SOP" ? "RP-SOP-HIGH" : "RP-CASE-MEDIUM",
          usageStats: { views: item.viewCount, reuseCount: item.reuseCount, helpfulRate: item.helpfulRate },
          relations: []
        }),
        status: issue.severity === "CRITICAL" ? "FLAGGED" : "UNDER_REVIEW"
      };
      return [next, ...items.filter((entry) => entry.knowledgeId !== item.id)];
    });
    setLifecycleEvents((events) => [
      { eventId: makeId("LC-EVT"), entityType: "ISSUE_REPORT", entityId: issue.issueReportId, action: "ISSUE_SUBMITTED", actorId: currentUser.id, timestamp: nowIso(), metadata: { knowledgeId: item.id, issueType: issue.issueType } },
      { eventId: makeId("LC-EVT"), entityType: "REVIEW_TASK", entityId: linkedTask.reviewTaskId, action: existingTask ? "ISSUE_LINKED_TO_TASK" : "TASK_CREATED", actorId: "SYSTEM", timestamp: nowIso(), metadata: { knowledgeId: item.id, issueReportId: issue.issueReportId } },
      ...events
    ]);
    setIssueReportItem(null);
    setToast("Đã tạo Issue Report và Review Task FL-05.");
    navigate("lifecycle-review-detail", { id: linkedTask.reviewTaskId });
  }

  function resetDemo() {
    [ROLE_STORAGE, RECENT_STORAGE, FEEDBACK_STORAGE, APPLICATION_STORAGE, REQUEST_STORAGE, FIELD_SUBMISSIONS_STORAGE, PUBLISHED_OUTPUT_STORAGE, SOP_REQUESTS_STORAGE, SOP_TASKS_STORAGE, SOP_DRAFTS_STORAGE, SOP_VERSIONS_STORAGE, KNOWLEDGE_REQUESTS_STORAGE, ARTICLE_DRAFTS_STORAGE, LIFECYCLE_ITEMS_STORAGE, LIFECYCLE_REVIEW_TASKS_STORAGE, LIFECYCLE_ISSUE_REPORTS_STORAGE, LIFECYCLE_REVISION_TASKS_STORAGE, LIFECYCLE_DECISIONS_STORAGE, LIFECYCLE_EVENTS_STORAGE, LIFECYCLE_POLICIES_STORAGE].forEach((key) => window.localStorage.removeItem(key));
    setCurrentRole("FIELD_TECHNICIAN");
    setRecentSearches([]);
    setFeedbackEvents({});
    setApplicationEvents({});
    setRequestDraft(null);
    setFieldSubmissions(seedFieldSubmissions);
    setPublishedOutputs([]);
    setSopRequests(seedSopRequests);
    setSopTasks(seedSopTasks);
    setSopDrafts(seedSopDrafts);
    setSopVersions(seedSopVersions);
    setKnowledgeRequests(seedKnowledgeRequests);
    setArticleDrafts(seedArticleDrafts);
    setLifecycleItems(seedLifecycleItems);
    setLifecycleReviewTasks(seedLifecycleReviewTasks);
    setLifecycleIssueReports(seedIssueReports);
    setLifecycleRevisionTasks(seedRevisionTasks);
    setLifecycleDecisions(seedLifecycleDecisions);
    setLifecycleEvents(seedLifecycleEvents);
    setReviewPolicies(seedReviewPolicies);
    setIssueReportItem(null);
    setSearchParams(DEFAULT_SEARCH);
    navigate("dashboard");
    setToast("Đã reset demo data.");
  }

  function exitSimulation() {
    const targetRole = adminSimulation?.baseRole || "ADMINISTRATOR";
    setCurrentRole(targetRole);
    setAdminSimulation(null);
    setToast("Đã thoát mô phỏng role.");
    navigate("admin-dashboard");
  }

  function resetAdminSeed() {
    const resetAt = adminNowIso();
    const nextConfig = cloneAdminConfig();
    nextConfig.seedState.lastResetAt = resetAt;
    const event = {
      eventId: makeAdminId("ADM-EVT"),
      actorId: currentUser.id,
      actorRole: "ADMINISTRATOR",
      action: "RESET_SEED",
      objectType: "DemoSeedState",
      objectId: nextConfig.seedState.seedVersion,
      result: "SUCCESS",
      reason: "Reset FL-06 seed data từ Admin Console.",
      before: adminConfig.seedState.checksum,
      after: nextConfig.seedState.checksum,
      createdAt: resetAt
    };
    window.localStorage.removeItem(ADMIN_CONFIG_STORAGE);
    window.localStorage.removeItem(ADMIN_AUDIT_STORAGE);
    window.localStorage.removeItem(ADMIN_SIMULATION_STORAGE);
    setAdminConfig(nextConfig);
    setAdminAuditEvents([event, ...cloneAdminAuditEvents()]);
    setAdminSimulation(null);
    setCurrentRole("ADMINISTRATOR");
    setToast("Đã reset FL-06 seed và đưa role về Quản trị viên.");
    navigate("admin-operation-result", { id: event.eventId });
  }

  const fl04Screens = ["request", "knowledge-request-success", "my-knowledge-requests", "knowledge-request-detail", "knowledge-request-queue", "knowledge-request-triage", "contributor-request-queue", "request-workspace", "knowledge-article-editor", "knowledge-article-preview", "knowledge-request-review-detail", "resolved-request"];
  const fl05Screens = ["lifecycle-entry", "lifecycle-dashboard", "lifecycle-review-queue", "lifecycle-review-detail", "lifecycle-checklist", "lifecycle-reconfirm", "lifecycle-create-revision", "my-revision-tasks", "lifecycle-revision-workspace", "lifecycle-version-compare", "lifecycle-rereview", "lifecycle-suspend", "lifecycle-supersede", "lifecycle-archive", "lifecycle-success", "lifecycle-history", "lifecycle-policy-settings"];
  const fl06Screens = adminScreenIds;
  let content;
  if (screen === "dashboard") content = <Dashboard searchParams={searchParams} setSearchParams={setSearchParams} runSearch={runSearch} openItem={openItem} navigate={navigate} createFieldSubmission={createFieldSubmission} fieldSubmissions={fieldSubmissions} currentRole={currentRole} />;
  else if (screen === "search") content = <AdvancedSearch searchParams={searchParams} setSearchParams={setSearchParams} runSearch={runSearch} validationError={validationError} recentSearches={recentSearches} taxonomySource={runtimeTaxonomy} />;
  else if (screen === "search-results") content = <SearchResults searchParams={searchParams} setSearchParams={setSearchParams} runSearch={runSearch} results={results} openItem={openItem} createKnowledgeRequest={createKnowledgeRequest} currentRole={currentRole} taxonomySource={runtimeTaxonomy} />;
  else if (screen === "knowledge-detail") content = selectedItem && canViewItem(selectedItem, currentRole) ? <KnowledgeDetail item={selectedItem} openItem={openItem} navigate={navigate} feedbackEvents={feedbackEvents} submitFeedback={submitFeedback} reportItem={reportItem} setApplyItem={setApplyItem} applicationEvents={applicationEvents} currentRole={currentRole} createFieldSubmission={createFieldSubmission} knowledgeCatalog={knowledgeCatalog} fieldSubmissions={fieldSubmissions} sopRequests={sopRequests} ensureSopTaskFromRequest={ensureSopTaskFromRequest} createKnowledgeRequest={createKnowledgeRequest} setIssueReportItem={setIssueReportItem} /> : <AccessDenied navigate={navigate} currentRole={currentRole} />;
  else if (screen === "sop-detail") content = selectedItem && canViewItem(selectedItem, currentRole) ? <SopDetail item={selectedItem} openItem={openItem} navigate={navigate} feedbackEvents={feedbackEvents} submitFeedback={submitFeedback} reportItem={reportItem} setApplyItem={setApplyItem} applicationEvents={applicationEvents} currentRole={currentRole} createFieldSubmission={createFieldSubmission} knowledgeCatalog={knowledgeCatalog} fieldSubmissions={fieldSubmissions} sopRequests={sopRequests} ensureSopTaskFromRequest={ensureSopTaskFromRequest} createKnowledgeRequest={createKnowledgeRequest} setIssueReportItem={setIssueReportItem} /> : <AccessDenied navigate={navigate} currentRole={currentRole} />;
  else if (screen === "access-denied") content = <AccessDenied navigate={navigate} currentRole={currentRole} />;
  else if (fl04Screens.includes(screen)) content = <FL04Flow screen={screen} tab={requestTab} id={selectedId} currentUser={currentUser} currentRole={currentRole} users={users} taxonomy={runtimeTaxonomy} navigate={navigate} requestDraft={requestDraft} setRequestDraft={setRequestDraft} knowledgeRequests={knowledgeRequests} setKnowledgeRequests={setKnowledgeRequests} articleDrafts={articleDrafts} setArticleDrafts={setArticleDrafts} knowledgeCatalog={knowledgeCatalog} setPublishedOutputs={setPublishedOutputs} setToast={setToast} createFieldSubmission={createFieldSubmission} transferKnowledgeRequestToSop={transferKnowledgeRequestToSop} openItem={openItem} />;
  else if (fl05Screens.includes(screen)) content = <FL05Flow screen={screen} id={params.get("taskId") || selectedId || params.get("eventId")} currentUser={currentUser} currentRole={currentRole} users={users} taxonomy={runtimeTaxonomy} navigate={navigate} knowledgeCatalog={knowledgeCatalog} lifecycleItems={lifecycleItems} setLifecycleItems={setLifecycleItems} reviewTasks={lifecycleReviewTasks} setReviewTasks={setLifecycleReviewTasks} issueReports={lifecycleIssueReports} setIssueReports={setLifecycleIssueReports} revisionTasks={lifecycleRevisionTasks} setRevisionTasks={setLifecycleRevisionTasks} lifecycleDecisions={lifecycleDecisions} setLifecycleDecisions={setLifecycleDecisions} lifecycleEvents={lifecycleEvents} setLifecycleEvents={setLifecycleEvents} reviewPolicies={reviewPolicies} setReviewPolicies={setReviewPolicies} createFieldSubmission={createFieldSubmission} startLifecycleSopRevision={startLifecycleSopRevision} publishLifecycleArticleRevision={publishLifecycleArticleRevision} openItem={openItem} setToast={setToast} />;
  else if (fl06Screens.includes(screen)) content = <FL06Flow screen={screen} id={selectedId} currentRole={currentRole} currentUser={currentUser} config={adminConfig} setConfig={setAdminConfig} auditEvents={adminAuditEvents} setAuditEvents={setAdminAuditEvents} navigate={navigate} verifySearch={verifySearchFromAdmin} setToast={setToast} setCurrentRole={setCurrentRole} adminSimulation={adminSimulation} setAdminSimulation={setAdminSimulation} resetAdminSeed={resetAdminSeed} />;
  else if (screen === "field-submission") content = selectedSubmission ? <FieldSubmissionWizard submission={selectedSubmission} step={currentStep} updateSubmission={updateSubmission} navigate={navigate} setToast={setToast} currentRole={currentRole} setSearchParams={setSearchParams} runSearch={runSearch} taxonomySource={runtimeTaxonomy} /> : <Placeholder title="Không tìm thấy submission" description="Bản nháp hoặc submission này không còn trong mock data." />;
  else if (screen === "submission-success") content = selectedSubmission ? <SubmissionSuccess submission={selectedSubmission} navigate={navigate} /> : <Placeholder title="Không tìm thấy submission" description="Không có submission tương ứng." />;
  else if (screen === "my-submissions") content = <MySubmissions submissions={fieldSubmissions} navigate={navigate} currentUser={currentUser} knowledgeCatalog={knowledgeCatalog} openItem={openItem} />;
  else if (screen === "submission-detail") content = selectedSubmission ? <SubmissionDetail submission={selectedSubmission} navigate={navigate} currentUser={currentUser} knowledgeCatalog={knowledgeCatalog} openItem={openItem} /> : <Placeholder title="Không tìm thấy submission" description="Không có submission tương ứng." />;
  else if (screen === "review" || screen === "review-queue") content = <ReviewQueue submissions={fieldSubmissions} navigate={navigate} currentRole={currentRole} />;
  else if (screen === "review-detail") content = selectedSubmission ? <ReviewDetail submission={selectedSubmission} updateSubmission={updateSubmission} currentUser={currentUser} currentRole={currentRole} navigate={navigate} setToast={setToast} setPublishedOutputs={setPublishedOutputs} setSopRequests={setSopRequests} openItem={openItem} knowledgeCatalog={knowledgeCatalog} /> : <Placeholder title="Không tìm thấy submission" description="Không có item trong hàng đợi." />;
  else if (screen === "sops") content = <SopWorkspace tab={sopTab} navigate={navigate} openItem={openItem} knowledgeCatalog={knowledgeCatalog} sopTasks={sopTasks} sopDrafts={sopDrafts} sopVersions={sopVersions} currentUser={currentUser} currentRole={currentRole} startAuthoringFromTask={startAuthoringFromTask} startVersionFromSop={startVersionFromSop} />;
  else if (screen === "sop-task-detail") content = <SopTaskDetail task={selectedSopTask} drafts={sopDrafts} navigate={navigate} knowledgeCatalog={knowledgeCatalog} startAuthoringFromTask={startAuthoringFromTask} />;
  else if (screen === "sop-editor") content = <SopEditor draft={selectedSopDraft} step={params.get("step") || "metadata"} updateDraft={updateSopDraft} navigate={navigate} setToast={setToast} taxonomy={runtimeTaxonomy} />;
  else if (screen === "sop-submit-success") content = <SopSubmitSuccess draft={selectedSopDraft} navigate={navigate} />;
  else if (screen === "my-sop-drafts") content = <SopWorkspace tab="drafts" navigate={navigate} openItem={openItem} knowledgeCatalog={knowledgeCatalog} sopTasks={sopTasks} sopDrafts={sopDrafts} sopVersions={sopVersions} currentUser={currentUser} currentRole={currentRole} startAuthoringFromTask={startAuthoringFromTask} startVersionFromSop={startVersionFromSop} />;
  else if (screen === "sop-review-queue") content = <SopWorkspace tab="review" navigate={navigate} openItem={openItem} knowledgeCatalog={knowledgeCatalog} sopTasks={sopTasks} sopDrafts={sopDrafts} sopVersions={sopVersions} currentUser={currentUser} currentRole={currentRole} startAuthoringFromTask={startAuthoringFromTask} startVersionFromSop={startVersionFromSop} />;
  else if (screen === "sop-review-detail") content = <SopReviewDetail draft={selectedSopDraft} updateDraft={updateSopDraft} navigate={navigate} currentUser={currentUser} currentRole={currentRole} setToast={setToast} publishDraft={publishSopDraft} />;
  else if (screen === "sop-version-compare") content = <SopVersionCompare draft={selectedSopDraft} baseSop={selectedSopDraft ? knowledgeCatalog.find((item) => item.id === selectedSopDraft.sopId) : null} navigate={navigate} />;
  else if (screen === "sop-version-history") content = <SopVersionHistory sopId={selectedId} versions={sopVersions} knowledgeCatalog={knowledgeCatalog} navigate={navigate} openItem={openItem} />;
  else content = <Placeholder title="Màn hình chưa hỗ trợ" description="Route này chưa có trong prototype." />;

  return (
    <div className="app-shell">
      <Sidebar activeNav={activeNav} navigate={navigate} currentRole={currentRole} />
      <main className="workspace">
        <TopBar currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser} resetDemo={resetDemo} roleOptions={adminConfig.roles} adminSimulation={adminSimulation} exitSimulation={exitSimulation} />
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
      {issueReportItem && (
        <IssueReportForm
          item={issueReportItem}
          currentUser={currentUser}
          submitIssueReport={submitIssueReport}
          close={() => setIssueReportItem(null)}
        />
      )}
      <div className={toast ? "toast show" : "toast"} aria-live="polite">{toast}</div>
    </div>
  );
}

function Sidebar({ activeNav, navigate, currentRole }) {
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
        {navItems.filter((item) => !item.allowedRoles || item.allowedRoles.includes(currentRole)).map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={activeNav === item.id ? "nav-item active" : "nav-item"} onClick={() => navigate(item.screen || (item.id === "search" ? "search" : item.id))} type="button">
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

function TopBar({ currentRole, setCurrentRole, currentUser, resetDemo, roleOptions, adminSimulation, exitSimulation }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <strong>FL-01 đến FL-06</strong>
        <span>{adminSimulation ? `Đang mô phỏng ${adminRoleLabels[currentRole] || currentRole}` : "Tìm kiếm, gửi, chuẩn hóa, vòng đời và quản trị tri thức"}</span>
      </div>
      <div className="topbar-actions">
        <label className="role-switcher">
          <UserRound size={16} />
          <select value={currentRole} onChange={(event) => setCurrentRole(event.target.value)}>
            {(roleOptions || users.map((user) => ({ roleId: user.role, name: user.label }))).map((role) => <option key={role.roleId} value={role.roleId}>{role.name}</option>)}
          </select>
        </label>
        {adminSimulation && <button className="secondary-btn" onClick={exitSimulation} type="button"><ShieldCheck size={16} />Thoát mô phỏng</button>}
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

function Dashboard({ searchParams, setSearchParams, runSearch, openItem, navigate, createFieldSubmission, fieldSubmissions, currentRole }) {
  const recentItems = knowledgeItems.filter((item) => item.status === "PUBLISHED").slice(0, 3);
  const recommendedItems = knowledgeItems.filter((item) => item.contentType === "SOP").slice(0, 3);
  const draftCount = fieldSubmissions.filter((item) => item.status === "DRAFT").length;
  const changesCount = fieldSubmissions.filter((item) => item.status === "CHANGES_REQUESTED").length;

  return (
    <section className="page">
      <PageHeader title="Tìm kiếm tri thức LABSL" description="Điểm vào nhanh cho Field Technician tìm SOP, repair case và bài học đã kiểm chứng." />
      <div className="capture-strip">
        <article>
          <span>FL-02</span>
          <h3>Gửi tri thức hiện trường</h3>
          <p>Ghi lại case vừa xử lý, SOP đã dùng, bằng chứng và bài học để Knowledge Manager kiểm duyệt.</p>
        </article>
        <div className="capture-actions">
          <button className="primary-btn" type="button" onClick={() => createFieldSubmission({})}><Plus size={17} />Gửi tri thức hiện trường</button>
          <button className="secondary-btn" type="button" onClick={() => navigate("my-submissions")}><ClipboardList size={17} />Submission của tôi</button>
          {currentRole === "KNOWLEDGE_MANAGER" && <button className="ghost-btn" type="button" onClick={() => navigate("review-queue")}>Mở hàng đợi xét duyệt</button>}
        </div>
        <div className="mini-metrics">
          <span>{draftCount} bản nháp</span>
          <span>{changesCount} cần bổ sung</span>
        </div>
      </div>
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

function AdvancedSearch({ searchParams, setSearchParams, runSearch, validationError, recentSearches, taxonomySource }) {
  return (
    <section className="page">
      <PageHeader title="Tìm kiếm nâng cao" description="Thu thập query và filter có cấu trúc trước khi render kết quả." />
      <SearchForm searchParams={searchParams} setSearchParams={setSearchParams} runSearch={runSearch} validationError={validationError} taxonomySource={taxonomySource} />
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

function SearchForm({ searchParams, setSearchParams, runSearch, validationError, compact = false, taxonomySource = baseTaxonomy }) {
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
        <SelectField label="Loại nội dung" value={searchParams.contentType} field="contentType" options={taxonomySource.contentTypes} setSearchParams={setSearchParams} searchParams={searchParams} />
        <SelectField label="Loại thiết bị" value={searchParams.assetType} field="assetType" options={taxonomySource.assetTypes} setSearchParams={setSearchParams} searchParams={searchParams} />
        <SelectField label="Loại lỗi" value={searchParams.faultType} field="faultType" options={taxonomySource.faultTypes} setSearchParams={setSearchParams} searchParams={searchParams} />
        <SelectField label="Danh mục" value={searchParams.categoryId} field="categoryId" options={taxonomySource.categories} setSearchParams={setSearchParams} searchParams={searchParams} />
        <SelectField label="Trạng thái" value={searchParams.status} field="status" options={[
          { value: "PUBLISHED", label: "Đang hiệu lực" },
          { value: "REVIEW_DUE", label: "Đến hạn rà soát" },
          { value: "FLAGGED", label: "Bị gắn cờ" },
          { value: "UNDER_REVIEW", label: "Đang rà soát" },
          { value: "SUSPENDED", label: "Tạm ngừng" },
          { value: "SUPERSEDED", label: "Đã thay thế" },
          { value: "ARCHIVED", label: "Đã lưu trữ" },
          { value: "OUTDATED", label: "Outdated" },
          { value: "ALL", label: "Tất cả trạng thái" }
        ]} setSearchParams={setSearchParams} searchParams={searchParams} />
        <SelectField label="Sắp xếp" value={searchParams.sortBy} field="sortBy" options={taxonomySource.sortOptions} setSearchParams={setSearchParams} searchParams={searchParams} />
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

function SearchResults({ searchParams, setSearchParams, runSearch, results, openItem, createKnowledgeRequest, currentRole, taxonomySource }) {
  return (
    <section className="page">
      <PageHeader
        eyebrow={roleLabels[currentRole]}
        title="Kết quả tìm kiếm"
        description={`${results.length} kết quả cho ${searchParams.query || searchParams.assetId || "bộ lọc hiện tại"}. Visibility được lọc trước khi render.`}
      />
      <SearchForm compact searchParams={searchParams} setSearchParams={setSearchParams} runSearch={runSearch} taxonomySource={taxonomySource} />
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
      <button className="primary-btn" type="button" onClick={() => createKnowledgeRequest({ ...searchParams, origin: "NEW_GAP", filters: searchParams, resultCount: 0 })}>Yêu cầu bổ sung tri thức</button>
    </article>
  );
}

function KnowledgeDetail({ item, openItem, navigate, feedbackEvents, submitFeedback, reportItem, setApplyItem, applicationEvents, currentRole, createFieldSubmission, knowledgeCatalog, fieldSubmissions, sopRequests, ensureSopTaskFromRequest, createKnowledgeRequest, setIssueReportItem }) {
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
        <DetailAside item={item} openItem={openItem} feedbackEvents={feedbackEvents} submitFeedback={submitFeedback} reportItem={reportItem} setApplyItem={setApplyItem} applicationEvents={applicationEvents} currentRole={currentRole} createFieldSubmission={createFieldSubmission} navigate={navigate} createKnowledgeRequest={createKnowledgeRequest} setIssueReportItem={setIssueReportItem} />
      </div>
      {item.sourceSubmissionId && <PublishedTraceability item={item} navigate={navigate} fieldSubmissions={fieldSubmissions} sopRequests={sopRequests} ensureSopTaskFromRequest={ensureSopTaskFromRequest} />}
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
  if (item.status === "REVIEW_DUE") {
    return <div className="warning-banner"><FileClock size={20} /><span>Nội dung đã đến hạn rà soát vòng đời. Có thể tiếp tục xem nhưng cần Knowledge Manager xác nhận lại.</span></div>;
  }
  if (item.status === "FLAGGED") {
    return <div className="warning-banner"><ShieldAlert size={20} /><span>Nội dung đang bị gắn cờ do issue report hoặc feedback. Cần rà soát trước khi sử dụng cho tình huống rủi ro.</span></div>;
  }
  if (item.status === "UNDER_REVIEW" || item.status === "UPDATE_REQUIRED" || item.status === "UNDER_REVISION") {
    return <div className="warning-banner neutral"><History size={20} /><span>{lifecycleStatusLabels[item.status]}. Nội dung đang trong quy trình FL-05.</span></div>;
  }
  if (item.status === "SUSPENDED") {
    return <div className="warning-banner"><ShieldAlert size={20} /><span>Nội dung đã bị tạm ngừng. Không dùng cho tác nghiệp thông thường cho đến khi có bản cập nhật.</span>{item.lifecycle?.replacementKnowledgeId && <button onClick={() => openItem(knowledgeItems.find((x) => x.id === item.lifecycle.replacementKnowledgeId))}>Xem nội dung thay thế</button>}</div>;
  }
  if (item.status === "ARCHIVED") {
    return <div className="warning-banner neutral"><Archive size={20} /><span>Nội dung đã lưu trữ, chỉ dùng để truy vết lịch sử.</span></div>;
  }
  if (item.status === "OUTDATED") {
    return <div className="warning-banner"><AlertTriangle size={20} /><span>Quá ngày review: {item.reviewDate}. Nội dung có thể không còn phù hợp.</span>{item.replacementId && <button onClick={() => openItem(knowledgeItems.find((x) => x.id === item.replacementId))}>Xem nội dung thay thế</button>}</div>;
  }
  if (item.status === "SUPERSEDED") {
    return <div className="warning-banner neutral"><History size={20} /><span>Phiên bản này đã bị thay thế.</span>{item.currentVersionId && <button onClick={() => openItem(knowledgeItems.find((x) => x.id === item.currentVersionId))}>Xem phiên bản hiện hành</button>}</div>;
  }
  return null;
}

function DetailAside({ item, openItem, feedbackEvents, submitFeedback, reportItem, setApplyItem, applicationEvents, currentRole, createFieldSubmission, navigate, createKnowledgeRequest, setIssueReportItem }) {
  const applied = applicationEvents[item.id];
  const feedback = feedbackEvents[item.id]?.value;
  const canApply = item.status === "PUBLISHED" && currentRole !== "ADMINISTRATOR";

  function requestImprovement(type, label) {
    reportItem(item, type);
    if (!createKnowledgeRequest) return;
    createKnowledgeRequest({
      origin: "IMPROVEMENT_REQUEST",
      query: item.title,
      title: item.title,
      assetId: item.assetIds?.[0] || "",
      assetType: item.assetTypes?.[0] || "",
      faultType: item.faultType,
      knowledgeId: item.id,
      feedbackReason: label,
      filters: {
        query: item.title,
        assetId: item.assetIds?.[0] || "",
        contentType: item.contentType,
        assetType: item.assetTypes?.[0] || "ALL",
        faultType: item.faultType || "ALL",
        categoryId: item.categoryId || "ALL",
        status: item.status,
        sortBy: "RELEVANCE"
      },
      resultCount: 1
    });
  }

  return (
    <aside className="detail-aside">
      <article className="panel action-panel">
        <h3>Áp dụng & phản hồi</h3>
        <button className="primary-btn wide" disabled={!canApply} onClick={() => setApplyItem(item)} type="button">Đánh dấu đã áp dụng</button>
        {!canApply && <p className="hint">Không thể apply với trạng thái/role hiện tại.</p>}
        {applied && <p className="success-note">Đã áp dụng: {applied.applicationOutcome}</p>}
        {applied && currentRole === "FIELD_TECHNICIAN" && <button className="secondary-btn wide" onClick={() => createFieldSubmission({ appliedItem: item })} type="button"><Plus size={16} />Ghi nhận tri thức hiện trường</button>}
        <div className="feedback-row">
          <button className={feedback === "HELPFUL" ? "feedback active" : "feedback"} onClick={() => submitFeedback(item, "HELPFUL")}><ThumbsUp size={16} />Hữu ích</button>
          <button className={feedback === "NOT_HELPFUL" ? "feedback active" : "feedback"} onClick={() => { submitFeedback(item, "NOT_HELPFUL"); requestImprovement("NOT_HELPFUL", "Không hữu ích"); }}><ThumbsDown size={16} />Không hữu ích</button>
        </div>
        <button className="ghost-btn wide" onClick={() => setIssueReportItem ? setIssueReportItem(item) : requestImprovement("INCORRECT", "Nội dung chưa chính xác")}><MessageSquareWarning size={16} />Báo nội dung chưa chính xác</button>
        <button className="ghost-btn wide" onClick={() => setIssueReportItem ? setIssueReportItem(item) : requestImprovement("OUTDATED", "Nội dung lỗi thời")}><AlertTriangle size={16} />Báo nội dung lỗi thời</button>
        <button className="ghost-btn wide" onClick={() => setIssueReportItem?.(item)}><ShieldAlert size={16} />Báo không an toàn</button>
      </article>
      <article className="panel governance">
        <h3>Governance</h3>
        <InfoGrid rows={[["Security", item.securityLevel], ["Effective", item.effectiveDate], ["Review", item.reviewDate], ["Views", String(item.viewCount)], ["Reuse", String(item.reuseCount + (applied ? 1 : 0))]]} />
        {item.contentType === "SOP" && navigate && <button className="secondary-btn wide" type="button" onClick={() => navigate("sop-version-history", { id: item.id })}><History size={16} />Lịch sử phiên bản</button>}
        {navigate && <button className="secondary-btn wide" type="button" onClick={() => navigate("lifecycle-history", { id: item.id })}><ShieldCheck size={16} />Lifecycle history</button>}
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

function PublishedTraceability({ item, navigate, fieldSubmissions, sopRequests, ensureSopTaskFromRequest }) {
  const source = fieldSubmissions.find((submission) => submission.id === item.sourceSubmissionId);
  const relatedRequests = sopRequests.filter((request) => request.sourceKnowledgeId === item.id || request.sourceSubmissionId === item.sourceSubmissionId);
  return (
    <article className="panel traceability-panel">
      <h3>Truy vết nguồn gốc FL-02</h3>
      <InfoGrid rows={[
        ["Submission nguồn", item.sourceSubmissionId],
        ["Người gửi", source?.submittedBy],
        ["SOP đã dùng", item.appliedSopRefs?.map((ref) => `${ref.sopId} ${ref.version} (${ref.stepIds.join(", ")})`).join("; ")],
        ["SOP mục tiêu", item.targetSopId],
        ["Yêu cầu FL-03", relatedRequests.map((request) => request.id).join(", ")]
      ]} />
      <div className="form-actions">
        {source && <button className="secondary-btn" type="button" onClick={() => navigate("submission-detail", { id: source.id })}>Xem submission nguồn</button>}
        {relatedRequests[0] && <button className="primary-btn" type="button" onClick={() => ensureSopTaskFromRequest(relatedRequests[0])}>Chuẩn hóa thành SOP</button>}
      </div>
    </article>
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

function RequestHub({ tab, draft, setDraft, setToast, navigate, createFieldSubmission, fieldSubmissions }) {
  const activeTab = tab === "knowledge-request" || tab === "field-capture" ? tab : "hub";
  return (
    <section className="page">
      <PageHeader title="Gửi yêu cầu" description="Một điểm vào chung cho yêu cầu bổ sung tri thức và gửi tri thức hiện trường." />
      <div className="subtab-row" role="tablist" aria-label="Nhánh gửi yêu cầu">
        <button className={activeTab === "hub" ? "subtab active" : "subtab"} onClick={() => navigate("request")} type="button">Tổng quan</button>
        <button className={activeTab === "knowledge-request" ? "subtab active" : "subtab"} onClick={() => navigate("request", { tab: "knowledge-request" })} type="button">Yêu cầu bổ sung tri thức</button>
        <button className={activeTab === "field-capture" ? "subtab active" : "subtab"} onClick={() => navigate("request", { tab: "field-capture" })} type="button">Gửi tri thức hiện trường</button>
      </div>
      {activeTab === "knowledge-request" && <KnowledgeRequest draft={draft} setDraft={setDraft} setToast={setToast} navigate={navigate} />}
      {activeTab === "field-capture" && <FieldCaptureEntry createFieldSubmission={createFieldSubmission} navigate={navigate} fieldSubmissions={fieldSubmissions} />}
      {activeTab === "hub" && (
        <div className="choice-grid">
          <article className="choice-card">
            <FileQuestion size={28} />
            <h3>Yêu cầu bổ sung tri thức</h3>
            <p>Dùng khi FL-01 search không có kết quả phù hợp hoặc phát hiện khoảng trống tri thức.</p>
            <button className="secondary-btn" onClick={() => navigate("request", { tab: "knowledge-request" })} type="button">Mở form yêu cầu</button>
          </article>
          <article className="choice-card">
            <ClipboardList size={28} />
            <h3>Gửi tri thức hiện trường</h3>
            <p>Ghi nhận case thực tế, evidence, bài học và đề xuất cập nhật SOP để Knowledge Manager kiểm duyệt.</p>
            <button className="primary-btn" onClick={() => navigate("request", { tab: "field-capture" })} type="button">Bắt đầu FL-02</button>
          </article>
        </div>
      )}
    </section>
  );
}

function FieldCaptureEntry({ createFieldSubmission, navigate, fieldSubmissions }) {
  const draftCount = fieldSubmissions.filter((item) => item.status === "DRAFT").length;
  const reworkCount = fieldSubmissions.filter((item) => item.status === "CHANGES_REQUESTED").length;
  return (
    <div className="field-entry-grid">
      <article className="panel work-order-card">
        <span className="eyebrow">Công việc gần nhất</span>
        <h3>{currentWorkOrder.id}</h3>
        <InfoGrid rows={[
          ["Asset ID", currentWorkOrder.assetId],
          ["Loại thiết bị", taxonomyLabel("assetTypes", currentWorkOrder.assetType)],
          ["Loại lỗi", taxonomyLabel("faultTypes", currentWorkOrder.faultType)],
          ["Vị trí", currentWorkOrder.location]
        ]} />
        <p>{currentWorkOrder.symptom}</p>
        <button className="primary-btn wide" type="button" onClick={() => createFieldSubmission({ workOrderId: currentWorkOrder.id })}><Plus size={17} />Ghi nhận bài học từ công việc này</button>
      </article>
      <article className="panel">
        <h3>Trạng thái của tôi</h3>
        <div className="metric-grid compact-metrics">
          <div className="metric-card"><span>Bản nháp</span><strong>{draftCount}</strong><p>Có thể tiếp tục sau</p></div>
          <div className="metric-card"><span>Cần bổ sung</span><strong>{reworkCount}</strong><p>Theo phản hồi kiểm duyệt</p></div>
        </div>
        <div className="form-actions">
          <button className="secondary-btn" type="button" onClick={() => createFieldSubmission({})}>Tạo submission trống</button>
          <button className="ghost-btn" type="button" onClick={() => navigate("my-submissions")}>Xem submission của tôi</button>
        </div>
      </article>
    </div>
  );
}

const stepOrder = ["context", "resolution", "evidence", "review"];
const stepLabels = {
  context: "Bối cảnh",
  resolution: "Chẩn đoán & xử lý",
  evidence: "Bằng chứng & bài học",
  review: "Xem lại & gửi"
};

function FieldSubmissionWizard({ submission, step, updateSubmission, navigate, setToast, currentRole, setSearchParams, runSearch }) {
  const currentIndex = Math.max(0, stepOrder.indexOf(step));
  const errors = validateSubmission(submission, step);
  const [showErrors, setShowErrors] = useState(false);
  const visibleErrors = showErrors ? errors : {};

  function change(path, value) {
    updateSubmission(submission.id, (item) => setDeep(item, path, value));
  }

  function next() {
    const stepErrors = validateSubmission(submission, step);
    if (Object.keys(stepErrors).length > 0) {
      setShowErrors(true);
      setToast("Kiểm tra lại các trường bắt buộc trước khi tiếp tục.");
      return;
    }
    setShowErrors(false);
    const nextStep = stepOrder[Math.min(currentIndex + 1, stepOrder.length - 1)];
    navigate("field-submission", { id: submission.id, step: nextStep });
  }

  function back() {
    const prevStep = stepOrder[Math.max(currentIndex - 1, 0)];
    navigate("field-submission", { id: submission.id, step: prevStep });
  }

  function saveExit() {
    setToast("Đã lưu bản nháp.");
    navigate("my-submissions");
  }

  function submit() {
    const allErrors = validateSubmission(submission, "review", true);
    if (Object.keys(allErrors).length > 0) {
      setShowErrors(true);
      setToast("Submission chưa hợp lệ. Vui lòng kiểm tra error summary.");
      return;
    }
    updateSubmission(submission.id, (item) => ({
      ...item,
      status: item.status === "CHANGES_REQUESTED" ? "RESUBMITTED" : "SUBMITTED",
      submittedAt: nowIso(),
      reviewHistory: [
        ...(item.reviewHistory || []),
        { id: makeId("EVT"), action: item.status === "CHANGES_REQUESTED" ? "RESUBMITTED" : "SUBMITTED", actorId: item.submittedBy, comment: "Gửi kiểm duyệt.", createdAt: nowIso() }
      ]
    }));
    navigate("submission-success", { id: submission.id });
  }

  function searchRelated() {
    const nextParams = { ...DEFAULT_SEARCH, query: submission.resolution.symptomSummary || submission.context.assetId };
    setSearchParams(nextParams);
    runSearch(nextParams);
  }

  return (
    <section className="page">
      <PageHeader eyebrow="FL-02" title="Gửi tri thức hiện trường" description={`${submission.id} - ${workflowLabels[submission.status]}`}>
        <Badge tone={workflowTones[submission.status]}>{workflowLabels[submission.status]}</Badge>
      </PageHeader>
      <ol className="stepper" aria-label="Tiến trình gửi tri thức">
        {stepOrder.map((item, index) => <li key={item} className={index === currentIndex ? "active" : index < currentIndex ? "done" : ""} aria-current={index === currentIndex ? "step" : undefined}><span>{index + 1}</span>{stepLabels[item]}</li>)}
      </ol>
      {showErrors && Object.keys(errors).length > 0 && <ErrorSummary errors={errors} />}
      <form className="submission-form" onSubmit={(event) => event.preventDefault()}>
        {step === "context" && <ContextStep submission={submission} change={change} errors={visibleErrors} />}
        {step === "resolution" && <ResolutionStep submission={submission} change={change} errors={visibleErrors} searchRelated={searchRelated} />}
        {step === "evidence" && <EvidenceStep submission={submission} change={change} updateSubmission={updateSubmission} errors={visibleErrors} />}
        {step === "review" && <ReviewStep submission={submission} change={change} navigate={navigate} errors={visibleErrors} />}
        <div className="sticky-actions">
          <button className="ghost-btn" type="button" onClick={saveExit}><Save size={16} />Lưu nháp và thoát</button>
          {currentIndex > 0 && <button className="secondary-btn" type="button" onClick={back}><ArrowLeft size={16} />Quay lại</button>}
          {step !== "review" ? <button className="primary-btn" type="button" onClick={next}>Tiếp tục <ChevronRight size={16} /></button> : <button className="primary-btn" type="button" onClick={submit}><Send size={16} />Gửi kiểm duyệt</button>}
        </div>
      </form>
    </section>
  );
}

function setDeep(item, path, value) {
  const next = structuredClone(item);
  const keys = path.split(".");
  let cursor = next;
  keys.slice(0, -1).forEach((key) => {
    cursor = cursor[key];
  });
  cursor[keys.at(-1)] = value;
  return next;
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

function ContextStep({ submission, change, errors }) {
  const context = submission.context;
  return (
    <article className="panel form-panel">
      <h3>Bước 1/4 - Bối cảnh sự cố</h3>
      <div className="form-main">
        <label><span>Work Order ID</span><input value={submission.workOrderId || ""} onChange={(event) => change("workOrderId", event.target.value)} /></label>
        <label><span>Asset ID *</span><input value={context.assetId} onChange={(event) => change("context.assetId", event.target.value.toUpperCase())} /><FieldError id="assetId" errors={errors} /></label>
      </div>
      <div className="filter-grid">
        <NativeSelect label="Loại thiết bị *" value={context.assetType} onChange={(value) => change("context.assetType", value)} options={taxonomy.assetTypes.filter((item) => item.value !== "ALL")} error={errors.assetType} />
        <label><span>Thời điểm xảy ra *</span><input type="datetime-local" value={context.incidentDateTime} onChange={(event) => change("context.incidentDateTime", event.target.value)} /><FieldError id="incidentDateTime" errors={errors} /></label>
        <label><span>Vị trí *</span><input value={context.location} onChange={(event) => change("context.location", event.target.value)} /><FieldError id="location" errors={errors} /></label>
        <NativeSelect label="Khu vực" value={context.district} onChange={(value) => change("context.district", value)} options={selectOptions.districts.map((value) => ({ value, label: value }))} />
        <NativeSelect label="Loại lỗi *" value={context.faultType} onChange={(value) => change("context.faultType", value)} options={taxonomy.faultTypes.filter((item) => item.value !== "ALL")} error={errors.faultType} />
        <NativeSelect label="Mức độ *" value={context.severity} onChange={(value) => change("context.severity", value)} options={selectOptions.severity} error={errors.severity} />
        <NativeSelect label="Phạm vi ảnh hưởng *" value={context.impactScope} onChange={(value) => change("context.impactScope", value)} options={selectOptions.impactScope} error={errors.impactScope} />
      </div>
      <div className="toggle-grid">
        <label className="check-row"><input type="checkbox" checked={context.safetyFlag} onChange={(event) => change("context.safetyFlag", event.target.checked)} />Có sự cố hoặc nguy cơ an toàn?</label>
        <label className="check-row"><input type="checkbox" checked={context.sensitiveInfoFlag} onChange={(event) => change("context.sensitiveInfoFlag", event.target.checked)} />Có thông tin nhạy cảm?</label>
      </div>
      {context.safetyFlag && <label><span>Mô tả nguy cơ an toàn *</span><textarea value={context.safetyDescription} onChange={(event) => change("context.safetyDescription", event.target.value)} /><FieldError id="safetyDescription" errors={errors} /></label>}
      <div className="form-actions">
        <button className="ghost-btn" type="button" onClick={() => change("context.assetId", currentWorkOrder.assetId)}>Quét Asset ID giả lập</button>
        <button className="ghost-btn" type="button" onClick={() => change("context.location", currentWorkOrder.location)}>Dùng vị trí hiện tại giả lập</button>
      </div>
    </article>
  );
}

function ResolutionStep({ submission, change, errors, searchRelated }) {
  const resolution = submission.resolution;
  const usage = resolution.sopUsage;
  const selectedSop = sopById(usage.appliedSopId);
  return (
    <article className="panel form-panel">
      <h3>Bước 2/4 - Chẩn đoán và hành động sửa chữa</h3>
      <button className="secondary-btn" type="button" onClick={searchRelated}><Search size={16} />Tìm tri thức liên quan trong FL-01</button>
      <label><span>Triệu chứng quan sát được *</span><textarea value={resolution.symptomSummary} onChange={(event) => change("resolution.symptomSummary", event.target.value)} /><FieldError id="symptomSummary" errors={errors} /></label>
      <div className="form-main">
        <label><span>Mã lỗi / cảnh báo</span><input value={resolution.errorCode} onChange={(event) => change("resolution.errorCode", event.target.value)} /></label>
        <label><span>Thời gian gián đoạn (phút)</span><input type="number" min="0" value={resolution.downtimeMinutes} onChange={(event) => change("resolution.downtimeMinutes", Number(event.target.value))} /></label>
      </div>
      <RepeatableTextarea label="Các bước chẩn đoán đã thực hiện *" values={resolution.diagnosisSteps} onChange={(values) => change("resolution.diagnosisSteps", values)} error={errors.diagnosisSteps} />
      <label><span>Nguyên nhân gốc rễ *</span><textarea value={resolution.rootCause} onChange={(event) => change("resolution.rootCause", event.target.value)} /><FieldError id="rootCause" errors={errors} /></label>
      <label><span>Hành động sửa chữa *</span><textarea value={resolution.repairAction} onChange={(event) => change("resolution.repairAction", event.target.value)} /><FieldError id="repairAction" errors={errors} /></label>
      <NativeSelect label="Kết quả xử lý *" value={resolution.outcome} onChange={(value) => change("resolution.outcome", value)} options={selectOptions.outcome} error={errors.outcome} />
      <label><span>Cách xác minh kết quả *</span><textarea value={resolution.verificationMethod} onChange={(event) => change("resolution.verificationMethod", event.target.value)} /><FieldError id="verificationMethod" errors={errors} /></label>
      {resolution.outcome !== "RESOLVED" && <label><span>Hành động tiếp theo *</span><textarea value={resolution.nextAction} onChange={(event) => change("resolution.nextAction", event.target.value)} /><FieldError id="nextAction" errors={errors} /></label>}
      <section className="nested-panel">
        <h4>Liên kết SOP đã sử dụng</h4>
        <NativeSelect label="Tình trạng sử dụng SOP *" value={usage.status} onChange={(value) => change("resolution.sopUsage.status", value)} options={selectOptions.sopUsage} error={errors.sopUsage} />
        {usage.status === "USED" && (
          <>
            <NativeSelect label="SOP chuẩn đã sử dụng *" value={usage.appliedSopId} onChange={(value) => {
              const sop = sopById(value);
              change("resolution.sopUsage", { ...usage, appliedSopId: value, appliedSopVersion: sop?.version || "", appliedSopStepIds: sop?.steps?.slice(0, 1).map((step) => step.id) || [] });
            }} options={sopCatalog.map((sop) => ({ value: sop.sopId, label: `${sop.sopId} - ${sop.title}` }))} error={errors.appliedSopId} />
            <label><span>Phiên bản SOP đã sử dụng *</span><input value={usage.appliedSopVersion} readOnly /><FieldError id="appliedSopVersion" errors={errors} /></label>
            {selectedSop && <CheckboxGroup label="Bước SOP đã áp dụng/liên quan *" options={selectedSop.steps.map((step) => ({ value: step.id, label: `${step.id} - ${step.label}` }))} values={usage.appliedSopStepIds} onChange={(values) => change("resolution.sopUsage.appliedSopStepIds", values)} error={errors.appliedSopStepIds} />}
            <NativeSelect label="Đánh giá SOP đã dùng *" value={usage.feedback} onChange={(value) => change("resolution.sopUsage.feedback", value)} options={selectOptions.sopFeedback} error={errors.sopFeedback} />
            <label className="check-row"><input type="checkbox" checked={usage.deviationFlag} onChange={(event) => change("resolution.sopUsage.deviationFlag", event.target.checked)} />Có thực hiện khác SOP không?</label>
            {usage.deviationFlag && <label><span>Lý do sai khác với SOP *</span><textarea value={usage.deviationReason} onChange={(event) => change("resolution.sopUsage.deviationReason", event.target.value)} /><FieldError id="deviationReason" errors={errors} /></label>}
          </>
        )}
      </section>
    </article>
  );
}

function EvidenceStep({ submission, change, updateSubmission, errors }) {
  const knowledge = submission.knowledge;
  const proposal = knowledge.sopProposal;
  const targetSop = sopById(proposal.targetSopId);
  function addMockPhoto() {
    updateSubmission(submission.id, (item) => ({
      ...item,
      attachments: [
        ...item.attachments,
        { id: makeId("ATT"), name: `anh-hien-truong-${item.attachments.length + 1}.jpg`, mimeType: "image/jpeg", sizeBytes: 1200000, category: "FIELD_PHOTO", altText: "Ảnh hiện trường mô phỏng" }
      ]
    }));
  }
  return (
    <article className="panel form-panel">
      <h3>Bước 3/4 - Bằng chứng và bài học kinh nghiệm</h3>
      <section className="upload-box">
        <Camera size={24} />
        <div>
          <strong>Upload bằng chứng giả lập</strong>
          <p>Prototype chỉ lưu metadata, không upload file thật.</p>
        </div>
        <button className="secondary-btn" type="button" onClick={addMockPhoto}>Thêm ảnh hiện trường giả lập</button>
      </section>
      <FieldError id="attachments" errors={errors} />
      {submission.attachments.length > 0 && <div className="file-list">{submission.attachments.map((file) => <span key={file.id}><FileText size={14} />{file.name}</span>)}</div>}
      <label><span>Bài học kinh nghiệm *</span><textarea value={knowledge.lessonLearned} onChange={(event) => change("knowledge.lessonLearned", event.target.value)} /><FieldError id="lessonLearned" errors={errors} /></label>
      <label><span>Khuyến nghị phòng ngừa/cải tiến</span><textarea value={knowledge.recommendation} onChange={(event) => change("knowledge.recommendation", event.target.value)} /></label>
      <NativeSelect label="Phạm vi có thể áp dụng *" value={knowledge.reusableScope} onChange={(value) => change("knowledge.reusableScope", value)} options={selectOptions.reusableScope} error={errors.reusableScope} />
      <section className="nested-panel">
        <h4>Đề xuất đối với SOP mục tiêu</h4>
        <NativeSelect label="Đề xuất đối với SOP *" value={proposal.action} onChange={(value) => change("knowledge.sopProposal.action", value)} options={selectOptions.sopProposal} error={errors.sopProposal} />
        {(proposal.action === "UPDATE_EXISTING" || proposal.action === "NEW_SOP" || proposal.action === "UNSURE") && (
          <>
            {proposal.action === "UPDATE_EXISTING" && <NativeSelect label="SOP mục tiêu cần cập nhật *" value={proposal.targetSopId} onChange={(value) => change("knowledge.sopProposal.targetSopId", value)} options={sopCatalog.map((sop) => ({ value: sop.sopId, label: `${sop.sopId} - ${sop.title}` }))} error={errors.targetSopId} />}
            {proposal.action === "UPDATE_EXISTING" && targetSop && <CheckboxGroup label="Bước SOP bị ảnh hưởng *" options={targetSop.steps.map((step) => ({ value: step.id, label: `${step.id} - ${step.label}` }))} values={proposal.affectedStepIds} onChange={(values) => change("knowledge.sopProposal.affectedStepIds", values)} error={errors.affectedStepIds} />}
            <label><span>Vấn đề/khoảng trống phát hiện trong SOP</span><textarea value={proposal.gapSummary} onChange={(event) => change("knowledge.sopProposal.gapSummary", event.target.value)} /><FieldError id="gapSummary" errors={errors} /></label>
            <NativeSelect label="Loại thay đổi đề xuất" value={proposal.changeType} onChange={(value) => change("knowledge.sopProposal.changeType", value)} options={selectOptions.changeType} />
            <label><span>Nội dung đề xuất điều chỉnh SOP *</span><textarea value={proposal.proposedChange} onChange={(event) => change("knowledge.sopProposal.proposedChange", event.target.value)} /><FieldError id="proposedChange" errors={errors} /></label>
            {proposal.targetSopId && proposal.targetSopId !== submission.resolution.sopUsage.appliedSopId && <label><span>Lý do chọn SOP mục tiêu khác SOP đã dùng *</span><textarea value={proposal.targetSopRationale} onChange={(event) => change("knowledge.sopProposal.targetSopRationale", event.target.value)} /><FieldError id="targetSopRationale" errors={errors} /></label>}
          </>
        )}
      </section>
    </article>
  );
}

function ReviewStep({ submission, change, navigate, errors }) {
  return (
    <article className="panel form-panel review-summary">
      <h3>Bước 4/4 - Xem lại trước khi gửi</h3>
      <SummaryBlock title="Bối cảnh" edit={() => navigate("field-submission", { id: submission.id, step: "context" })} rows={[
        ["Asset", submission.context.assetId],
        ["Loại lỗi", taxonomyLabel("faultTypes", submission.context.faultType)],
        ["Mức độ", optionLabel(selectOptions.severity, submission.context.severity)],
        ["Vị trí", submission.context.location]
      ]} />
      <SummaryBlock title="Chẩn đoán & xử lý" edit={() => navigate("field-submission", { id: submission.id, step: "resolution" })} rows={[
        ["Triệu chứng", submission.resolution.symptomSummary],
        ["Nguyên nhân", submission.resolution.rootCause],
        ["Kết quả", optionLabel(selectOptions.outcome, submission.resolution.outcome)],
        ["SOP đã dùng", submission.resolution.sopUsage.appliedSopId ? `${submission.resolution.sopUsage.appliedSopId} ${submission.resolution.sopUsage.appliedSopVersion}` : optionLabel(selectOptions.sopUsage, submission.resolution.sopUsage.status)]
      ]} />
      <SummaryBlock title="Bằng chứng & bài học" edit={() => navigate("field-submission", { id: submission.id, step: "evidence" })} rows={[
        ["Bằng chứng", submission.attachments.map((item) => item.name).join(", ") || "Chưa có"],
        ["Bài học", submission.knowledge.lessonLearned],
        ["SOP mục tiêu", submission.knowledge.sopProposal.targetSopId || optionLabel(selectOptions.sopProposal, submission.knowledge.sopProposal.action)],
        ["Đề xuất thay đổi", submission.knowledge.sopProposal.proposedChange]
      ]} />
      <label className="check-row confirmation-row"><input type="checkbox" checked={Boolean(submission.confirmation)} onChange={(event) => change("confirmation", event.target.checked)} />Tôi xác nhận nội dung đúng theo thông tin tôi có và không chứa dữ liệu cá nhân không cần thiết.</label>
      <FieldError id="confirmation" errors={errors} />
    </article>
  );
}

function SummaryBlock({ title, rows, edit }) {
  return (
    <section className="summary-block">
      <div><h4>{title}</h4><button className="ghost-btn" type="button" onClick={edit}>Sửa</button></div>
      <InfoGrid rows={rows} />
    </section>
  );
}

function NativeSelect({ label, value, onChange, options, error }) {
  return (
    <label>
      <span>{label}</span>
      <select value={value || ""} onChange={(event) => onChange(event.target.value)}>
        <option value="" disabled>Chọn...</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

function CheckboxGroup({ label, options, values = [], onChange, error }) {
  function toggle(value) {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }
  return (
    <fieldset className="checkbox-group">
      <legend>{label}</legend>
      {options.map((option) => <label key={option.value} className="check-row"><input type="checkbox" checked={values.includes(option.value)} onChange={() => toggle(option.value)} />{option.label}</label>)}
      {error && <small className="field-error">{error}</small>}
    </fieldset>
  );
}

function RepeatableTextarea({ label, values, onChange, error }) {
  return (
    <fieldset className="repeatable">
      <legend>{label}</legend>
      {values.map((value, index) => (
        <label key={index}>
          <span>Bước {index + 1}</span>
          <textarea value={value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
        </label>
      ))}
      <button className="ghost-btn" type="button" onClick={() => onChange([...values, ""])}>Thêm bước</button>
      {error && <small className="field-error">{error}</small>}
    </fieldset>
  );
}

function SubmissionSuccess({ submission, navigate }) {
  return (
    <section className="page">
      <article className="success-screen">
        <CheckCircle2 size={46} />
        <h2>Đã gửi tri thức hiện trường để kiểm duyệt.</h2>
        <p>Mã submission: <strong>{submission.id}</strong>. Knowledge Manager sẽ kiểm tra và có thể yêu cầu bổ sung.</p>
        <div className="form-actions">
          <button className="primary-btn" type="button" onClick={() => navigate("submission-detail", { id: submission.id })}>Xem submission</button>
          <button className="secondary-btn" type="button" onClick={() => navigate("my-submissions")}>Submission của tôi</button>
          <button className="ghost-btn" type="button" onClick={() => navigate("dashboard")}>Về Dashboard</button>
        </div>
      </article>
    </section>
  );
}

function MySubmissions({ submissions, navigate, currentUser, knowledgeCatalog, openItem }) {
  const mine = submissions.filter((item) => item.submittedBy === currentUser.id || currentUser.role === "ADMINISTRATOR");
  const groups = [
    ["Tất cả", mine.length],
    ["Bản nháp", mine.filter((item) => item.status === "DRAFT").length],
    ["Chờ duyệt", mine.filter((item) => ["SUBMITTED", "RESUBMITTED", "IN_REVIEW"].includes(item.status)).length],
    ["Cần bổ sung", mine.filter((item) => item.status === "CHANGES_REQUESTED").length],
    ["Đã xuất bản", mine.filter((item) => item.status === "PUBLISHED").length],
    ["Từ chối", mine.filter((item) => item.status === "REJECTED").length]
  ];
  return (
    <section className="page">
      <PageHeader title="Submission của tôi" description="Theo dõi bản nháp, submission chờ duyệt và các phản hồi cần bổ sung." />
      <div className="status-tabs">{groups.map(([label, count]) => <span key={label}>{label}<strong>{count}</strong></span>)}</div>
      <div className="submission-list">
        {mine.map((submission) => <SubmissionCard key={submission.id} submission={submission} navigate={navigate} knowledgeCatalog={knowledgeCatalog} openItem={openItem} />)}
      </div>
    </section>
  );
}

function SubmissionCard({ submission, navigate, knowledgeCatalog, openItem }) {
  const publishedItem = submission.knowledgeId ? knowledgeCatalog.find((item) => item.id === submission.knowledgeId) : null;
  return (
    <article className="submission-card">
      <div>
        <Badge tone={workflowTones[submission.status]}>{workflowLabels[submission.status]}</Badge>
        <h3>{submission.id} - {submission.context.assetId}</h3>
        <p>{submission.resolution.symptomSummary}</p>
        <small>Cập nhật: {displayDateTime(submission.updatedAt)}</small>
      </div>
      <div className="submission-actions">
        {submission.status === "DRAFT" && <button className="primary-btn" onClick={() => navigate("field-submission", { id: submission.id, step: "context" })} type="button">Tiếp tục soạn</button>}
        {submission.status === "CHANGES_REQUESTED" && <button className="primary-btn" onClick={() => navigate("field-submission", { id: submission.id, step: "evidence" })} type="button">Sửa và gửi lại</button>}
        {publishedItem && <button className="primary-btn" onClick={() => openItem(publishedItem)} type="button">Xem tri thức đã xuất bản</button>}
        <button className="secondary-btn" onClick={() => navigate("submission-detail", { id: submission.id })} type="button">Xem chi tiết</button>
      </div>
    </article>
  );
}

function SubmissionDetail({ submission, navigate, currentUser, knowledgeCatalog, openItem }) {
  const publishedItem = submission.knowledgeId ? knowledgeCatalog.find((item) => item.id === submission.knowledgeId) : null;
  return (
    <section className="page detail-page">
      <BackButton label="Về Submission của tôi" onClick={() => navigate("my-submissions")} />
      <PageHeader title={`${submission.id} - ${submission.context.assetId}`} description={submission.resolution.symptomSummary}>
        <Badge tone={workflowTones[submission.status]}>{workflowLabels[submission.status]}</Badge>
      </PageHeader>
      <div className="detail-layout">
        <article className="panel article">
          <Section title="Dòng thời gian trạng thái">
            <Timeline events={submission.reviewHistory} status={submission.status} />
          </Section>
          <Section title="Nội dung submission">
            <InfoGrid rows={[
              ["Asset", submission.context.assetId],
              ["Vị trí", submission.context.location],
              ["Loại lỗi", taxonomyLabel("faultTypes", submission.context.faultType)],
              ["Nguyên nhân", submission.resolution.rootCause],
              ["Hành động sửa chữa", submission.resolution.repairAction],
              ["Bài học", submission.knowledge.lessonLearned]
            ]} />
          </Section>
          <Section title="Truy vết SOP">
            <InfoGrid rows={[
              ["SOP đã dùng", submission.resolution.sopUsage.appliedSopId ? `${submission.resolution.sopUsage.appliedSopId} ${submission.resolution.sopUsage.appliedSopVersion}` : optionLabel(selectOptions.sopUsage, submission.resolution.sopUsage.status)],
              ["Bước đã dùng", sopStepLabels(submission.resolution.sopUsage.appliedSopId, submission.resolution.sopUsage.appliedSopStepIds)],
              ["SOP mục tiêu", submission.knowledge.sopProposal.targetSopId],
              ["Khoảng trống", submission.knowledge.sopProposal.gapSummary],
              ["Đề xuất", submission.knowledge.sopProposal.proposedChange]
            ]} />
          </Section>
        </article>
        <aside className="detail-aside">
          <article className="panel action-panel">
            <h3>Hành động</h3>
            {submission.status === "CHANGES_REQUESTED" && <button className="primary-btn wide" onClick={() => navigate("field-submission", { id: submission.id, step: "evidence" })} type="button">Chỉnh sửa và gửi lại</button>}
            {submission.status === "DRAFT" && <button className="primary-btn wide" onClick={() => navigate("field-submission", { id: submission.id, step: "context" })} type="button">Tiếp tục soạn</button>}
            {publishedItem && <button className="primary-btn wide" onClick={() => openItem(publishedItem)} type="button">Mở tri thức đã xuất bản</button>}
          </article>
          <article className="panel">
            <h3>Phản hồi kiểm duyệt</h3>
            <Timeline events={submission.reviewHistory.filter((event) => ["REQUEST_CHANGES", "REJECT", "APPROVE_PUBLISH"].includes(event.action))} />
          </article>
        </aside>
      </div>
    </section>
  );
}

function ReviewQueue({ submissions, navigate, currentRole }) {
  if (currentRole !== "KNOWLEDGE_MANAGER" && currentRole !== "ADMINISTRATOR") {
    return <AccessDenied navigate={navigate} currentRole={currentRole} />;
  }
  const queue = submissions
    .filter((item) => ["SUBMITTED", "RESUBMITTED", "IN_REVIEW"].includes(item.status))
    .sort((a, b) => severityRank(b.context.severity) - severityRank(a.context.severity) || new Date(a.submittedAt || a.updatedAt) - new Date(b.submittedAt || b.updatedAt));

  return (
    <section className="page">
      <PageHeader title="Hàng đợi xét duyệt FL-02" description="Knowledge Manager ưu tiên submission theo mức độ, safety flag và thời gian gửi." />
      <div className="queue-filters">
        <span>Submitted / Resubmitted / In Review</span>
        <span>Ưu tiên Critical/Safety</span>
        <span>{queue.length} item chờ xử lý</span>
      </div>
      {queue.length === 0 ? <article className="empty-state"><ClipboardCheck size={34} /><h3>Không có submission chờ duyệt.</h3><p>Reset demo data để khôi phục seed queue.</p></article> : (
        <div className="submission-list">
          {queue.map((submission) => (
            <article className="submission-card queue-card" key={submission.id}>
              <div>
                <div className="card-badges">
                  <Badge tone={workflowTones[submission.status]}>{workflowLabels[submission.status]}</Badge>
                  <Badge tone={submission.context.severity === "CRITICAL" || submission.context.safetyFlag ? "danger" : "warning"}>{optionLabel(selectOptions.severity, submission.context.severity)}</Badge>
                  {submission.context.safetyFlag && <Badge tone="danger">Safety</Badge>}
                  {submission.knowledge.sopProposal.action !== "NO_CHANGE" && <Badge tone="neutral">Có đề xuất SOP</Badge>}
                </div>
                <h3>{submission.id} - {submission.context.assetId}</h3>
                <p>{submission.resolution.symptomSummary}</p>
                <small>Gửi bởi {submission.submittedBy} - {displayDateTime(submission.submittedAt || submission.updatedAt)}</small>
              </div>
              <button className="primary-btn" type="button" onClick={() => navigate("review-detail", { id: submission.id })}>Mở kiểm duyệt</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function severityRank(value) {
  return { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }[value] || 0;
}

function ReviewDetail({ submission, updateSubmission, currentUser, currentRole, navigate, setToast, setPublishedOutputs, setSopRequests, openItem, knowledgeCatalog }) {
  const [checklist, setChecklist] = useState({
    context: "PASS",
    technical: "PASS",
    evidence: submission.context.safetyFlag ? "NEEDS_CHANGE" : "PASS",
    conflict: "PASS",
    privacy: "PASS",
    reusable: "YES",
    sopTraceability: submission.resolution.sopUsage.status === "USED" || submission.knowledge.sopProposal.action !== "NO_CHANGE" ? "PASS" : "NA"
  });
  const [decision, setDecision] = useState(null);

  if (currentRole !== "KNOWLEDGE_MANAGER" && currentRole !== "ADMINISTRATOR") {
    return <AccessDenied navigate={navigate} currentRole={currentRole} />;
  }

  const isOwnSubmission = currentUser.id === submission.submittedBy;
  const checklistPass = checklist.context === "PASS"
    && checklist.technical === "PASS"
    && ["PASS", "NA"].includes(checklist.evidence)
    && checklist.conflict === "PASS"
    && checklist.privacy === "PASS"
    && checklist.reusable === "YES"
    && ["PASS", "NA"].includes(checklist.sopTraceability);
  const canApprove = !isOwnSubmission && checklistPass;

  function markInReview() {
    if (submission.status === "IN_REVIEW") return;
    updateSubmission(submission.id, (item) => ({
      ...item,
      status: "IN_REVIEW",
      reviewStartedAt: nowIso(),
      reviewHistory: [...(item.reviewHistory || []), { id: makeId("EVT"), action: "START_REVIEW", actorId: currentUser.id, comment: "Bắt đầu kiểm duyệt.", createdAt: nowIso() }]
    }));
    setToast("Đã chuyển submission sang trạng thái đang kiểm duyệt.");
  }

  function requestChanges(payload) {
    updateSubmission(submission.id, (item) => ({
      ...item,
      status: "CHANGES_REQUESTED",
      reviewHistory: [...(item.reviewHistory || []), { id: makeId("EVT"), action: "REQUEST_CHANGES", actorId: currentUser.id, comment: payload.comment, requestedFieldIds: payload.requestedFieldIds, createdAt: nowIso() }]
    }));
    setDecision(null);
    setToast("Đã yêu cầu Field Technician bổ sung thông tin.");
    navigate("review-queue");
  }

  function reject(payload) {
    updateSubmission(submission.id, (item) => ({
      ...item,
      status: "REJECTED",
      reviewHistory: [...(item.reviewHistory || []), { id: makeId("EVT"), action: "REJECT", actorId: currentUser.id, comment: payload.comment, reasonCode: payload.reasonCode, createdAt: nowIso() }]
    }));
    setDecision(null);
    setToast("Đã từ chối submission.");
    navigate("review-queue");
  }

  function publish(payload) {
    const published = makePublishedKnowledge(submission, payload, currentUser);
    const sopRequest = payload.sopPotential === "NONE" ? null : {
      id: published.sopChangeRequestId || makeId("SOPREQ"),
      type: payload.sopPotential,
      sourceSubmissionId: submission.id,
      sourceKnowledgeId: published.id,
      appliedSopRef: published.appliedSopRefs?.[0] || null,
      targetSopId: payload.targetSopId,
      affectedStepIds: payload.affectedSopStepIds,
      gapSummary: payload.sopGapSummary,
      proposedChange: payload.proposedSopChange,
      status: "MOCK_HANDOFF",
      createdAt: nowIso()
    };
    setPublishedOutputs((items) => [published, ...items.filter((item) => item.id !== published.id)]);
    if (sopRequest) setSopRequests((items) => [sopRequest, ...items]);
    updateSubmission(submission.id, (item) => ({
      ...item,
      status: "PUBLISHED",
      knowledgeId: published.id,
      publishedAt: published.publishedAt,
      reviewHistory: [...(item.reviewHistory || []), { id: makeId("EVT"), action: "APPROVE_PUBLISH", actorId: currentUser.id, comment: "Phê duyệt và xuất bản tri thức.", createdAt: nowIso() }]
    }));
    setDecision(null);
    setToast(sopRequest ? "Đã publish tri thức và tạo handoff mock sang FL-03." : "Đã publish tri thức vào kho tri thức.");
    navigate("knowledge-detail", { id: published.id });
  }

  return (
    <section className="page detail-page">
      <BackButton label="Về hàng đợi xét duyệt" onClick={() => navigate("review-queue")} />
      <PageHeader title={`Kiểm duyệt ${submission.id}`} description={submission.resolution.symptomSummary}>
        <Badge tone={workflowTones[submission.status]}>{workflowLabels[submission.status]}</Badge>
        {isOwnSubmission && <Badge tone="danger">Không được tự duyệt</Badge>}
      </PageHeader>
      <div className="detail-layout">
        <article className="panel article">
          <Section title="Header">
            <InfoGrid rows={[
              ["Người gửi", submission.submittedBy],
              ["Asset", submission.context.assetId],
              ["Severity", optionLabel(selectOptions.severity, submission.context.severity)],
              ["Safety", submission.context.safetyFlag ? "Có" : "Không"],
              ["Submitted", displayDateTime(submission.submittedAt || submission.updatedAt)]
            ]} />
            <button className="secondary-btn" type="button" onClick={markInReview}>Bắt đầu kiểm duyệt</button>
          </Section>
          <Section title="Bối cảnh">
            <InfoGrid rows={[
              ["Loại thiết bị", taxonomyLabel("assetTypes", submission.context.assetType)],
              ["Vị trí", submission.context.location],
              ["Loại lỗi", taxonomyLabel("faultTypes", submission.context.faultType)],
              ["Phạm vi", optionLabel(selectOptions.impactScope, submission.context.impactScope)]
            ]} />
          </Section>
          <Section title="Chẩn đoán và xử lý">
            <p><strong>Triệu chứng:</strong> {submission.resolution.symptomSummary}</p>
            <Checklist items={submission.resolution.diagnosisSteps} />
            <p><strong>Nguyên nhân:</strong> {submission.resolution.rootCause}</p>
            <p><strong>Hành động:</strong> {submission.resolution.repairAction}</p>
            <p><strong>Xác minh:</strong> {submission.resolution.verificationMethod}</p>
          </Section>
          <Section title="Bằng chứng và bài học">
            <div className="file-list">{submission.attachments.map((file) => <span key={file.id}><FileText size={14} />{file.name}</span>)}</div>
            <div className="lesson-box">{submission.knowledge.lessonLearned}</div>
            <p>{submission.knowledge.recommendation}</p>
          </Section>
          <Section title="Truy vết SOP">
            <InfoGrid rows={[
              ["SOP đã dùng", submission.resolution.sopUsage.appliedSopId ? `${submission.resolution.sopUsage.appliedSopId} ${submission.resolution.sopUsage.appliedSopVersion}` : optionLabel(selectOptions.sopUsage, submission.resolution.sopUsage.status)],
              ["Bước SOP đã dùng", sopStepLabels(submission.resolution.sopUsage.appliedSopId, submission.resolution.sopUsage.appliedSopStepIds)],
              ["Đánh giá SOP", optionLabel(selectOptions.sopFeedback, submission.resolution.sopUsage.feedback)],
              ["SOP mục tiêu", submission.knowledge.sopProposal.targetSopId],
              ["Bước bị ảnh hưởng", sopStepLabels(submission.knowledge.sopProposal.targetSopId, submission.knowledge.sopProposal.affectedStepIds)],
              ["Khoảng trống", submission.knowledge.sopProposal.gapSummary],
              ["Đề xuất thay đổi", submission.knowledge.sopProposal.proposedChange]
            ]} />
          </Section>
        </article>
        <aside className="detail-aside">
          <article className="panel action-panel">
            <h3>Checklist kiểm duyệt</h3>
            <ReviewCheck label="Thông tin đủ bối cảnh" value={checklist.context} onChange={(value) => setChecklist({ ...checklist, context: value })} />
            <ReviewCheck label="Nguyên nhân và hành động hợp lý" value={checklist.technical} onChange={(value) => setChecklist({ ...checklist, technical: value })} />
            <ReviewCheck label="Bằng chứng đủ cho mức rủi ro" value={checklist.evidence} onChange={(value) => setChecklist({ ...checklist, evidence: value })} allowNA />
            <ReviewCheck label="Không mâu thuẫn tài liệu hiện hành" value={checklist.conflict} onChange={(value) => setChecklist({ ...checklist, conflict: value })} />
            <ReviewCheck label="Không chứa dữ liệu cá nhân không cần thiết" value={checklist.privacy} onChange={(value) => setChecklist({ ...checklist, privacy: value })} />
            <ReviewCheck label="Có giá trị tái sử dụng" value={checklist.reusable} onChange={(value) => setChecklist({ ...checklist, reusable: value })} yesNo />
            <ReviewCheck label="Truy vết SOP rõ ràng" value={checklist.sopTraceability} onChange={(value) => setChecklist({ ...checklist, sopTraceability: value })} allowNA />
          </article>
          <article className="panel action-panel decision-panel">
            <h3>Quyết định</h3>
            <button className="secondary-btn wide" type="button" onClick={() => setDecision("REQUEST_CHANGES")}>Yêu cầu bổ sung</button>
            <button className="ghost-btn wide danger-text" type="button" onClick={() => setDecision("REJECT")}>Từ chối</button>
            <button className="primary-btn wide" type="button" disabled={!canApprove} onClick={() => setDecision("PUBLISH")}>Phê duyệt & xuất bản</button>
            {!checklistPass && <p className="hint">Approve bị khóa cho đến khi checklist đạt.</p>}
            {isOwnSubmission && <p className="hint">SoD: người tạo không được tự phê duyệt.</p>}
          </article>
        </aside>
      </div>
      {decision === "REQUEST_CHANGES" && <RequestChangesModal close={() => setDecision(null)} confirm={requestChanges} />}
      {decision === "REJECT" && <RejectModal close={() => setDecision(null)} confirm={reject} />}
      {decision === "PUBLISH" && <PublishModal submission={submission} close={() => setDecision(null)} confirm={publish} />}
    </section>
  );
}

function ReviewCheck({ label, value, onChange, allowNA = false, yesNo = false }) {
  const options = yesNo ? [{ value: "YES", label: "Có" }, { value: "NO", label: "Không" }] : [{ value: "PASS", label: "Đạt" }, { value: "NEEDS_CHANGE", label: "Cần sửa" }, ...(allowNA ? [{ value: "NA", label: "Không áp dụng" }] : [])];
  return <NativeSelect label={label} value={value} onChange={onChange} options={options} />;
}

function RequestChangesModal({ close, confirm }) {
  const [comment, setComment] = useState("Bổ sung ảnh hiện trường và mô tả rõ hơn cách xác minh sau sửa.");
  const [fields, setFields] = useState(["EVD-PHOTOS", "RES-VERIFY"]);
  const canSubmit = comment.trim().length >= 20 && fields.length > 0;
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="request-changes-title">
        <h2 id="request-changes-title">Yêu cầu bổ sung</h2>
        <CheckboxGroup label="Section/field cần sửa" values={fields} onChange={setFields} options={[
          { value: "CTX", label: "Bối cảnh" },
          { value: "RES-VERIFY", label: "Cách xác minh" },
          { value: "EVD-PHOTOS", label: "Ảnh hiện trường" },
          { value: "LESSON", label: "Bài học kinh nghiệm" },
          { value: "SOP_TRACE", label: "Truy vết SOP" }
        ]} />
        <label><span>Nhận xét cụ thể *</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} /></label>
        <div className="form-actions"><button className="ghost-btn" onClick={close} type="button">Hủy</button><button className="primary-btn" disabled={!canSubmit} onClick={() => confirm({ comment, requestedFieldIds: fields })} type="button">Gửi yêu cầu bổ sung</button></div>
      </section>
    </div>
  );
}

function RejectModal({ close, confirm }) {
  const [reasonCode, setReasonCode] = useState("INSUFFICIENT_VALUE");
  const [comment, setComment] = useState("Nội dung chưa đủ bằng chứng và chưa có giá trị tái sử dụng rõ ràng.");
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="reject-title">
        <h2 id="reject-title">Từ chối submission</h2>
        <NativeSelect label="Lý do từ chối" value={reasonCode} onChange={setReasonCode} options={[
          { value: "DUPLICATE", label: "Trùng nội dung" },
          { value: "INVALID", label: "Không hợp lệ" },
          { value: "INSUFFICIENT_VALUE", label: "Giá trị tái sử dụng chưa đủ" },
          { value: "POLICY_VIOLATION", label: "Vi phạm chính sách" },
          { value: "OTHER", label: "Khác" }
        ]} />
        <label><span>Nhận xét *</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} /></label>
        <div className="form-actions"><button className="ghost-btn" onClick={close} type="button">Hủy</button><button className="primary-btn danger-btn" disabled={comment.trim().length < 20} onClick={() => confirm({ reasonCode, comment })} type="button">Xác nhận từ chối</button></div>
      </section>
    </div>
  );
}

function PublishModal({ submission, close, confirm }) {
  const proposal = submission.knowledge.sopProposal;
  const applied = submission.resolution.sopUsage;
  const defaultReviewDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [form, setForm] = useState({
    publicationType: "REPAIR_CASE",
    title: `Ca xử lý ${submission.context.assetId}: ${taxonomyLabel("faultTypes", submission.context.faultType)}`,
    summary: submission.knowledge.lessonLearned || submission.resolution.symptomSummary,
    categoryId: "TROUBLESHOOTING",
    securityLevel: submission.context.sensitiveInfoFlag ? "RESTRICTED" : "INTERNAL",
    allowedRoles: ["FIELD_TECHNICIAN", "CONTRIBUTOR", "KNOWLEDGE_MANAGER"],
    reviewDate: defaultReviewDate,
    sopPotential: proposal.action === "UPDATE_EXISTING" ? "UPDATE_EXISTING" : proposal.action === "NEW_SOP" ? "NEW_SOP" : "NONE",
    targetSopId: proposal.targetSopId,
    affectedSopStepIds: proposal.affectedStepIds,
    sopGapSummary: proposal.gapSummary,
    proposedSopChange: proposal.proposedChange,
    confirmPublish: false
  });
  const targetSop = sopById(form.targetSopId);
  const needsSop = form.sopPotential !== "NONE";
  const canSubmit = form.title.trim().length >= 10
    && form.summary.trim().length >= 30
    && form.reviewDate
    && form.confirmPublish
    && (!needsSop || (form.sopGapSummary.trim().length >= 20 && form.proposedSopChange.trim().length >= 20 && (form.sopPotential !== "UPDATE_EXISTING" || (form.targetSopId && form.affectedSopStepIds.length > 0))));

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal large-modal" role="dialog" aria-modal="true" aria-labelledby="publish-title">
        <h2 id="publish-title">Phê duyệt và xuất bản</h2>
        {applied.status === "USED" && <div className="trace-note"><strong>SOP đã dùng:</strong> {applied.appliedSopId} {applied.appliedSopVersion} - {applied.appliedSopStepIds.join(", ")}</div>}
        <NativeSelect label="Loại tri thức xuất bản" value={form.publicationType} onChange={(value) => setForm({ ...form, publicationType: value })} options={selectOptions.publicationType} />
        <label><span>Tiêu đề *</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label><span>Tóm tắt *</span><textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} /></label>
        <div className="form-main">
          <NativeSelect label="Danh mục" value={form.categoryId} onChange={(value) => setForm({ ...form, categoryId: value })} options={taxonomy.categories.filter((item) => item.value !== "ALL")} />
          <NativeSelect label="Security" value={form.securityLevel} onChange={(value) => setForm({ ...form, securityLevel: value })} options={[{ value: "INTERNAL", label: "Nội bộ" }, { value: "RESTRICTED", label: "Giới hạn" }, { value: "PUBLIC", label: "Công khai" }]} />
        </div>
        <label><span>Ngày review *</span><input type="date" value={form.reviewDate} onChange={(event) => setForm({ ...form, reviewDate: event.target.value })} /></label>
        <section className="nested-panel">
          <h4>Đánh giá tiềm năng SOP / handoff FL-03</h4>
          <NativeSelect label="Tiềm năng SOP" value={form.sopPotential} onChange={(value) => setForm({ ...form, sopPotential: value })} options={[{ value: "NONE", label: "Không chuyển SOP" }, { value: "UPDATE_EXISTING", label: "Cập nhật SOP hiện có" }, { value: "NEW_SOP", label: "Đề xuất SOP mới" }]} />
          {needsSop && (
            <>
              {form.sopPotential === "UPDATE_EXISTING" && <NativeSelect label="SOP mục tiêu" value={form.targetSopId} onChange={(value) => setForm({ ...form, targetSopId: value, affectedSopStepIds: [] })} options={sopCatalog.map((sop) => ({ value: sop.sopId, label: `${sop.sopId} - ${sop.title}` }))} />}
              {form.sopPotential === "UPDATE_EXISTING" && targetSop && <CheckboxGroup label="Bước SOP bị ảnh hưởng" values={form.affectedSopStepIds} onChange={(values) => setForm({ ...form, affectedSopStepIds: values })} options={targetSop.steps.map((step) => ({ value: step.id, label: `${step.id} - ${step.label}` }))} />}
              <label><span>Khoảng trống SOP *</span><textarea value={form.sopGapSummary} onChange={(event) => setForm({ ...form, sopGapSummary: event.target.value })} /></label>
              <label><span>Nội dung đề xuất thay đổi *</span><textarea value={form.proposedSopChange} onChange={(event) => setForm({ ...form, proposedSopChange: event.target.value })} /></label>
            </>
          )}
        </section>
        <label className="check-row confirmation-row"><input type="checkbox" checked={form.confirmPublish} onChange={(event) => setForm({ ...form, confirmPublish: event.target.checked })} />Tôi xác nhận chịu trách nhiệm với nội dung được xuất bản.</label>
        <div className="form-actions"><button className="ghost-btn" onClick={close} type="button">Hủy</button><button className="primary-btn" disabled={!canSubmit} onClick={() => confirm(form)} type="button">Xuất bản tri thức</button></div>
      </section>
    </div>
  );
}

function Timeline({ events = [], status }) {
  if (!events.length) return <p className="hint">Chưa có event kiểm duyệt. Trạng thái hiện tại: {workflowLabels[status] || status}</p>;
  return <ol className="timeline">{events.map((event) => <li key={event.id}><strong>{event.action}</strong><span>{displayDateTime(event.createdAt)}</span><p>{event.comment}</p></li>)}</ol>;
}

function BackButton({ label, onClick }) {
  return <button className="back-btn" type="button" onClick={onClick}><ArrowLeft size={16} />{label}</button>;
}

function SopLibrary({ openItem, knowledgeCatalog = knowledgeItems }) {
  const sops = knowledgeCatalog.filter((item) => item.contentType === "SOP");
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

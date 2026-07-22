export const lifecycleStatusLabels = {
  PUBLISHED: "Đang hiệu lực",
  REVIEW_DUE: "Đến hạn rà soát",
  FLAGGED: "Bị gắn cờ",
  UNDER_REVIEW: "Đang rà soát",
  UPDATE_REQUIRED: "Cần cập nhật",
  UNDER_REVISION: "Đang cập nhật",
  SUSPENDED: "Tạm ngừng",
  SUPERSEDED: "Đã được thay thế",
  ARCHIVED: "Đã lưu trữ"
};

export const lifecycleStatusTones = {
  PUBLISHED: "good",
  REVIEW_DUE: "warning",
  FLAGGED: "warning",
  UNDER_REVIEW: "warning",
  UPDATE_REQUIRED: "danger",
  UNDER_REVISION: "warning",
  SUSPENDED: "danger",
  SUPERSEDED: "neutral",
  ARCHIVED: "neutral"
};

export const reviewTaskStatusLabels = {
  OPEN: "Đang mở",
  IN_PROGRESS: "Đang xử lý",
  WAITING_FOR_REVISION: "Chờ bản sửa",
  IN_REVIEW: "Chờ tái duyệt",
  CHANGES_REQUESTED: "Cần chỉnh sửa",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy"
};

export const issueTypeLabels = {
  OUTDATED: "Lỗi thời",
  INCORRECT: "Chưa chính xác",
  UNSAFE: "Không an toàn",
  MISSING_STEP: "Thiếu bước",
  BROKEN_LINK: "Liên kết hỏng",
  OTHER: "Khác"
};

export const triggerTypeLabels = {
  SCHEDULED_REVIEW: "Đến hạn rà soát",
  USER_ISSUE_REPORT: "Người dùng báo vấn đề",
  FEEDBACK_THRESHOLD: "Feedback vượt ngưỡng",
  SOURCE_CHANGE: "Nguồn/OEM thay đổi",
  MANUAL_REVIEW: "Manager chủ động rà soát",
  RELATED_FLOW_SIGNAL: "Tín hiệu từ FL-02/FL-04"
};

export const priorityLabels = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Nghiêm trọng"
};

export const decisionLabels = {
  RECONFIRM: "Xác nhận lại",
  REVISE: "Tạo bản sửa",
  SUSPEND: "Tạm ngừng",
  SUPERSEDE: "Thay thế",
  ARCHIVE: "Lưu trữ",
  APPROVE_REVISION: "Phê duyệt bản sửa"
};

export const issueTypeOptions = [
  { value: "OUTDATED", label: "Nội dung lỗi thời" },
  { value: "INCORRECT", label: "Nội dung chưa chính xác" },
  { value: "UNSAFE", label: "Không an toàn" },
  { value: "MISSING_STEP", label: "Thiếu bước" },
  { value: "BROKEN_LINK", label: "Liên kết hỏng" },
  { value: "OTHER", label: "Khác" }
];

export const severityOptions = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "CRITICAL", label: "Nghiêm trọng" }
];

export const changeTypeOptions = [
  { value: "MINOR", label: "Minor - chỉnh sửa nhỏ" },
  { value: "MAJOR", label: "Major - thay đổi bước/phạm vi/an toàn" }
];

export const visibilityActionOptions = [
  { value: "KEEP_WITH_WARNING", label: "Giữ bản cũ kèm cảnh báo" },
  { value: "SUSPEND_OLD", label: "Tạm ngừng bản cũ" }
];

export const defaultReviewChecklist = [
  { itemId: "TECH-01", label: "Nội dung kỹ thuật còn chính xác", result: "PASS", critical: false, note: "" },
  { itemId: "SAFETY-01", label: "An toàn/PPE/điều kiện dừng còn phù hợp", result: "PASS", critical: true, note: "" },
  { itemId: "SOURCE-01", label: "Nguồn/OEM/policy còn hiệu lực", result: "PASS", critical: false, note: "" },
  { itemId: "FIELD-01", label: "Có thể áp dụng ngoài hiện trường", result: "PASS", critical: false, note: "" }
];

export function nowIso() {
  return new Date().toISOString();
}

export function makeLifecycleId(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

export function nextReviewDate(days = 180) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const seedLifecycleItems = [
  {
    knowledgeId: "SOP-NET-007",
    status: "REVIEW_DUE",
    currentVersion: "v2.1",
    knowledgeManagerId: "KM-001",
    authorId: "KC-001",
    lastReviewedAt: "2026-01-15T09:00:00+07:00",
    nextReviewDate: "2026-07-10",
    reviewPolicyId: "RP-SOP-HIGH",
    usageStats: { views: 184, reuseCount: 37, helpfulRate: 92 },
    relations: []
  },
  {
    knowledgeId: "SOP-IOT-003",
    status: "FLAGGED",
    currentVersion: "v1.8",
    knowledgeManagerId: "KM-001",
    authorId: "KC-001",
    lastReviewedAt: "2025-03-10T09:00:00+07:00",
    nextReviewDate: "2025-03-10",
    reviewPolicyId: "RP-SOP-HIGH",
    usageStats: { views: 54, reuseCount: 8, helpfulRate: 74 },
    relations: []
  },
  {
    knowledgeId: "CASE-CABLE-042",
    status: "PUBLISHED",
    currentVersion: "v1.0",
    knowledgeManagerId: "KM-001",
    authorId: "KC-001",
    lastReviewedAt: "2026-07-02T09:00:00+07:00",
    nextReviewDate: "2026-12-10",
    reviewPolicyId: "RP-CASE-MEDIUM",
    usageStats: { views: 96, reuseCount: 11, helpfulRate: 88 },
    relations: []
  }
];

export const seedIssueReports = [
  {
    issueReportId: "IR-2026-0075",
    knowledgeId: "SOP-IOT-003",
    version: "v1.8",
    issueType: "UNSAFE",
    severity: "CRITICAL",
    description: "Firmware gateway mới yêu cầu dừng thao tác khi NEMA socket có dấu hiệu nước hoặc quá nhiệt, nhưng SOP cũ chưa có stop condition.",
    observedImpact: "Có nguy cơ kỹ thuật viên tiếp tục reset node trong điều kiện không an toàn.",
    assetIds: ["NEMA-88", "SN-1044"],
    workOrderId: "WO-2026-00991",
    attachments: ["photo-nema-water-risk.jpg"],
    reporterId: "FT-001",
    status: "LINKED_TO_REVIEW",
    createdAt: "2026-07-22T08:15:00+07:00"
  }
];

export const seedLifecycleReviewTasks = [
  {
    reviewTaskId: "LR-2026-0011",
    knowledgeId: "SOP-NET-007",
    version: "v2.1",
    triggerType: "SCHEDULED_REVIEW",
    priority: "MEDIUM",
    risk: "MEDIUM",
    status: "OPEN",
    assignedManagerId: "KM-001",
    dueDate: "2026-07-25",
    triggerEvidenceIds: [],
    checklistResults: defaultReviewChecklist,
    decisionId: null,
    revisionTaskId: null,
    createdAt: "2026-07-20T08:00:00+07:00",
    startedAt: "",
    completedAt: ""
  },
  {
    reviewTaskId: "LR-2026-0012",
    knowledgeId: "SOP-IOT-003",
    version: "v1.8",
    triggerType: "USER_ISSUE_REPORT",
    priority: "CRITICAL",
    risk: "CRITICAL",
    status: "IN_PROGRESS",
    assignedManagerId: "KM-001",
    dueDate: "2026-07-23",
    triggerEvidenceIds: ["IR-2026-0075"],
    checklistResults: [
      { itemId: "TECH-01", label: "Nội dung kỹ thuật còn chính xác", result: "FAIL", critical: false, note: "Firmware gateway 2.4 thay đổi quy trình kiểm tra." },
      { itemId: "SAFETY-01", label: "An toàn/PPE/điều kiện dừng còn phù hợp", result: "FAIL", critical: true, note: "Thiếu stop condition khi phát hiện nước/quá nhiệt." },
      { itemId: "SOURCE-01", label: "Nguồn/OEM/policy còn hiệu lực", result: "FAIL", critical: false, note: "OEM bulletin mới thay thế hướng dẫn cũ." },
      { itemId: "FIELD-01", label: "Có thể áp dụng ngoài hiện trường", result: "FAIL", critical: false, note: "Không nên áp dụng khi chưa cập nhật điều kiện dừng." }
    ],
    decisionId: null,
    revisionTaskId: null,
    createdAt: "2026-07-22T08:15:00+07:00",
    startedAt: "2026-07-22T08:45:00+07:00",
    completedAt: ""
  },
  {
    reviewTaskId: "LR-2026-0013",
    knowledgeId: "CASE-CABLE-042",
    version: "v1.0",
    triggerType: "MANUAL_REVIEW",
    priority: "LOW",
    risk: "LOW",
    status: "OPEN",
    assignedManagerId: "KM-001",
    dueDate: "2026-08-01",
    triggerEvidenceIds: [],
    checklistResults: defaultReviewChecklist,
    decisionId: null,
    revisionTaskId: null,
    createdAt: "2026-07-21T10:20:00+07:00",
    startedAt: "",
    completedAt: ""
  }
];

export const seedRevisionTasks = [
  {
    revisionTaskId: "RT-2026-0031",
    sourceReviewTaskId: "LR-2026-0012",
    knowledgeId: "SOP-IOT-003",
    contentType: "SOP",
    changeType: "MAJOR",
    requiredChanges: ["Cập nhật PPE theo OEM bulletin", "Bổ sung stop condition khi phát hiện nước/quá nhiệt", "Thêm bước xác minh firmware gateway 2.4"],
    assignedContributorId: "KC-001",
    visibilityAction: "SUSPEND_OLD",
    targetVersion: "v2.0",
    status: "ASSIGNED",
    targetFlow: "FL-03",
    sopTaskId: "",
    submittedDraftId: "",
    createdAt: "2026-07-22T09:10:00+07:00",
    updatedAt: "2026-07-22T09:10:00+07:00"
  }
];

export const seedLifecycleDecisions = [];

export const seedLifecycleEvents = [
  { eventId: "LC-EVT-001", entityType: "ISSUE_REPORT", entityId: "IR-2026-0075", action: "ISSUE_SUBMITTED", actorId: "FT-001", timestamp: "2026-07-22T08:15:00+07:00", metadata: { knowledgeId: "SOP-IOT-003" } },
  { eventId: "LC-EVT-002", entityType: "REVIEW_TASK", entityId: "LR-2026-0012", action: "TASK_CREATED", actorId: "SYSTEM", timestamp: "2026-07-22T08:16:00+07:00", metadata: { triggerType: "USER_ISSUE_REPORT" } },
  { eventId: "LC-EVT-003", entityType: "REVISION_TASK", entityId: "RT-2026-0031", action: "REVISION_TASK_SEEDED", actorId: "KM-001", timestamp: "2026-07-22T09:10:00+07:00", metadata: { sourceReviewTaskId: "LR-2026-0012" } }
];

export const seedReviewPolicies = [
  { policyId: "RP-SOP-HIGH", contentType: "SOP", riskLevel: "HIGH", reviewFrequencyDays: 180, leadTimeDays: 14, defaultDueDaysByPriority: { CRITICAL: 1, HIGH: 3, MEDIUM: 7, LOW: 14 } },
  { policyId: "RP-CASE-MEDIUM", contentType: "REPAIR_CASE", riskLevel: "MEDIUM", reviewFrequencyDays: 365, leadTimeDays: 30, defaultDueDaysByPriority: { CRITICAL: 1, HIGH: 3, MEDIUM: 7, LOW: 14 } }
];

export function makeIssueReport(item, reporter, payload) {
  const createdAt = nowIso();
  const severity = payload.severity || (payload.issueType === "UNSAFE" ? "CRITICAL" : "MEDIUM");
  return {
    issueReportId: makeLifecycleId("IR"),
    knowledgeId: item.id,
    version: item.version,
    issueType: payload.issueType,
    severity,
    description: payload.description,
    observedImpact: payload.observedImpact || "",
    assetIds: payload.assetIds || item.assetIds || [],
    workOrderId: payload.workOrderId || "",
    attachments: payload.attachments || [],
    reporterId: reporter.id,
    status: "LINKED_TO_REVIEW",
    createdAt
  };
}

export function makeReviewTaskFromIssue(item, issue, managerId = "KM-001") {
  const critical = issue.severity === "CRITICAL" || issue.issueType === "UNSAFE";
  const createdAt = nowIso();
  const dueDate = new Date(Date.now() + (critical ? 1 : 7) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const checklistResults = defaultReviewChecklist.map((entry) => {
    if (issue.issueType === "UNSAFE" && entry.itemId === "SAFETY-01") return { ...entry, result: "FAIL", note: issue.description };
    if (issue.issueType === "INCORRECT" && entry.itemId === "TECH-01") return { ...entry, result: "FAIL", note: issue.description };
    if (issue.issueType === "OUTDATED" && entry.itemId === "SOURCE-01") return { ...entry, result: "FAIL", note: issue.description };
    return entry;
  });
  return {
    reviewTaskId: makeLifecycleId("LR"),
    knowledgeId: item.id,
    version: item.version,
    triggerType: "USER_ISSUE_REPORT",
    priority: critical ? "CRITICAL" : "HIGH",
    risk: critical ? "CRITICAL" : "HIGH",
    status: "OPEN",
    assignedManagerId: managerId,
    dueDate,
    triggerEvidenceIds: [issue.issueReportId],
    checklistResults,
    decisionId: null,
    revisionTaskId: null,
    createdAt,
    startedAt: "",
    completedAt: ""
  };
}

export function buildSopTaskFromLifecycleRevision(revisionTask, reviewTask, knowledgeItem, currentUser) {
  return {
    id: makeLifecycleId("SOPTASK"),
    sourceRequestId: revisionTask.sourceReviewTaskId,
    sourceLifecycleReviewId: revisionTask.sourceReviewTaskId,
    sourceRevisionTaskId: revisionTask.revisionTaskId,
    type: "UPDATE_EXISTING",
    status: "OPEN",
    priority: reviewTask.priority || "HIGH",
    title: `Cập nhật SOP từ rà soát vòng đời: ${knowledgeItem.title}`,
    proposedTitle: knowledgeItem.title,
    existingSopId: knowledgeItem.id,
    currentVersion: knowledgeItem.version,
    requestedVersionIntent: revisionTask.changeType || "MAJOR",
    assignedTo: revisionTask.assignedContributorId,
    createdBy: currentUser?.id || "KM-001",
    sourceKnowledgeIds: [knowledgeItem.id],
    sourceSubmissionId: "",
    relatedAssetTypes: knowledgeItem.assetTypes || [],
    relatedFaultType: knowledgeItem.faultType,
    businessReason: `FL-05 xác định nội dung cần cập nhật. Review task: ${reviewTask.reviewTaskId}.`,
    requestedChanges: revisionTask.requiredChanges,
    dueDate: reviewTask.dueDate,
    createdAt: nowIso()
  };
}

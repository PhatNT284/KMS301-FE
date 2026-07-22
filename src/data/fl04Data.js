export const knowledgeRequestStatusLabels = {
  DRAFT: "Bản nháp",
  SUBMITTED: "Đã gửi",
  TRIAGING: "Đang phân loại",
  NEEDS_INFORMATION: "Cần bổ sung thông tin",
  DUPLICATE_RESOLVED: "Trùng lặp - đã xử lý",
  ASSIGNED: "Đã giao xử lý",
  IN_PROGRESS: "Đang biên soạn",
  IN_REVIEW: "Chờ duyệt bài viết",
  CHANGES_REQUESTED: "Cần chỉnh sửa",
  APPROVED: "Đã phê duyệt",
  TRANSFERRED_FL03: "Đã chuyển FL-03",
  RESOLVED: "Đã hoàn tất",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy"
};

export const knowledgeRequestStatusTones = {
  DRAFT: "neutral",
  SUBMITTED: "warning",
  TRIAGING: "warning",
  NEEDS_INFORMATION: "danger",
  DUPLICATE_RESOLVED: "good",
  ASSIGNED: "warning",
  IN_PROGRESS: "warning",
  IN_REVIEW: "warning",
  CHANGES_REQUESTED: "danger",
  APPROVED: "good",
  TRANSFERRED_FL03: "good",
  RESOLVED: "good",
  REJECTED: "danger",
  CANCELLED: "neutral"
};

export const knowledgeRequestOriginLabels = {
  NEW_GAP: "Không có kết quả FL-01",
  IMPROVEMENT_REQUEST: "Cải thiện nội dung FL-01",
  DIRECT_REQUEST: "Tạo thủ công",
  ARTICLE_OR_SOP: "Nguồn từ FL-02"
};

export const deliverableLabels = {
  KNOWLEDGE_ARTICLE: "Bài viết tri thức",
  SOP: "SOP",
  FIELD_EVIDENCE: "Cần bằng chứng hiện trường",
  DUPLICATE: "Nội dung đã tồn tại",
  REJECT: "Ngoài phạm vi"
};

export const priorityLabels = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Nghiêm trọng"
};

export const articleDraftStatusLabels = {
  NOT_STARTED: "Chưa bắt đầu",
  DRAFT: "Bản nháp",
  SUBMITTED: "Chờ duyệt",
  CHANGES_REQUESTED: "Cần chỉnh sửa",
  APPROVED: "Đã phê duyệt",
  PUBLISHED: "Đã xuất bản"
};

export const requestOrigins = [
  { value: "NEW_GAP", label: "Không có kết quả FL-01" },
  { value: "IMPROVEMENT_REQUEST", label: "Cải thiện nội dung FL-01" },
  { value: "DIRECT_REQUEST", label: "Tạo thủ công" },
  { value: "ARTICLE_OR_SOP", label: "Nguồn từ FL-02" }
];

export const deliverableOptions = [
  { value: "KNOWLEDGE_ARTICLE", label: "Bài viết tri thức" },
  { value: "SOP", label: "SOP" },
  { value: "FIELD_EVIDENCE", label: "Cần bằng chứng hiện trường" },
  { value: "DUPLICATE", label: "Nội dung đã tồn tại" },
  { value: "REJECT", label: "Ngoài phạm vi" }
];

export const requestPriorityOptions = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "CRITICAL", label: "Nghiêm trọng" }
];

export const requestImpactOptions = [
  { value: "LOW", label: "Ảnh hưởng thấp" },
  { value: "MEDIUM", label: "Ảnh hưởng vận hành cục bộ" },
  { value: "HIGH", label: "Ảnh hưởng nhiều tài sản/khu vực" },
  { value: "SAFETY", label: "Có rủi ro an toàn" }
];

export function isoNow() {
  return new Date().toISOString();
}

export function sevenDaysFromNow() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

export function makeKnowledgeRequestId(prefix = "KR") {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

export function emptyKnowledgeRequest(currentUser, sourceContext = {}) {
  const origin = sourceContext.origin || "DIRECT_REQUEST";
  const query = sourceContext.query || sourceContext.filters?.query || "";
  const assetId = sourceContext.assetId || sourceContext.filters?.assetId || "";
  const faultType = sourceContext.faultType || sourceContext.filters?.faultType || "";
  const createdAt = isoNow();

  return {
    id: makeKnowledgeRequestId(),
    status: "DRAFT",
    origin,
    title: query ? `Cần bổ sung tri thức cho: ${query}` : "Yêu cầu bổ sung tri thức mới",
    description: sourceContext.feedbackReason
      ? `Nội dung hiện tại chưa đáp ứng nhu cầu: ${sourceContext.feedbackReason}`
      : "Mô tả khoảng trống tri thức hoặc nội dung cần được bổ sung.",
    expectedOutcome: origin === "IMPROVEMENT_REQUEST" ? "Cập nhật hoặc bổ sung bài viết tri thức đang thiếu thông tin." : "Có bài viết tri thức đủ rõ để kỹ thuật viên xử lý tình huống tương tự.",
    requesterId: currentUser.id,
    requesterRole: currentUser.role,
    requesterName: currentUser.name,
    sourceContext: {
      ...sourceContext,
      origin,
      query,
      assetId,
      searchedAt: sourceContext.searchedAt || createdAt
    },
    assetId,
    assetType: sourceContext.assetType || sourceContext.filters?.assetType || "CITYTOUCH_NODE",
    faultType: faultType && faultType !== "ALL" ? faultType : "CONNECTIVITY_LOSS",
    area: sourceContext.area || "District 7",
    attemptedActions: sourceContext.attemptedActions || "",
    impact: sourceContext.impact || "MEDIUM",
    priority: sourceContext.priority || "MEDIUM",
    dueDate: sevenDaysFromNow(),
    deliverableType: "KNOWLEDGE_ARTICLE",
    assigneeId: "",
    relatedKnowledgeIds: sourceContext.knowledgeId ? [sourceContext.knowledgeId] : [],
    duplicateKnowledgeId: "",
    fieldSubmissionId: sourceContext.fieldSubmissionId || "",
    resultKnowledgeId: "",
    sopTaskId: "",
    resolutionNote: "",
    rejectionReason: "",
    attachments: [],
    confirmation: false,
    events: [
      { id: makeKnowledgeRequestId("KR-EVT"), action: "DRAFT_CREATED", actorId: currentUser.id, comment: "Tạo bản nháp yêu cầu bổ sung tri thức.", createdAt }
    ],
    createdAt,
    updatedAt: createdAt
  };
}

export const seedKnowledgeRequests = [
  {
    id: "KR-DEMO-001",
    status: "ASSIGNED",
    origin: "NEW_GAP",
    title: "Cần hướng dẫn xử lý CityTouch Node offline sau cập nhật firmware",
    description: "FL-01 không có kết quả đủ rõ cho query về CityTouch node offline sau firmware 2.4.",
    expectedOutcome: "Có bài viết tri thức nêu triệu chứng, nguyên nhân thường gặp và các bước kiểm tra nhanh trước khi escalte.",
    requesterId: "FT-001",
    requesterRole: "FIELD_TECHNICIAN",
    requesterName: "Minh Tran",
    sourceContext: {
      origin: "NEW_GAP",
      query: "CityTouch node offline firmware 2.4",
      assetId: "CTN-1108",
      resultCount: 0,
      filters: {
        query: "CityTouch node offline firmware 2.4",
        assetId: "CTN-1108",
        contentType: "ALL",
        assetType: "CITYTOUCH_NODE",
        faultType: "CONNECTIVITY_LOSS",
        categoryId: "ALL",
        status: "PUBLISHED",
        sortBy: "RELEVANCE"
      },
      searchedAt: "2026-07-22T08:35:00+07:00"
    },
    assetId: "CTN-1108",
    assetType: "CITYTOUCH_NODE",
    faultType: "CONNECTIVITY_LOSS",
    area: "District 7",
    attemptedActions: "Đã ping gateway, reset node một lần, kiểm tra nguồn tại cột.",
    impact: "HIGH",
    priority: "HIGH",
    dueDate: "2026-07-29",
    deliverableType: "KNOWLEDGE_ARTICLE",
    assigneeId: "KC-001",
    relatedKnowledgeIds: [],
    duplicateKnowledgeId: "",
    fieldSubmissionId: "",
    resultKnowledgeId: "",
    sopTaskId: "",
    resolutionNote: "",
    rejectionReason: "",
    attachments: ["telemetry-ctn-1108.png"],
    confirmation: true,
    events: [
      { id: "KR-EVT-001", action: "SUBMITTED", actorId: "FT-001", comment: "Gửi yêu cầu từ no-result FL-01.", createdAt: "2026-07-22T08:42:00+07:00" },
      { id: "KR-EVT-002", action: "ASSIGNED", actorId: "KM-001", comment: "Giao Contributor soạn bài viết tri thức.", createdAt: "2026-07-22T09:15:00+07:00" }
    ],
    createdAt: "2026-07-22T08:42:00+07:00",
    updatedAt: "2026-07-22T09:15:00+07:00"
  },
  {
    id: "KR-DEMO-002",
    status: "RESOLVED",
    origin: "NEW_GAP",
    title: "Không tìm thấy hướng dẫn kiểm tra nhiều Smart Node cùng offline",
    description: "Người dùng tìm kiếm nhưng dùng từ khóa khác với nội dung hiện có.",
    expectedOutcome: "Tìm được nội dung hiện hành hoặc có bài mới nếu thật sự thiếu.",
    requesterId: "FT-001",
    requesterRole: "FIELD_TECHNICIAN",
    requesterName: "Minh Tran",
    sourceContext: {
      origin: "NEW_GAP",
      query: "cả cụm smart node mất online",
      resultCount: 0,
      searchedAt: "2026-07-21T17:10:00+07:00"
    },
    assetId: "GW-D7-02",
    assetType: "SMART_NODE",
    faultType: "CONNECTIVITY_LOSS",
    area: "District 7",
    attemptedActions: "Đã kiểm tra sơ bộ gateway.",
    impact: "MEDIUM",
    priority: "MEDIUM",
    dueDate: "2026-07-28",
    deliverableType: "DUPLICATE",
    assigneeId: "",
    relatedKnowledgeIds: ["SOP-NET-007"],
    duplicateKnowledgeId: "SOP-NET-007",
    fieldSubmissionId: "",
    resultKnowledgeId: "SOP-NET-007",
    sopTaskId: "",
    resolutionNote: "Nội dung SOP-NET-007 đã bao phủ tình huống; request được resolve bằng cách gắn liên kết và giải thích từ khóa phù hợp.",
    rejectionReason: "",
    attachments: [],
    confirmation: true,
    events: [
      { id: "KR-EVT-003", action: "SUBMITTED", actorId: "FT-001", comment: "Gửi yêu cầu từ no-result FL-01.", createdAt: "2026-07-21T17:12:00+07:00" },
      { id: "KR-EVT-004", action: "DUPLICATE_RESOLVED", actorId: "KM-001", comment: "Liên kết SOP-NET-007 và đóng yêu cầu.", createdAt: "2026-07-21T17:40:00+07:00" }
    ],
    createdAt: "2026-07-21T17:12:00+07:00",
    updatedAt: "2026-07-21T17:40:00+07:00"
  },
  {
    id: "KR-DEMO-003",
    status: "NEEDS_INFORMATION",
    origin: "IMPROVEMENT_REQUEST",
    title: "Bài viết về nước vào tủ điều khiển chưa đủ điều kiện áp dụng",
    description: "Kỹ thuật viên báo nội dung hiện có thiếu ảnh hiện trường và điều kiện dừng an toàn.",
    expectedOutcome: "Bổ sung phạm vi áp dụng, bằng chứng hiện trường và cảnh báo an toàn.",
    requesterId: "FT-001",
    requesterRole: "FIELD_TECHNICIAN",
    requesterName: "Minh Tran",
    sourceContext: {
      origin: "IMPROVEMENT_REQUEST",
      query: "nước vào tủ điều khiển",
      knowledgeId: "CASE-CABLE-042",
      feedbackReason: "Còn thiếu điều kiện dừng khi có nước trong tủ điện.",
      searchedAt: "2026-07-22T10:10:00+07:00"
    },
    assetId: "CAB-D1-18",
    assetType: "CONTROL_CABINET",
    faultType: "WATER_INGRESS",
    area: "District 1",
    attemptedActions: "Chưa mở tủ vì khu vực còn ngập.",
    impact: "SAFETY",
    priority: "HIGH",
    dueDate: "2026-07-27",
    deliverableType: "FIELD_EVIDENCE",
    assigneeId: "",
    relatedKnowledgeIds: ["CASE-CABLE-042"],
    duplicateKnowledgeId: "",
    fieldSubmissionId: "",
    resultKnowledgeId: "",
    sopTaskId: "",
    resolutionNote: "Cần người yêu cầu bổ sung ảnh hiện trường và mô tả điều kiện an toàn trước khi phân loại tiếp.",
    rejectionReason: "",
    attachments: [],
    confirmation: true,
    events: [
      { id: "KR-EVT-005", action: "SUBMITTED", actorId: "FT-001", comment: "Tạo request từ feedback Không hữu ích.", createdAt: "2026-07-22T10:12:00+07:00" },
      { id: "KR-EVT-006", action: "NEEDS_INFORMATION", actorId: "KM-001", comment: "Yêu cầu bổ sung ảnh và bối cảnh an toàn.", createdAt: "2026-07-22T10:30:00+07:00" }
    ],
    createdAt: "2026-07-22T10:12:00+07:00",
    updatedAt: "2026-07-22T10:30:00+07:00"
  },
  {
    id: "KR-DEMO-004",
    status: "TRANSFERRED_FL03",
    origin: "ARTICLE_OR_SOP",
    title: "Chuẩn hóa quy trình kiểm tra nước xâm nhập trong tủ điều khiển",
    description: "Nhiều case lặp lại yêu cầu có SOP an toàn thay vì chỉ là bài viết tri thức.",
    expectedOutcome: "Tạo nhiệm vụ SOP mới cho FL-03, có traceability về request FL-04.",
    requesterId: "KM-001",
    requesterRole: "KNOWLEDGE_MANAGER",
    requesterName: "Alex Chen",
    sourceContext: {
      origin: "ARTICLE_OR_SOP",
      query: "water ingress control cabinet safety",
      sourceSubmissionId: "SUB-2026-0043",
      searchedAt: "2026-07-22T11:00:00+07:00"
    },
    assetId: "CAB-D1-18",
    assetType: "CONTROL_CABINET",
    faultType: "WATER_INGRESS",
    area: "District 1",
    attemptedActions: "Đã có nhiều field submission liên quan.",
    impact: "SAFETY",
    priority: "HIGH",
    dueDate: "2026-07-30",
    deliverableType: "SOP",
    assigneeId: "KC-001",
    relatedKnowledgeIds: ["CASE-CABLE-042"],
    duplicateKnowledgeId: "",
    fieldSubmissionId: "SUB-2026-0043",
    resultKnowledgeId: "",
    sopTaskId: "SOPTASK-2026-009",
    resolutionNote: "Đã chuyển thành nhiệm vụ SOP để biên soạn quy trình có kiểm soát an toàn.",
    rejectionReason: "",
    attachments: ["field-photo-cabinet-water.jpg"],
    confirmation: true,
    events: [
      { id: "KR-EVT-007", action: "TRANSFERRED_FL03", actorId: "KM-001", comment: "Chuyển thành nhiệm vụ SOP FL-03.", createdAt: "2026-07-22T11:20:00+07:00" }
    ],
    createdAt: "2026-07-22T11:00:00+07:00",
    updatedAt: "2026-07-22T11:20:00+07:00"
  },
  {
    id: "KR-DEMO-005",
    status: "REJECTED",
    origin: "DIRECT_REQUEST",
    title: "Yêu cầu tài liệu cấu hình vendor ngoài phạm vi",
    description: "Yêu cầu xin tài liệu vendor có bản quyền và không liên quan trực tiếp tri thức vận hành nội bộ.",
    expectedOutcome: "Có tài liệu vendor đầy đủ.",
    requesterId: "FT-001",
    requesterRole: "FIELD_TECHNICIAN",
    requesterName: "Minh Tran",
    sourceContext: {
      origin: "DIRECT_REQUEST",
      query: "vendor manual full firmware source",
      searchedAt: "2026-07-20T15:00:00+07:00"
    },
    assetId: "",
    assetType: "SMART_NODE",
    faultType: "CONNECTIVITY_LOSS",
    area: "Citywide",
    attemptedActions: "",
    impact: "LOW",
    priority: "LOW",
    dueDate: "2026-07-26",
    deliverableType: "REJECT",
    assigneeId: "",
    relatedKnowledgeIds: [],
    duplicateKnowledgeId: "",
    fieldSubmissionId: "",
    resultKnowledgeId: "",
    sopTaskId: "",
    resolutionNote: "",
    rejectionReason: "Ngoài phạm vi KMS prototype và không có quyền phân phối tài liệu vendor.",
    attachments: [],
    confirmation: true,
    events: [
      { id: "KR-EVT-008", action: "SUBMITTED", actorId: "FT-001", comment: "Gửi yêu cầu thủ công.", createdAt: "2026-07-20T15:10:00+07:00" },
      { id: "KR-EVT-009", action: "REJECTED", actorId: "KM-001", comment: "Từ chối vì ngoài phạm vi.", createdAt: "2026-07-20T16:00:00+07:00" }
    ],
    createdAt: "2026-07-20T15:10:00+07:00",
    updatedAt: "2026-07-20T16:00:00+07:00"
  }
];

export const seedArticleDrafts = [
  {
    id: "KRA-DEMO-001",
    requestId: "KR-DEMO-001",
    status: "DRAFT",
    authorId: "KC-001",
    reviewerId: "KM-001",
    title: "Xử lý CityTouch Node offline sau cập nhật firmware 2.4",
    summary: "Các bước kiểm tra nhanh khi node offline sau cập nhật firmware gateway hoặc node.",
    problemStatement: "Sau khi cập nhật firmware, một số CityTouch Node không gửi telemetry dù nguồn vẫn ổn định.",
    cause: "Node có thể chưa đồng bộ lại mesh channel, gateway cache trạng thái cũ hoặc lịch heartbeat bị lệch.",
    solutionSteps: [
      "Kiểm tra gateway online và phiên bản firmware đang chạy.",
      "Đối chiếu node offline với cùng tuyến cấp nguồn hoặc cùng mesh channel.",
      "Chờ hai chu kỳ heartbeat trước khi reset node.",
      "Reset theo cụm nhỏ và xác minh telemetry trong 15 phút."
    ],
    limitations: "Không áp dụng khi có dấu hiệu mất nguồn, nước vào tủ điều khiển hoặc cháy/chập.",
    assetTypes: ["CITYTOUCH_NODE"],
    faultType: "CONNECTIVITY_LOSS",
    categoryId: "TROUBLESHOOTING",
    tags: ["firmware", "offline", "mesh"],
    sourceRefs: ["KR-DEMO-001", "telemetry-ctn-1108.png"],
    securityLevel: "INTERNAL",
    effectiveDate: "2026-07-22",
    reviewDate: "2027-07-22",
    reviewChecklist: {
      technicalAccuracy: false,
      sourceTraceability: false,
      reusableInField: false,
      noHiddenSop: false
    },
    comments: [],
    createdAt: "2026-07-22T09:20:00+07:00",
    updatedAt: "2026-07-22T09:35:00+07:00"
  }
];

export function emptyArticleDraft(request, currentUser) {
  const createdAt = isoNow();
  return {
    id: makeKnowledgeRequestId("KRA"),
    requestId: request.id,
    status: "DRAFT",
    authorId: currentUser.id,
    reviewerId: "KM-001",
    title: request.title.replace(/^Cần\s+/i, ""),
    summary: request.expectedOutcome,
    problemStatement: request.description,
    cause: "",
    solutionSteps: ["Xác định bối cảnh, tài sản và triệu chứng trước khi áp dụng hướng dẫn."],
    limitations: "Không dùng thay SOP bắt buộc hoặc quy trình an toàn cần phê duyệt.",
    assetTypes: [request.assetType].filter(Boolean),
    faultType: request.faultType,
    categoryId: "TROUBLESHOOTING",
    tags: [],
    sourceRefs: [request.id, ...(request.attachments || [])],
    securityLevel: "INTERNAL",
    effectiveDate: new Date().toISOString().slice(0, 10),
    reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    reviewChecklist: {
      technicalAccuracy: false,
      sourceTraceability: false,
      reusableInField: false,
      noHiddenSop: false
    },
    comments: [],
    createdAt,
    updatedAt: createdAt
  };
}

export function createPublishedArticleFromDraft(request, draft, manager) {
  const id = makeKnowledgeRequestId("ART-FL04");
  return {
    id,
    contentType: "ARTICLE",
    sourceRequestId: request.id,
    title: draft.title,
    summary: draft.summary,
    status: "PUBLISHED",
    version: "v1.0",
    effectiveDate: new Date(draft.effectiveDate).toLocaleDateString("vi-VN"),
    reviewDate: new Date(draft.reviewDate).toLocaleDateString("vi-VN"),
    updatedDate: new Date().toLocaleDateString("vi-VN"),
    securityLevel: draft.securityLevel,
    allowedRoles: ["FIELD_TECHNICIAN", "CONTRIBUTOR", "KNOWLEDGE_MANAGER", "ADMINISTRATOR"],
    categoryId: draft.categoryId,
    assetTypes: draft.assetTypes,
    assetIds: [request.assetId].filter(Boolean),
    faultType: draft.faultType,
    knowledgeManagerName: manager.name,
    helpfulRate: 0,
    feedbackCount: 0,
    reuseCount: 0,
    viewCount: 0,
    relevanceScore: 0.78,
    location: request.area,
    incidentDate: new Date(request.createdAt).toLocaleDateString("vi-VN"),
    symptom: request.description,
    diagnosisMethod: draft.problemStatement,
    rootCause: draft.cause,
    repairAction: draft.solutionSteps.join(" "),
    outcome: draft.summary,
    lessonLearned: draft.limitations,
    telemetry: request.sourceContext?.query ? [`Query nguồn: ${request.sourceContext.query}`] : [],
    evidence: draft.sourceRefs,
    relatedItems: request.relatedKnowledgeIds,
    sourceRefs: draft.sourceRefs
  };
}

export function buildSopTaskFromKnowledgeRequest(request, currentUser) {
  return {
    id: makeKnowledgeRequestId("SOPTASK"),
    sourceRequestId: request.id,
    type: request.relatedKnowledgeIds?.length ? "UPDATE_EXISTING" : "NEW_SOP",
    status: "OPEN",
    priority: request.priority || "HIGH",
    title: `Chuyển FL-04 thành nhiệm vụ SOP: ${request.title}`,
    proposedTitle: request.title.replace(/^Cần\s+/i, ""),
    existingSopId: request.relatedKnowledgeIds?.find((id) => id.startsWith("SOP-")) || "",
    currentVersion: "",
    requestedVersionIntent: "MAJOR",
    assignedTo: request.assigneeId || "KC-001",
    createdBy: currentUser?.id || "KM-001",
    sourceKnowledgeIds: request.relatedKnowledgeIds || [],
    sourceSubmissionId: request.fieldSubmissionId || "",
    relatedAssetTypes: [request.assetType].filter(Boolean),
    relatedFaultType: request.faultType,
    businessReason: `${request.description} Kết quả mong muốn: ${request.expectedOutcome}`,
    requestedChanges: [request.expectedOutcome, request.resolutionNote].filter(Boolean),
    dueDate: request.dueDate,
    createdAt: isoNow()
  };
}

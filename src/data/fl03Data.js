export const seedSopTasks = [
  {
    id: "SOPTASK-2026-008",
    sourceRequestId: "SOPREQ-2026-0043",
    type: "UPDATE_EXISTING",
    status: "OPEN",
    priority: "HIGH",
    title: "Cập nhật SOP xử lý nhiều Smart Node mất kết nối",
    proposedTitle: "Chẩn đoán nhiều Smart Node mất kết nối đồng thời",
    existingSopId: "SOP-NET-007",
    currentVersion: "v2.1",
    requestedVersionIntent: "MAJOR",
    assignedTo: "KC-001",
    createdBy: "KM-001",
    sourceKnowledgeIds: ["CASE-FL02-0043"],
    sourceSubmissionId: "SUB-2026-0043",
    relatedAssetTypes: ["CITYTOUCH_NODE", "SMART_NODE"],
    relatedFaultType: "CONNECTIVITY_LOSS",
    businessReason: "FL-02 xác nhận SOP hiện tại thiếu bước kiểm tra tuyến nguồn dùng chung trước khi reset hoặc thay từng node.",
    requestedChanges: [
      "Bổ sung kiểm tra nguồn và tuyến cáp dùng chung khi nhiều node cùng offline.",
      "Thêm decision rule trước bước reset cụm node.",
      "Liên kết case nguồn đã được Knowledge Manager phê duyệt."
    ],
    dueDate: "2026-07-28",
    createdAt: "2026-07-21T18:05:00+07:00"
  },
  {
    id: "SOPTASK-2026-009",
    type: "NEW_SOP",
    status: "OPEN",
    priority: "MEDIUM",
    title: "Tạo SOP kiểm tra nước xâm nhập trong tủ điều khiển",
    proposedTitle: "Kiểm tra nước xâm nhập trong tủ điều khiển chiếu sáng",
    existingSopId: "",
    currentVersion: "",
    requestedVersionIntent: "MAJOR",
    assignedTo: "KC-001",
    createdBy: "KM-001",
    sourceKnowledgeIds: ["CASE-CABLE-042"],
    sourceSubmissionId: "",
    relatedAssetTypes: ["CONTROL_CABINET", "LED_FIXTURE"],
    relatedFaultType: "WATER_INGRESS",
    businessReason: "Các case field gần đây có lặp lại điều kiện tủ điều khiển bị nước xâm nhập sau mưa lớn.",
    requestedChanges: [
      "Chuẩn hóa điều kiện dừng khi phát hiện nước trong tủ điện.",
      "Thêm PPE và checklist cách ly nguồn."
    ],
    dueDate: "2026-08-02",
    createdAt: "2026-07-21T18:20:00+07:00"
  }
];

export const seedSopDrafts = [
  {
    id: "SOPD-2026-0012",
    taskId: "SOPTASK-2026-008",
    type: "UPDATE_EXISTING",
    status: "DRAFT",
    authorId: "KC-001",
    reviewerId: "KM-001",
    sopId: "SOP-NET-007",
    previousVersion: "v2.1",
    proposedVersion: "v3.0",
    changeLevel: "MAJOR",
    title: "Chẩn đoán nhiều Smart Node mất kết nối đồng thời",
    summary: "Phiên bản cập nhật bổ sung kiểm tra nguồn dùng chung, tuyến cáp và decision rule trước khi reset cụm node.",
    categoryId: "TROUBLESHOOTING",
    securityLevel: "INTERNAL",
    domain: "Smart Street Lighting",
    assetTypes: ["CITYTOUCH_NODE", "SMART_NODE"],
    faultType: "CONNECTIVITY_LOSS",
    intendedRoles: ["FIELD_TECHNICIAN", "CONTRIBUTOR"],
    purpose: "Giúp kỹ thuật viên xác định nguyên nhân khi nhiều Smart Node hoặc CityTouch Node mất kết nối đồng thời trong cùng gateway hoặc tuyến cấp nguồn.",
    scope: "Áp dụng cho gateway Interact City, CityTouch Node, NEMA socket node và cụm smart node dùng chung nguồn hoặc mesh channel.",
    exclusions: "Không áp dụng cho lỗi mất sáng do thay đổi lịch dimming hoặc mất nguồn toàn khu vực chưa có dữ liệu telemetry.",
    trigger: "Nhiều hơn ba node cùng offline trong cùng gateway, tuyến hoặc khu vực trong vòng 15 phút.",
    completionCriteria: [
      "Xác định được lỗi nằm ở gateway, RF, nguồn dùng chung hoặc từng node.",
      "Tối thiểu 95% node online lại sau xử lý.",
      "Work order có ảnh hoặc bằng chứng telemetry sau khi hoàn tất."
    ],
    preconditions: [
      "Có work order hợp lệ và quyền truy cập bản đồ vận hành.",
      "Xác nhận khu vực mất kết nối trên telemetry trước khi thao tác hiện trường."
    ],
    tools: ["Thiết bị đo RF", "Đồng hồ đo điện áp", "Laptop cấu hình gateway", "Ứng dụng Interact City"],
    ppe: ["Găng tay cách điện", "Kính bảo hộ", "Áo phản quang"],
    hazards: ["Nguy cơ điện áp tại hộp cáp hoặc tủ điều khiển", "Giao thông khi thao tác gần lòng đường"],
    controls: ["Cô lập nguồn khi mở hộp cáp", "Đặt biển cảnh báo và phân luồng khu vực thao tác"],
    emergencyAction: "Dừng thao tác, cô lập khu vực và báo đội an toàn nếu phát hiện cháy, nước trong hộp cáp hoặc điện áp bất thường.",
    riskLevel: "HIGH",
    stopConditions: [
      "Gateway không phản hồi sau hai lần reset.",
      "Có dấu hiệu chập điện, nước xâm nhập hoặc hư hại cơ khí tại hộp cáp."
    ],
    procedureSteps: [
      {
        id: "STEP-01",
        title: "Xác định phạm vi mất kết nối",
        responsibleRole: "Field Technician",
        instruction: "So sánh danh sách node offline với gateway, tuyến cấp nguồn và khu vực địa lý trên bản đồ vận hành.",
        expectedResult: "Biết lỗi tập trung theo gateway, theo tuyến điện hay theo từng node.",
        warning: ""
      },
      {
        id: "STEP-02",
        title: "Kiểm tra gateway và mesh channel",
        responsibleRole: "Field Technician",
        instruction: "Ping gateway, kiểm tra firmware, kênh mesh và độ trễ telemetry trong 15 phút gần nhất.",
        expectedResult: "Gateway phản hồi ổn định hoặc xác định được điểm nghẽn mạng.",
        warning: ""
      },
      {
        id: "STEP-03",
        title: "Kiểm tra nguồn và tuyến cáp dùng chung",
        responsibleRole: "Field Technician",
        instruction: "Đo điện áp tại tủ cấp nguồn, hộp cáp chung và điểm đầu tuyến trước khi thay từng node.",
        expectedResult: "Xác định được có hay không lỗi nguồn/cáp dùng chung gây mất kết nối hàng loạt.",
        warning: "Cô lập nguồn nếu mở hộp cáp hoặc phát hiện nước."
      },
      {
        id: "STEP-04",
        title: "Loại trừ nhiễu RF",
        responsibleRole: "Network Team",
        instruction: "Dùng thiết bị đo RF tại ba điểm quanh cụm node và ghi nhận mức nhiễu theo khung giờ.",
        expectedResult: "Có bằng chứng nếu mất kết nối do nhiễu từ thiết bị lân cận.",
        warning: ""
      },
      {
        id: "STEP-05",
        title: "Reset theo cụm và xác minh telemetry",
        responsibleRole: "Field Technician",
        instruction: "Reset từng cụm tối đa 20 node sau khi loại trừ lỗi nguồn dùng chung, theo dõi dữ liệu ít nhất 15 phút.",
        expectedResult: "Node online lại và telemetry cập nhật theo chu kỳ bình thường.",
        warning: ""
      }
    ],
    decisionPoints: [
      {
        id: "DEC-01",
        condition: "Nhiều node offline cùng tuyến nhưng gateway vẫn phản hồi?",
        yesAction: "Kiểm tra nguồn và tuyến cáp dùng chung trước khi reset.",
        noAction: "Chuyển sang kiểm tra gateway và mesh channel.",
        exception: "Nếu có dấu hiệu chập điện, dừng quy trình và báo đội an toàn."
      }
    ],
    sourceKnowledgeIds: ["CASE-FL02-0043", "CASE-CABLE-042"],
    sourceSubmissionIds: ["SUB-2026-0043"],
    externalReferences: ["Biên bản đo telemetry WO-2026-00423", "Ảnh hiện trường cable-cut-01.jpg"],
    changeSummary: "Bổ sung bước kiểm tra nguồn và tuyến cáp dùng chung, thay đổi thứ tự kiểm tra trước bước reset cụm node.",
    relatedSopIds: ["SOP-IOT-003"],
    confirmation: false,
    reviewChecklist: {
      technicalAccuracy: false,
      safetyComplete: false,
      sourceTraceability: false,
      versionValid: false,
      usableInField: false
    },
    history: [
      { id: "SOPD-EVT-001", action: "DRAFT_CREATED", actorId: "KC-001", comment: "Tạo draft từ task FL-02.", createdAt: "2026-07-21T18:40:00+07:00" }
    ],
    createdAt: "2026-07-21T18:40:00+07:00",
    updatedAt: "2026-07-21T18:48:00+07:00"
  },
  {
    id: "SOPD-2026-0014",
    taskId: "SOPTASK-2026-009",
    type: "NEW_SOP",
    status: "CHANGES_REQUESTED",
    authorId: "KC-001",
    reviewerId: "KM-001",
    sopId: "SOP-WTR-001",
    previousVersion: "",
    proposedVersion: "v1.0",
    changeLevel: "MAJOR",
    title: "Kiểm tra nước xâm nhập trong tủ điều khiển chiếu sáng",
    summary: "Bản nháp SOP mới cho kiểm tra tủ điều khiển sau mưa lớn và xử lý điều kiện dừng an toàn.",
    categoryId: "SAFETY",
    securityLevel: "INTERNAL",
    domain: "Field Safety",
    assetTypes: ["CONTROL_CABINET"],
    faultType: "WATER_INGRESS",
    intendedRoles: ["FIELD_TECHNICIAN"],
    purpose: "Chuẩn hóa cách kiểm tra an toàn khi nghi ngờ nước xâm nhập trong tủ điều khiển chiếu sáng.",
    scope: "Áp dụng cho tủ điều khiển khu vực đô thị sau mưa lớn hoặc ngập cục bộ.",
    exclusions: "Không áp dụng cho tủ trung thế hoặc hạ tầng ngoài phạm vi chiếu sáng công cộng.",
    trigger: "Có cảnh báo rò điện, mất sáng sau mưa lớn hoặc ảnh hiện trường cho thấy nước trong tủ.",
    completionCriteria: ["Tủ được xác minh an toàn", "Ảnh hiện trường và biên bản đo được lưu"],
    preconditions: ["Có work order hợp lệ"],
    tools: ["Đồng hồ đo điện", "Bút thử điện", "Bộ LOTO"],
    ppe: ["Găng tay cách điện", "Kính bảo hộ"],
    hazards: ["Điện giật khi mở tủ có nước"],
    controls: ["Cô lập nguồn trước khi mở tủ"],
    emergencyAction: "Báo đội an toàn khi phát hiện nước chạm thanh cái.",
    riskLevel: "CRITICAL",
    stopConditions: ["Không xác minh được trạng thái cô lập nguồn"],
    procedureSteps: [
      { id: "STEP-01", title: "Đánh giá bên ngoài", responsibleRole: "Field Technician", instruction: "Quan sát dấu vết nước và tình trạng khóa tủ.", expectedResult: "Biết có dấu hiệu nước xâm nhập hay không.", warning: "" },
      { id: "STEP-02", title: "Cô lập nguồn", responsibleRole: "Field Technician", instruction: "Thực hiện LOTO trước khi mở tủ.", expectedResult: "Nguồn được cô lập và ghi nhận.", warning: "Không mở tủ khi chưa cô lập nguồn." }
    ],
    decisionPoints: [],
    sourceKnowledgeIds: ["CASE-CABLE-042"],
    sourceSubmissionIds: [],
    externalReferences: [],
    changeSummary: "Tạo SOP mới từ nhóm case hiện trường có nguy cơ nước xâm nhập.",
    relatedSopIds: ["SOP-HV-002"],
    confirmation: true,
    reviewChecklist: {
      technicalAccuracy: false,
      safetyComplete: false,
      sourceTraceability: true,
      versionValid: true,
      usableInField: false
    },
    reviewComments: [
      {
        id: "REV-001",
        actorId: "KM-001",
        section: "An toàn",
        comment: "Bổ sung điều kiện dừng khi phát hiện nước chạm thanh cái và yêu cầu ảnh sau khi cô lập nguồn.",
        createdAt: "2026-07-21T19:10:00+07:00"
      }
    ],
    history: [
      { id: "SOPD-EVT-004", action: "SUBMITTED", actorId: "KC-001", comment: "Gửi duyệt bản nháp SOP mới.", createdAt: "2026-07-21T18:55:00+07:00" },
      { id: "SOPD-EVT-005", action: "REQUEST_CHANGES", actorId: "KM-001", comment: "Cần bổ sung điều kiện dừng và evidence ảnh.", createdAt: "2026-07-21T19:10:00+07:00" }
    ],
    createdAt: "2026-07-21T18:30:00+07:00",
    updatedAt: "2026-07-21T19:10:00+07:00"
  },
  {
    id: "SOPD-2026-0015",
    taskId: "SOPTASK-2026-008",
    type: "UPDATE_EXISTING",
    status: "RESUBMITTED",
    authorId: "KC-001",
    reviewerId: "KM-001",
    sopId: "SOP-NET-007",
    previousVersion: "v2.1",
    proposedVersion: "v3.0",
    changeLevel: "MAJOR",
    title: "Chẩn đoán nhiều Smart Node mất kết nối đồng thời",
    summary: "Bản đã chỉnh sửa sau phản hồi, nhấn mạnh kiểm tra nguồn dùng chung trước khi reset.",
    categoryId: "TROUBLESHOOTING",
    securityLevel: "INTERNAL",
    domain: "Smart Street Lighting",
    assetTypes: ["CITYTOUCH_NODE", "SMART_NODE"],
    faultType: "CONNECTIVITY_LOSS",
    intendedRoles: ["FIELD_TECHNICIAN", "CONTRIBUTOR"],
    purpose: "Chuẩn hóa xử lý lỗi mất kết nối đồng thời trên nhiều node trong cùng gateway hoặc tuyến.",
    scope: "Áp dụng cho CityTouch Node, Smart Node và gateway Interact City trong mạng chiếu sáng đô thị.",
    exclusions: "Không áp dụng cho mất sáng toàn khu do lịch điều khiển trung tâm.",
    trigger: "Nhiều node cùng offline trong vòng 15 phút.",
    completionCriteria: ["95% node online lại", "Telemetry ổn định tối thiểu 15 phút", "Có bằng chứng nguồn dùng chung đã được kiểm tra"],
    preconditions: ["Có work order hợp lệ", "Có quyền truy cập telemetry"],
    tools: ["Thiết bị đo RF", "Đồng hồ đo điện áp", "Laptop cấu hình gateway"],
    ppe: ["Găng tay cách điện", "Kính bảo hộ", "Áo phản quang"],
    hazards: ["Nguy cơ điện áp tại hộp cáp"],
    controls: ["Cô lập nguồn khi mở hộp cáp", "Đặt cảnh báo khu vực thao tác"],
    emergencyAction: "Dừng thao tác và báo đội an toàn nếu phát hiện chập điện hoặc nước.",
    riskLevel: "HIGH",
    stopConditions: ["Không xác minh được nguồn đã cô lập", "Gateway không phản hồi sau hai lần reset"],
    procedureSteps: [
      { id: "STEP-01", title: "Xác định phạm vi mất kết nối", responsibleRole: "Field Technician", instruction: "Đối chiếu node offline với gateway và tuyến cấp nguồn.", expectedResult: "Khoanh vùng cụm ảnh hưởng.", warning: "" },
      { id: "STEP-02", title: "Kiểm tra nguồn dùng chung", responsibleRole: "Field Technician", instruction: "Đo điện áp tại tủ nguồn và hộp cáp chung trước khi reset node.", expectedResult: "Loại trừ hoặc xác nhận lỗi nguồn chung.", warning: "Cô lập nguồn khi mở hộp cáp." },
      { id: "STEP-03", title: "Kiểm tra gateway và RF", responsibleRole: "Network Team", instruction: "Ping gateway, kiểm tra kênh mesh và đo RF.", expectedResult: "Có bằng chứng mạng ổn định hoặc bị nhiễu.", warning: "" },
      { id: "STEP-04", title: "Reset theo cụm và xác minh", responsibleRole: "Field Technician", instruction: "Reset cụm sau khi hoàn tất kiểm tra nguồn, theo dõi telemetry 15 phút.", expectedResult: "Node online và dữ liệu ổn định.", warning: "" }
    ],
    decisionPoints: [
      { id: "DEC-01", condition: "Nguồn dùng chung bất thường?", yesAction: "Cô lập và sửa tuyến cáp trước khi reset.", noAction: "Tiếp tục kiểm tra gateway/RF.", exception: "Nếu có nguy cơ điện, dừng quy trình." }
    ],
    sourceKnowledgeIds: ["CASE-FL02-0043"],
    sourceSubmissionIds: ["SUB-2026-0043"],
    externalReferences: ["Ảnh cable-cut-01.jpg"],
    changeSummary: "Điều chỉnh thứ tự kiểm tra, thêm bước nguồn dùng chung và điều kiện dừng an toàn.",
    relatedSopIds: ["SOP-IOT-003"],
    confirmation: true,
    reviewChecklist: {
      technicalAccuracy: true,
      safetyComplete: true,
      sourceTraceability: true,
      versionValid: true,
      usableInField: true
    },
    history: [
      { id: "SOPD-EVT-008", action: "RESUBMITTED", actorId: "KC-001", comment: "Đã bổ sung safety và source traceability.", createdAt: "2026-07-21T19:25:00+07:00" }
    ],
    createdAt: "2026-07-21T18:10:00+07:00",
    updatedAt: "2026-07-21T19:25:00+07:00"
  },
  {
    id: "SOPD-2026-0016",
    taskId: "SOPTASK-2026-009",
    type: "NEW_SOP",
    status: "REJECTED",
    authorId: "KC-001",
    reviewerId: "KM-001",
    sopId: "SOP-RF-004",
    previousVersion: "",
    proposedVersion: "v1.0",
    changeLevel: "MAJOR",
    title: "Thử nghiệm thay gateway khi mất kết nối",
    summary: "Bản đề xuất bị từ chối vì chưa đủ bằng chứng và phạm vi quá rộng.",
    categoryId: "OPERATIONS",
    securityLevel: "INTERNAL",
    domain: "Smart Street Lighting",
    assetTypes: ["SMART_NODE"],
    faultType: "CONNECTIVITY_LOSS",
    intendedRoles: ["FIELD_TECHNICIAN"],
    purpose: "Đề xuất chưa đủ dữ liệu.",
    scope: "Chưa xác định.",
    exclusions: "",
    trigger: "",
    completionCriteria: [],
    preconditions: [],
    tools: [],
    ppe: [],
    hazards: [],
    controls: [],
    emergencyAction: "",
    riskLevel: "MEDIUM",
    stopConditions: [],
    procedureSteps: [],
    decisionPoints: [],
    sourceKnowledgeIds: [],
    sourceSubmissionIds: [],
    externalReferences: [],
    changeSummary: "",
    relatedSopIds: [],
    confirmation: false,
    reviewChecklist: {},
    reviewComments: [
      { id: "REV-004", actorId: "KM-001", section: "Nguồn", comment: "Không đủ case nguồn để chuẩn hóa thành SOP chính thức.", createdAt: "2026-07-21T17:50:00+07:00" }
    ],
    history: [
      { id: "SOPD-EVT-009", action: "REJECT", actorId: "KM-001", comment: "Không đủ evidence và phạm vi quá rộng.", createdAt: "2026-07-21T17:50:00+07:00" }
    ],
    createdAt: "2026-07-21T16:30:00+07:00",
    updatedAt: "2026-07-21T17:50:00+07:00"
  }
];

export const seedSopVersions = [
  {
    versionId: "SOPV-NET-007-2.1",
    sopId: "SOP-NET-007",
    version: "v2.1",
    status: "PUBLISHED",
    title: "Chẩn đoán nhiều Smart Node mất kết nối đồng thời",
    effectiveDate: "2026-06-01",
    reviewDate: "2027-06-01",
    authorId: "KC-001",
    approvedBy: "KM-001",
    sourceDraftId: "",
    changeSummary: "Phiên bản hiện hành trước FL-03.",
    createdAt: "2026-06-01T09:00:00+07:00"
  },
  {
    versionId: "SOPV-HV-002-3.4",
    sopId: "SOP-HV-002",
    version: "v3.4",
    status: "PUBLISHED",
    title: "Bảo trì máy biến áp cao thế",
    effectiveDate: "2026-01-01",
    reviewDate: "2027-01-01",
    authorId: "KC-001",
    approvedBy: "KM-001",
    sourceDraftId: "",
    changeSummary: "Phiên bản an toàn cao thế hiện hành.",
    createdAt: "2026-01-01T09:00:00+07:00"
  }
];

export const sopAuthoringSteps = [
  { id: "metadata", label: "Thông tin" },
  { id: "scope", label: "Phạm vi" },
  { id: "safety", label: "An toàn" },
  { id: "procedure", label: "Các bước" },
  { id: "references", label: "Nguồn" },
  { id: "review", label: "Xem lại" }
];

export const sopWorkflowLabels = {
  OPEN: "Đang mở",
  ACCEPTED: "Đã nhận",
  DRAFT: "Bản nháp",
  SUBMITTED: "Chờ duyệt",
  IN_REVIEW: "Đang duyệt",
  CHANGES_REQUESTED: "Cần chỉnh sửa",
  RESUBMITTED: "Đã gửi lại",
  REJECTED: "Từ chối",
  APPROVED: "Đã duyệt",
  PUBLISHED: "Đã xuất bản"
};

export const sopWorkflowTones = {
  OPEN: "warning",
  ACCEPTED: "neutral",
  DRAFT: "neutral",
  SUBMITTED: "warning",
  IN_REVIEW: "warning",
  CHANGES_REQUESTED: "danger",
  RESUBMITTED: "warning",
  REJECTED: "danger",
  APPROVED: "good",
  PUBLISHED: "good"
};

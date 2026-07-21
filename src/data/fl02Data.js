export const currentWorkOrder = {
  id: "WO-2026-00421",
  assetId: "CTN-1108",
  assetType: "CITYTOUCH_NODE",
  location: "Main St - District 7",
  faultType: "CONNECTIVITY_LOSS",
  symptom: "8 node CityTouch mất kết nối đồng thời sau mưa lớn.",
  openedAt: "2026-07-21T14:32"
};

export const sopCatalog = [
  {
    sopId: "SOP-NET-007",
    title: "Chẩn đoán nhiều Smart Node mất kết nối đồng thời",
    version: "v2.1",
    status: "PUBLISHED",
    steps: [
      { id: "STEP-01", label: "Xác định phạm vi mất kết nối" },
      { id: "STEP-02", label: "Kiểm tra gateway và mesh channel" },
      { id: "STEP-03", label: "Loại trừ nhiễu RF" },
      { id: "STEP-04", label: "Reset theo cụm và xác minh telemetry" }
    ]
  },
  {
    sopId: "SOP-IOT-003",
    title: "Hiệu chuẩn kết nối NEMA Socket Node",
    version: "v1.8",
    status: "OUTDATED",
    steps: [
      { id: "STEP-01", label: "Kiểm tra firmware" }
    ]
  },
  {
    sopId: "SOP-HV-002",
    title: "Bảo trì máy biến áp cao thế",
    version: "v3.4",
    status: "PUBLISHED",
    steps: [
      { id: "STEP-01", label: "Cách ly và LOTO" },
      { id: "STEP-02", label: "Xả tụ điện" },
      { id: "STEP-03", label: "Kiểm tra bằng mắt" }
    ]
  }
];

export const seedFieldSubmissions = [
  {
    id: "SUB-2026-0042",
    status: "DRAFT",
    submittedBy: "FT-001",
    workOrderId: "WO-2026-00421",
    context: {
      assetId: "CTN-1108",
      assetType: "CITYTOUCH_NODE",
      incidentDateTime: "2026-07-21T14:32",
      location: "Main St - District 7",
      district: "District 7",
      faultType: "CONNECTIVITY_LOSS",
      severity: "HIGH",
      impactScope: "MULTIPLE_ASSETS",
      safetyFlag: false,
      safetyDescription: "",
      sensitiveInfoFlag: false
    },
    resolution: {
      symptomSummary: "8 node mất kết nối đồng thời trong cùng cụm gateway sau mưa lớn.",
      errorCode: "OFFLINE-GROUP",
      diagnosisSteps: ["Kiểm tra telemetry gateway", "Đối chiếu tuyến nguồn dùng chung"],
      rootCause: "Cáp nguồn chung bị cắt làm toàn bộ cụm node mất kết nối.",
      repairAction: "Cô lập nguồn, nối lại cáp và gia cố hộp cáp trước khi reset cụm node.",
      parts: [{ partNumber: "CBL-CU-25", name: "Cáp đồng 25mm", qty: 12 }],
      outcome: "RESOLVED",
      verificationMethod: "8 node online ổn định 15 phút và telemetry cập nhật dưới 5 phút.",
      nextAction: "",
      downtimeMinutes: 95,
      relatedKnowledgeIds: ["SOP-NET-007"],
      sopUsage: {
        status: "USED",
        appliedSopId: "SOP-NET-007",
        appliedSopVersion: "v2.1",
        appliedSopStepIds: ["STEP-03", "STEP-04"],
        feedback: "INCOMPLETE",
        deviationFlag: true,
        deviationReason: "SOP chưa có bước kiểm tra nguồn dùng chung trước khi thay từng node."
      }
    },
    knowledge: {
      lessonLearned: "Khi nhiều node cùng offline, cần kiểm tra thành phần dùng chung trước khi thay từng node.",
      recommendation: "Bổ sung kiểm tra nguồn và tuyến cáp vào checklist xử lý mất kết nối theo cụm.",
      reusableScope: "SAME_MODEL",
      sopProposal: {
        action: "UPDATE_EXISTING",
        targetSopId: "SOP-NET-007",
        affectedStepIds: ["STEP-04"],
        gapSummary: "Thiếu bước kiểm tra tuyến nguồn dùng chung trước khi thay từng node.",
        changeType: "MODIFY_STEP",
        proposedChange: "Bổ sung bước kiểm tra nguồn và tuyến cáp dùng chung trước bước reset/thay node.",
        targetSopRationale: ""
      },
      tags: ["citytouch", "offline", "shared power"]
    },
    attachments: [],
    reviewHistory: [],
    createdAt: "2026-07-21T16:20:00+07:00",
    updatedAt: "2026-07-21T16:40:00+07:00"
  },
  {
    id: "SUB-2026-0043",
    status: "SUBMITTED",
    submittedBy: "FT-001",
    workOrderId: "WO-2026-00423",
    context: {
      assetId: "CTN-1108",
      assetType: "CITYTOUCH_NODE",
      incidentDateTime: "2026-07-21T14:32",
      location: "Main St - District 7",
      district: "District 7",
      faultType: "CONNECTIVITY_LOSS",
      severity: "HIGH",
      impactScope: "MULTIPLE_ASSETS",
      safetyFlag: false,
      safetyDescription: "",
      sensitiveInfoFlag: false
    },
    resolution: {
      symptomSummary: "8 node mất kết nối đồng thời trong cùng cụm gateway.",
      errorCode: "OFFLINE-GROUP",
      diagnosisSteps: ["Kiểm tra telemetry", "Kiểm tra tuyến nguồn dùng chung"],
      rootCause: "Cáp nguồn chung bị cắt trong lúc thi công vỉa hè.",
      repairAction: "Nối lại cáp, gia cố hộp nối và reset cụm node.",
      parts: [{ partNumber: "CBL-CU-25", name: "Cáp đồng 25mm", qty: 12 }],
      outcome: "RESOLVED",
      verificationMethod: "Tất cả node online ổn định trong 15 phút.",
      nextAction: "",
      downtimeMinutes: 95,
      relatedKnowledgeIds: ["SOP-NET-007"],
      sopUsage: {
        status: "USED",
        appliedSopId: "SOP-NET-007",
        appliedSopVersion: "v2.1",
        appliedSopStepIds: ["STEP-03", "STEP-04"],
        feedback: "INCOMPLETE",
        deviationFlag: true,
        deviationReason: "Phải kiểm tra cáp nguồn dùng chung trước khi thực hiện reset."
      }
    },
    knowledge: {
      lessonLearned: "Nhiều node cùng offline thường là tín hiệu của lỗi thành phần dùng chung.",
      recommendation: "Ưu tiên kiểm tra gateway, nguồn và tuyến cáp trước khi thay từng node.",
      reusableScope: "SAME_MODEL",
      sopProposal: {
        action: "UPDATE_EXISTING",
        targetSopId: "SOP-NET-007",
        affectedStepIds: ["STEP-04"],
        gapSummary: "SOP chưa nhấn mạnh kiểm tra nguồn dùng chung.",
        changeType: "MODIFY_STEP",
        proposedChange: "Thêm decision rule: nếu nhiều node cùng offline, kiểm tra nguồn/tuyến chung trước.",
        targetSopRationale: ""
      },
      tags: ["citytouch", "offline", "cable"]
    },
    attachments: [
      { id: "ATT-001", name: "cable-cut-01.jpg", mimeType: "image/jpeg", sizeBytes: 1840000, category: "FIELD_PHOTO", altText: "Vị trí cáp bị cắt tại hố ga" }
    ],
    reviewHistory: [
      { id: "EVT-001", action: "SUBMITTED", actorId: "FT-001", comment: "Gửi kiểm duyệt lần đầu.", createdAt: "2026-07-21T16:50:00+07:00" }
    ],
    createdAt: "2026-07-21T16:20:00+07:00",
    updatedAt: "2026-07-21T16:50:00+07:00",
    submittedAt: "2026-07-21T16:50:00+07:00"
  },
  {
    id: "SUB-2026-0044",
    status: "CHANGES_REQUESTED",
    submittedBy: "FT-001",
    workOrderId: "WO-2026-00418",
    context: {
      assetId: "SN-4217",
      assetType: "SMART_NODE",
      incidentDateTime: "2026-07-20T10:10",
      location: "Hill St - District 3",
      district: "District 3",
      faultType: "RF_INTERFERENCE",
      severity: "MEDIUM",
      impactScope: "MULTIPLE_ASSETS",
      safetyFlag: false,
      safetyDescription: "",
      sensitiveInfoFlag: false
    },
    resolution: {
      symptomSummary: "Nhóm smart node mất tín hiệu theo chu kỳ trong giờ cao điểm.",
      errorCode: "MESH-LATENCY",
      diagnosisSteps: ["Đo tín hiệu RF", "Đổi kênh gateway thử nghiệm"],
      rootCause: "Nhiễu RF từ thiết bị lân cận gây trễ mesh.",
      repairAction: "Đổi kênh mesh và theo dõi telemetry sau 30 phút.",
      parts: [],
      outcome: "PARTIAL",
      verificationMethod: "Telemetry giảm trễ nhưng vẫn cần theo dõi qua đêm.",
      nextAction: "Bổ sung đo RF sau 24 giờ.",
      downtimeMinutes: 40,
      relatedKnowledgeIds: ["SOP-NET-007"],
      sopUsage: {
        status: "USED",
        appliedSopId: "SOP-NET-007",
        appliedSopVersion: "v2.1",
        appliedSopStepIds: ["STEP-02", "STEP-03"],
        feedback: "HELPFUL",
        deviationFlag: false,
        deviationReason: ""
      }
    },
    knowledge: {
      lessonLearned: "Nhiễu RF theo giờ có thể làm node mất tín hiệu theo chu kỳ.",
      recommendation: "Ghi log RF theo khung giờ để tránh kết luận lỗi phần cứng quá sớm.",
      reusableScope: "SAME_AREA",
      sopProposal: {
        action: "NO_CHANGE",
        targetSopId: "",
        affectedStepIds: [],
        gapSummary: "",
        changeType: "OTHER",
        proposedChange: "",
        targetSopRationale: ""
      },
      tags: ["rf", "mesh"]
    },
    attachments: [],
    reviewHistory: [
      { id: "EVT-002", action: "SUBMITTED", actorId: "FT-001", comment: "Gửi kiểm duyệt.", createdAt: "2026-07-20T12:30:00+07:00" },
      { id: "EVT-003", action: "REQUEST_CHANGES", actorId: "KM-001", comment: "Bổ sung ảnh hiện trường và mô tả verification sau khi đổi kênh mesh.", requestedFieldIds: ["EVD-PHOTOS", "RES-VERIFY"], createdAt: "2026-07-20T15:10:00+07:00" }
    ],
    createdAt: "2026-07-20T11:40:00+07:00",
    updatedAt: "2026-07-20T15:10:00+07:00",
    submittedAt: "2026-07-20T12:30:00+07:00"
  },
  {
    id: "SUB-2026-0045",
    status: "RESUBMITTED",
    submittedBy: "FT-002",
    workOrderId: "WO-2026-00411",
    context: {
      assetId: "NODE-42",
      assetType: "UNDERGROUND_CABLE",
      incidentDateTime: "2026-07-19T08:15",
      location: "North Corridor - Node 42",
      district: "North Corridor",
      faultType: "VOLTAGE_DROP",
      severity: "HIGH",
      impactScope: "AREA_OUTAGE",
      safetyFlag: true,
      safetyDescription: "Hộp nối có nước và nguy cơ chạm điện khi mở nắp.",
      sensitiveInfoFlag: false
    },
    resolution: {
      symptomSummary: "Toàn bộ tuyến đèn nhấp nháy và điện áp tại Node 42 tụt mạnh.",
      errorCode: "VOLT-DROP",
      diagnosisSteps: ["Đo điện áp đầu nguồn", "Kiểm tra continuity trung tính"],
      rootCause: "Đứt dây trung tính tại hộp nối Node 42.",
      repairAction: "Cô lập mạch, thay đoạn cáp trung tính và bọc đầu nối IP68.",
      parts: [],
      outcome: "RESOLVED",
      verificationMethod: "Điện áp trở lại ổn định và đèn không nhấp nháy sau 20 phút.",
      nextAction: "",
      downtimeMinutes: 55,
      relatedKnowledgeIds: ["CASE-CABLE-042"],
      sopUsage: {
        status: "NOT_FOUND",
        appliedSopId: "",
        appliedSopVersion: "",
        appliedSopStepIds: [],
        feedback: "",
        deviationFlag: false,
        deviationReason: ""
      }
    },
    knowledge: {
      lessonLearned: "Sụt áp theo tuyến cần kiểm tra dây trung tính trước khi thay driver LED.",
      recommendation: "Tạo SOP riêng cho xử lý open neutral ở tuyến cáp ngầm.",
      reusableScope: "ORGANIZATION_WIDE",
      sopProposal: {
        action: "NEW_SOP",
        targetSopId: "",
        affectedStepIds: [],
        gapSummary: "Chưa có SOP chuẩn cho lỗi open neutral ở mạch nối tiếp.",
        changeType: "ADD_STEP",
        proposedChange: "Tạo SOP mới cho kiểm tra trung tính, cô lập mạch và xác minh sau sửa.",
        targetSopRationale: ""
      },
      tags: ["open neutral", "voltage drop"]
    },
    attachments: [
      { id: "ATT-002", name: "node-42-neutral.jpg", mimeType: "image/jpeg", sizeBytes: 1250000, category: "FIELD_PHOTO", altText: "Dây trung tính tại Node 42" }
    ],
    reviewHistory: [
      { id: "EVT-004", action: "REQUEST_CHANGES", actorId: "KM-001", comment: "Cần thêm ảnh hộp nối và xác minh điện áp sau sửa.", requestedFieldIds: ["EVD-PHOTOS", "RES-VERIFY"], createdAt: "2026-07-19T12:00:00+07:00" },
      { id: "EVT-005", action: "RESUBMITTED", actorId: "FT-002", comment: "Đã bổ sung ảnh và verification.", createdAt: "2026-07-19T15:30:00+07:00" }
    ],
    createdAt: "2026-07-19T10:00:00+07:00",
    updatedAt: "2026-07-19T15:30:00+07:00",
    submittedAt: "2026-07-19T11:10:00+07:00"
  },
  {
    id: "SUB-2026-0046",
    status: "REJECTED",
    submittedBy: "FT-001",
    workOrderId: "WO-2026-00390",
    context: {
      assetId: "LED-1001",
      assetType: "LED_FIXTURE",
      incidentDateTime: "2026-07-17T09:15",
      location: "Demo Area",
      district: "District 1",
      faultType: "THERMAL_FAILURE",
      severity: "LOW",
      impactScope: "SINGLE_ASSET",
      safetyFlag: false,
      safetyDescription: "",
      sensitiveInfoFlag: false
    },
    resolution: {
      symptomSummary: "Đèn giảm sáng sau thời gian vận hành dài.",
      errorCode: "",
      diagnosisSteps: ["Quan sát bằng mắt"],
      rootCause: "Không đủ bằng chứng để kết luận.",
      repairAction: "Chưa thực hiện hành động sửa chữa rõ ràng.",
      parts: [],
      outcome: "UNRESOLVED",
      verificationMethod: "Chưa có xác minh.",
      nextAction: "Tạo work order kiểm tra lại.",
      downtimeMinutes: 0,
      relatedKnowledgeIds: [],
      sopUsage: {
        status: "NOT_APPLICABLE",
        appliedSopId: "",
        appliedSopVersion: "",
        appliedSopStepIds: [],
        feedback: "",
        deviationFlag: false,
        deviationReason: ""
      }
    },
    knowledge: {
      lessonLearned: "Chưa có bài học có thể tái sử dụng.",
      recommendation: "",
      reusableScope: "ONE_ASSET",
      sopProposal: {
        action: "NO_CHANGE",
        targetSopId: "",
        affectedStepIds: [],
        gapSummary: "",
        changeType: "OTHER",
        proposedChange: "",
        targetSopRationale: ""
      },
      tags: []
    },
    attachments: [],
    reviewHistory: [
      { id: "EVT-006", action: "REJECT", actorId: "KM-001", comment: "Nội dung chưa đủ bằng chứng và không có giá trị tái sử dụng rõ ràng.", reasonCode: "INSUFFICIENT_VALUE", createdAt: "2026-07-17T12:10:00+07:00" }
    ],
    createdAt: "2026-07-17T10:00:00+07:00",
    updatedAt: "2026-07-17T12:10:00+07:00"
  }
];

export const seedSopRequests = [
  {
    id: "SOPREQ-0007",
    type: "UPDATE_EXISTING",
    sourceSubmissionId: "SUB-2026-0047",
    sourceKnowledgeId: "CASE-CABLE-042",
    appliedSopRef: {
      sopId: "SOP-NET-007",
      version: "v2.1",
      stepIds: ["STEP-03", "STEP-04"]
    },
    targetSopId: "SOP-NET-007",
    affectedStepIds: ["STEP-04"],
    gapSummary: "Thiếu bước kiểm tra tuyến nguồn dùng chung.",
    proposedChange: "Bổ sung kiểm tra nguồn và tuyến cáp trước khi thay node.",
    status: "MOCK_HANDOFF",
    createdAt: "2026-07-21T17:30:00+07:00"
  }
];

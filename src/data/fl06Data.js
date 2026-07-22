export const ADMIN_CONFIG_VERSION = "v3.0";

export const adminRoleLabels = {
  FIELD_TECHNICIAN: "Kỹ thuật viên hiện trường",
  CONTRIBUTOR: "Người đóng góp tri thức",
  KNOWLEDGE_MANAGER: "Quản lý tri thức",
  ADMINISTRATOR: "Quản trị viên"
};

export const adminResourceLabels = {
  KNOWLEDGE: "Tri thức",
  SOP: "SOP",
  SUBMISSION: "Submission hiện trường",
  REQUEST: "Yêu cầu bổ sung",
  LIFECYCLE: "Vòng đời tri thức",
  ADMIN: "Quản trị hệ thống"
};

export const adminActionLabels = {
  VIEW: "Xem",
  CREATE: "Tạo",
  EDIT_OWN: "Sửa của mình",
  EDIT_ANY: "Sửa bất kỳ",
  REVIEW: "Rà soát",
  APPROVE: "Phê duyệt",
  ARCHIVE: "Lưu trữ",
  MANAGE: "Quản trị"
};

export const adminScreenIds = [
  "admin-entry",
  "admin-dashboard",
  "admin-users",
  "admin-user-detail",
  "admin-role-simulator",
  "admin-permissions",
  "admin-taxonomy",
  "admin-taxonomy-tree",
  "admin-concept-editor",
  "admin-synonyms",
  "admin-metadata-templates",
  "admin-metadata-template",
  "admin-content-types",
  "admin-search-config",
  "admin-lifecycle-policy",
  "admin-audit-log",
  "admin-demo-data",
  "admin-system-settings",
  "admin-impact-preview",
  "admin-operation-result"
];

export const seedAdminConfig = {
  configVersion: ADMIN_CONFIG_VERSION,
  publishedVersion: "TAX-v2.4",
  pendingChange: null,
  demoUsers: [
    { userId: "FT-001", fullName: "Minh Trần", email: "minh.tran@labsl.example", departmentId: "OPS-NORTH", roleIds: ["FIELD_TECHNICIAN"], domainIds: ["DOMAIN_LIGHTING"], status: "ACTIVE" },
    { userId: "FT-002", fullName: "Lan Phạm", email: "lan.pham@labsl.example", departmentId: "OPS-SOUTH", roleIds: ["FIELD_TECHNICIAN"], domainIds: ["DOMAIN_POWER"], status: "ACTIVE" },
    { userId: "KC-001", fullName: "Sarah Jenkins", email: "sarah.jenkins@labsl.example", departmentId: "KMS-CONTENT", roleIds: ["CONTRIBUTOR"], domainIds: ["DOMAIN_LIGHTING"], status: "ACTIVE" },
    { userId: "KM-001", fullName: "Alex Chen", email: "alex.chen@labsl.example", departmentId: "KMS-GOV", roleIds: ["KNOWLEDGE_MANAGER"], domainIds: ["DOMAIN_LIGHTING", "DOMAIN_POWER"], status: "ACTIVE" },
    { userId: "AD-001", fullName: "Demo Admin", email: "admin@labsl.example", departmentId: "SYSTEM", roleIds: ["ADMINISTRATOR"], domainIds: ["DOMAIN_LIGHTING", "DOMAIN_POWER", "DOMAIN_NETWORK"], status: "ACTIVE" },
    { userId: "MX-001", fullName: "Nghê Tài Phát", email: "phat.nt@labsl.example", departmentId: "KMS-PROTOTYPE", roleIds: ["CONTRIBUTOR", "KNOWLEDGE_MANAGER"], domainIds: ["DOMAIN_LIGHTING", "DOMAIN_NETWORK"], status: "ACTIVE" }
  ],
  roles: [
    { roleId: "FIELD_TECHNICIAN", name: "Kỹ thuật viên hiện trường", description: "Tìm kiếm tri thức, dùng SOP và gửi tri thức hiện trường." },
    { roleId: "CONTRIBUTOR", name: "Người đóng góp tri thức", description: "Biên soạn bài viết/SOP theo task đã phân công." },
    { roleId: "KNOWLEDGE_MANAGER", name: "Quản lý tri thức", description: "Phân loại, rà soát, phê duyệt và quản lý vòng đời tri thức." },
    { roleId: "ADMINISTRATOR", name: "Quản trị viên", description: "Cấu hình hệ thống, taxonomy, permission, seed data và audit." }
  ],
  permissionRules: [
    { roleId: "FIELD_TECHNICIAN", resource: "KNOWLEDGE", action: "VIEW", allowed: true },
    { roleId: "FIELD_TECHNICIAN", resource: "SUBMISSION", action: "CREATE", allowed: true },
    { roleId: "FIELD_TECHNICIAN", resource: "SUBMISSION", action: "EDIT_OWN", allowed: true },
    { roleId: "FIELD_TECHNICIAN", resource: "REQUEST", action: "CREATE", allowed: true },
    { roleId: "FIELD_TECHNICIAN", resource: "ADMIN", action: "VIEW", allowed: false },
    { roleId: "CONTRIBUTOR", resource: "KNOWLEDGE", action: "VIEW", allowed: true },
    { roleId: "CONTRIBUTOR", resource: "KNOWLEDGE", action: "CREATE", allowed: true },
    { roleId: "CONTRIBUTOR", resource: "KNOWLEDGE", action: "EDIT_OWN", allowed: true },
    { roleId: "CONTRIBUTOR", resource: "SOP", action: "CREATE", allowed: true },
    { roleId: "CONTRIBUTOR", resource: "SOP", action: "EDIT_OWN", allowed: true },
    { roleId: "CONTRIBUTOR", resource: "REQUEST", action: "EDIT_OWN", allowed: true },
    { roleId: "CONTRIBUTOR", resource: "ADMIN", action: "VIEW", allowed: false },
    { roleId: "KNOWLEDGE_MANAGER", resource: "KNOWLEDGE", action: "VIEW", allowed: true },
    { roleId: "KNOWLEDGE_MANAGER", resource: "KNOWLEDGE", action: "EDIT_ANY", allowed: true },
    { roleId: "KNOWLEDGE_MANAGER", resource: "KNOWLEDGE", action: "REVIEW", allowed: true },
    { roleId: "KNOWLEDGE_MANAGER", resource: "KNOWLEDGE", action: "APPROVE", allowed: true },
    { roleId: "KNOWLEDGE_MANAGER", resource: "SOP", action: "REVIEW", allowed: true },
    { roleId: "KNOWLEDGE_MANAGER", resource: "SOP", action: "APPROVE", allowed: true },
    { roleId: "KNOWLEDGE_MANAGER", resource: "SUBMISSION", action: "REVIEW", allowed: true },
    { roleId: "KNOWLEDGE_MANAGER", resource: "REQUEST", action: "REVIEW", allowed: true },
    { roleId: "KNOWLEDGE_MANAGER", resource: "LIFECYCLE", action: "MANAGE", allowed: true },
    { roleId: "KNOWLEDGE_MANAGER", resource: "ADMIN", action: "VIEW", allowed: false },
    { roleId: "ADMINISTRATOR", resource: "KNOWLEDGE", action: "VIEW", allowed: true },
    { roleId: "ADMINISTRATOR", resource: "SOP", action: "VIEW", allowed: true },
    { roleId: "ADMINISTRATOR", resource: "SUBMISSION", action: "VIEW", allowed: true },
    { roleId: "ADMINISTRATOR", resource: "REQUEST", action: "VIEW", allowed: true },
    { roleId: "ADMINISTRATOR", resource: "LIFECYCLE", action: "VIEW", allowed: true },
    { roleId: "ADMINISTRATOR", resource: "ADMIN", action: "VIEW", allowed: true },
    { roleId: "ADMINISTRATOR", resource: "ADMIN", action: "MANAGE", allowed: true }
  ],
  taxonomySchemes: [
    { schemeId: "DOMAIN", name: "Miền tri thức", language: "vi", version: "2.4", status: "PUBLISHED" },
    { schemeId: "FAULT_TYPE", name: "Loại lỗi", language: "vi", version: "2.4", status: "PUBLISHED" },
    { schemeId: "ASSET_TYPE", name: "Loại tài sản", language: "vi", version: "2.4", status: "PUBLISHED" },
    { schemeId: "CONTENT_CATEGORY", name: "Danh mục nội dung", language: "vi", version: "2.4", status: "PUBLISHED" }
  ],
  taxonomyConcepts: [
    { conceptId: "DOMAIN_LIGHTING", schemeId: "DOMAIN", value: "LIGHTING", prefLabel: "Chiếu sáng", altLabels: ["đèn đường", "street lighting"], definition: "Tri thức về vận hành đèn đường.", broaderConceptId: "", relatedConceptIds: ["DOMAIN_NETWORK"], status: "ACTIVE", replacedById: "", usageCount: 14 },
    { conceptId: "DOMAIN_NETWORK", schemeId: "DOMAIN", value: "NETWORK", prefLabel: "Mạng điều khiển", altLabels: ["mesh", "gateway"], definition: "Kết nối node, gateway và kênh truyền.", broaderConceptId: "", relatedConceptIds: ["FAULT_CONNECTIVITY_LOSS"], status: "ACTIVE", replacedById: "", usageCount: 11 },
    { conceptId: "DOMAIN_POWER", schemeId: "DOMAIN", value: "POWER", prefLabel: "Nguồn điện", altLabels: ["lưới điện", "điện áp"], definition: "Nguồn cấp, tủ điện và an toàn điện.", broaderConceptId: "", relatedConceptIds: ["FAULT_VOLTAGE_DROP"], status: "ACTIVE", replacedById: "", usageCount: 9 },
    { conceptId: "DOMAIN_SAFETY", schemeId: "DOMAIN", value: "SAFETY_DOMAIN", prefLabel: "An toàn", altLabels: ["PPE", "lockout tagout"], definition: "Quy định an toàn hiện trường.", broaderConceptId: "", relatedConceptIds: ["CAT_SAFETY"], status: "ACTIVE", replacedById: "", usageCount: 8 },
    { conceptId: "FAULT_CONNECTIVITY_LOSS", schemeId: "FAULT_TYPE", value: "CONNECTIVITY_LOSS", prefLabel: "Mất kết nối", altLabels: ["offline", "outage", "mất mạng"], definition: "Node/gateway không gửi dữ liệu hoặc mất liên lạc.", broaderConceptId: "", relatedConceptIds: ["ASSET_SMART_NODE"], status: "ACTIVE", replacedById: "", usageCount: 7 },
    { conceptId: "FAULT_VOLTAGE_DROP", schemeId: "FAULT_TYPE", value: "VOLTAGE_DROP", prefLabel: "Sụt áp", altLabels: ["sụt nguồn", "điện áp thấp"], definition: "Điện áp cấp thấp hơn ngưỡng vận hành.", broaderConceptId: "", relatedConceptIds: ["DOMAIN_POWER"], status: "ACTIVE", replacedById: "", usageCount: 5 },
    { conceptId: "FAULT_WATER_INGRESS", schemeId: "FAULT_TYPE", value: "WATER_INGRESS", prefLabel: "Nước xâm nhập", altLabels: ["ẩm hộp nối", "nước vào tủ"], definition: "Nước hoặc hơi ẩm đi vào thiết bị/hộp nối.", broaderConceptId: "", relatedConceptIds: ["ASSET_CONTROL_CABINET"], status: "ACTIVE", replacedById: "", usageCount: 4 },
    { conceptId: "FAULT_RF_INTERFERENCE", schemeId: "FAULT_TYPE", value: "RF_INTERFERENCE", prefLabel: "Nhiễu RF", altLabels: ["nhiễu sóng", "mesh yếu"], definition: "Nhiễu vô tuyến làm suy giảm mạng mesh.", broaderConceptId: "", relatedConceptIds: ["DOMAIN_NETWORK"], status: "ACTIVE", replacedById: "", usageCount: 3 },
    { conceptId: "FAULT_THERMAL_FAILURE", schemeId: "FAULT_TYPE", value: "THERMAL_FAILURE", prefLabel: "Lỗi nhiệt", altLabels: ["quá nhiệt", "nóng driver"], definition: "Thiết bị lỗi do nhiệt độ hoặc tản nhiệt kém.", broaderConceptId: "", relatedConceptIds: ["ASSET_LED_FIXTURE"], status: "ACTIVE", replacedById: "", usageCount: 3 },
    { conceptId: "FAULT_SAFETY_HIGH_VOLTAGE", schemeId: "FAULT_TYPE", value: "SAFETY_HIGH_VOLTAGE", prefLabel: "An toàn cao thế", altLabels: ["cao áp", "nguy cơ điện giật"], definition: "Sự cố có rủi ro điện áp cao.", broaderConceptId: "", relatedConceptIds: ["DOMAIN_SAFETY"], status: "ACTIVE", replacedById: "", usageCount: 2 },
    { conceptId: "FAULT_OLD_POWER_LOSS", schemeId: "FAULT_TYPE", value: "POWER_LOSS_OLD", prefLabel: "Mất nguồn cũ", altLabels: ["đứt nguồn"], definition: "Thuật ngữ cũ, thay bằng Sụt áp hoặc Mất kết nối tùy ngữ cảnh.", broaderConceptId: "", relatedConceptIds: ["FAULT_VOLTAGE_DROP"], status: "DEPRECATED", replacedById: "FAULT_VOLTAGE_DROP", usageCount: 1 },
    { conceptId: "ASSET_CITYTOUCH_NODE", schemeId: "ASSET_TYPE", value: "CITYTOUCH_NODE", prefLabel: "CityTouch Node", altLabels: ["CTN", "citytouch"], definition: "Node điều khiển CityTouch.", broaderConceptId: "", relatedConceptIds: ["FAULT_CONNECTIVITY_LOSS"], status: "ACTIVE", replacedById: "", usageCount: 8 },
    { conceptId: "ASSET_SMART_NODE", schemeId: "ASSET_TYPE", value: "SMART_NODE", prefLabel: "Smart Node", altLabels: ["smartnode", "node thông minh"], definition: "Node điều khiển đèn thông minh.", broaderConceptId: "", relatedConceptIds: ["DOMAIN_NETWORK"], status: "ACTIVE", replacedById: "", usageCount: 10 },
    { conceptId: "ASSET_LED_FIXTURE", schemeId: "ASSET_TYPE", value: "LED_FIXTURE", prefLabel: "Đèn LED", altLabels: ["bộ đèn", "fixture"], definition: "Bộ đèn LED đường phố.", broaderConceptId: "", relatedConceptIds: ["FAULT_THERMAL_FAILURE"], status: "ACTIVE", replacedById: "", usageCount: 7 },
    { conceptId: "ASSET_TRANSFORMER", schemeId: "ASSET_TYPE", value: "TRANSFORMER", prefLabel: "Máy biến áp", altLabels: ["MBA", "transformer"], definition: "Thiết bị biến đổi điện áp.", broaderConceptId: "", relatedConceptIds: ["DOMAIN_POWER"], status: "ACTIVE", replacedById: "", usageCount: 5 },
    { conceptId: "ASSET_CONTROL_CABINET", schemeId: "ASSET_TYPE", value: "CONTROL_CABINET", prefLabel: "Tủ điều khiển", altLabels: ["tủ điện", "cabinet"], definition: "Tủ điều khiển chiếu sáng.", broaderConceptId: "", relatedConceptIds: ["FAULT_WATER_INGRESS"], status: "ACTIVE", replacedById: "", usageCount: 6 },
    { conceptId: "ASSET_UNDERGROUND_CABLE", schemeId: "ASSET_TYPE", value: "UNDERGROUND_CABLE", prefLabel: "Cáp ngầm", altLabels: ["cáp điện", "underground cable"], definition: "Cáp nguồn/điều khiển ngầm.", broaderConceptId: "", relatedConceptIds: ["DOMAIN_POWER"], status: "ACTIVE", replacedById: "", usageCount: 4 },
    { conceptId: "CAT_TROUBLESHOOTING", schemeId: "CONTENT_CATEGORY", value: "TROUBLESHOOTING", prefLabel: "Khắc phục sự cố", altLabels: ["troubleshooting", "xử lý lỗi"], definition: "Hướng dẫn chẩn đoán và xử lý lỗi.", broaderConceptId: "", relatedConceptIds: ["FAULT_CONNECTIVITY_LOSS"], status: "ACTIVE", replacedById: "", usageCount: 10 },
    { conceptId: "CAT_MAINTENANCE", schemeId: "CONTENT_CATEGORY", value: "MAINTENANCE", prefLabel: "Bảo trì", altLabels: ["maintenance", "bảo dưỡng"], definition: "Quy trình bảo trì định kỳ.", broaderConceptId: "", relatedConceptIds: ["ASSET_LED_FIXTURE"], status: "ACTIVE", replacedById: "", usageCount: 7 },
    { conceptId: "CAT_SAFETY", schemeId: "CONTENT_CATEGORY", value: "SAFETY", prefLabel: "An toàn", altLabels: ["safety", "PPE"], definition: "Tri thức liên quan kiểm soát an toàn.", broaderConceptId: "", relatedConceptIds: ["DOMAIN_SAFETY"], status: "ACTIVE", replacedById: "", usageCount: 6 },
    { conceptId: "CAT_OPERATIONS", schemeId: "CONTENT_CATEGORY", value: "OPERATIONS", prefLabel: "Vận hành", altLabels: ["operations", "ca trực"], definition: "Vận hành hệ thống và ca trực.", broaderConceptId: "", relatedConceptIds: ["DOMAIN_LIGHTING"], status: "ACTIVE", replacedById: "", usageCount: 5 },
    { conceptId: "CAT_TRAINING", schemeId: "CONTENT_CATEGORY", value: "TRAINING", prefLabel: "Đào tạo", altLabels: ["training", "hướng dẫn học"], definition: "Tài liệu đào tạo kỹ thuật.", broaderConceptId: "", relatedConceptIds: ["DOMAIN_LIGHTING"], status: "ACTIVE", replacedById: "", usageCount: 3 },
    { conceptId: "CAT_OBSOLETE", schemeId: "CONTENT_CATEGORY", value: "OLD_GUIDE", prefLabel: "Hướng dẫn cũ", altLabels: ["legacy guide"], definition: "Nhóm tài liệu cũ đã ngưng dùng.", broaderConceptId: "", relatedConceptIds: ["CAT_TRAINING"], status: "DEPRECATED", replacedById: "CAT_TRAINING", usageCount: 2 }
  ],
  metadataTemplates: [
    {
      templateId: "TPL-SOP",
      name: "Mẫu metadata SOP",
      contentType: "SOP",
      status: "ACTIVE",
      fields: [
        { fieldId: "assetType", label: "Loại tài sản", type: "taxonomy", required: true, visibleRoleIds: ["CONTRIBUTOR", "KNOWLEDGE_MANAGER", "ADMINISTRATOR"] },
        { fieldId: "faultType", label: "Loại lỗi", type: "taxonomy", required: true, visibleRoleIds: ["CONTRIBUTOR", "KNOWLEDGE_MANAGER", "ADMINISTRATOR"] },
        { fieldId: "ppe", label: "PPE bắt buộc", type: "text", required: true, visibleRoleIds: ["CONTRIBUTOR", "KNOWLEDGE_MANAGER"] },
        { fieldId: "reviewCycle", label: "Chu kỳ rà soát", type: "number", required: true, visibleRoleIds: ["KNOWLEDGE_MANAGER", "ADMINISTRATOR"] }
      ]
    },
    {
      templateId: "TPL-CASE",
      name: "Mẫu metadata ca sửa chữa",
      contentType: "REPAIR_CASE",
      status: "ACTIVE",
      fields: [
        { fieldId: "assetId", label: "Asset ID", type: "text", required: true, visibleRoleIds: ["FIELD_TECHNICIAN", "KNOWLEDGE_MANAGER"] },
        { fieldId: "district", label: "Khu vực", type: "text", required: true, visibleRoleIds: ["FIELD_TECHNICIAN", "KNOWLEDGE_MANAGER"] },
        { fieldId: "evidence", label: "Bằng chứng", type: "attachment", required: true, visibleRoleIds: ["FIELD_TECHNICIAN", "KNOWLEDGE_MANAGER"] }
      ]
    }
  ],
  contentTypes: [
    { contentTypeId: "SOP", label: "SOP", workflowCode: "FL-03", templateId: "TPL-SOP", status: "ACTIVE" },
    { contentTypeId: "REPAIR_CASE", label: "Ca sửa chữa", workflowCode: "FL-02", templateId: "TPL-CASE", status: "ACTIVE" },
    { contentTypeId: "LESSON_LEARNED", label: "Bài học kinh nghiệm", workflowCode: "FL-02", templateId: "TPL-CASE", status: "ACTIVE" },
    { contentTypeId: "ARTICLE", label: "Bài viết tri thức", workflowCode: "FL-04", templateId: "TPL-CASE", status: "ACTIVE" }
  ],
  searchConfig: {
    synonymExpansion: true,
    deprecatedRedirect: true,
    defaultSort: "RELEVANCE",
    visibleFilters: ["contentType", "assetType", "faultType", "categoryId", "status", "updatedRange"],
    minQueryLength: 2
  },
  lifecyclePolicy: {
    sopReviewDays: 180,
    articleReviewDays: 365,
    lowHelpfulThreshold: 55,
    notificationTemplate: "Nội dung {{knowledgeId}} đến hạn rà soát vào {{dueDate}}.",
    autoCreateReviewTask: true
  },
  seedState: {
    seedVersion: "Seed FL-06 v2",
    lastImportedAt: "2026-07-20T15:00:00.000Z",
    lastResetAt: "",
    checksum: "KMS-FL06-20260720"
  }
};

export const seedAdminAuditEvents = [
  { eventId: "ADM-EVT-020", actorId: "AD-001", actorRole: "ADMINISTRATOR", action: "PUBLISH_TAXONOMY", objectType: "TaxonomyScheme", objectId: "FAULT_TYPE", result: "SUCCESS", reason: "Chuẩn hóa thuật ngữ loại lỗi cho FL-01.", before: "TAX-v2.3", after: "TAX-v2.4", createdAt: "2026-07-20T10:15:00.000Z" },
  { eventId: "ADM-EVT-019", actorId: "AD-001", actorRole: "ADMINISTRATOR", action: "UPDATE_PERMISSION", objectType: "PermissionRule", objectId: "KNOWLEDGE_MANAGER:SOP:APPROVE", result: "SUCCESS", reason: "Bổ sung quyền duyệt SOP cho KM.", before: "blocked", after: "allowed", createdAt: "2026-07-19T09:30:00.000Z" },
  { eventId: "ADM-EVT-018", actorId: "AD-001", actorRole: "ADMINISTRATOR", action: "RESET_SEED", objectType: "DemoSeedState", objectId: "Seed FL-06 v1", result: "SUCCESS", reason: "Reset trước buổi demo tích hợp.", before: "dirty mock state", after: "clean seed", createdAt: "2026-07-18T08:00:00.000Z" }
];

export function cloneAdminConfig() {
  return JSON.parse(JSON.stringify(seedAdminConfig));
}

export function cloneAdminAuditEvents() {
  return JSON.parse(JSON.stringify(seedAdminAuditEvents));
}

export function adminNowIso() {
  return new Date().toISOString();
}

export function makeAdminId(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

export function normalizeAdminText(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .trim();
}

export function hasPermission(config, roleId, resource, action) {
  if (roleId === "ADMINISTRATOR" && resource === "ADMIN") return true;
  return config.permissionRules.some((rule) => rule.roleId === roleId && rule.resource === resource && rule.action === action && rule.allowed);
}

export function taxonomyOptions(config, schemeId, allLabel) {
  const options = config.taxonomyConcepts
    .filter((concept) => concept.schemeId === schemeId && concept.status === "ACTIVE")
    .map((concept) => ({ value: concept.value, label: concept.prefLabel }))
    .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  return [{ value: "ALL", label: allLabel }, ...options];
}

export function buildRuntimeTaxonomy(baseTaxonomy, config) {
  return {
    ...baseTaxonomy,
    assetTypes: taxonomyOptions(config, "ASSET_TYPE", "Tất cả thiết bị"),
    faultTypes: taxonomyOptions(config, "FAULT_TYPE", "Tất cả loại lỗi"),
    categories: taxonomyOptions(config, "CONTENT_CATEGORY", "Tất cả danh mục"),
    sortOptions: baseTaxonomy.sortOptions.map((option) => option.value === "RELEVANCE" ? { ...option, label: "Mức độ phù hợp" } : option)
  };
}

export function buildAdminSynonymPhrases(config) {
  if (!config.searchConfig.synonymExpansion) return [];
  return config.taxonomyConcepts
    .filter((concept) => concept.status === "ACTIVE")
    .flatMap((concept) => {
      const canonical = normalizeAdminText(`${concept.prefLabel} ${concept.value}`);
      return (concept.altLabels || []).map((label) => ({
        from: normalizeAdminText(label),
        to: canonical
      }));
    })
    .filter((item) => item.from && item.to);
}

export function validateTaxonomyPublish(config) {
  const errors = [];
  config.taxonomySchemes.forEach((scheme) => {
    const concepts = config.taxonomyConcepts.filter((concept) => concept.schemeId === scheme.schemeId && concept.status !== "DEPRECATED");
    const allSchemeConcepts = config.taxonomyConcepts.filter((concept) => concept.schemeId === scheme.schemeId);
    const seen = new Map();
    concepts.forEach((concept) => {
      const key = normalizeAdminText(concept.prefLabel);
      if (seen.has(key)) errors.push(`Trùng preferred label "${concept.prefLabel}" trong ${scheme.name}.`);
      seen.set(key, concept.conceptId);
      if (concept.broaderConceptId && !config.taxonomyConcepts.some((candidate) => candidate.conceptId === concept.broaderConceptId)) {
        errors.push(`Concept ${concept.prefLabel} đang trỏ tới broader concept không tồn tại.`);
      }
    });
    allSchemeConcepts
      .filter((concept) => concept.status === "DEPRECATED" && concept.usageCount > 0 && !concept.replacedById)
      .forEach((concept) => errors.push(`Concept ${concept.prefLabel} đã deprecated nhưng còn usage và chưa có replacement.`));
  });

  const conceptById = new Map(config.taxonomyConcepts.map((concept) => [concept.conceptId, concept]));
  config.taxonomyConcepts.forEach((concept) => {
    const visited = new Set([concept.conceptId]);
    let parentId = concept.broaderConceptId;
    while (parentId) {
      if (visited.has(parentId)) {
        errors.push(`Taxonomy có vòng lặp tại ${concept.prefLabel}.`);
        break;
      }
      visited.add(parentId);
      parentId = conceptById.get(parentId)?.broaderConceptId;
    }
  });

  return errors;
}

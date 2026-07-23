import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "/Users/phantatthanh/Downloads/DataDemo_KMS.xlsx";
const outputPath = "/Users/phantatthanh/Downloads/DataDemo_KMS.xlsx";
const qaDir = "/Users/phantatthanh/Documents/FPT-Sem7/KMS301/KMS301-FE/outputs/datademo_fl06_explain";
const sheetName = "FL06_Governance";

const sourceUrls = {
  iso30401: "https://www.iso.org/standard/68683.html",
  nistRbac: "https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=916402",
  iso25964: "https://www.niso.org/schemas/iso25964",
  skos: "https://www.w3.org/TR/skos-reference/",
  dcmi: "https://www.dublincore.org/documents/dcmi-terms/",
  iso15489: "https://committee.iso.org/sites/tc46sc11/home/projects/published/iso-15489-records-management.html",
  nist80053: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
  kcs: "https://www.serviceinnovation.org/kcs/"
};

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const overview = await workbook.inspect({
  kind: "sheet,table",
  maxChars: 4000,
  tableMaxRows: 4,
  tableMaxCols: 6
});
await fs.writeFile(`${qaDir}/before_inspect.ndjson`, overview.ndjson);

const sheet = workbook.worksheets.getOrAdd(sheetName);
sheet.showGridLines = false;
sheet.getRange("A1:J90").unmerge();
sheet.getRange("A1:J90").clear({ applyTo: "all" });

sheet.getRange("A1").values = [["FL-06 Governance"]];
sheet.getRange("A2").values = [[
  "Giải thích vì sao các trường FL-06 tồn tại, chúng hỗ trợ FL-01 đến FL-05 ra sao, và chuẩn/nguyên tắc nào làm tăng độ tin cậy của KMS prototype."
]];

sheet.getRange("A4").values = [["1. Tổng quan"]];
sheet.getRange("A5:J7").values = [
  ["Mục tiêu", "FL-06 là lớp governance/admin: kiểm soát user, role, permission, taxonomy, metadata, search behavior, lifecycle policy, audit log và seed state.", "", "", "", "", "", "", "", ""],
  ["Giá trị tin cậy", "Giúp chứng minh tri thức không chỉ được tạo/publish, mà còn có ownership, phân quyền, chuẩn thuật ngữ, metadata bắt buộc, vòng đời rà soát và audit trail.", "", "", "", "", "", "", "", ""],
  ["Cách dùng khi bảo vệ", "Khi hội đồng hỏi vì sao có các màn hình quản trị, dùng sheet này để mapping từng trường với lý do nghiệp vụ và nguồn chuẩn tham chiếu.", "", "", "", "", "", "", "", ""]
];
sheet.getRange("A5:A7").format.font.bold = true;

sheet.getRange("A9").values = [["2. Giải thích trường"]];
const mainTable = [
  ["Màn hình", "Trường/khái niệm", "Ý nghĩa trong prototype", "Vì sao cần trong KMS", "Chuẩn/nghiên cứu tham chiếu"],
  [
    "Người dùng",
    "userId, fullName, email, departmentId, roleIds, domainIds, status",
    "Định danh user, bộ phận, vai trò, miền tri thức phụ trách và trạng thái active/inactive.",
    "KMS cần biết ai tạo, ai đóng góp, ai duyệt, ai quản trị và ai chịu trách nhiệm theo từng domain tri thức.",
    "ISO 30401; ISO 15489"
  ],
  [
    "Quyền",
    "roleId, resource, action, allowed",
    "Ma trận quyền theo vai trò, tài nguyên và hành động như View/Create/Edit/Review/Approve/Manage.",
    "Đảm bảo đúng người đúng quyền. Rule Separation of Duties chặn Contributor tự phê duyệt SOP do chính mình biên soạn.",
    "NIST RBAC; SoD governance"
  ],
  [
    "Taxonomy",
    "schemeId, conceptId, value, prefLabel, altLabels, definition, broader/related, status, replacedById, usageCount",
    "Bộ từ vựng chuẩn cho domain, loại lỗi, loại tài sản, danh mục và synonym.",
    "Giúp chuẩn hóa thuật ngữ, tăng khả năng tìm kiếm, giảm nhập liệu không thống nhất và hỗ trợ deprecated term redirect.",
    "ISO 25964; W3C SKOS"
  ],
  [
    "Metadata",
    "templateId, contentType, fieldId, label, type, required, visibleRoleIds",
    "Mẫu metadata bắt buộc/hiển thị theo role cho SOP, repair case, lesson learned và article.",
    "Metadata làm tri thức dễ tìm, dễ lọc, dễ audit và dễ tái sử dụng. Field bắt buộc giúp đảm bảo chất lượng trước publish.",
    "Dublin Core; ISO 15489"
  ],
  [
    "Tìm kiếm",
    "synonymExpansion, deprecatedRedirect, defaultSort, visibleFilters, minQueryLength",
    "Cấu hình cách FL-01 search mở rộng từ khóa, xử lý thuật ngữ cũ, sắp xếp và hiển thị filter.",
    "Tri thức chỉ có giá trị khi tìm được. Synonym/filter/ranking giúp người hiện trường tìm đúng nội dung nhanh hơn.",
    "ISO 25964; W3C SKOS; KCS"
  ],
  [
    "Lifecycle",
    "sopReviewDays, articleReviewDays, lowHelpfulThreshold, notificationTemplate, autoCreateReviewTask",
    "Chính sách rà soát vòng đời: SOP/article review theo chu kỳ, trigger bằng helpful rate thấp và tự tạo review task.",
    "Tri thức là tài sản sống; phải được review, cập nhật, tạm ngừng hoặc archive khi lỗi thời/rủi ro.",
    "ISO 30401; KCS"
  ],
  [
    "Audit",
    "eventId, actorId, actorRole, action, objectType, objectId, result, reason, before, after, createdAt",
    "Log lại mọi thay đổi cấu hình: ai đổi, đổi gì, lý do, trạng thái, trước/sau và thời điểm.",
    "Tạo accountability, hỗ trợ truy vết, giải trình khi taxonomy/permission/policy thay đổi.",
    "NIST SP 800-53 AU; ISO 15489"
  ],
  [
    "Seed data",
    "seedVersion, lastImportedAt, lastResetAt, checksum",
    "Quản lý trạng thái dữ liệu demo và reset baseline.",
    "Bảo đảm demo lặp lại được, dữ liệu nhất quán và có mốc kiểm tra trước/sau khi reset.",
    "Records/config baseline practice"
  ]
];
sheet.getRangeByIndexes(9, 0, mainTable.length, mainTable[0].length).values = mainTable;

sheet.getRange("A22").values = [["3. Chuẩn tham chiếu"]];
const standards = [
  ["Chuẩn/nguyên tắc", "Áp dụng vào FL-06", "Nguồn tham chiếu"],
  ["ISO 30401 - Knowledge Management Systems", "Nền tảng cho việc thiết lập, duy trì, rà soát và cải tiến hệ thống quản lý tri thức.", sourceUrls.iso30401],
  ["NIST RBAC + Separation of Duties", "Thiết kế role, permission matrix và chặn quyền rủi ro như Contributor tự approve SOP.", sourceUrls.nistRbac],
  ["ISO 25964 - Thesauri / controlled vocabulary", "Cơ sở cho taxonomy, synonym, deprecated term và interoperability của từ vựng.", sourceUrls.iso25964],
  ["W3C SKOS", "Cơ sở cho prefLabel, altLabel/synonym, definition, broader/related concept.", sourceUrls.skos],
  ["Dublin Core Metadata Terms", "Cơ sở cho metadata mô tả resource để hỗ trợ discovery và quản lý nội dung.", sourceUrls.dcmi],
  ["ISO 15489 - Records Management", "Cơ sở cho records, metadata, policy, assigned responsibilities, monitoring và quản lý bằng chứng.", sourceUrls.iso15489],
  ["NIST SP 800-53 - Audit and Accountability", "Cơ sở cho audit trail: actor, action, object, timestamp, result, before/after.", sourceUrls.nist80053],
  ["KCS - Knowledge-Centered Success", "Cơ sở cho cách xem tri thức là tài sản sống được tạo/cải tiến trong quá trình xử lý công việc.", sourceUrls.kcs]
];
sheet.getRangeByIndexes(22, 0, standards.length, standards[0].length).values = standards;

sheet.getRange("A34").values = [["4. Q&A bảo vệ"]];
const talkingPoints = [
  ["Câu hỏi thường gặp", "Câu trả lời gợi ý"],
  [
    "Vì sao cần Admin Users?",
    "Để chứng minh mỗi tri thức có owner, role và domain chịu trách nhiệm. KMS không thể đáng tin nếu không biết ai tạo, ai duyệt, ai quản trị."
  ],
  [
    "Vì sao cần Permission Matrix?",
    "Để đảm bảo đúng quyền theo role và tách nhiệm vụ tạo/duyệt. Ví dụ Contributor không được tự approve SOP để tránh xung đột lợi ích."
  ],
  [
    "Vì sao cần Taxonomy?",
    "Để chuẩn hóa cách gọi lỗi, tài sản và danh mục. Nếu người dùng nhập offline/mất mạng/mất kết nối, hệ thống vẫn hiểu cùng một concept."
  ],
  [
    "Vì sao cần Metadata Templates?",
    "Để bắt buộc các thông tin quan trọng trước khi publish. SOP phải có asset type, fault type, PPE và review cycle vì có rủi ro vận hành."
  ],
  [
    "Vì sao cần Lifecycle Policy?",
    "Vì tri thức có thể lỗi thời. Review days, helpful threshold và auto review task giúp hệ thống duy trì chất lượng sau khi publish."
  ],
  [
    "Vì sao cần Audit Log?",
    "Để giải trình mọi thay đổi. Khi taxonomy/permission/policy bị đổi, hệ thống biết ai đổi, khi nào, vì sao và trước/sau là gì."
  ]
];
sheet.getRangeByIndexes(34, 0, talkingPoints.length, talkingPoints[0].length).values = talkingPoints;

sheet.getRange("A43").values = [["5. Kết luận"]];
const conclusion = [
  ["Ý chính", "Nội dung"],
  [
    "Vai trò",
    "FL-06 là lớp kiểm soát và đảm bảo chất lượng của toàn bộ KMS."
  ],
  [
    "Cơ chế tin cậy",
    "Các trường trong FL-06 là cơ chế governance: phân quyền theo vai trò, chuẩn hóa taxonomy/metadata, kiểm soát search, quản lý vòng đời, audit thay đổi và duy trì seed baseline."
  ],
  [
    "Giá trị chứng minh",
    "Prototype không chỉ chạy được luồng nghiệp vụ, mà còn có cơ sở để chứng minh tính tin cậy, truy vết và khả năng bảo trì."
  ]
];
sheet.getRangeByIndexes(43, 0, conclusion.length, conclusion[0].length).values = conclusion;

// Formatting
sheet.getRange("A1:E1").format.fill.color = "#0B3B75";
sheet.getRange("A1:E1").format.font.color = "#FFFFFF";
sheet.getRange("A1:E1").format.font.bold = true;
sheet.getRange("A1:E1").format.font.size = 18;
sheet.getRange("A1:E1").format.horizontalAlignment = "left";
sheet.getRange("A2:E2").format.fill.color = "#EAF3FF";
sheet.getRange("A2:E2").format.font.color = "#1F2937";
sheet.getRange("A2:E2").format.wrapText = true;

for (const address of ["A4:E4", "A9:E9", "A22:C22", "A34:B34", "A43:E43"]) {
  const range = sheet.getRange(address);
  range.format.fill.color = "#D9EAF7";
  range.format.font.bold = true;
  range.format.font.color = "#0B3B75";
}

const headerRanges = ["A10:E10", "A23:C23", "A35:B35"];
for (const address of headerRanges) {
  const range = sheet.getRange(address);
  range.format.fill.color = "#0F766E";
  range.format.font.color = "#FFFFFF";
  range.format.font.bold = true;
  range.format.horizontalAlignment = "center";
}

for (const address of ["A10:E18", "A23:C31", "A35:B41", "A5:J7", "A44:B47"]) {
  const range = sheet.getRange(address);
  range.format.borders = { preset: "all", style: "thin", color: "#CBD5E1" };
  range.format.wrapText = true;
  range.format.verticalAlignment = "top";
}

sheet.getRange("A11:A18").format.fill.color = "#F8FAFC";
sheet.getRange("A24:A31").format.fill.color = "#F8FAFC";
sheet.getRange("A36:A41").format.fill.color = "#F8FAFC";
sheet.getRange("A11:A18").format.font.bold = true;
sheet.getRange("A24:A31").format.font.bold = true;
sheet.getRange("A36:A41").format.font.bold = true;
sheet.getRange("C24:C31").format.font.color = "#0B63CE";
sheet.getRange("A44:B44").format.fill.color = "#0F766E";
sheet.getRange("A44:B44").format.font.color = "#FFFFFF";
sheet.getRange("A44:B44").format.font.bold = true;
sheet.getRange("A45:B47").format.fill.color = "#FFF7ED";
sheet.getRange("A45:B47").format.font.color = "#1F2937";

sheet.getRange("A1:J60").format.font.name = "Aptos";
sheet.getRange("A1:J60").format.verticalAlignment = "top";
sheet.getRange("A1:J60").format.wrapText = true;

sheet.getRange("A:A").format.columnWidth = 26;
sheet.getRange("B:B").format.columnWidth = 40;
sheet.getRange("C:C").format.columnWidth = 46;
sheet.getRange("D:D").format.columnWidth = 50;
sheet.getRange("E:E").format.columnWidth = 28;
sheet.getRange("F:J").format.columnWidth = 14;
sheet.getRange("A1:E1").format.rowHeight = 30;
sheet.getRange("A2:J2").format.rowHeight = 54;
sheet.getRange("A4:E4").format.rowHeight = 24;
sheet.getRange("A9:E9").format.rowHeight = 24;
sheet.getRange("A5:J7").format.rowHeight = 48;
sheet.getRange("A10:E18").format.rowHeight = 64;
sheet.getRange("A22:C22").format.rowHeight = 24;
sheet.getRange("A23:C31").format.rowHeight = 54;
sheet.getRange("A34:B34").format.rowHeight = 24;
sheet.getRange("A35:B41").format.rowHeight = 56;
sheet.getRange("A43:E43").format.rowHeight = 24;
sheet.getRange("A44:B44").format.rowHeight = 28;
sheet.getRange("A45:B47").format.rowHeight = 54;
sheet.freezePanes.freezeRows(10);

const finalInspect = await workbook.inspect({
  kind: "table",
  sheetId: sheetName,
  range: "A1:E18",
  include: "values",
  tableMaxRows: 20,
  tableMaxCols: 5,
  maxChars: 8000
});
await fs.writeFile(`${qaDir}/final_table_inspect.ndjson`, finalInspect.ndjson);

const errorInspect = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan"
});
await fs.writeFile(`${qaDir}/formula_errors.ndjson`, errorInspect.ndjson);

const preview = await workbook.render({ sheetName, range: "A1:E47", scale: 1 });
await fs.writeFile(`${qaDir}/FL06_Governance_preview.png`, new Uint8Array(await preview.arrayBuffer()));

const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(outputPath);

const copyExported = await SpreadsheetFile.exportXlsx(workbook);
await copyExported.save(`${qaDir}/DataDemo_KMS_FL06_Governance.xlsx`);

console.log(JSON.stringify({ outputPath, qaCopy: `${qaDir}/DataDemo_KMS_FL06_Governance.xlsx`, sheetName }));

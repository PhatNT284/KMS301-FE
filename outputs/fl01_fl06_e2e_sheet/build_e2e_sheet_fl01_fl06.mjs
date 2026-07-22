import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const sourcePath = "/Users/macprocuaphat/Desktop/KMS301/Code/FE/outputs/fl01_fl06_visual_runbook/KMS_FL01_FL06_Visual_Runbook_Tieng_Viet_Dep.xlsx";
const outDir = "/Users/macprocuaphat/Desktop/KMS301/Code/FE/outputs/fl01_fl06_e2e_sheet";
const outputPath = `${outDir}/KMS_FL01_FL06_End_to_End_Demo_Sheet_Tieng_Viet.xlsx`;
const baseUrl = "http://localhost:5175";

function url(screen, params = {}) {
  const search = new URLSearchParams({ screen, ...params });
  return `${baseUrl}/?${search.toString()}`;
}

function routeFromUrl(value) {
  try {
    const parsed = new URL(value);
    return `${parsed.pathname}${parsed.search}`.replace("/", "") || value;
  } catch {
    return value;
  }
}

function displayValue(value) {
  if (typeof value === "string" && value.startsWith(baseUrl) && value !== `${baseUrl}/`) {
    return routeFromUrl(value);
  }
  return value;
}

const theme = {
  dark: "#0B2F4A",
  mid: "#1F5D7D",
  light: "#DCECF5",
  pale: "#F5FAFD",
  green: "#DDF3EE",
  violet: "#E9E3FA",
  amber: "#F8E8D2",
  rose: "#F6DDE6",
  gray: "#E5E7EB"
};

const rows = [
  ["Chặng", "FL", "Vai trò", "Màn hình", "Thao tác trên giao diện", "Data mẫu áp dụng", "Kết quả nối luồng", "Route mở nhanh"],
  [1, "Chuẩn bị", "Field Technician", "Dashboard", "Mở prototype, bấm Reset Demo và kiểm tra sidebar tiếng Việt.", "Prototype: http://localhost:5175/; role mặc định Field Technician.", "Dữ liệu seed sạch, sẵn sàng đi FL-01.", `${baseUrl}/`],
  [2, "FL-01", "Field Technician", "Cơ sở tri thức", "Bấm sidebar Cơ sở tri thức, nhập query và Asset ID rồi bấm Tìm kiếm.", "Query: CityTouch node offline; Asset: CTN-1108; filter: Mất kết nối.", "Tìm thấy SOP-NET-007 để mở chi tiết.", url("search-results", { query: "CityTouch node offline", assetId: "CTN-1108" })],
  [3, "FL-01", "Field Technician", "Chi tiết SOP", "Mở SOP-NET-007, đọc Applicability/Safety/Procedure, bấm Đánh dấu đã áp dụng.", "SOP-NET-007 v2.1; Work order: WO-2026-00421; ghi chú: reset cụm sau khi kiểm tra gateway.", "SOP được ghi nhận đã áp dụng, có điểm nối tạo tri thức hiện trường FL-02.", url("sop-detail", { id: "SOP-NET-007" })],
  [4, "FL-02", "Field Technician", "Gửi yêu cầu > Gửi tri thức hiện trường", "Bấm Ghi nhận tri thức hiện trường từ SOP hoặc mở tab Gửi yêu cầu.", "WO-2026-00421; Asset CTN-1108; Fault CONNECTIVITY_LOSS; severity HIGH.", "Draft field submission có pre-fill từ FL-01.", url("request", { tab: "field-capture" })],
  [5, "FL-02", "Field Technician", "Field Submission Wizard", "Đi đủ 4 bước Context, Resolution, Evidence, Review rồi gửi kiểm duyệt.", "SUB-2026-0042; SOP-NET-007; ảnh mock; lesson: kiểm tra nguồn dùng chung trước khi reset từng node.", "Submission chuyển SUBMITTED/RESUBMITTED cho Knowledge Manager duyệt.", url("field-submission", { id: "SUB-2026-0042", step: "context" })],
  [6, "FL-02", "Knowledge Manager", "Hàng đợi xét duyệt", "Đổi role Knowledge Manager, mở SUB-2026-0043 và kiểm duyệt.", "SUB-2026-0043; publication type: Repair Case; sopPotential: UPDATE_EXISTING.", "Tri thức hiện trường được publish và tạo đầu vào SOP task cho FL-03.", url("review-detail", { id: "SUB-2026-0043" })],
  [7, "FL-03", "Contributor", "SOP Task Detail", "Đổi role Contributor, mở task cập nhật SOP từ nguồn FL-02.", "SOPTASK-2026-008; target SOP: SOP-NET-007; source: SUB-2026-0043.", "Contributor hiểu lý do cập nhật SOP và bắt đầu draft.", url("sop-task-detail", { id: "SOPTASK-2026-008" })],
  [8, "FL-03", "Contributor", "SOP Editor", "Đi metadata/safety/procedure/reference, thêm bước kiểm tra nguồn dùng chung, gửi duyệt.", "Draft SOPD-2026-0012; Step mới: Kiểm tra nguồn dùng chung trước khi reset node.", "Draft SOP chuyển sang review queue của Knowledge Manager.", url("sop-editor", { id: "SOPD-2026-0012", step: "procedure" })],
  [9, "FL-03", "Knowledge Manager", "SOP Review Detail", "Mở draft resubmitted, review traceability, publish version mới.", "SOPD-2026-0015; version note: bổ sung kiểm tra nguồn dùng chung.", "SOP-NET-007 có version mới, quay lại FL-01 sẽ thấy nội dung cập nhật.", url("sop-review-detail", { id: "SOPD-2026-0015" })],
  [10, "FL-04", "Field Technician", "FL-01 no-result", "Quay lại Cơ sở tri thức, tìm query không có kết quả và bấm Yêu cầu bổ sung tri thức.", "Query: khong co tri thuc demo 999; Asset: CTN-1108; resultCount: 0.", "Form yêu cầu bổ sung tri thức được pre-fill context từ FL-01.", url("search-results", { query: "khong co tri thuc demo 999" })],
  [11, "FL-04", "Field Technician", "Tạo yêu cầu tri thức", "Hoàn thiện request và gửi.", "Title: Không có tri thức xử lý mất nguồn Smart Node sau mưa; Priority HIGH; AssetType SMART_NODE.", "Request KR-DEMO-001/ request mới xuất hiện trong hàng đợi triage.", url("request", { tab: "knowledge-request" })],
  [12, "FL-04", "Knowledge Manager", "Hàng đợi phân loại", "Mở KR-DEMO-001, chọn hướng xử lý tạo Article và giao Contributor.", "Deliverable: KNOWLEDGE_ARTICLE; Assignee: KC-001.", "Request chuyển ASSIGNED và tạo việc biên soạn cho Contributor.", url("knowledge-request-triage", { id: "KR-DEMO-001" })],
  [13, "FL-04", "Contributor", "Article Editor", "Mở KRA-DEMO-001, soạn nội dung, preview và gửi duyệt.", "Tags: water ingress, voltage drop; related SOP: SOP-NET-007.", "Draft article sẵn sàng để Knowledge Manager duyệt publish.", url("knowledge-article-editor", { id: "KR-DEMO-001" })],
  [14, "FL-04", "Knowledge Manager", "Knowledge Request Review", "Review article và approve publish.", "KR-DEMO-001 / KRA-DEMO-001.", "Yêu cầu tri thức được đóng RESOLVED/PUBLISHED, nội dung xuất hiện trong kho tri thức.", url("knowledge-request-review-detail", { id: "KR-DEMO-001" })],
  [15, "FL-05", "Knowledge Manager", "Lifecycle Dashboard", "Mở Vòng đời tri thức và quan sát content health.", "SOP-NET-007 REVIEW_DUE; SOP-IOT-003 FLAGGED; CASE-CABLE-042 PUBLISHED.", "Hiểu được các nội dung cần rà soát, flagged, due review.", url("lifecycle-dashboard")],
  [16, "FL-05", "Knowledge Manager", "Lifecycle Review Detail", "Mở LR-2026-0011 và demo Reconfirm nội dung còn đúng.", "LR-2026-0011; next review: +180 ngày.", "Nội dung quay về PUBLISHED, lịch rà soát được cập nhật.", url("lifecycle-review-detail", { id: "LR-2026-0011" })],
  [17, "FL-05", "Knowledge Manager", "Lifecycle Review Detail", "Mở LR-2026-0012 và demo Revise để tạo revision task.", "LR-2026-0012; issue report IR-2026-0075; change type MAJOR; assignee KC-001.", "Tạo revision task RT-2026-0031, nối lại Contributor/FL-03 khi cần sửa SOP.", url("lifecycle-review-detail", { id: "LR-2026-0012" })],
  [18, "FL-05", "Contributor", "My Revision Tasks", "Đổi role Contributor, mở RT-2026-0031 và bấm mở luồng chỉnh sửa.", "RT-2026-0031; targetFlow FL-03; knowledgeId SOP-IOT-003.", "Revision task đi tiếp sang FL-03/SOP editor, chứng minh FL-05 không đứng riêng.", url("my-revision-tasks")],
  [19, "FL-06", "Quản trị viên", "Admin Dashboard", "Chọn role Quản trị viên, mở tab Quản trị hệ thống.", "Role: ADMINISTRATOR.", "Admin Console mở metrics users/permissions/taxonomy/audit.", url("admin-dashboard")],
  [20, "FL-06", "Quản trị viên", "Role Simulator", "Mô phỏng Field Technician rồi mở direct admin URL.", "Simulated role: Field Technician; URL admin-dashboard.", "Admin route bị chặn Access Denied; thoát mô phỏng quay lại Admin.", url("admin-role-simulator")],
  [21, "FL-06", "Quản trị viên", "Permission Matrix", "Thử cấp quyền Contributor / SOP / Phê duyệt.", "Role: Contributor; Resource: SOP; Action: APPROVE.", "Impact Preview báo bị chặn bởi Separation of Duties.", url("admin-permissions")],
  [22, "FL-06", "Quản trị viên", "Synonym Manager", "Tạo synonym Mất điện trỏ về concept Sụt áp rồi publish.", "Term: Mất điện; Concept: FAULT_VOLTAGE_DROP/Sụt áp.", "Taxonomy version tăng, audit ghi PUBLISH_SYNONYM.", url("admin-synonyms")],
  [23, "FL-06 -> FL-01", "Quản trị viên / Field Technician", "Operation Result / Cơ sở tri thức", "Bấm Verify ở FL-01 hoặc quay lại search query Mất điện.", "Query: Mất điện.", "FL-01 mở rộng synonym và trả kết quả liên quan Sụt áp/VOLTAGE_DROP.", url("search-results", { query: "Mất điện" })],
  [24, "Kết thúc", "Quản trị viên", "Audit Log / Seed Data", "Mở audit log kiểm tra event, sau đó reset FL-06 nếu cần quay lại seed.", "Audit event ADM-EVT-*; confirm text: RESET FL06.", "Có bằng chứng actor/role/time/before-after/reason và dữ liệu sẵn sàng cho lần demo sau.", url("admin-audit-log")]
];

function setValue(sheet, address, value) {
  sheet.getRange(address).values = [[value]];
}

function styleTitle(range) {
  range.format.fill = { color: theme.light };
  range.format.font = { color: theme.dark, bold: true, size: 18 };
  range.format.wrapText = true;
}

function styleSubtitle(range) {
  range.format.fill = { color: theme.light };
  range.format.font = { color: theme.dark, bold: true, size: 11 };
  range.format.wrapText = true;
}

function styleContext(range) {
  range.format.fill = { color: theme.pale };
  range.format.font = { color: theme.mid, bold: true, size: 10 };
  range.format.wrapText = true;
  range.format.borders = { preset: "outside", style: "thin", color: theme.light };
}

function styleHeader(range) {
  range.format.fill = { color: theme.light };
  range.format.font = { color: theme.dark, bold: true, size: 10 };
  range.format.wrapText = true;
  range.format.borders = { preset: "all", style: "thin", color: theme.mid };
}

function styleBody(range) {
  range.format.wrapText = true;
  range.format.verticalAlignment = "top";
  range.format.font = { color: "#111827", size: 10 };
  range.format.borders = { preset: "insideHorizontal", style: "thin", color: "#E2E8F0" };
}

function styleRoleCell(cell, value) {
  const text = String(value || "");
  if (text.includes("Field Technician")) {
    cell.format.fill = { color: "#E6F4EA" };
    cell.format.font = { color: "#137333", bold: true, size: 9 };
  } else if (text.includes("Contributor")) {
    cell.format.fill = { color: theme.violet };
    cell.format.font = { color: "#5B4B8A", bold: true, size: 9 };
  } else if (text.includes("Knowledge Manager")) {
    cell.format.fill = { color: "#E8F0FE" };
    cell.format.font = { color: "#1F477B", bold: true, size: 9 };
  } else if (text.includes("Quản trị viên")) {
    cell.format.fill = { color: "#FFF1D6" };
    cell.format.font = { color: "#8A4F12", bold: true, size: 9 };
  }
}

function styleFlCell(cell, value) {
  const text = String(value || "");
  const fill =
    text.includes("FL-01") ? "#D9ECFF" :
    text.includes("FL-02") ? theme.green :
    text.includes("FL-03") ? theme.violet :
    text.includes("FL-04") ? theme.amber :
    text.includes("FL-05") ? theme.rose :
    text.includes("FL-06") ? theme.light :
    "#F3F4F6";
  cell.format.fill = { color: fill };
  cell.format.font = { color: theme.dark, bold: true, size: 10 };
}

function styleStepCell(cell) {
  cell.format.fill = { color: theme.dark };
  cell.format.font = { color: "#FFFFFF", bold: true, size: 10 };
  cell.format.horizontalAlignment = "center";
}

function styleLinkCell(cell) {
  cell.format.fill = { color: theme.light };
  cell.format.font = { color: theme.dark, bold: true, size: 10 };
  cell.format.borders = { preset: "outside", style: "thin", color: theme.mid };
}

function writeMasterSheet(workbook) {
  const sheet = workbook.worksheets.add("01_E2E_Master");
  const totalCols = 8;
  sheet.showGridLines = false;
  sheet.getRangeByIndexes(0, 0, 1, totalCols).merge();
  sheet.getRangeByIndexes(1, 0, 1, totalCols).merge();
  sheet.getRangeByIndexes(2, 0, 1, totalCols).merge();
  setValue(sheet, "A1", "KMS - Master demo end-to-end FL-01 đến FL-06");
  setValue(sheet, "A2", "Đi từ trên xuống để demo một câu chuyện liền mạch: tìm tri thức, gửi tri thức hiện trường, cập nhật SOP, yêu cầu bổ sung, lifecycle review, admin taxonomy/audit.");
  setValue(sheet, "A3", `Prototype: ${baseUrl}/  |  FrontEnd mock data  |  Bản này giữ các tab chi tiết từng FL từ file runbook đẹp và bổ sung tab master E2E.`);
  styleTitle(sheet.getRangeByIndexes(0, 0, 1, totalCols));
  styleSubtitle(sheet.getRangeByIndexes(1, 0, 1, totalCols));
  styleContext(sheet.getRangeByIndexes(2, 0, 1, totalCols));

  const startRow = 4;
  const displayRows = rows.map((row) => row.map((value) => displayValue(value)));
  sheet.getRangeByIndexes(startRow, 0, displayRows.length, totalCols).values = displayRows;
  styleHeader(sheet.getRangeByIndexes(startRow, 0, 1, totalCols));
  styleBody(sheet.getRangeByIndexes(startRow + 1, 0, displayRows.length - 1, totalCols));
  sheet.freezePanes.freezeRows(startRow + 1);

  const widths = [8, 16, 24, 28, 45, 42, 45, 20];
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, displayRows.length + startRow + 2, 1).format.columnWidth = width;
  });
  sheet.getRangeByIndexes(0, 0, displayRows.length + startRow + 2, totalCols).format.rowHeight = 62;
  sheet.getRange("A1:H1").format.rowHeight = 36;
  sheet.getRange("A2:H2").format.rowHeight = 48;
  sheet.getRange("A3:H3").format.rowHeight = 28;
  sheet.getRangeByIndexes(startRow, 0, 1, totalCols).format.rowHeight = 34;

  for (let i = 1; i < rows.length; i += 1) {
    const absoluteRow = startRow + i;
    const rowRange = sheet.getRangeByIndexes(absoluteRow, 0, 1, totalCols);
    rowRange.format.fill = { color: i % 2 === 0 ? "#FFFFFF" : theme.pale };
    styleStepCell(sheet.getCell(absoluteRow, 0));
    styleFlCell(sheet.getCell(absoluteRow, 1), rows[i][1]);
    styleRoleCell(sheet.getCell(absoluteRow, 2), rows[i][2]);
    if (typeof rows[i][7] === "string" && rows[i][7].startsWith(baseUrl)) {
      styleLinkCell(sheet.getCell(absoluteRow, 7));
    }
  }

  return sheet;
}

await fs.mkdir(outDir, { recursive: true });
const input = await FileBlob.load(sourcePath);
const workbook = await SpreadsheetFile.importXlsx(input);
writeMasterSheet(workbook);

const overview = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 8000,
  tableMaxRows: 4,
  tableMaxCols: 5,
  tableMaxCellChars: 100
});
await fs.writeFile(`${outputPath}.inspect.ndjson`, overview.ndjson, "utf8");
console.log(overview.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan"
});
console.log(errors.ndjson);

const masterPreview = await workbook.render({ sheetName: "01_E2E_Master", range: "A1:H20", scale: 1, format: "png" });
await fs.writeFile(`${outDir}/preview_01_E2E_Master.png`, new Uint8Array(await masterPreview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`Saved ${outputPath}`);

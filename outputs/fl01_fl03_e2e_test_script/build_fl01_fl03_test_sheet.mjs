import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/macprocuaphat/Desktop/KMS301/Code/FE/outputs/fl01_fl03_e2e_test_script";
const outputPath = path.join(outputDir, "KMS_FL01_FL03_E2E_Test_Script.xlsx");
const baseUrl = "http://127.0.0.1:5173/";

const workbook = Workbook.create();

const theme = {
  navy: "#003366",
  blue: "#D5E3FF",
  gray: "#F4F6FA",
  line: "#D9E2EC",
  green: "#E6F4EA",
  amber: "#FFFBEB",
  red: "#FFDAD6",
  white: "#FFFFFF",
  text: "#1A1C1F"
};

function ws(name) {
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;
  return sheet;
}

function writeMatrix(sheet, startCell, matrix) {
  sheet.getRange(startCell).write(matrix);
}

function safeFormat(range, options = {}) {
  if (options.fill) range.format.fill = { color: options.fill };
  if (options.font) range.format.font = options.font;
  if (options.wrap !== undefined) range.format.wrapText = options.wrap;
  if (options.align) range.format.horizontalAlignment = options.align;
  if (options.valign) range.format.verticalAlignment = options.valign;
  if (options.border) range.format.borders = options.border;
}

function styleSheet(sheet, colWidths = []) {
  const used = sheet.getUsedRange();
  if (used) {
    safeFormat(used, {
      font: { name: "Inter", size: 10, color: theme.text },
      wrap: true,
      valign: "top"
    });
  }
  colWidths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width;
  });
}

function addTitle(sheet, title, subtitle, widthCols) {
  const lastCol = String.fromCharCode(64 + widthCols);
  const titleRange = sheet.getRange(`A1:${lastCol}1`);
  titleRange.merge();
  titleRange.values = [[title]];
  safeFormat(titleRange, {
    fill: theme.navy,
    font: { bold: true, color: theme.white, size: 16 },
    wrap: true,
    valign: "middle"
  });
  titleRange.format.rowHeight = 30;
  const subtitleRange = sheet.getRange(`A2:${lastCol}2`);
  subtitleRange.merge();
  subtitleRange.values = [[subtitle]];
  safeFormat(subtitleRange, {
    fill: theme.blue,
    font: { bold: false, color: theme.text, size: 10 },
    wrap: true,
    valign: "middle"
  });
  subtitleRange.format.rowHeight = 44;
}

function addTable(sheet, startRow, headers, rows, tableName) {
  const colCount = headers.length;
  const startCol = "A";
  const endCol = String.fromCharCode(64 + colCount);
  const range = `${startCol}${startRow}:${endCol}${startRow + rows.length}`;
  sheet.getRange(`${startCol}${startRow}:${endCol}${startRow}`).values = [headers];
  if (rows.length) sheet.getRange(`${startCol}${startRow + 1}:${endCol}${startRow + rows.length}`).values = rows;
  const headerRange = sheet.getRange(`${startCol}${startRow}:${endCol}${startRow}`);
  safeFormat(headerRange, {
    fill: theme.navy,
    font: { bold: true, color: theme.white },
    align: "center",
    valign: "middle",
    wrap: true
  });
  const dataRange = sheet.getRange(range);
  safeFormat(dataRange, { border: { preset: "inside", style: "thin", color: theme.line }, wrap: true, valign: "top" });
  try {
    const table = sheet.tables.add(range, true, tableName);
    table.style = "TableStyleMedium2";
    table.showFilterButton = true;
  } catch {
    // Tables are a convenience for filtering; the content remains usable if the viewer skips table creation.
  }
  sheet.freezePanes.freezeRows(startRow);
}

const overview = ws("00_Tong_quan");
addTitle(overview, "KMS Prototype - Test Script End-to-End FL-01 den FL-03", "Workbook tong hop kich ban demo UI/UX Prototype: tim kiem tri thuc, gui tri thuc hien truong, kiem duyet, tao/cap nhat SOP va xuat ban version moi.", 8);
addTable(overview, 4, ["Muc", "Noi dung", "Gia tri demo", "Ghi chu"], [
  ["Pham vi", "Frontend Prototype, mock data/localStorage, khong co backend", "FL-01 + FL-02 + FL-03", "Dua theo source React/Vite hien tai"],
  ["Base URL", "Chay app local bang Vite", baseUrl, "Neu port doi thi cap nhat URL nay"],
  ["Diem bat dau de demo sach", "Bam Reset Demo tren topbar", "Role mac dinh Field Technician", "Lam truoc moi lan demo chinh"],
  ["Ket qua cuoi ky vong", "SOP-NET-007 duoc publish version moi", "v2.1 -> v3.0", "Version history hien v2.1 SUPERSEDED"],
  ["Nguon FL-02 quan trong", "Submission da duyet/duoc chuan hoa thanh case", "SUB-2026-0043 / CASE-FL02-0043", "Dung de noi sang FL-03"],
  ["Task FL-03 quan trong", "Task cap nhat SOP tu FL-02", "SOPTASK-2026-008", "Contributor bien soan"],
  ["Draft nhanh de demo approve", "Draft da resubmit va pass checklist", "SOPD-2026-0015", "Manager co the approve & publish nhanh"],
  ["Draft de demo rework", "Draft dang bi request changes", "SOPD-2026-0014", "Dung neu muon minh hoa nhánh chỉnh sửa"]
], "OverviewTable");
styleSheet(overview, [24, 48, 34, 48, 18, 18, 18, 18]);

const roles = ws("01_Roles_Setup");
addTitle(roles, "Roles, setup va dieu kien demo", "Doi role tren topbar cua prototype. Tat ca role duoc gia lap o frontend bang localStorage.", 8);
addTable(roles, 4, ["Role", "User ID", "Ten hien thi", "Dung trong flow", "Man hinh chinh", "Du lieu demo", "Can luu y", "Route goi y"], [
  ["Field Technician", "FT-001", "Minh Tran", "FL-01 search/apply va FL-02 gui tri thuc hien truong", "Co so tri thuc, Gui yeu cau", "Asset CTN-1108, Work Order WO-2026-00421", "Khong tao/duyet SOP chinh thuc", `${baseUrl}?screen=search`],
  ["Contributor", "KC-001", "Sarah Jenkins", "FL-03 nhan task, tao/chinh Draft SOP, submit/resubmit", "Quy trinh van hanh (SOP)", "SOPTASK-2026-008, SOPD-2026-0012", "Khong duoc tu approve SOP cua minh", `${baseUrl}?screen=sops&tab=tasks`],
  ["Knowledge Manager", "KM-001", "Alex Chen", "FL-02 review, FL-03 review/approve/publish", "Hang doi xet duyet, Hang doi duyet SOP", "SUB-2026-0043, SOPD-2026-0015", "Can pass checklist va SoD", `${baseUrl}?screen=sops&tab=review`],
  ["Administrator", "AD-001", "Demo Admin", "Kiem thu visibility va reset demo", "Tat ca man hinh", "Seed data/localStorage", "Khong dung lam actor nghiep vu chinh", `${baseUrl}?screen=dashboard`]
], "RolesTable");
styleSheet(roles, [22, 16, 22, 42, 28, 36, 42, 56]);

const data = ws("02_Test_Data");
addTitle(data, "Test Data chuan bi san", "Bang nay gom ID, role, trang thai va y nghia du lieu can dung khi demo end-to-end.", 9);
addTable(data, 4, ["Loai", "ID", "Trang thai", "Role/Owner", "Flow", "Mo ta", "Dung tai buoc", "Route nhanh", "Expected signal"], [
  ["Knowledge Item", "SOP-NET-007", "PUBLISHED v2.1 seed", "KM-001", "FL-01/FL-03", "SOP chuan hien hanh ve nhieu Smart Node mat ket noi", "Search, apply, tao version moi", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`, "Sau publish thanh v3.0"],
  ["Knowledge Item", "CASE-CABLE-042", "PUBLISHED", "KM-001", "FL-01/FL-03", "Repair Case nguon de tham chieu", "Search detail, related source", `${baseUrl}?screen=knowledge-detail&id=CASE-CABLE-042`, "Mo duoc case va related SOP"],
  ["Work Order", "WO-2026-00421", "Mock current work order", "FT-001", "FL-02", "8 node CityTouch mat ket noi sau mua lon", "Tao submission hien truong", `${baseUrl}?screen=request&tab=field-capture`, "Form prefill CTN-1108"],
  ["Field Submission", "SUB-2026-0043", "SUBMITTED", "FT-001", "FL-02", "Case nhieu node offline co de xuat update SOP-NET-007", "Manager review/publish", `${baseUrl}?screen=review-detail&id=SUB-2026-0043`, "Publish thanh CASE-FL02-*"],
  ["SOP Request", "SOPREQ-0007", "MOCK_HANDOFF", "KM-001", "FL-02 -> FL-03", "Yeu cau cap nhat SOP tu case da publish", "Nut Chuan hoa thanh SOP", `${baseUrl}?screen=knowledge-detail&id=CASE-CABLE-042`, "Tao/mo task FL-03"],
  ["SOP Task", "SOPTASK-2026-008", "OPEN", "KC-001", "FL-03", "Task cap nhat SOP-NET-007 do thieu buoc kiem tra nguon dung chung", "Contributor soan SOP", `${baseUrl}?screen=sop-task-detail&id=SOPTASK-2026-008`, "Mo detail task co source"],
  ["SOP Draft", "SOPD-2026-0012", "DRAFT", "KC-001", "FL-03", "Draft update v2.1 -> v3.0 chua tick confirmation", "Demo editor 6 buoc", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=review`, "Thay error confirmation"],
  ["SOP Draft", "SOPD-2026-0014", "CHANGES_REQUESTED", "KC-001/KM-001", "FL-03", "Draft SOP moi ve nuoc xam nhap can bo sung an toan", "Demo rework", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0014&step=safety`, "Hien comment can chinh"],
  ["SOP Draft", "SOPD-2026-0015", "RESUBMITTED", "KC-001/KM-001", "FL-03", "Draft da chinh va pass checklist", "Demo approve & publish nhanh", `${baseUrl}?screen=sop-review-detail&id=SOPD-2026-0015`, "Nut Duyet va chuan bi xuat ban enabled"],
  ["SOP Version", "SOPV-NET-007-2.1", "PUBLISHED seed", "KM-001", "FL-03", "Version cu truoc khi publish v3.0", "Version history", `${baseUrl}?screen=sop-version-history&id=SOP-NET-007`, "Sau publish bi SUPERSEDED"]
], "TestDataTable");
styleSheet(data, [18, 22, 24, 22, 16, 48, 34, 58, 36]);

const fl01 = ws("03_FL01_Search");
addTitle(fl01, "FL-01 - Tim kiem va su dung tri thuc", "Test cases tap trung vao search, filter, mo detail, mark as applied, feedback va no-result handoff.", 10);
addTable(fl01, 4, ["TC ID", "Actor", "Precondition", "Route", "Thao tac demo", "Data nhap/chon", "Expected result", "Checkpoint UI", "Status", "Notes"], [
  ["FL01-TC-01", "Field Technician", "Reset Demo, role FT-001", `${baseUrl}?screen=search`, "Nhap query va tim kiem tri thuc", "Query: node offline gateway; Asset ID: CTN-1108", "Danh sach co SOP-NET-007 va case lien quan", "Kết quả tìm kiếm hien so luong ket qua", "Ready", "Dung de mo dau luong"],
  ["FL01-TC-02", "Field Technician", "Da co ket qua search", `${baseUrl}?screen=search-results&query=node%20offline&assetId=CTN-1108`, "Mo SOP-NET-007", "Click Mo noi dung", "SOP detail hien v2.1, safety, procedure steps", "Badge Published + v2.1", "Ready", "Sau FL-03 publish se thanh v3.0"],
  ["FL01-TC-03", "Field Technician", "Dang o SOP detail", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`, "Danh dau da ap dung", "Outcome: Resolved Fully; Comment: Work order WO-2026-00421", "Toast ghi nhan apply; nut Ghi nhan tri thuc hien truong hien ra", "Đã áp dụng: RESOLVED_FULLY", "Ready", "Mo duong sang FL-02"],
  ["FL01-TC-04", "Field Technician", "Da apply SOP", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`, "Gui feedback Huu ich/Khong huu ich hoac Bao loi thoi", "Click Huu ich", "Feedback duoc luu localStorage", "Nut feedback active/toast", "Ready", "Co the bo qua neu demo can ngan"],
  ["FL01-TC-05", "Field Technician", "Can demo no-result", `${baseUrl}?screen=search`, "Nhap query khong co ket qua va tao Knowledge Request", "Query: firmware phantom cabinet xyz", "Hien empty state va nut Yeu cau bo sung tri thuc", "Form Gui yeu cau prefill query/filter", "Optional", "Lien quan FL-04, khong phai luong chinh FL-03"],
  ["FL01-TC-06", "Field Technician", "Sau FL-03 publish", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`, "Quay lai xem SOP da update", "SOP-NET-007", "Version hien v3.0 va co buoc kiem tra nguon dung chung", "Badge v3.0; procedure co STEP kiem tra nguon", "Final verify", "Ket thuc E2E"]
], "FL01Table");
styleSheet(fl01, [14, 20, 34, 56, 44, 38, 48, 34, 16, 36]);

const fl02 = ws("04_FL02_Field_Knowledge");
addTitle(fl02, "FL-02 - Gui tri thuc hien truong va kiem duyet", "Test cases cho Field Technician ghi nhan case, lien ket SOP da su dung, Knowledge Manager review va publish case/lesson learned.", 10);
addTable(fl02, 4, ["TC ID", "Actor", "Precondition", "Route", "Thao tac demo", "Data nhap/chon", "Expected result", "Checkpoint UI", "Status", "Notes"], [
  ["FL02-TC-01", "Field Technician", "Da apply SOP-NET-007 hoac vao tab Gui yeu cau", `${baseUrl}?screen=request&tab=field-capture`, "Tao submission hien truong tu work order gan nhat", "WO-2026-00421, CTN-1108, CONNECTIVITY_LOSS", "Tao draft SUB-* va mo buoc Boi canh", "Toast Da tao ban nhap tri thuc hien truong", "Ready", "Co the dung seed SUB-2026-0043 de rut ngan"],
  ["FL02-TC-02", "Field Technician", "Dang trong wizard FL-02", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=context`, "Kiem tra context va tiep tuc", "Asset CTN-1108; Severity HIGH; Impact MULTIPLE_ASSETS", "Qua buoc Chan doan & xu ly", "Stepper sang buoc 2", "Ready", "SUB-2026-0042 la draft seed"],
  ["FL02-TC-03", "Field Technician", "Buoc resolution", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=resolution`, "Lien ket SOP da dung va khai bao deviation", "SOP-NET-007 v2.1; Steps STEP-03/STEP-04; Feedback INCOMPLETE", "Prototype ghi nhan SOP gap", "Section Lien ket SOP da su dung", "Ready", "Day la cau noi sang FL-03"],
  ["FL02-TC-04", "Field Technician", "Buoc evidence", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=evidence`, "Nhap bai hoc va de xuat update SOP", "Gap: thieu buoc kiem tra nguon dung chung; Proposed change: bo sung kiem tra nguon/cap", "Validation pass neu du do dai", "Khong con error summary", "Ready", "Nhan man source traceability"],
  ["FL02-TC-05", "Field Technician", "Buoc review", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=review`, "Tick confirmation va gui kiem duyet", "Confirmation = TRUE", "Status SUBMITTED/RESUBMITTED va success screen", "Man hinh Submit Success", "Ready", "Neu demo ngan dung thang SUB-2026-0043"],
  ["FL02-TC-06", "Knowledge Manager", "Role KM-001", `${baseUrl}?screen=review-detail&id=SUB-2026-0043`, "Review submission va publish tri thuc", "Publication Type: Repair Case; SOP potential: Update Existing; Target SOP-NET-007", "Tao published case CASE-FL02-* va SOPREQ-*", "Traceability FL-02 hien request FL-03", "Ready", "Nut publish nam trong Review Detail"],
  ["FL02-TC-07", "Knowledge Manager", "Sau publish case", `${baseUrl}?screen=knowledge-detail&id=CASE-CABLE-042`, "Tu traceability bam Chuan hoa thanh SOP", "SOPREQ-0007 hoac request vua tao", "Mo/tạo task FL-03", "Route sop-task-detail; active sidebar SOP", "Bridge", "Neu case vua publish co ID moi, mo detail case moi trong search"]
], "FL02Table");
styleSheet(fl02, [14, 22, 36, 58, 44, 44, 48, 38, 16, 38]);

const fl03 = ws("05_FL03_SOP_Authoring");
addTitle(fl03, "FL-03 - Tao moi hoac cap nhat SOP", "Test cases cho SOP task, editor 6 buoc, request changes/resubmit, approve/publish va versioning.", 10);
addTable(fl03, 4, ["TC ID", "Actor", "Precondition", "Route", "Thao tac demo", "Data nhap/chon", "Expected result", "Checkpoint UI", "Status", "Notes"], [
  ["FL03-TC-01", "Contributor", "Role KC-001, Reset Demo", `${baseUrl}?screen=sops&tab=tasks`, "Mo Nhiem vu SOP", "SOPTASK-2026-008", "Thay task cap nhat SOP-NET-007", "Card Cập nhật SOP xử lý nhiều Smart Node mất kết nối", "Ready", "Tab nam trong sidebar SOP"],
  ["FL03-TC-02", "Contributor", "Co task", `${baseUrl}?screen=sop-task-detail&id=SOPTASK-2026-008`, "Mo chi tiet task va source", "Nguon CASE-FL02-0043 / SUB-2026-0043", "Task detail hien business reason va requested changes", "Nut Soạn nội dung SOP", "Ready", "Wording khong dung 'mo task fl-03'"],
  ["FL03-TC-03", "Contributor", "Task co draft seed", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=metadata`, "Kiem tra Metadata & Version", "SOP-NET-007; v2.1 -> v3.0; MAJOR", "Validation metadata pass", "Stepper buoc 1 Thong tin", "Ready", "Co the sua title/summary neu can"],
  ["FL03-TC-04", "Contributor", "Editor step scope", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=scope`, "Kiem tra Purpose, Scope, Role, Completion Criteria", "Role FIELD_TECHNICIAN, CONTRIBUTOR", "Scope hop le", "Khong co error summary", "Ready", ""],
  ["FL03-TC-05", "Contributor", "Editor step safety", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=safety`, "Kiem tra risk HIGH va cac field an toan bat buoc", "PPE, hazards, controls, stop conditions, emergency action", "Risk cao co warning va validation bat PPE", "Warning banner hien", "Ready", "Diem de hoi dong thay safety rule"],
  ["FL03-TC-06", "Contributor", "Editor step procedure", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=procedure`, "Kiem tra cac procedure steps va decision point", "STEP-03 Kiem tra nguon va tuyen cap dung chung", "It nhat 2 buoc, decision co Co/Khong", "Procedure preview co STEP moi", "Ready", "Noi dung chinh cua update SOP"],
  ["FL03-TC-07", "Contributor", "Editor step references", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=references`, "Kiem tra source traceability", "CASE-FL02-0043, SUB-2026-0043, cable-cut-01.jpg", "Co it nhat mot source", "Source Knowledge ID co gia tri", "Ready", "Bat buoc de publish"],
  ["FL03-TC-08", "Contributor", "Editor step review", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=review`, "Preview, tick confirmation, Submit", "Confirmation TRUE", "Status SUBMITTED va vao success screen", "Man hinh Da gui Draft SOP vao hang doi duyet", "Ready", "Neu khong tick se co error confirmation"],
  ["FL03-TC-09", "Knowledge Manager", "Role KM-001", `${baseUrl}?screen=sops&tab=review`, "Mo Hang doi duyet SOP", "SOPD-2026-0015", "Draft RESUBMITTED hien trong queue", "Nut Duyet SOP", "Ready", "Dung draft seed de demo nhanh"],
  ["FL03-TC-10", "Knowledge Manager", "Review detail", `${baseUrl}?screen=sop-review-detail&id=SOPD-2026-0015`, "Kiem checklist, SoD, compare", "All checklist TRUE; author KC-001 reviewer KM-001", "Nut Duyet va chuan bi xuat ban enabled", "Khong co SoD error", "Ready", "Neu can request changes dung SOPD-2026-0014"],
  ["FL03-TC-11", "Knowledge Manager", "Modal publish", `${baseUrl}?screen=sop-review-detail&id=SOPD-2026-0015`, "Click Duyet va chuan bi xuat ban, tick confirm, Xuat ban SOP", "Version v3.0; Effective Date today; Review Date +1 year", "Navigate ve SOP Detail", "SOP-NET-007 badge v3.0", "Ready", "Action chinh ket thuc workflow"],
  ["FL03-TC-12", "Knowledge Manager/Contributor", "Sau publish", `${baseUrl}?screen=sop-version-history&id=SOP-NET-007`, "Xem Version History", "SOP-NET-007", "v3.0 Published, v2.1 Superseded", "Timeline hien 2 version", "Final verify", "Chung minh khong ghi de version cu"]
], "FL03Table");
styleSheet(fl03, [14, 22, 34, 58, 44, 46, 48, 38, 16, 38]);

const runbook = ws("06_E2E_Runbook");
addTitle(runbook, "E2E Demo Runbook - tu FL-01 den FL-03", "Chay theo thu tu nay de demo day du. Cot Backup Route giup nhay nhanh neu can rut ngan thoi gian.", 10);
addTable(runbook, 4, ["Step", "Flow", "Actor", "Route/Screen", "Action", "Data chuan bi", "Expected Result", "Success Signal", "Backup Route", "Ghi chu demo"], [
  [1, "Setup", "Any", "Topbar", "Bam Reset Demo", "Seed localStorage", "App ve trang Dashboard role Field Technician", "Toast reset demo", `${baseUrl}?screen=dashboard`, "Lam truoc khi hoi dong xem"],
  [2, "FL-01", "Field Technician", "Co so tri thuc", "Search tri thuc lien quan node offline", "Query node offline; Asset CTN-1108", "Tim thay SOP-NET-007", "Kết quả tìm kiếm co SOP", `${baseUrl}?screen=search-results&query=node%20offline&assetId=CTN-1108`, ""],
  [3, "FL-01", "Field Technician", "SOP Detail", "Mo SOP-NET-007", "SOP-NET-007", "Thay SOP v2.1 va procedure", "Badge v2.1", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`, ""],
  [4, "FL-01", "Field Technician", "SOP Detail", "Mark as Applied", "Outcome RESOLVED_FULLY, comment WO-2026-00421", "Ghi nhan apply", "Đã áp dụng", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`, "Neu modal mat thoi gian co the noi nhanh"],
  [5, "FL-02", "Field Technician", "Gui yeu cau > Gui tri thuc hien truong", "Tao submission tu work order gan nhat", "WO-2026-00421", "Mo wizard FL-02", "SUB-* draft", `${baseUrl}?screen=request&tab=field-capture`, ""],
  [6, "FL-02", "Field Technician", "Wizard Context", "Kiem tra context", "CTN-1108, District 7, HIGH", "Qua buoc 2", "Stepper B2", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=context`, "Dung seed neu can nhanh"],
  [7, "FL-02", "Field Technician", "Wizard Resolution", "Nhap/root cause va link SOP", "SOP-NET-007 v2.1, STEP-03/04, INCOMPLETE", "Co SOP gap/deviation", "SOP usage hien dung", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=resolution`, ""],
  [8, "FL-02", "Field Technician", "Wizard Evidence", "Nhap lesson learned va SOP proposal", "Update existing SOP-NET-007; gap nguon dung chung", "Validation pass", "Khong co error summary", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=evidence`, ""],
  [9, "FL-02", "Field Technician", "Wizard Review", "Tick confirmation va submit", "Confirmation TRUE", "Submission chuyen SUBMITTED", "Submit Success", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=review`, ""],
  [10, "FL-02", "Knowledge Manager", "Review Detail", "Doi role KM, mo submission da submitted", "SUB-2026-0043", "Manager thay thong tin case va SOP proposal", "Review detail hien", `${baseUrl}?screen=review-detail&id=SUB-2026-0043`, "Seed duoc khuyen nghi cho demo"],
  [11, "FL-02", "Knowledge Manager", "Review Detail", "Approve & Publish tri thuc", "Publication Repair Case, SOP potential Update Existing", "Sinh case published + SOP request", "Traceability co Yêu cầu FL-03", `${baseUrl}?screen=review-detail&id=SUB-2026-0043`, "Neu publish ID moi, mo tu search/recent"],
  [12, "Bridge", "Knowledge Manager", "Knowledge Detail", "Bam Chuan hoa thanh SOP", "SOPREQ-0007 hoac request moi", "Mo/tạo SOP task", "Route sop-task-detail", `${baseUrl}?screen=knowledge-detail&id=CASE-CABLE-042`, "Wording dung yeu cau cua ban"],
  [13, "FL-03", "Contributor", "SOP Tasks", "Doi role Contributor va mo task", "SOPTASK-2026-008", "Contributor thay task cap nhat SOP", "Card task hien", `${baseUrl}?screen=sops&tab=tasks`, ""],
  [14, "FL-03", "Contributor", "Task Detail", "Mo chi tiet task", "Nguon CASE-FL02-0043/SUB-2026-0043", "Thay business reason va requested changes", "Nut Soạn nội dung SOP", `${baseUrl}?screen=sop-task-detail&id=SOPTASK-2026-008`, ""],
  [15, "FL-03", "Contributor", "SOP Editor", "Kiem tra 6 buoc editor", "SOPD-2026-0012", "Draft v3.0 co metadata, safety, procedure, source", "Stepper 1-6", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=review`, "Tick confirmation neu muon submit"],
  [16, "FL-03", "Contributor", "SOP Editor Review", "Submit draft", "Confirmation TRUE", "Status SUBMITTED va success screen", "Da gui Draft SOP", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=review`, "Co the nhay seed SOPD-2026-0015"],
  [17, "FL-03", "Knowledge Manager", "SOP Review Queue", "Doi role KM va mo queue", "SOPD-2026-0015", "Draft resubmitted hien trong queue", "Nut Duyet SOP", `${baseUrl}?screen=sops&tab=review`, ""],
  [18, "FL-03", "Knowledge Manager", "SOP Review Detail", "Kiem checklist va SoD", "All checklist TRUE, author KC-001 reviewer KM-001", "Nut approve enabled", "Khong co SoD error", `${baseUrl}?screen=sop-review-detail&id=SOPD-2026-0015`, ""],
  [19, "FL-03", "Knowledge Manager", "Publish Modal", "Approve & Publish", "Version v3.0, effective today, review +1 year", "Publish SOP-NET-007", "Navigate SOP Detail v3.0", `${baseUrl}?screen=sop-review-detail&id=SOPD-2026-0015`, "Ket qua chinh cua FL-03"],
  [20, "Final Verify", "Any", "Version History", "Mo lich su version", "SOP-NET-007", "v3.0 Published, v2.1 Superseded", "Timeline co 2 version", `${baseUrl}?screen=sop-version-history&id=SOP-NET-007`, "Chung minh versioning"],
  [21, "Final Verify", "Field Technician", "FL-01 SOP Detail", "Doi role FT va xem SOP", "SOP-NET-007", "Field Technician thay SOP published v3.0", "Badge v3.0", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`, "Dong vong FL-01"]
], "RunbookTable");
styleSheet(runbook, [8, 14, 22, 34, 42, 42, 48, 34, 58, 34]);

const trace = ws("07_Traceability");
addTitle(trace, "Traceability FL-01 -> FL-02 -> FL-03", "Bang link du lieu de giai thich voi hoi dong vi sao mot SOP version moi duoc tao tu case field da duoc kiem chung.", 8);
addTable(trace, 4, ["Tu", "Source ID", "Sang", "Target ID", "Y nghia", "Man hinh verify", "Expected UI", "Ghi chu"], [
  ["FL-01 Apply", "SOP-NET-007 v2.1", "FL-02 Field Submission", "SUB-2026-0043", "Field Technician ap dung SOP nhung phat hien gap", `${baseUrl}?screen=review-detail&id=SUB-2026-0043`, "SOP usage: USED, feedback INCOMPLETE", "Nguon business cho SOP update"],
  ["FL-02 Published Case", "SUB-2026-0043", "Knowledge Item", "CASE-FL02-*", "Knowledge Manager xac thuc case thanh tri thuc published", "Knowledge Detail cua case publish", "Traceability panel FL-02", "ID moi sinh theo session"],
  ["FL-02 SOP Handoff", "SOPREQ-* / SOPREQ-0007", "FL-03 SOP Task", "SOPTASK-2026-008", "Khoang trong SOP duoc chuyen thanh task chuan hoa", `${baseUrl}?screen=sop-task-detail&id=SOPTASK-2026-008`, "Task detail co source va business reason", ""],
  ["FL-03 Authoring", "SOPTASK-2026-008", "Draft SOP", "SOPD-2026-0012", "Contributor clone SOP v2.1 thanh draft v3.0", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=review`, "Preview co STEP kiem tra nguon", ""],
  ["FL-03 Review", "SOPD-2026-0015", "Published SOP", "SOP-NET-007 v3.0", "Knowledge Manager approve va publish", `${baseUrl}?screen=sop-review-detail&id=SOPD-2026-0015`, "Approve button enabled, publish modal", "Dung seed de demo nhanh"],
  ["Versioning", "SOP-NET-007 v2.1", "SOP-NET-007 v3.0", "SOPV-NET-007-*", "Version cu khong bi sua truc tiep ma bi superseded", `${baseUrl}?screen=sop-version-history&id=SOP-NET-007`, "Timeline v3.0 Published va v2.1 SUPERSEDED", "Sau publish"]
], "TraceabilityTable");
styleSheet(trace, [22, 24, 24, 24, 50, 58, 42, 38]);

const checklist = ws("08_Demo_Checklist");
addTitle(checklist, "Checklist truoc va trong khi demo", "Danh sach tick nhanh de dam bao luong end-to-end khong bi lech role, localStorage hoac route.", 8);
addTable(checklist, 4, ["Nhom", "Checklist", "Owner", "Trang thai", "Bang chung can thay", "Xu ly neu loi", "Muc uu tien", "Ghi chu"], [
  ["Setup", "Dev server dang chay", "Presenter", "Todo", "http://127.0.0.1:5173/ mo duoc", "npm run dev -- --host 127.0.0.1", "High", ""],
  ["Setup", "Reset Demo truoc khi demo chinh", "Presenter", "Todo", "Toast Da reset demo data", "Bam Reset Demo tren topbar", "High", ""],
  ["Role", "FT search va submit FL-02", "Presenter", "Todo", "Topbar hien Minh Tran", "Chon Field Technician", "High", ""],
  ["Role", "Contributor thay task FL-03", "Presenter", "Todo", "Topbar hien Sarah Jenkins, task cards hien", "Chon Contributor", "High", ""],
  ["Role", "KM thay review queue", "Presenter", "Todo", "Topbar hien Alex Chen, Review Queue co draft", "Chon Knowledge Manager", "High", ""],
  ["FL-01", "Search hien SOP-NET-007", "Tester", "Todo", "Card SOP-NET-007", "Dung route backup search-results", "High", ""],
  ["FL-02", "Submission co SOP proposal update existing", "Tester", "Todo", "Target SOP-NET-007, gap summary", "Dung seed SUB-2026-0043", "High", ""],
  ["FL-03", "Editor co du 6 buoc", "Tester", "Todo", "Stepper Thong tin > Xem lai", "Mo SOPD-2026-0012", "High", ""],
  ["FL-03", "Review checklist pass va SoD hop le", "Tester", "Todo", "Approve button enabled", "Mo SOPD-2026-0015 bang role KM", "High", ""],
  ["Final", "SOP version history dung", "Tester", "Todo", "v3.0 Published, v2.1 SUPERSEDED", "Publish lai hoac Reset Demo roi chay lai", "High", ""],
  ["Optional", "Demo request changes", "Presenter", "Todo", "SOPD-2026-0014 hien CHANGES_REQUESTED", "Mo tab Draft SOP cua toi", "Medium", "Dung khi co them thoi gian"],
  ["Optional", "Demo access/visibility", "Presenter", "Todo", "Sidebar khong doi sang tieng Anh", "Reload route va check active nav", "Medium", ""]
], "ChecklistTable");
styleSheet(checklist, [18, 44, 18, 16, 42, 42, 16, 34]);

for (const sheetName of ["03_FL01_Search", "04_FL02_Field_Knowledge", "05_FL03_SOP_Authoring", "06_E2E_Runbook", "08_Demo_Checklist"]) {
  const sheet = workbook.worksheets.getItem(sheetName);
  const statusCol = sheetName === "06_E2E_Runbook" ? null : sheetName === "08_Demo_Checklist" ? "D" : "I";
  if (statusCol) {
    const range = sheet.getRange(`${statusCol}5:${statusCol}80`);
    range.dataValidation = { rule: { type: "list", values: ["Todo", "Ready", "Optional", "Bridge", "Final verify", "Pass", "Fail", "Blocked"] } };
  }
}

await fs.mkdir(outputDir, { recursive: true });

const inspect = await workbook.inspect({
  kind: "sheet,table",
  maxChars: 5000,
  tableMaxRows: 4,
  tableMaxCols: 6
});
console.log(inspect.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan"
});
console.log(errors.ndjson);

for (const sheetName of ["00_Tong_quan", "01_Roles_Setup", "02_Test_Data", "03_FL01_Search", "04_FL02_Field_Knowledge", "05_FL03_SOP_Authoring", "06_E2E_Runbook", "07_Traceability", "08_Demo_Checklist"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  const bytes = new Uint8Array(await preview.arrayBuffer());
  await fs.writeFile(path.join(outputDir, `${sheetName}.png`), bytes);
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`Saved ${outputPath}`);

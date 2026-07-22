import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/macprocuaphat/Desktop/KMS301/Code/FE/outputs/fl01_fl03_visual_runbook";
const outputPath = path.join(outputDir, "KMS_FL01_FL03_Visual_Runbook_Tieng_Viet.xlsx");
const baseUrl = "http://127.0.0.1:5173/";

const wb = Workbook.create();

const colors = {
  navy: "#003366",
  navy2: "#0A4A7A",
  blue: "#D5E3FF",
  paleBlue: "#EEF5FF",
  green: "#E6F4EA",
  amber: "#FFF4D6",
  red: "#FFE4E1",
  gray: "#F4F6FA",
  line: "#D7DEE8",
  text: "#1A1C1F",
  white: "#FFFFFF"
};

function colLetter(index) {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function sheet(name) {
  const ws = wb.worksheets.add(name);
  ws.showGridLines = false;
  return ws;
}

function setFmt(range, { fill, font, wrap = true, h = "left", v = "top", border } = {}) {
  if (fill) range.format.fill = { color: fill };
  range.format.font = { name: "Inter", size: 10, color: colors.text, ...(font || {}) };
  range.format.wrapText = wrap;
  range.format.horizontalAlignment = h;
  range.format.verticalAlignment = v;
  if (border) range.format.borders = border;
}

function setWidths(ws, widths) {
  widths.forEach((width, i) => {
    ws.getRange(`${colLetter(i)}:${colLetter(i)}`).format.columnWidth = width;
  });
}

function title(ws, text, subtitle, cols) {
  const end = colLetter(cols - 1);
  const r1 = ws.getRange(`A1:${end}1`);
  r1.merge();
  r1.values = [[text]];
  setFmt(r1, { fill: colors.navy, font: { color: colors.white, bold: true, size: 16 }, v: "middle" });
  r1.format.rowHeight = 32;
  const r2 = ws.getRange(`A2:${end}2`);
  r2.merge();
  r2.values = [[subtitle]];
  setFmt(r2, { fill: colors.blue, font: { color: colors.text, size: 10 }, v: "middle" });
  r2.format.rowHeight = 46;
}

function noteBand(ws, row, text, cols, fill = colors.amber) {
  const end = colLetter(cols - 1);
  const r = ws.getRange(`A${row}:${end}${row}`);
  r.merge();
  r.values = [[text]];
  setFmt(r, { fill, font: { bold: true }, v: "middle" });
  r.format.rowHeight = 34;
}

function table(ws, startRow, headers, rows, name) {
  const cols = headers.length;
  const end = colLetter(cols - 1);
  ws.getRange(`A${startRow}:${end}${startRow}`).values = [headers];
  if (rows.length) {
    ws.getRange(`A${startRow + 1}:${end}${startRow + rows.length}`).values = rows;
  }
  const header = ws.getRange(`A${startRow}:${end}${startRow}`);
  setFmt(header, { fill: colors.navy2, font: { color: colors.white, bold: true }, h: "center", v: "middle" });
  header.format.rowHeight = 34;
  const all = ws.getRange(`A${startRow}:${end}${startRow + rows.length}`);
  setFmt(all, { border: { preset: "inside", style: "thin", color: colors.line } });
  for (let i = 0; i < rows.length; i += 1) {
    const fill = i % 2 === 0 ? colors.paleBlue : colors.white;
    ws.getRange(`A${startRow + 1 + i}:${end}${startRow + 1 + i}`).format.fill = { color: fill };
    ws.getRange(`A${startRow + 1 + i}:${end}${startRow + 1 + i}`).format.rowHeight = 62;
  }
  try {
    const t = ws.tables.add(`A${startRow}:${end}${startRow + rows.length}`, true, name);
    t.style = "TableStyleMedium2";
    t.showFilterButton = true;
  } catch {
    // Table filters are optional; the workbook remains readable without them.
  }
  ws.freezePanes.freezeRows(startRow);
}

function dataValidation(ws, range, values) {
  ws.getRange(range).dataValidation = { rule: { type: "list", values } };
}

const flowHeaders = ["Bước", "Màn hình cần mở", "Thao tác trên giao diện", "Dữ liệu mẫu dùng ngay", "Kết quả cần thấy", "Mở nhanh"];

const intro = sheet("00_Cách dùng");
title(intro, "KMS - Runbook trực quan FL-01 đến FL-03", "Bản này dùng để demo theo luồng màn hình. Mỗi tab là một luồng, mỗi dòng là một bước thao tác cụ thể trên prototype.", 6);
noteBand(intro, 4, "Cách dùng nhanh: mở app tại http://127.0.0.1:5173/ → bấm Reset dữ liệu demo → đi theo tab 01, 02, 03 hoặc tab 04 để demo trọn vẹn.", 6);
table(intro, 6, ["Mục", "Bạn cần làm gì", "Dữ liệu/vai trò cần nhớ", "Kết quả mong muốn", "Khi bị lệch thì xử lý", "Ghi chú"], [
  ["Chuẩn bị", "Chạy dev server và mở prototype", "http://127.0.0.1:5173/", "Bảng điều khiển hiển thị thanh bên tiếng Việt", "Reload trang hoặc chạy lại npm run dev", "Không cần backend"],
  ["Reset demo", "Bấm nút Reset dữ liệu demo trên thanh trên cùng", "Vai trò quay về Kỹ thuật viên hiện trường", "Dữ liệu trong trình duyệt quay về dữ liệu mẫu ban đầu", "Bấm lại Reset dữ liệu demo", "Làm trước mỗi lần demo chính"],
  ["Đổi vai trò", "Dùng dropdown vai trò trên thanh trên", "FT-001, KC-001, KM-001", "Màn hình thay đổi quyền đúng vai trò", "Chọn lại vai trò theo dòng runbook", "Prototype dùng chung UI, không có login"],
  ["Đi demo ngắn", "Dùng tab 04_E2E_Tổng hợp", "Dữ liệu mẫu: SUB-2026-0043, SOPD-2026-0015", "Đi được từ FL-01 tới xuất bản SOP v3.0", "Dùng cột Mở nhanh để nhảy đường dẫn", "Phù hợp khi thời gian demo ít"],
  ["Đi demo chi tiết", "Dùng lần lượt tab 01_FL01, 02_FL02, 03_FL03", "Dữ liệu mẫu nằm ngay từng dòng", "Giải thích rõ từng luồng riêng", "Quay lại tab 05_Dữ liệu mẫu khi cần ID", "Phù hợp lúc thuyết trình sâu"],
  ["Kết thúc", "Mở lịch sử phiên bản của SOP-NET-007", "SOP-NET-007 v2.1 → v3.0", "v3.0 Đã xuất bản, v2.1 Bị thay thế", "Nếu chưa thấy v3.0 thì xuất bản lại ở FL-03", "Đây là điểm chốt của demo"]
], "CachDung");
setWidths(intro, [18, 34, 32, 36, 36, 34]);

const fl01 = sheet("01_FL01");
title(fl01, "FL-01 - Tìm kiếm và sử dụng tri thức", "Mục tiêu: Kỹ thuật viên hiện trường tìm SOP/tình huống phù hợp, mở SOP, đánh dấu đã áp dụng và tạo đầu vào cho FL-02.", 6);
noteBand(fl01, 4, "Vai trò dùng trong luồng này: Kỹ thuật viên hiện trường - Minh Tran. Dữ liệu trọng tâm: CTN-1108, node mất kết nối, SOP-NET-007.", 6);
table(fl01, 6, flowHeaders, [
  [1, "Bảng điều khiển", "Bấm Reset dữ liệu demo để đưa dữ liệu về trạng thái sạch.", "Không cần nhập gì.", "Sidebar vẫn là tiếng Việt, vai trò đang là Kỹ thuật viên hiện trường.", `${baseUrl}?screen=dashboard`],
  [2, "Cơ sở tri thức", "Bấm tab Cơ sở tri thức ở thanh bên.", "Từ khóa: node mất kết nối hoặc cổng kết nối.", "Màn hình tìm kiếm nâng cao hiển thị biểu mẫu lọc.", `${baseUrl}?screen=search`],
  [3, "Cơ sở tri thức", "Nhập từ khóa và mã tài sản rồi bấm Tìm kiếm.", "Từ khóa: node mất kết nối cổng kết nối; mã tài sản: CTN-1108.", "Danh sách kết quả có SOP liên quan đến Smart Node mất kết nối.", `${baseUrl}?screen=search-results&query=node%20mất kết nối&assetId=CTN-1108`],
  [4, "Kết quả tìm kiếm", "Bấm Mở nội dung ở thẻ SOP-NET-007.", "SOP-NET-007.", "Mở trang chi tiết SOP, có nhãn trạng thái Đã xuất bản và phiên bản v2.1.", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`],
  [5, "Chi tiết SOP", "Đọc nhanh phần Applicability, Safety/phương tiện bảo hộ và Procedure Steps.", "Chú ý các bước cổng kết nối, RF, reset cụm node.", "Người xem hiểu SOP hiện tại chưa có bước kiểm tra nguồn dùng chung rõ ràng.", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`],
  [6, "Chi tiết SOP", "Bấm Đánh dấu đã áp dụng, chọn kết quả và xác nhận.", "Kết quả: đã xử lý; Ghi chú: Áp dụng cho WO-2026-00421.", "Thông báo ghi nhận áp dụng; màn hình hiện trạng thái đã áp dụng.", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`],
  [7, "Chi tiết SOP", "Bấm Ghi nhận tri thức hiện trường nếu muốn đi tiếp sang FL-02.", "Mã công việc: WO-2026-00421; Tài sản: CTN-1108.", "Prototype tạo draft submission hoặc mở tab gửi tri thức hiện trường.", `${baseUrl}?screen=request&tab=field-capture`],
  [8, "Kiểm tra sau FL-03", "Sau khi xuất bản SOP ở FL-03, quay lại SOP-NET-007.", "SOP-NET-007.", "Phiên bản đổi thành v3.0 và có bước kiểm tra nguồn/tuyến cáp dùng chung.", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`]
], "LuongFL01");
setWidths(fl01, [8, 24, 45, 42, 46, 42]);

const fl02 = sheet("02_FL02");
title(fl02, "FL-02 - Gửi tri thức hiện trường và kiểm duyệt", "Mục tiêu: Kỹ thuật viên hiện trường ghi nhận tình huống thực tế, Quản lý tri thức duyệt và biến tình huống thành tri thức có thể chuyển sang FL-03.", 6);
noteBand(fl02, 4, "Vai trò dùng: Kỹ thuật viên hiện trường để gửi, Quản lý tri thức để duyệt. Nếu demo ngắn, dùng dữ liệu mẫu SUB-2026-0043.", 6);
table(fl02, 6, flowHeaders, [
  [1, "Gửi yêu cầu", "Mở tab Gửi yêu cầu trên thanh bên, chọn Gửi tri thức hiện trường.", "Mã công việc gần nhất: WO-2026-00421.", "Thấy thẻ công việc gần nhất và nút ghi nhận bài học.", `${baseUrl}?screen=request&tab=field-capture`],
  [2, "Gửi tri thức hiện trường - Bối cảnh", "Bấm Ghi nhận bài học từ công việc này.", "Tài sản: CTN-1108; Loại lỗi: Mất kết nối; Severity: Cao.", "trình nhập liệu mở bước Bối cảnh với dữ liệu được điền sẵn.", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=context`],
  [3, "Bước Chẩn đoán & xử lý", "Điền nguyên nhân, hành động sửa chữa và liên kết SOP đã dùng.", "SOP đã dùng: SOP-NET-007 v2.1; bước liên quan: STEP-03, STEP-04; phản hồi: Chưa đầy đủ.", "Form thể hiện SOP gap/deviation để làm căn cứ cập nhật SOP.", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=resolution`],
  [4, "Bước Bằng chứng & bài học", "Nhập bài học kinh nghiệm và đề xuất cập nhật SOP.", "Bài học: nhiều node cùng mất kết nối nên kiểm tra nguồn/tuyến cáp dùng chung trước khi thay node.", "Đề xuất Cập nhật SOP hiện có, SOP mục tiêu SOP-NET-007, gap summary đủ rõ.", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=evidence`],
  [5, "Bước Xem lại & gửi", "Tick xác nhận rồi bấm Gửi kiểm duyệt.", "Xác nhận: đã xác nhận nội dung.", "Màn hình thành công hoặc submission chuyển sang trạng thái chờ kiểm duyệt.", `${baseUrl}?screen=field-submission&id=SUB-2026-0042&step=review`],
  [6, "Hàng đợi xét duyệt", "Đổi vai trò sang Quản lý tri thức, mở submission đã gửi.", "Dùng nhanh: SUB-2026-0043.", "Màn hình duyệt hiển thị bối cảnh, chẩn đoán, bài học và đề xuất SOP.", `${baseUrl}?screen=review-detail&id=SUB-2026-0043`],
  [7, "Màn hình duyệt", "Quản lý tri thức phê duyệt và xuất bản tri thức.", "Loại xuất bản: Tình huống sửa chữa; Tiềm năng SOP: Cập nhật SOP hiện có; SOP mục tiêu: SOP-NET-007.", "Sinh tri thức đã xuất bản và yêu cầu chuyển tiếp sang FL-03.", `${baseUrl}?screen=review-detail&id=SUB-2026-0043`],
  [8, "Chi tiết tri thức của tình huống", "Trong phần truy vết FL-02, bấm Chuẩn hóa thành SOP.", "Yêu cầu mẫu: SOPREQ-0007 hoặc request mới vừa sinh.", "Mở/tạo nhiệm vụ SOP cho Người biên soạn ở FL-03.", `${baseUrl}?screen=knowledge-detail&id=CASE-CABLE-042`]
], "LuongFL02");
setWidths(fl02, [8, 28, 46, 42, 48, 42]);

const fl03 = sheet("03_FL03");
title(fl03, "FL-03 - Tạo mới hoặc cập nhật SOP", "Mục tiêu: Người biên soạn soạn bản nháp SOP từ nhiệm vụ, Quản lý tri thức duyệt và xuất bản SOP phiên bản mới về FL-01.", 6);
noteBand(fl03, 4, "Vai trò dùng: Người biên soạn để soạn, Quản lý tri thức để duyệt. Dữ liệu trọng tâm: SOPTASK-2026-008, SOPD-2026-0012, SOPD-2026-0015.", 6);
table(fl03, 6, flowHeaders, [
  [1, "Quy trình vận hành (SOP)", "Đổi vai trò sang Người biên soạn rồi mở tab Nhiệm vụ SOP.", "Nhiệm vụ mẫu: SOPTASK-2026-008.", "Thấy thẻ Cập nhật SOP xử lý nhiều Smart Node mất kết nối.", `${baseUrl}?screen=sops&tab=tasks`],
  [2, "Chi tiết nhiệm vụ SOP", "Bấm Xem chi tiết hoặc Soạn nội dung SOP.", "Nguồn: CASE-FL02-0043, SUB-2026-0043; SOP mục tiêu: SOP-NET-007.", "Màn hình giải thích vì sao cần cập nhật SOP.", `${baseUrl}?screen=sop-task-detail&id=SOPTASK-2026-008`],
  [3, "Trình soạn - Thông tin", "Kiểm tra thông tin mô tả và phiên bản.", "SOP-NET-007; phiên bản trước v2.1; phiên bản đề xuất v3.0; loại thay đổi lớn.", "Bước 1 hợp lệ, tiêu đề/tóm tắt đã có sẵn.", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=metadata`],
  [4, "Trình soạn - Phạm vi", "Kiểm tra mục đích, phạm vi, vai trò áp dụng và tiêu chí hoàn tất.", "Vai trò áp dụng: Kỹ thuật viên hiện trường, Người biên soạn.", "Người xem hiểu SOP dùng cho nhiều node mất kết nối trong cùng cổng kết nối/tuyến.", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=scope`],
  [5, "Trình soạn - An toàn", "Kiểm tra rủi ro CAO, phương tiện bảo hộ, mối nguy, biện pháp kiểm soát và điều kiện dừng.", "phương tiện bảo hộ: găng tay cách điện, kính bảo hộ, áo phản quang.", "Có cảnh báo rủi ro cao và đầy đủ trường an toàn bắt buộc.", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=safety`],
  [6, "Trình soạn - Các bước", "Mở phần các bước thực hiện và chỉ rõ bước mới được bổ sung.", "STEP-03: Kiểm tra nguồn và tuyến cáp dùng chung.", "Luồng cập nhật có thay đổi nghiệp vụ rõ ràng, không chỉ sửa chữ.", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=procedure`],
  [7, "Trình soạn - Nguồn", "Kiểm tra truy vết nguồn trước khi gửi duyệt.", "Nguồn: CASE-FL02-0043, CASE-CABLE-042, SUB-2026-0043, cable-cut-01.jpg.", "Bản nháp có nguồn rõ để Quản lý tri thức kiểm tra.", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=references`],
  [8, "Trình soạn - Xem lại", "Xem bản xem trước, tick xác nhận, bấm Gửi duyệt SOP.", "Xác nhận: đã xác nhận.", "Bản nháp vào hàng đợi duyệt SOP.", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=review`],
  [9, "Hàng đợi duyệt SOP", "Đổi vai trò sang Quản lý tri thức và mở hàng đợi.", "Dùng nhanh: SOPD-2026-0015 vì đã ở trạng thái Đã gửi lại.", "Hàng đợi có mục để duyệt.", `${baseUrl}?screen=sops&tab=review`],
  [10, "Màn hình duyệt SOP", "Kiểm tra danh sách kiểm tra và phân tách nhiệm vụ.", "Danh sách kiểm tra đều đạt; Người soạn: KC-001; Người duyệt: KM-001.", "Nút Duyệt và chuẩn bị xuất bản được bật.", `${baseUrl}?screen=sop-review-detail&id=SOPD-2026-0015`],
  [11, "Hộp thoại xuất bản", "Bấm Duyệt và chuẩn bị xuất bản, tick xác nhận, bấm Xuất bản SOP.", "Phiên bản: v3.0; Ngày hiệu lực: hôm nay; Ngày rà soát: +1 năm.", "Điều hướng về Chi tiết SOP và nhãn trạng thái hiển thị v3.0.", `${baseUrl}?screen=sop-review-detail&id=SOPD-2026-0015`],
  [12, "Lịch sử phiên bản", "Mở lịch sử SOP-NET-007.", "SOP-NET-007.", "Dòng thời gian có v3.0 Đã xuất bản và v2.1 Bị thay thế.", `${baseUrl}?screen=sop-version-history&id=SOP-NET-007`]
], "LuongFL03");
setWidths(fl03, [8, 28, 46, 42, 48, 42]);

const e2e = sheet("04_E2E_Tổng hợp");
title(e2e, "Luồng demo tổng hợp từ FL-01 đến FL-03", "Dùng tab này khi muốn chạy một mạch trước hội đồng. Đây là bản ít chi tiết hơn nhưng đúng thứ tự demo.", 6);
noteBand(e2e, 4, "Nếu thời gian ít: dùng dữ liệu mẫu SUB-2026-0043 ở FL-02 và SOPD-2026-0015 ở FL-03 để đi nhanh tới xuất bản v3.0.", 6);
table(e2e, 6, flowHeaders, [
  [1, "Bảng điều khiển", "Reset dữ liệu demo.", "Không cần nhập.", "Dữ liệu về dữ liệu mẫu, vai trò là Kỹ thuật viên hiện trường.", `${baseUrl}?screen=dashboard`],
  [2, "Cơ sở tri thức", "Tìm SOP cho lỗi nhiều node mất kết nối.", "Từ khóa: node mất kết nối cổng kết nối; Tài sản: CTN-1108.", "Có kết quả SOP-NET-007.", `${baseUrl}?screen=search-results&query=node%20mất kết nối&assetId=CTN-1108`],
  [3, "Chi tiết SOP", "Mở SOP-NET-007 và đánh dấu đã áp dụng.", "Kết quả: đã xử lý; Ghi chú: WO-2026-00421.", "Apply được ghi nhận.", `${baseUrl}?screen=sop-detail&id=SOP-NET-007`],
  [4, "Gửi yêu cầu", "Bắt đầu gửi tri thức hiện trường.", "WO-2026-00421, CTN-1108.", "trình nhập liệu FL-02 mở với dữ liệu tình huống hiện trường.", `${baseUrl}?screen=request&tab=field-capture`],
  [5, "FL-02 Review", "Đổi vai trò Quản lý tri thức và mở submission mẫu.", "SUB-2026-0043.", "Thấy tình huống có đề xuất cập nhật SOP-NET-007.", `${baseUrl}?screen=review-detail&id=SUB-2026-0043`],
  [6, "FL-02 Publish", "Phê duyệt và xuất bản tình huống/bài học kinh nghiệm.", "Tình huống sửa chữa; tiềm năng SOP: Cập nhật SOP hiện có.", "Có chuyển tiếp sang FL-03.", `${baseUrl}?screen=review-detail&id=SUB-2026-0043`],
  [7, "FL-03 Task", "Đổi vai trò Người biên soạn, mở nhiệm vụ SOP.", "SOPTASK-2026-008.", "Nhiệm vụ giải thích khoảng trống SOP.", `${baseUrl}?screen=sop-task-detail&id=SOPTASK-2026-008`],
  [8, "FL-03 Trình soạn", "Xem draft update v3.0 qua 6 bước.", "SOPD-2026-0012.", "Thấy bước mới: kiểm tra nguồn và tuyến cáp dùng chung.", `${baseUrl}?screen=sop-editor&id=SOPD-2026-0012&step=review`],
  [9, "FL-03 Review", "Đổi vai trò Quản lý tri thức, mở bản nháp đã gửi lại.", "SOPD-2026-0015.", "Danh sách kiểm tra đạt, nút phê duyệt bật.", `${baseUrl}?screen=sop-review-detail&id=SOPD-2026-0015`],
  [10, "FL-03 Publish", "Xuất bản SOP.", "Phiên bản v3.0.", "SOP-NET-007 chuyển thành v3.0.", `${baseUrl}?screen=sop-review-detail&id=SOPD-2026-0015`],
  [11, "Kiểm tra cuối", "Mở lịch sử phiên bản và quay lại Chi tiết SOP.", "SOP-NET-007.", "v3.0 Đã xuất bản, v2.1 Bị thay thế; FL-01 thấy v3.0.", `${baseUrl}?screen=sop-version-history&id=SOP-NET-007`]
], "TongHop");
setWidths(e2e, [8, 26, 46, 42, 48, 42]);

const data = sheet("05_Dữ liệu mẫu");
title(data, "Dữ liệu mẫu cần nhớ khi demo", "Tab này gom dữ liệu thật đang có trong prototype để bạn copy nhanh khi thao tác.", 6);
noteBand(data, 4, "Những ID dưới đây đã được chuẩn bị trong mock data/dữ liệu trình duyệt. Không cần backend.", 6);
table(data, 6, ["Nhóm dữ liệu", "ID / Giá trị", "Dùng ở luồng", "Ý nghĩa khi demo", "Màn hình nên mở", "Ghi chú"], [
  ["Vai trò", "Kỹ thuật viên hiện trường - FT-001 - Minh Tran", "FL-01, FL-02", "Người tìm và sử dụng tri thức, gửi tình huống hiện trường.", "Bộ chọn vai trò trên thanh trên", "Không duyệt SOP"],
  ["Vai trò", "Người biên soạn - KC-001 - Sarah Jenkins", "FL-03", "Người nhận nhiệm vụ và soạn bản nháp SOP.", "Bộ chọn vai trò trên thanh trên", "Không tự phê duyệt draft của mình"],
  ["Vai trò", "Quản lý tri thức - KM-001 - Alex Chen", "FL-02, FL-03", "Người kiểm duyệt, phê duyệt và xuất bản tri thức/SOP.", "Bộ chọn vai trò trên thanh trên", "Dùng để xuất bản"],
  ["Tài sản", "CTN-1108", "FL-01, FL-02", "mã tài sản của CityTouch Node trong mã công việc.", "Tìm kiếm hoặc FL-02 Bối cảnh", "Dùng với từ khóa node mất kết nối"],
  ["Mã công việc", "WO-2026-00421", "FL-02", "Công việc gần nhất để tạo tri thức hiện trường.", "Gửi yêu cầu > Gửi tri thức hiện trường", "Dữ liệu mẫu mã công việc hiện tại"],
  ["SOP hiện tại", "SOP-NET-007 v2.1", "FL-01, FL-03", "SOP đang thiếu bước kiểm tra nguồn/tuyến cáp dùng chung.", "Chi tiết SOP", "Sau xuất bản thành v3.0"],
  ["Tình huống tham chiếu", "CASE-CABLE-042", "FL-01, FL-03", "Tình huống sửa chữa có thể dùng làm nguồn truy vết nguồn.", "Chi tiết tri thức", "Có liên quan SOP-NET-007"],
  ["Bản gửi mẫu", "SUB-2026-0043", "FL-02", "Bản gửi đã gửi, có đề xuất cập nhật SOP-NET-007.", "Màn hình duyệt", "Dùng để demo nhanh duyệt/xuất bản"],
  ["Yêu cầu SOP mẫu", "SOPREQ-0007", "FL-02 → FL-03", "Chuyển tiếp từ tri thức đã duyệt sang nhiệm vụ SOP.", "Bảng truy vết nguồn", "Nút: Chuẩn hóa thành SOP"],
  ["Nhiệm vụ SOP mẫu", "SOPTASK-2026-008", "FL-03", "Nhiệm vụ cập nhật SOP từ tình huống FL-02.", "Chi tiết nhiệm vụ SOP", "Giao cho KC-001"],
  ["Bản nháp để xem trình soạn", "SOPD-2026-0012", "FL-03", "Bản nháp v3.0 có đủ nội dung nhưng chưa tick xác nhận.", "Trình soạn SOP", "Dùng để demo kiểm tra xác nhận"],
  ["Bản nháp để xuất bản nhanh", "SOPD-2026-0015", "FL-03", "Bản nháp đã gửi lại và danh sách kiểm tra đạt.", "Màn hình duyệt SOP", "Dùng để demo phê duyệt & xuất bản"],
  ["Phiên bản cuối", "SOP-NET-007 v3.0", "Kết thúc E2E", "SOP mới đã xuất bản và quay lại FL-01.", "Chi tiết SOP / Lịch sử phiên bản", "v2.1 bị thay thế"]
], "DataMau");
setWidths(data, [24, 34, 22, 48, 40, 36]);

const checklist = sheet("06_Checklist");
title(checklist, "Checklist trước khi demo", "Dùng tab này để tick nhanh những thứ cần chuẩn bị và những dấu hiệu thành công phải thấy.", 6);
noteBand(checklist, 4, "Các cột Trạng thái có dropdown để bạn đánh dấu trước buổi demo.", 6);
table(checklist, 6, ["Hạng mục", "Cần kiểm tra", "Vai trò", "Trạng thái", "Dấu hiệu thành công", "Cách xử lý nếu chưa đúng"], [
  ["Setup", "Dev server đang chạy.", "Bất kỳ", "Chưa làm", "Mở được http://127.0.0.1:5173/.", "Chạy npm run dev -- --host 127.0.0.1"],
  ["Setup", "Đã bấm Reset dữ liệu demo.", "Bất kỳ", "Chưa làm", "Thông báo reset demo data.", "Bấm lại Reset dữ liệu demo trên thanh trên."],
  ["FL-01", "Tìm kiếm ra SOP-NET-007.", "Kỹ thuật viên hiện trường", "Chưa làm", "Kết quả tìm kiếm có SOP mất kết nối.", "Dùng đường dẫn nhanh trong tab 01_FL01."],
  ["FL-01", "Chi tiết SOP trước xuất bản là v2.1.", "Kỹ thuật viên hiện trường", "Chưa làm", "Nhãn trạng thái v2.1.", "Reset dữ liệu demo nếu đang là v3.0 từ lần test trước."],
  ["FL-02", "Bản gửi có đề xuất cập nhật SOP.", "Quản lý tri thức", "Chưa làm", "Màn hình duyệt có SOP mục tiêu SOP-NET-007.", "Dùng dữ liệu mẫu SUB-2026-0043."],
  ["FL-03", "Người biên soạn thấy nhiệm vụ SOP.", "Người biên soạn", "Chưa làm", "SOPTASK-2026-008 hiển thị.", "Chọn vai trò Người biên soạn."],
  ["FL-03", "Trình soạn có đủ 6 bước.", "Người biên soạn", "Chưa làm", "Stepper Thông tin, Phạm vi, An toàn, Các bước, Nguồn, Xem lại.", "Mở SOPD-2026-0012."],
  ["FL-03", "Quản lý phê duyệt được draft.", "Quản lý tri thức", "Chưa làm", "Nút Duyệt và chuẩn bị xuất bản được bật.", "Mở SOPD-2026-0015 bằng vai trò Quản lý tri thức."],
  ["Kết thúc", "Lịch sử phiên bản đúng.", "Bất kỳ", "Chưa làm", "v3.0 Đã xuất bản, v2.1 Bị thay thế.", "Xuất bản lại draft hoặc Reset dữ liệu demo rồi chạy lại."],
  ["Kết thúc", "FL-01 thấy SOP mới.", "Kỹ thuật viên hiện trường", "Chưa làm", "SOP-NET-007 nhãn trạng thái v3.0.", "Mở lại Chi tiết SOP sau xuất bản."]
], "Checklist");
setWidths(checklist, [18, 38, 22, 18, 44, 44]);
dataValidation(checklist, "D7:D40", ["Chưa làm", "Đang làm", "Đã xong", "Bị kẹt", "Bỏ qua"]);

for (const ws of [intro, fl01, fl02, fl03, e2e, data, checklist]) {
  const used = ws.getUsedRange();
  if (used) {
    setFmt(used, { wrap: true, v: "top" });
  }
  setFmt(ws.getRange("A1:F1"), { font: { color: colors.navy, bold: true, size: 16 }, v: "middle" });
  ws.getRange("A1:F1").format.rowHeight = 32;
  setFmt(ws.getRange("A2:F2"), { fill: colors.blue, font: { color: colors.text, size: 10 }, v: "middle" });
  ws.getRange("A2:F2").format.rowHeight = 46;
  setFmt(ws.getRange("A4:F4"), { fill: colors.amber, font: { bold: true }, v: "middle" });
  ws.getRange("A4:F4").format.rowHeight = 34;
}

await fs.mkdir(outputDir, { recursive: true });

const overview = await wb.inspect({
  kind: "sheet,table",
  maxChars: 6000,
  tableMaxRows: 5,
  tableMaxCols: 6
});
console.log(overview.ndjson);

const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 200 },
  summary: "Quét lỗi công thức cuối"
});
console.log(errors.ndjson);

for (const name of ["00_Cách dùng", "01_FL01", "02_FL02", "03_FL03", "04_E2E_Tổng hợp", "05_Dữ liệu mẫu", "06_Checklist"]) {
  const png = await wb.render({ sheetName: name, autoCrop: "all", scale: 1, format: "png" });
  const bytes = new Uint8Array(await png.arrayBuffer());
  await fs.writeFile(path.join(outputDir, `${name}.png`), bytes);
}

const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outputPath);
console.log(`Đã lưu ${outputPath}`);

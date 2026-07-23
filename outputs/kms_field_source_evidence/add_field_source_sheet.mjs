import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "/Users/phantatthanh/Documents/FPT-Sem7/KMS301/KMS301-FE/documents/DataDemo_KMS.xlsx";
const outputDir = "/Users/phantatthanh/Documents/FPT-Sem7/KMS301/KMS301-FE/outputs/kms_field_source_evidence";
const outputPath = `${outputDir}/DataDemo_KMS_Field_Source_Evidence.xlsx`;
const documentsPath = "/Users/phantatthanh/Documents/FPT-Sem7/KMS301/KMS301-FE/documents/DataDemo_KMS.xlsx";
const sheetName = "10_Cơ sở field";

const sources = [
  ["ISO 30401:2018", "Knowledge management systems - yêu cầu thiết lập, duy trì, rà soát và cải tiến hệ thống quản lý tri thức.", "https://www.iso.org/standard/68683.html"],
  ["ISO 9001 Clause 9", "Cơ sở cho monitoring, measurement, analysis and evaluation để đánh giá hiệu quả quy trình bằng dữ liệu.", "https://www.iso.org/obp/ui/"],
  ["KCS v6 Article Structure", "Cấu trúc bài tri thức gồm Issue, Environment, Resolution, Cause và metadata để tri thức dễ tìm, dễ dùng.", "https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/020"],
  ["EPA QA/G-6 SOP Guidance", "Hướng dẫn cấu trúc SOP, document control, version, review/approval, safety, procedure, QA/QC và references.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["ISO 9001 Documented Information", "Cơ sở cho kiểm soát tài liệu, bằng chứng, review of changes, người phê duyệt và hồ sơ hành động.", "https://www.iso.org/iso/documented_information.pdf"],
  ["ISO 55001 Asset Management", "Cơ sở cho asset context, data/information/knowledge và life cycle management trong quản lý tài sản.", "https://committee.iso.org/sites/tc251/home/projects/published/iso-55001.html"],
  ["ISO 31000 Risk Management", "Cơ sở cho nhận diện, phân tích, xử lý, theo dõi và truyền thông rủi ro.", "https://www.iso.org/standard/65694.html"],
  ["OSHA Job Hazard Analysis", "Cơ sở cho hazard, PPE, controls, điều kiện dừng và an toàn khi thao tác hiện trường.", "https://www.osha.gov/sites/default/files/publications/OSHA3071.pdf"]
];

const fieldRows = [
  ["Tri thức hiện trường", "Triệu chứng", "Ghi lại vấn đề nhìn thấy theo ngôn ngữ hiện trường để người sau tìm đúng case tương tự.", "KCS Issue", "Nếu không có triệu chứng, tri thức không có entry point để tìm kiếm và so khớp tình huống.", "https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/020"],
  ["Tri thức hiện trường", "Mã lỗi", "Chuẩn hóa tín hiệu kỹ thuật từ hệ thống/thiết bị để phân loại và đối chiếu telemetry.", "KCS Environment; ISO 55001", "Mã lỗi giúp nối case với asset/system data thay vì chỉ dựa vào mô tả tự do.", "https://committee.iso.org/sites/tc251/home/projects/published/iso-55001.html"],
  ["Tri thức hiện trường", "Downtime", "Đo ảnh hưởng vận hành và mức độ ưu tiên xử lý sự cố.", "ISO 31000", "Downtime là dữ liệu impact để đánh giá rủi ro/damage của sự cố.", "https://www.iso.org/standard/65694.html"],
  ["Tri thức hiện trường", "Thời gian hoàn thành", "Ghi nhận thời gian thực tế từ lúc bắt đầu chẩn đoán/xử lý đến khi xác minh xong, làm dữ liệu so sánh với thời gian ước tính của SOP.", "ISO 9001 Clause 9; KCS Metrics", "Nếu nhiều case dùng cùng SOP liên tục chậm hơn estimate, đây là signal để Knowledge Manager rà soát SOP.", "https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/070"],
  ["Tri thức hiện trường", "Các bước chẩn đoán", "Cho biết đã kiểm tra gì, theo thứ tự nào, tránh lặp lại thao tác sai hoặc bỏ sót kiểm tra.", "KCS Resolution; EPA SOP procedure", "Case tốt không chỉ nói kết quả, mà ghi được đường đi chẩn đoán để tái sử dụng.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["Tri thức hiện trường", "Nguyên nhân gốc rễ", "Phân biệt các case có triệu chứng giống nhau nhưng nguyên nhân khác nhau.", "KCS Cause", "Root cause giúp người tìm xác nhận bài này có đúng vấn đề của họ không.", "https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/020"],
  ["Tri thức hiện trường", "Hành động sửa chữa", "Ghi lại thao tác xử lý có thể áp dụng lại cho tình huống tương tự.", "KCS Resolution", "Đây là phần biến kinh nghiệm hiện trường thành hướng dẫn tái sử dụng.", "https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/020"],
  ["Tri thức hiện trường", "Kết quả xử lý", "Cho biết case đã resolved, partial hay cần follow-up để tránh dùng tri thức chưa kiểm chứng như tri thức chuẩn.", "ISO 9001 record; KCS content health", "Outcome là bằng chứng trạng thái của giải pháp.", "https://www.iso.org/iso/documented_information.pdf"],
  ["Tri thức hiện trường", "Cách xác minh", "Chứng minh kết quả thật sự đúng bằng kiểm tra sau sửa, ví dụ node online/telemetry ổn định.", "EPA QA/QC; ISO 9001", "Verification làm tri thức đáng tin, không chỉ là cảm nhận của kỹ thuật viên.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["Tri thức hiện trường", "Bằng chứng", "Lưu căn cứ để Knowledge Manager review, audit và quyết định publish/update.", "ISO 9001 Documented Information", "Không có evidence thì hội đồng/reviewer không kiểm chứng được case.", "https://www.iso.org/iso/documented_information.pdf"],
  ["Tri thức hiện trường", "Telemetry", "Dữ liệu máy giúp xác nhận trạng thái thiết bị trước/sau xử lý.", "ISO 55001 data/information; ISO 9001 records", "Telemetry là evidence khách quan cho asset vận hành.", "https://committee.iso.org/sites/tc251/home/projects/published/iso-55001.html"],
  ["Tri thức hiện trường", "Ảnh", "Ghi nhận điều kiện vật lý/an toàn ngoài hiện trường như nước, cháy, đứt cáp.", "KCS multimedia; OSHA JHA", "Ảnh giúp reviewer hiểu tình huống mà text khó mô tả đầy đủ.", "https://www.osha.gov/sites/default/files/publications/OSHA3071.pdf"],
  ["Tri thức hiện trường", "File", "Lưu log, report, ảnh, tài liệu OEM hoặc export hệ thống làm hồ sơ hỗ trợ.", "ISO 9001 records", "File là hồ sơ dẫn chứng phục vụ audit và traceability.", "https://www.iso.org/iso/documented_information.pdf"],
  ["Tri thức hiện trường", "Lesson learned", "Rút ra bài học có thể tái sử dụng từ kinh nghiệm cá nhân.", "ISO 30401; KCS", "Đây là nơi chuyển tacit knowledge thành organizational knowledge.", "https://www.iso.org/standard/68683.html"],
  ["Tri thức hiện trường", "Recommendation", "Đề xuất phòng ngừa/cải tiến để giảm lỗi lặp lại.", "ISO 30401 continual improvement; ISO 31000", "Không chỉ lưu sự cố đã qua, hệ thống còn tạo đầu vào cải tiến.", "https://www.iso.org/standard/68683.html"],
  ["Tri thức hiện trường", "Reusable scope", "Xác định tình huống nào được phép áp dụng lại để tránh áp dụng sai ngữ cảnh.", "KCS audience/context", "Tri thức hiện trường phải nói rõ phạm vi dùng lại, vì asset/fault có thể khác nhau.", "https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/020"],
  ["Tri thức hiện trường", "Đề xuất cập nhật SOP", "Kết nối case thực tế với cải tiến quy trình chuẩn khi phát hiện gap.", "KCS Improve; EPA SOP review", "Field case là tín hiệu để SOP được cập nhật thay vì đứng yên.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["SOP", "Mã SOP", "Định danh duy nhất để tìm, kiểm soát, audit và liên kết version.", "EPA SOP document control", "SOP không có mã thì không thể quản lý như controlled document.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["SOP", "Version", "Xác định bản đang dùng, bản cũ/bản mới và lịch sử thay đổi.", "EPA SOP revision; ISO 9001 change control", "Version tránh kỹ thuật viên dùng nhầm hướng dẫn lỗi thời.", "https://www.iso.org/iso/documented_information.pdf"],
  ["SOP", "Tiêu đề", "Cho biết quy trình xử lý hoạt động gì, giúp search và nhận diện nhanh.", "EPA SOP title page", "Title là trường tối thiểu của SOP/document control.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["SOP", "Tóm tắt", "Giúp người dùng hiểu nhanh SOP có phù hợp trước khi mở đọc chi tiết.", "KCS findability/usability", "Summary giảm thời gian tìm và tránh mở sai nội dung.", "https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/020"],
  ["SOP", "Thời gian ước tính hoàn thành", "Đặt baseline vận hành cho SOP để so sánh với thời gian thực tế khi kỹ thuật viên áp dụng ngoài hiện trường.", "ISO 9001 monitoring/measurement; ISO 30401 review/improve", "Estimate time không dùng để phạt cá nhân; nó là baseline để phát hiện SOP có thể thiếu bước, khó hiểu hoặc cần cải tiến.", "https://www.iso.org/standard/68683.html"],
  ["SOP", "Danh mục", "Phân loại nội dung để search/filter/report và quản trị taxonomy.", "KCS metadata; ISO 30401", "Danh mục giúp knowledge base không thành kho tài liệu rời rạc.", "https://www.iso.org/standard/68683.html"],
  ["SOP", "Loại lỗi", "Gắn SOP với fault taxonomy để tìm đúng quy trình khi có sự cố.", "KCS Environment", "Loại lỗi nối symptom/fault ngoài hiện trường với SOP xử lý.", "https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/020"],
  ["SOP", "Security", "Kiểm soát ai được xem nội dung có rủi ro, nội bộ hoặc nhạy cảm.", "KCS governance/visibility; ISO 9001 document control", "Không phải tri thức nào cũng public cho mọi role.", "https://www.iso.org/iso/documented_information.pdf"],
  ["SOP", "Loại tài sản áp dụng", "Xác định thiết bị/tài sản nào được áp dụng SOP để tránh thao tác sai asset.", "ISO 55001", "Cùng triệu chứng nhưng asset khác có thể cần quy trình khác.", "https://committee.iso.org/sites/tc251/home/projects/published/iso-55001.html"],
  ["SOP", "Procedure steps", "SOP phải chia thành các bước tuần tự, rõ ràng và tái lập được.", "EPA SOP procedure", "SOP không có step thì chỉ là mô tả, chưa phải hướng dẫn vận hành.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["SOP", "Role phụ trách", "Xác định trách nhiệm từng bước và năng lực/role cần có.", "EPA personnel responsibilities", "Reviewer cần biết ai được phép làm bước này.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["SOP", "Hướng dẫn thao tác", "Nội dung cốt lõi để người dùng thực hiện đúng thao tác.", "EPA SOP instructions", "Đây là phần biến quy trình thành hành động cụ thể.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["SOP", "Kết quả mong đợi", "Cho biết mỗi bước đạt hay chưa để tự kiểm tra chất lượng thao tác.", "EPA QA/QC", "Expected result giúp người dùng không đi tiếp khi bước trước chưa đạt.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["SOP", "Cảnh báo trong bước", "Nhắc rủi ro tại critical step, tránh injury, damage hoặc invalid result.", "EPA safety warnings; OSHA JHA", "Cảnh báo phải nằm gần bước nguy hiểm, không chỉ gom cuối tài liệu.", "https://www.osha.gov/sites/default/files/publications/OSHA3071.pdf"],
  ["SOP", "Decision point", "Mô hình hóa điểm rẽ nhánh khi điều kiện hiện trường thay đổi.", "ISO 31000 risk treatment; EPA SOP flow", "Field operation không luôn tuyến tính; cần điều kiện để quyết định hướng xử lý.", "https://www.iso.org/standard/65694.html"],
  ["SOP", "Nếu có/Nếu không/Ngoại lệ", "Ghi rõ nhánh hành động và exception để tránh người dùng tự suy đoán.", "ISO 31000; EPA SOP clarity", "Decision point chỉ hữu ích khi đủ nhánh yes/no/exception.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["SOP", "Source Knowledge ID", "Truy vết SOP được xây dựng/cập nhật từ bài tri thức nào.", "ISO 9001 traceability; KCS linking", "Nguồn giúp chứng minh SOP không tự bịa, có căn cứ từ knowledge base.", "https://www.iso.org/iso/documented_information.pdf"],
  ["SOP", "Source Submission ID", "Truy vết từ case/submission hiện trường nào tạo ra thay đổi.", "ISO 9001 records; KCS capture", "Dùng để giải thích vì sao SOP này được tạo hoặc cập nhật.", "https://www.iso.org/iso/documented_information.pdf"],
  ["SOP", "Nguồn ngoài/evidence", "Lưu tài liệu OEM, policy, ảnh, telemetry hoặc nguồn ngoài hỗ trợ quyết định.", "EPA references; ISO 9001 evidence", "Nguồn ngoài làm SOP đáng tin và có căn cứ kỹ thuật.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["SOP", "SOP liên quan", "Liên kết quy trình phụ thuộc hoặc nội dung thay thế để tránh trùng lặp.", "KCS linking; EPA references", "Knowledge base cần network tri thức, không chỉ từng tài liệu đơn lẻ.", "https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/020"],
  ["SOP", "Mô tả thay đổi", "Ghi rõ bản mới thay đổi gì so với bản cũ.", "EPA revision/change control; ISO 9001 change records", "Reviewer và người dùng cần biết impact của version mới.", "https://www.iso.org/iso/documented_information.pdf"],
  ["SOP", "Review Date", "Đặt kỳ rà soát để SOP không lỗi thời khi thiết bị, firmware, policy thay đổi.", "EPA periodic review; ISO 30401 improvement", "SOP phải được review định kỳ, không publish rồi bỏ quên.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["SOP", "Effective Date", "Xác định ngày SOP bắt đầu có hiệu lực để kiểm soát áp dụng ngoài hiện trường.", "EPA issue/revision date; ISO 9001 control", "Effective date giúp biết case nào dùng theo bản nào.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"],
  ["SOP", "Approval checklist", "Bảo đảm SOP đã được kiểm tra đủ metadata, an toàn, procedure, nguồn và SoD trước khi publish.", "EPA review/approval; ISO 9001 approval", "Checklist làm quyết định publish có căn cứ, không phụ thuộc cảm tính.", "https://www.epa.gov/sites/default/files/2015-06/documents/g6-final.pdf"]
];

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

try {
  const existing = workbook.worksheets.getItem(sheetName);
  existing.delete();
} catch {
  // Sheet does not exist yet.
}

const sheet = workbook.worksheets.add(sheetName);
sheet.showGridLines = false;
sheet.freezePanes.freezeRows(12);

sheet.getRange("A1:F1").merge();
sheet.getRange("A1").values = [["Cơ sở dẫn chứng cho các field trong KMS"]];
sheet.getRange("A2:F2").merge();
sheet.getRange("A2").values = [["Mục tiêu: giải thích với hội đồng vì sao các form tri thức hiện trường và SOP cần các trường này trong domain vận hành chiếu sáng thông minh."]];
sheet.getRange("A4:F4").merge();
sheet.getRange("A4").values = [["Câu chốt khi bảo vệ"]];
sheet.getRange("A5:F6").merge();
sheet.getRange("A5").values = [["Bộ field không được đặt ngẫu nhiên. Tri thức hiện trường bám KCS để capture Issue - Environment - Resolution - Cause; SOP bám EPA QA/G-6 và ISO 9001 để kiểm soát version, review, approval và traceability; các field asset/safety/risk bám ISO 55001, ISO 31000 và OSHA JHA. Vì domain là field maintenance cho hệ thống chiếu sáng thông minh, dữ liệu phải đủ để tìm lại, áp dụng lại, kiểm chứng và kiểm soát rủi ro."]];

sheet.getRange("A8:C8").values = [["Nguồn chuẩn/practice", "Dùng để chứng minh phần nào", "URL"]];
sheet.getRangeByIndexes(8, 0, sources.length, 3).values = sources;

const startRow = 18;
sheet.getRange(`A${startRow}:F${startRow}`).values = [["Nhóm", "Field trong hệ thống", "Vì sao domain cần field này", "Nguồn/practice", "Câu nói khi hội đồng hỏi", "URL nguồn"]];
sheet.getRangeByIndexes(startRow, 0, fieldRows.length, 6).values = fieldRows;

const lastRow = startRow + fieldRows.length;
sheet.getRange("A1:F1").format.fill = "#003366";
sheet.getRange("A1:F1").format.font = { color: "#FFFFFF", bold: true, size: 18 };
sheet.getRange("A2:F2").format.fill = "#EAF1FB";
sheet.getRange("A2:F2").format.font = { color: "#003366", italic: true };
sheet.getRange("A4:F4").format.fill = "#1F4E79";
sheet.getRange("A4:F4").format.font = { color: "#FFFFFF", bold: true };
sheet.getRange("A5:F6").format.fill = "#F8FAFE";
sheet.getRange("A5:F6").format.font = { color: "#1F2937" };
sheet.getRange("A8:C8").format.fill = "#1F4E79";
sheet.getRange("A8:C8").format.font = { color: "#FFFFFF", bold: true };
sheet.getRange(`A${startRow}:F${startRow}`).format.fill = "#1F4E79";
sheet.getRange(`A${startRow}:F${startRow}`).format.font = { color: "#FFFFFF", bold: true };

sheet.getRange(`A9:C${8 + sources.length}`).format.fill = "#FFFFFF";
sheet.getRange(`A9:C${8 + sources.length}`).format.borders = { preset: "all", style: "thin", color: "#D9E2F3" };
sheet.getRange(`A${startRow + 1}:F${lastRow}`).format.borders = { preset: "all", style: "thin", color: "#D9E2F3" };
sheet.getRange(`A${startRow + 1}:A${lastRow}`).format.fill = "#EAF1FB";
sheet.getRange(`B${startRow + 1}:B${lastRow}`).format.fill = "#F8FAFE";

sheet.getRange(`A1:F${lastRow}`).format.wrapText = true;
sheet.getRange(`A1:F${lastRow}`).format.verticalAlignment = "top";
sheet.getRange(`A1:F${lastRow}`).format.font = { name: "Arial" };
sheet.getRange(`A1:F${lastRow}`).format.borders = { preset: "outside", style: "thin", color: "#9EADCC" };

sheet.getRange("A1:F1").format.fill = "#003366";
sheet.getRange("A1:F1").format.font = { name: "Arial", color: "#FFFFFF", bold: true, size: 18 };
sheet.getRange("A2:F2").format.fill = "#EAF1FB";
sheet.getRange("A2:F2").format.font = { name: "Arial", color: "#003366", italic: true };
sheet.getRange("A4:F4").format.fill = "#1F4E79";
sheet.getRange("A4:F4").format.font = { name: "Arial", color: "#FFFFFF", bold: true };
sheet.getRange("A8:C8").format.fill = "#1F4E79";
sheet.getRange("A8:C8").format.font = { name: "Arial", color: "#FFFFFF", bold: true };
sheet.getRange(`A${startRow}:F${startRow}`).format.fill = "#1F4E79";
sheet.getRange(`A${startRow}:F${startRow}`).format.font = { name: "Arial", color: "#FFFFFF", bold: true };

sheet.getRange("A:A").format.columnWidth = 20;
sheet.getRange("B:B").format.columnWidth = 28;
sheet.getRange("C:C").format.columnWidth = 48;
sheet.getRange("D:D").format.columnWidth = 28;
sheet.getRange("E:E").format.columnWidth = 52;
sheet.getRange("F:F").format.columnWidth = 60;
sheet.getRange("A1:F1").format.rowHeight = 30;
sheet.getRange("A2:F2").format.rowHeight = 34;
sheet.getRange("A5:F6").format.rowHeight = 54;
sheet.getRange(`A${startRow}:F${startRow}`).format.rowHeight = 28;
sheet.getRange(`A${startRow + 1}:F${lastRow}`).format.rowHeight = 58;

sheet.getRange(`A${startRow}:F${lastRow}`).format.autofitRows();

const inspect = await workbook.inspect({
  kind: "table",
  sheetId: sheetName,
  range: `A1:F${Math.min(lastRow, 28)}`,
  include: "values",
  tableMaxRows: 28,
  tableMaxCols: 6,
  tableMaxCellChars: 120
});
await fs.writeFile(`${outputDir}/inspect_after.ndjson`, inspect.ndjson, "utf8");

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan"
});
await fs.writeFile(`${outputDir}/formula_errors.ndjson`, errors.ndjson, "utf8");

const preview = await workbook.render({ sheetName, range: "A1:F30", scale: 1, format: "png" });
await fs.writeFile(`${outputDir}/preview_after.png`, new Uint8Array(await preview.arrayBuffer()));

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
await output.save(documentsPath);

console.log(JSON.stringify({ outputPath, documentsPath, sheetName, rows: fieldRows.length, sources: sources.length }));

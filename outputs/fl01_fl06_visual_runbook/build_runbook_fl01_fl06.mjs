import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = "/Users/macprocuaphat/Desktop/KMS301/Code/FE/outputs/fl01_fl06_e2e_sheet";
const outputPath = `${outDir}/KMS_FL01_FL06_Visual_Runbook_Giong_Template_Tieng_Viet.xlsx`;
const baseUrl = "http://localhost:5175";

const columns = [
  "Bước",
  "Vai trò",
  "Màn hình / route",
  "Thao tác trên giao diện",
  "Data mẫu áp dụng",
  "Kết quả cần thấy",
  "Mở nhanh",
  "Ghi chú demo"
];

function url(screen, params = {}) {
  const search = new URLSearchParams({ screen, ...params });
  return `${baseUrl}/?${search.toString()}`;
}

function row(step, role, screen, action, data, expected, quick, note = "") {
  return [step, role, screen, action, data, expected, quick, note];
}

const sheets = [
  {
    name: "00_Cách dùng",
    title: "KMS - Runbook trực quan FL-01 đến FL-06",
    subtitle: "Bản cập nhật sau FL-05 và FL-06. Dùng để demo end-to-end trên prototype FrontEnd mock data, không cần backend.",
    rows: [
      ["Mục", "Bạn cần làm gì", "Dữ liệu/vai trò cần nhớ", "Kết quả mong muốn", "Khi bị lệch thì xử lý", "Ghi chú", "", ""],
      ["Chuẩn bị", "Mở prototype và bấm Reset Demo", `${baseUrl}/`, "Dữ liệu quay về seed FL-01 đến FL-05; Admin seed reset riêng trong FL-06", "Reload trang hoặc bấm Reset Demo lần nữa", "Port hiện tại là 5175 vì 5174 đang bận", "", ""],
      ["Đổi vai trò", "Dùng dropdown vai trò trên top bar", "Field Technician, Contributor, Knowledge Manager, Quản trị viên", "Mỗi role thấy đúng menu/action demo", "Chọn lại đúng role theo từng bước", "Prototype không có login/backend", "", ""],
      ["Demo nhanh", "Đi sheet 01 đến 06 theo thứ tự", "CTN-1108, SOP-NET-007, SUB-2026-0043, SOPD-2026-0012, KR-DEMO-001, LR-2026-0011", "Đi được từ tìm kiếm, gửi tri thức, tạo SOP, bổ sung tri thức, lifecycle đến admin taxonomy", "Dùng cột Mở nhanh để nhảy route", "Phù hợp khi trình bày tổng quan", "", ""],
      ["Demo chi tiết", "Đi từng sheet FL theo đúng thứ tự bước", "Mỗi dòng có data nhập/chọn cụ thể", "Giải thích được mục tiêu, actor và expected output từng bước", "Quay lại sheet 07_Data_Demo khi cần ID", "Phù hợp khi giảng sâu từng luồng", "", ""],
      ["Reset Admin", "Vào FL-06 > Seed data", "Nhập RESET FL06", "Admin config quay về seed, role về Quản trị viên", "Nếu mất tab Admin, chọn lại role Quản trị viên", "Reset này tách khỏi Reset Demo topbar", "", ""],
      ["Checklist cuối", "Mở sheet 08_Checklist", "Tick theo từng FL", "Không bỏ sót role, data, nhánh phụ", "Bổ sung ghi chú ngay trong cột Ghi chú", "Dùng trước khi quay video/báo cáo", "", ""]
    ]
  },
  {
    name: "01_FL01",
    title: "FL-01 - Tìm kiếm và sử dụng tri thức",
    subtitle: "Kỹ thuật viên tìm tri thức/SOP, mở chi tiết, áp dụng nội dung và tạo đầu vào cho FL-02 hoặc FL-04 khi thiếu tri thức.",
    rows: [
      columns,
      row(1, "Field Technician", "Bảng điều khiển", "Bấm Reset Demo trên top bar.", "Không nhập dữ liệu.", "Sidebar tiếng Việt, role về Field Technician, dữ liệu seed sạch.", url("dashboard"), "Làm trước khi bắt đầu demo chính."),
      row(2, "Field Technician", "Cơ sở tri thức", "Bấm tab Cơ sở tri thức ở sidebar.", "Không nhập dữ liệu.", "Mở màn hình Tìm kiếm nâng cao, sidebar giữ layout cũ.", url("search"), "Đây là entry FL-01."),
      row(3, "Field Technician", "Tìm kiếm nâng cao", "Nhập từ khóa, Asset ID và filter rồi bấm Tìm kiếm.", "Từ khóa: CityTouch node offline; Asset ID: CTN-1108; Loại lỗi: Mất kết nối.", "Danh sách kết quả có SOP-NET-007 hoặc nội dung liên quan mất kết nối.", url("search-results", { query: "CityTouch node offline", assetId: "CTN-1108" }), "Nếu muốn demo synonym FL-06 sau này, dùng query Mất điện."),
      row(4, "Field Technician", "Kết quả tìm kiếm", "Bấm Mở nội dung ở thẻ SOP-NET-007.", "SOP-NET-007.", "Mở chi tiết SOP v2.1, thấy Applicability, Safety, Procedure Steps.", url("sop-detail", { id: "SOP-NET-007" }), "Giải thích đây là tri thức hiện có."),
      row(5, "Field Technician", "Chi tiết SOP", "Đọc metadata, kiểm tra khu vực áp dụng, PPE và các bước procedure.", "Asset: CTN-1108; lỗi: CONNECTIVITY_LOSS.", "Người demo hiểu SOP này phù hợp cho nhiều Smart Node mất kết nối.", url("sop-detail", { id: "SOP-NET-007" }), "Nói rõ đây là mock content, không gọi backend."),
      row(6, "Field Technician", "Chi tiết SOP", "Bấm Đánh dấu đã áp dụng, chọn outcome và nhập ghi chú.", "Outcome: Đã xử lý; Ghi chú: Áp dụng cho WO-2026-00421, reset cụm sau khi kiểm tra gateway.", "Toast ghi nhận áp dụng, panel hiển thị trạng thái đã áp dụng.", url("sop-detail", { id: "SOP-NET-007" }), "Đây là điểm nối sang FL-02."),
      row(7, "Field Technician", "Chi tiết SOP", "Bấm Ghi nhận tri thức hiện trường.", "Work order: WO-2026-00421; Asset: CTN-1108.", "Tạo draft FL-02 có pre-fill từ SOP đã áp dụng.", url("request", { tab: "field-capture" }), "Nếu không thấy nút, hãy bấm Đánh dấu đã áp dụng trước."),
      row(8, "Field Technician", "No-result FL-01", "Tìm query không có kết quả, sau đó bấm Yêu cầu bổ sung tri thức.", "Query: khong co tri thuc demo 999; resultCount: 0.", "Mở form FL-04 với snapshot query/filter từ FL-01.", url("search-results", { query: "khong co tri thuc demo 999" }), "Đây là điểm nối sang FL-04."),
      row(9, "Field Technician", "Chi tiết tri thức", "Bấm Không hữu ích hoặc Báo nội dung lỗi thời.", "Nội dung: SOP-NET-007; lý do: Nội dung lỗi thời hoặc thiếu tình huống nguồn dùng chung.", "Tạo request cải thiện nội dung hiện có trong FL-04.", url("sop-detail", { id: "SOP-NET-007" }), "Dùng khi muốn demo nhánh improvement."),
      row(10, "Quản trị viên", "FL-06 verify", "Sau khi publish synonym ở FL-06, quay lại FL-01 và tìm Mất điện.", "Query: Mất điện.", "FL-01 mở rộng query bằng synonym và trả kết quả liên quan Sụt áp/VOLTAGE_DROP.", url("search-results", { query: "Mất điện" }), "Chỉ đúng sau khi FL-06 publish synonym.")
    ]
  },
  {
    name: "02_FL02",
    title: "FL-02 - Gửi tri thức hiện trường và xét duyệt",
    subtitle: "Field Technician ghi lại case thực tế, Knowledge Manager kiểm duyệt và xuất bản tri thức hoặc tạo handoff sang SOP.",
    rows: [
      columns,
      row(1, "Field Technician", "Gửi yêu cầu > Gửi tri thức hiện trường", "Bấm tab Gửi yêu cầu, chọn tab nhỏ Gửi tri thức hiện trường.", "Không nhập dữ liệu.", "Mở entry FL-02 có Work Order gần nhất WO-2026-00421.", url("request", { tab: "field-capture" }), "Có thể đi từ nút của FL-01."),
      row(2, "Field Technician", "Field submission - context", "Bấm Ghi nhận bài học từ công việc này.", "WO-2026-00421; Asset CTN-1108; Asset type CITYTOUCH_NODE; Fault CONNECTIVITY_LOSS.", "Tạo draft submission mới, step 1 có pre-fill.", url("field-submission", { id: "SUB-2026-0042", step: "context" }), "Nếu dùng draft seed, mở SUB-2026-0042."),
      row(3, "Field Technician", "Step 1 - Bối cảnh", "Kiểm tra Asset ID, thời điểm, vị trí, loại lỗi, mức độ; bấm Tiếp tục.", "Severity: Cao; Impact: Nhiều tài sản; Safety: Không.", "Qua step 2 nếu các trường bắt buộc hợp lệ.", url("field-submission", { id: "SUB-2026-0042", step: "context" }), "Nếu lỗi validation, điền đủ field có dấu *."),
      row(4, "Field Technician", "Step 2 - Chẩn đoán", "Nhập triệu chứng, root cause, repair action, verification; chọn SOP đã dùng.", "SOP-NET-007 v2.1; bước STEP-01, STEP-02; feedback Hữu ích.", "Submission có trace tới SOP chuẩn và bước SOP liên quan.", url("field-submission", { id: "SUB-2026-0042", step: "resolution" }), "Nhấn Tìm tri thức liên quan để quay về FL-01 nếu cần."),
      row(5, "Field Technician", "Step 3 - Bằng chứng", "Thêm ảnh hiện trường giả lập, nhập bài học và đề xuất SOP.", "Lesson: Kiểm tra nguồn dùng chung trước khi reset từng node; SOP proposal: UPDATE_EXISTING SOP-NET-007.", "Có attachment mock và gap summary đủ dài.", url("field-submission", { id: "SUB-2026-0042", step: "evidence" }), "Critical/Safety cần ít nhất một ảnh."),
      row(6, "Field Technician", "Step 4 - Review", "Xem summary, tick xác nhận, bấm Gửi kiểm duyệt.", "Confirmation: checked.", "Submission chuyển sang SUBMITTED, mở success screen.", url("field-submission", { id: "SUB-2026-0042", step: "review" }), "Nếu muốn đi nhanh có thể dùng seed SUB-2026-0043."),
      row(7, "Knowledge Manager", "Hàng đợi xét duyệt", "Đổi role Knowledge Manager, mở Hàng đợi xét duyệt.", "Submission seed: SUB-2026-0043 đang SUBMITTED.", "Danh sách ưu tiên submission theo severity/safety/time.", url("review-queue"), "Role Field Technician sẽ bị Access Denied."),
      row(8, "Knowledge Manager", "Review detail", "Mở SUB-2026-0043 và bấm Bắt đầu kiểm duyệt.", "SUB-2026-0043.", "Status thành IN_REVIEW, review checklist hiện đầy đủ.", url("review-detail", { id: "SUB-2026-0043" }), "Không được tự duyệt submission của mình."),
      row(9, "Knowledge Manager", "Review detail", "Demo nhánh Yêu cầu bổ sung.", "Comment: Bổ sung ảnh hiện trường và mô tả verification sau khi đổi kênh mesh; Field: EVD-PHOTOS, RES-VERIFY.", "Submission chuyển CHANGES_REQUESTED và quay lại queue.", url("review-detail", { id: "SUB-2026-0043" }), "Dùng SUB-2026-0044 nếu muốn mở sẵn trạng thái cần bổ sung."),
      row(10, "Field Technician", "Submission của tôi", "Đổi lại Field Technician, mở submission cần bổ sung, sửa và gửi lại.", "SUB-2026-0044; thêm ảnh; verification: telemetry ổn định 15 phút.", "Status chuyển RESUBMITTED.", url("submission-detail", { id: "SUB-2026-0044" }), "Nhánh resubmit cho thấy vòng lặp review."),
      row(11, "Knowledge Manager", "Publish modal", "Mở SUB-2026-0045 hoặc submission hợp lệ, chọn Phê duyệt và xuất bản.", "Publication type: Repair Case; category: Troubleshooting; review date: +180 ngày; sopPotential: UPDATE_EXISTING.", "Tạo Published Knowledge mới và nếu có SOP potential thì tạo SOP request/task cho FL-03.", url("review-detail", { id: "SUB-2026-0045" }), "Đây là điểm nối FL-02 -> FL-03/FL-05."),
      row(12, "Knowledge Manager", "Review detail", "Demo nhánh Reject nếu nội dung không đủ giá trị tái sử dụng.", "SUB-2026-0046; reason: INSUFFICIENT_VALUE.", "Submission chuyển REJECTED, giữ audit history.", url("review-detail", { id: "SUB-2026-0046" }), "Nói rõ reject không publish tri thức.")
    ]
  },
  {
    name: "03_FL03",
    title: "FL-03 - Tạo mới hoặc cập nhật SOP",
    subtitle: "Contributor nhận SOP task, soạn/cập nhật SOP, Knowledge Manager review, yêu cầu chỉnh sửa hoặc publish version mới.",
    rows: [
      columns,
      row(1, "Contributor", "Quy trình vận hành (SOP)", "Đổi role Contributor, mở tab Quy trình vận hành (SOP).", "Không nhập dữ liệu.", "Thấy workspace SOP gồm Library, Tasks, Drafts, Review.", url("sops"), "Sidebar giữ tiếng Việt."),
      row(2, "Contributor", "SOP Tasks", "Mở task SOPTASK-2026-008.", "Task: cập nhật SOP-NET-007 từ FL-02; priority HIGH.", "Thấy source case, business reason và SOP mục tiêu.", url("sop-task-detail", { id: "SOPTASK-2026-008" }), "Task này phù hợp demo update SOP."),
      row(3, "Contributor", "SOP Editor - metadata", "Bấm bắt đầu/tạo draft, mở SOPD-2026-0012 ở step metadata.", "Draft: SOPD-2026-0012; SOP target: SOP-NET-007.", "Editor có stepper: Thông tin, Phạm vi, An toàn, Các bước, Nguồn, Xem lại.", url("sop-editor", { id: "SOPD-2026-0012", step: "metadata" }), "Draft seed giúp demo nhanh."),
      row(4, "Contributor", "SOP Editor - scope", "Chỉnh phạm vi áp dụng.", "Asset: CITYTOUCH_NODE, SMART_NODE; Fault: CONNECTIVITY_LOSS; Category: TROUBLESHOOTING.", "Metadata/Scope đủ điều kiện qua bước tiếp.", url("sop-editor", { id: "SOPD-2026-0012", step: "scope" }), "Data lấy từ taxonomy runtime."),
      row(5, "Contributor", "SOP Editor - safety", "Bổ sung PPE, điều kiện dừng và cảnh báo.", "PPE: găng cách điện, kính bảo hộ; Stop condition: phát hiện điện áp bất thường.", "Checklist an toàn rõ trước khi publish.", url("sop-editor", { id: "SOPD-2026-0012", step: "safety" }), "Nhấn mạnh safety là phần bắt buộc."),
      row(6, "Contributor", "SOP Editor - procedure", "Sửa/thêm bước kiểm tra nguồn dùng chung trước khi reset node.", "Step mới: Kiểm tra nguồn dùng chung; expected: loại trừ lỗi nguồn trước khi reset.", "SOP draft thể hiện thay đổi từ evidence FL-02.", url("sop-editor", { id: "SOPD-2026-0012", step: "procedure" }), "Có thể giải thích traceability từ SUB-2026-0043."),
      row(7, "Contributor", "SOP Editor - references", "Bổ sung source/evidence và affected steps.", "Source: SUB-2026-0043; Evidence: cable-cut-01.jpg; SOP step: STEP-02.", "Traceability đủ để KM review.", url("sop-editor", { id: "SOPD-2026-0012", step: "references" }), "Không upload file thật."),
      row(8, "Contributor", "SOP Editor - review", "Xem lại, tick confirm và bấm gửi duyệt.", "Confirmation checked.", "Draft chuyển SUBMITTED/RESUBMITTED, mở success.", url("sop-editor", { id: "SOPD-2026-0012", step: "review" }), "Dùng SOPD-2026-0015 để demo resubmitted sẵn."),
      row(9, "Knowledge Manager", "SOP Review Queue", "Đổi role Knowledge Manager, mở review queue SOP.", "Draft seed: SOPD-2026-0014 đang CHANGES_REQUESTED hoặc SOPD-2026-0015 RESUBMITTED.", "KM thấy draft cần duyệt theo trạng thái.", url("sop-review-queue"), "Admin cũng xem được, nhưng KM là role chính."),
      row(10, "Knowledge Manager", "SOP Review Detail", "Mở draft và chọn yêu cầu chỉnh sửa.", "Comment: Bổ sung điều kiện dừng và evidence ảnh; Section: An toàn/Nguồn.", "Draft chuyển CHANGES_REQUESTED và Contributor sửa lại.", url("sop-review-detail", { id: "SOPD-2026-0014" }), "Demo vòng lặp chỉnh sửa."),
      row(11, "Knowledge Manager", "SOP Review Detail", "Mở SOPD-2026-0015 và publish.", "Review decision: APPROVE; version note: bổ sung kiểm tra nguồn dùng chung.", "Tạo version SOP mới, published output xuất hiện trong thư viện/FL-01.", url("sop-review-detail", { id: "SOPD-2026-0015" }), "Đây là điểm nối FL-03 -> FL-01/FL-05."),
      row(12, "Knowledge Manager", "Version history", "Mở lịch sử phiên bản SOP-NET-007.", "SOP-NET-007.", "Thấy version timeline và có thể so sánh bản cũ/mới.", url("sop-version-history", { id: "SOP-NET-007" }), "Dùng để kết thúc FL-03.")
    ]
  },
  {
    name: "04_FL04",
    title: "FL-04 - Yêu cầu bổ sung tri thức",
    subtitle: "Tạo, phân loại, xử lý và đóng yêu cầu bổ sung tri thức; nối từ no-result/feedback FL-01 hoặc tạo trực tiếp.",
    rows: [
      columns,
      row(1, "Field Technician", "FL-01 no-result", "Tìm query không có kết quả và bấm Yêu cầu bổ sung tri thức.", "Query: khong co tri thuc demo 999; Asset: CTN-1108; Result count: 0.", "Mở form Tạo yêu cầu tri thức có pre-fill sourceContext.", url("search-results", { query: "khong co tri thuc demo 999" }), "Điểm vào chính từ FL-01."),
      row(2, "Field Technician", "Gửi yêu cầu > Tạo yêu cầu tri thức", "Hoàn thiện form và bấm gửi.", "Title: Không có tri thức xử lý mất nguồn Smart Node sau mưa; Priority: HIGH; AssetType: SMART_NODE.", "Tạo request mới status SUBMITTED, mở success.", url("request", { tab: "knowledge-request" }), "Nếu demo nhanh dùng KR-DEMO-001."),
      row(3, "Field Technician", "Yêu cầu của tôi", "Mở tab Yêu cầu của tôi.", "Requester: FT-001.", "Thấy request vừa tạo hoặc KR-DEMO-001/KR-DEMO-003.", url("my-knowledge-requests"), "Dùng để giải thích requester theo dõi trạng thái."),
      row(4, "Knowledge Manager", "Hàng đợi phân loại", "Đổi role KM, mở hàng đợi phân loại.", "KR-DEMO-001 đang ASSIGNED; KR-DEMO-003 NEEDS_INFORMATION; KR-DEMO-004 TRANSFERRED_FL03.", "KM thấy danh sách request cần triage/review.", url("knowledge-request-queue"), "FL-04 dùng trong tab Gửi yêu cầu."),
      row(5, "Knowledge Manager", "Triage detail", "Mở KR-DEMO-001, chọn hướng xử lý tạo Article.", "Deliverable: KNOWLEDGE_ARTICLE; Assignee: KC-001; Priority: HIGH.", "Request được giao Contributor, status ASSIGNED.", url("knowledge-request-triage", { id: "KR-DEMO-001" }), "Có thể chọn duplicate/resolved/transfer FL-03 tùy demo."),
      row(6, "Contributor", "Công việc biên soạn", "Đổi role Contributor, mở công việc biên soạn.", "KR-DEMO-001; Draft KRA-DEMO-001.", "Thấy task biên soạn bài viết tri thức.", url("contributor-request-queue"), "Contributor không duyệt nội dung."),
      row(7, "Contributor", "Article editor", "Mở editor, bổ sung nội dung, tag và source.", "Title: Smart Node mất nguồn sau mưa; Tags: water ingress, voltage drop; Related: SOP-NET-007.", "Draft đủ nội dung để gửi review.", url("knowledge-article-editor", { id: "KR-DEMO-001" }), "Nội dung chỉ là mock frontend."),
      row(8, "Contributor", "Article preview", "Bấm Xem preview.", "KRA-DEMO-001.", "Preview hiển thị giống bài viết tri thức chuẩn.", url("knowledge-article-preview", { id: "KR-DEMO-001" }), "Dùng để show trước khi gửi duyệt."),
      row(9, "Knowledge Manager", "Knowledge request review", "KM mở màn hình duyệt bài viết.", "KR-DEMO-001 / KRA-DEMO-001.", "Có thể approve publish hoặc request changes.", url("knowledge-request-review-detail", { id: "KR-DEMO-001" }), "KM là role duyệt chính."),
      row(10, "Knowledge Manager", "Resolved request", "Demo nhánh duplicate/resolved.", "KR-DEMO-002 duplicate với SOP-NET-007.", "Request đóng và liên kết nội dung đã có.", url("resolved-request", { id: "KR-DEMO-002" }), "Giải thích không phải request nào cũng tạo mới."),
      row(11, "Knowledge Manager", "Transfer FL-03", "Mở KR-DEMO-004 để show request đã chuyển thành SOP task.", "KR-DEMO-004; SOP task liên quan.", "Có nút mở task SOP FL-03.", url("knowledge-request-detail", { id: "KR-DEMO-004" }), "Điểm nối FL-04 -> FL-03."),
      row(12, "Field Technician", "Feedback improvement", "Từ chi tiết SOP/tri thức, bấm Không hữu ích để tạo improvement request.", "KnowledgeId: SOP-NET-007; lý do: thiếu bước kiểm tra nguồn.", "Request chứa relatedKnowledgeIds và origin IMPROVEMENT_REQUEST.", url("sop-detail", { id: "SOP-NET-007" }), "Điểm nối FL-01 -> FL-04.")
    ]
  },
  {
    name: "05_FL05",
    title: "FL-05 - Rà soát và quản lý vòng đời tri thức",
    subtitle: "Knowledge Manager rà soát nội dung đã publish, xử lý review task/issue report, tạo revision, suspend/supersede/archive và nối lại FL-03 khi cần cập nhật SOP.",
    rows: [
      columns,
      row(1, "Knowledge Manager", "Vòng đời tri thức", "Đổi role Knowledge Manager, mở tab Vòng đời tri thức.", "Không nhập dữ liệu.", "Dashboard lifecycle hiển thị Content Health, Lifecycle gần đây và Nội dung cần chú ý.", url("lifecycle-dashboard"), "Admin cũng xem được; KM là role ra quyết định."),
      row(2, "Knowledge Manager", "Lifecycle Dashboard", "Quan sát các trạng thái REVIEW_DUE, FLAGGED, PUBLISHED.", "SOP-NET-007 REVIEW_DUE; SOP-IOT-003 FLAGGED; CASE-CABLE-042 PUBLISHED.", "Người nghe hiểu lifecycle overlay làm đổi status hiển thị trong FL-01.", url("lifecycle-dashboard"), "Dữ liệu nằm trong seedLifecycleItems."),
      row(3, "Knowledge Manager", "Hàng đợi rà soát", "Bấm Mở hàng đợi rà soát.", "Review tasks: LR-2026-0011, LR-2026-0012, LR-2026-0013.", "Danh sách review task theo priority/due date.", url("lifecycle-review-queue"), "Role khác vẫn có warning hoặc bị hạn chế action."),
      row(4, "Knowledge Manager", "Review detail", "Mở LR-2026-0011 cho SOP-NET-007.", "Task: LR-2026-0011; Trigger: SCHEDULED_REVIEW; Priority HIGH.", "Mở chi tiết có checklist, history, issue report liên quan nếu có.", url("lifecycle-review-detail", { id: "LR-2026-0011" }), "Luồng scheduled review sạch nhất."),
      row(5, "Knowledge Manager", "Review detail", "Bấm Bắt đầu rà soát.", "Không nhập dữ liệu.", "Task chuyển IN_PROGRESS, startedAt được ghi mock.", url("lifecycle-review-detail", { id: "LR-2026-0011" }), "Action chỉ KM/Admin nên thực hiện."),
      row(6, "Knowledge Manager", "Decision - Reconfirm", "Chọn xác nhận lại nội dung còn đúng.", "Reason: SOP vẫn chính xác sau kiểm tra nguồn/gateway; Next review: +180 ngày.", "Lifecycle item quay về PUBLISHED, nextReviewDate cập nhật, decision/event được ghi.", url("lifecycle-review-detail", { id: "LR-2026-0011" }), "Dùng khi muốn demo happy path."),
      row(7, "Knowledge Manager", "Review detail", "Mở LR-2026-0012 cho SOP-IOT-003 để demo nội dung bị flagged.", "IssueReport: IR-2026-0075; status FLAGGED; helpful thấp.", "Thấy issue report và cảnh báo nội dung lỗi thời.", url("lifecycle-review-detail", { id: "LR-2026-0012" }), "Luồng này nối revision."),
      row(8, "Knowledge Manager", "Decision - Revise", "Tạo revision task từ review.", "Change type: MAJOR; Assignee: KC-001; Visibility bản cũ: SUSPEND_OLD; Reason: firmware cũ không còn đúng.", "Tạo RT mới hoặc dùng seed RT-2026-0031, nội dung chuyển UNDER_REVISION/SUSPENDED tùy option.", url("lifecycle-review-detail", { id: "LR-2026-0012" }), "Nếu targetFlow là FL-03 thì mở SOP editor."),
      row(9, "Contributor", "Revision task của tôi", "Đổi role Contributor, mở revision task.", "RT-2026-0031 assigned KC-001, targetFlow FL-03, knowledgeId SOP-IOT-003.", "Contributor thấy task revision và nút Mở FL-03 nếu là SOP.", url("my-revision-tasks"), "Điểm nối FL-05 -> FL-03."),
      row(10, "Contributor", "FL-03 từ revision", "Bấm Mở FL-03 từ revision task.", "Revision RT-2026-0031.", "Tạo/ mở SOP draft từ lifecycle revision với businessReason ghi review task.", url("my-revision-tasks"), "Dùng để chứng minh nối luồng, không xoá FL-03."),
      row(11, "Knowledge Manager", "Re-review", "Sau khi Contributor submit revision, KM mở re-review.", "Task RT-2026-0031; knowledge SOP-IOT-003.", "Có thể approve revision hoặc request changes.", url("lifecycle-rereview", { taskId: "RT-2026-0031" }), "Nếu task chưa IN_REVIEW, đi qua workspace trước."),
      row(12, "Knowledge Manager", "Lifecycle history", "Mở history của SOP-IOT-003 hoặc SOP-NET-007.", "KnowledgeId: SOP-IOT-003.", "Thấy review task, issue report, decisions, events theo timeline.", url("lifecycle-history", { id: "SOP-IOT-003" }), "Dùng để kết thúc FL-05 bằng audit trail."),
      row(13, "Field Technician", "Issue report từ chi tiết tri thức", "Từ SOP detail, bấm Báo nội dung lỗi thời/không an toàn.", "Issue type: OUTDATED hoặc UNSAFE; severity HIGH/CRITICAL; note >= 20 ký tự.", "Tạo Issue Report và Review Task FL-05, điều hướng tới lifecycle review detail.", url("sop-detail", { id: "SOP-IOT-003" }), "Điểm nối FL-01/field feedback -> FL-05."),
      row(14, "Administrator", "Lifecycle policy", "Mở Policy trong FL-05 hoặc FL-06 Lifecycle policy.", "SOP review days: 180; helpful threshold: 55.", "Policy mock được lưu localStorage và ảnh hưởng cách giải thích review cycle.", url("lifecycle-policy-settings"), "FL-06 có màn hình policy cấp Admin rộng hơn.")
    ]
  },
  {
    name: "06_FL06",
    title: "FL-06 - Quản trị hệ thống và phân loại tri thức",
    subtitle: "Admin Console mock quản lý role/permission, taxonomy/synonym, metadata, search config, lifecycle policy, audit và seed data; không có IAM/backend thật.",
    rows: [
      columns,
      row(1, "Quản trị viên", "Topbar role", "Chọn role Quản trị viên trên topbar.", "Role: Quản trị viên / ADMINISTRATOR.", "Sidebar hiện thêm tab Quản trị hệ thống.", url("dashboard"), "Nếu đang mô phỏng role khác, bấm Thoát mô phỏng."),
      row(2, "Quản trị viên", "Admin Dashboard", "Bấm tab Quản trị hệ thống.", "Không nhập dữ liệu.", "Mở Admin Console với metrics users, permission rules, concepts, audit events.", url("admin-dashboard"), "Direct URL chỉ render data khi role Admin."),
      row(3, "Quản trị viên", "Role simulator", "Bấm Mô phỏng role.", "Chọn Field Technician.", "App chuyển sang role Field Technician; tab Admin biến mất; topbar có nút Thoát mô phỏng.", url("admin-role-simulator"), "Đây là demo route/menu guard."),
      row(4, "Field Technician mô phỏng", "Direct admin URL", "Gõ/mở lại route admin-dashboard khi đang mô phỏng Field Technician.", "URL admin-dashboard.", "Màn hình Access Denied, không render admin data.", url("admin-dashboard"), "Chứng minh route guard kiểm tra cả direct URL."),
      row(5, "Quản trị viên", "Thoát mô phỏng", "Bấm Thoát mô phỏng trên topbar.", "Không nhập dữ liệu.", "Role quay về Quản trị viên và trở lại Admin Dashboard.", url("admin-dashboard"), "Nếu bị lạc, chọn lại role Quản trị viên."),
      row(6, "Quản trị viên", "Người dùng", "Mở tab Người dùng, xem 6 demo users.", "FT-001, FT-002, KC-001, KM-001, AD-001, MX-001.", "Thấy roleIds, department, status từng user.", url("admin-users"), "Có thể khóa/mở user để tạo audit."),
      row(7, "Quản trị viên", "User detail", "Mở chi tiết MX-001 và chỉnh role.", "MX-001 Nghê Tài Phát; roles Contributor + Knowledge Manager.", "Role preview thay đổi theo selection, audit ghi UPDATE_USER_ROLES khi lưu.", url("admin-user-detail", { id: "MX-001" }), "Dùng để giải thích multi-role."),
      row(8, "Quản trị viên", "Permission Matrix", "Mở Quyền, thử bấm Contributor / SOP / Phê duyệt.", "Role: Contributor; Resource: SOP; Action: Phê duyệt.", "Impact Preview xuất hiện và bị chặn bởi Separation of Duties.", url("admin-permissions"), "Rule: Contributor không tự approve SOP."),
      row(9, "Quản trị viên", "Taxonomy", "Mở Taxonomy, xem 4 scheme.", "DOMAIN, FAULT_TYPE, ASSET_TYPE, CONTENT_CATEGORY.", "Thấy count active/deprecated và nút mở cây/thêm concept.", url("admin-taxonomy"), "Không hard delete concept đang được dùng."),
      row(10, "Quản trị viên", "Synonym Manager", "Mở Quản lý synonym.", "Term: Mất điện; Concept chuẩn: Sụt áp - FAULT_TYPE.", "Tạo pending change, chuyển sang Impact Preview.", url("admin-synonyms"), "Case demo chính FL-06 -> FL-01."),
      row(11, "Quản trị viên", "Impact Preview", "Kiểm tra ảnh hưởng rồi bấm Confirm & publish.", "Change: Thêm synonym Mất điện; Object: FAULT_VOLTAGE_DROP.", "Publish thành công, version taxonomy tăng, audit event PUBLISH_SYNONYM được ghi.", url("admin-impact-preview", { id: "latest" }), "Nếu có duplicate/cycle/deprecated lỗi thì publish bị chặn."),
      row(12, "Quản trị viên", "Operation Result", "Bấm Verify ở FL-01.", "Query: Mất điện.", "FL-01 chạy search thật với query Mất điện và trả kết quả liên quan Sụt áp/VOLTAGE_DROP.", url("admin-operation-result", { id: "latest" }), "Nút này gọi runSearch trong React state."),
      row(13, "Quản trị viên", "Metadata / Content Types", "Mở Metadata, mở TPL-SOP hoặc Content types.", "TPL-SOP; ContentType SOP -> workflow FL-03.", "Có thể toggle required field/status và xem Impact Preview.", url("admin-metadata-templates"), "Ảnh hưởng form FL-02/FL-03/FL-04 ở mức prototype."),
      row(14, "Quản trị viên", "Search Config", "Mở Tìm kiếm, bật/tắt synonym expansion.", "synonymExpansion: true; defaultSort: RELEVANCE; minQueryLength: 2.", "Cấu hình search mock và verify query Mất điện.", url("admin-search-config"), "Đây là cấu hình dùng cho FL-01."),
      row(15, "Quản trị viên", "Lifecycle Policy", "Mở Lifecycle policy.", "SOP review days: 180; Article review days: 365; threshold: 55.", "Tạo pending change ảnh hưởng FL-05 dashboard/review task/notification.", url("admin-lifecycle-policy"), "FL-05 có policy screen hẹp hơn."),
      row(16, "Quản trị viên", "Audit Log", "Mở Audit, chọn event mới nhất.", "ADM-EVT-* hoặc seed ADM-EVT-020.", "Thấy actor, role, time, object, before/after, reason, result.", url("admin-audit-log"), "Đáp ứng AC audit detail."),
      row(17, "Quản trị viên", "Seed Data", "Mở Seed data, nhập confirm và reset.", "Confirm text: RESET FL06.", "Admin config về seed, role về Quản trị viên, audit RESET_SEED được ghi.", url("admin-demo-data"), "Reset Admin tách khỏi Reset Demo topbar.")
    ]
  },
  {
    name: "07_Data_Demo",
    title: "Data mẫu dùng khi demo FL-01 đến FL-06",
    subtitle: "Tra nhanh ID, role, trạng thái, route và nội dung nhập mẫu. Có thể copy trực tiếp vào prototype.",
    rows: [
      ["Nhóm", "ID / Giá trị", "Vai trò sử dụng", "Màn hình dùng", "Ý nghĩa", "Data nhập/chọn gợi ý", "Route mở nhanh", "Ghi chú"],
      ["Role", "FIELD_TECHNICIAN / Minh Trần", "Field Technician", "Topbar", "Tìm kiếm, áp dụng SOP, gửi tri thức hiện trường", "Query CityTouch node offline; Asset CTN-1108", url("dashboard"), "Role mặc định sau Reset Demo"],
      ["Role", "CONTRIBUTOR / Sarah Jenkins", "Contributor", "Topbar", "Biên soạn SOP/article/revision task", "Mở SOPD-2026-0012 hoặc KR-DEMO-001", url("sops"), "Không duyệt nội dung của mình"],
      ["Role", "KNOWLEDGE_MANAGER / Alex Chen", "Knowledge Manager", "Topbar", "Duyệt FL-02/03/04/05", "Mở review queue, SOP review queue, lifecycle queue", url("review-queue"), "Role chính để phê duyệt"],
      ["Role", "ADMINISTRATOR / Demo Admin", "Quản trị viên", "Topbar", "Admin Console FL-06", "Mở Quản trị hệ thống", url("admin-dashboard"), "Có quyền xem tab Admin"],
      ["FL-01", "CTN-1108", "Field Technician", "Search", "Asset ID CityTouch Node", "Asset ID: CTN-1108", url("search-results", { query: "CityTouch node offline", assetId: "CTN-1108" }), "Dùng cho happy path"],
      ["FL-01", "SOP-NET-007", "Field Technician", "SOP Detail", "SOP nhiều Smart Node mất kết nối", "Đánh dấu đã áp dụng; ghi chú WO-2026-00421", url("sop-detail", { id: "SOP-NET-007" }), "Nối sang FL-02/FL-05"],
      ["FL-02", "WO-2026-00421", "Field Technician", "Field Capture", "Work order gần nhất", "Asset CTN-1108, fault CONNECTIVITY_LOSS, severity HIGH", url("request", { tab: "field-capture" }), "Prefill submission"],
      ["FL-02", "SUB-2026-0043", "Knowledge Manager", "Review Detail", "Submission đang chờ duyệt", "Approve publish hoặc request changes", url("review-detail", { id: "SUB-2026-0043" }), "Dùng cho KM review"],
      ["FL-02", "SUB-2026-0044", "Field Technician", "Submission Detail", "Submission cần bổ sung", "Thêm ảnh, verification telemetry 15 phút", url("submission-detail", { id: "SUB-2026-0044" }), "Demo vòng lặp bổ sung"],
      ["FL-03", "SOPTASK-2026-008", "Contributor", "SOP Task Detail", "Task cập nhật SOP từ evidence", "Bắt đầu draft SOP-NET-007", url("sop-task-detail", { id: "SOPTASK-2026-008" }), "Nguồn từ FL-02"],
      ["FL-03", "SOPD-2026-0012", "Contributor", "SOP Editor", "Draft SOP update", "Thêm bước kiểm tra nguồn dùng chung", url("sop-editor", { id: "SOPD-2026-0012", step: "procedure" }), "Happy path authoring"],
      ["FL-03", "SOPD-2026-0015", "Knowledge Manager", "SOP Review Detail", "Draft resubmitted", "Approve publish version mới", url("sop-review-detail", { id: "SOPD-2026-0015" }), "Dùng demo publish"],
      ["FL-04", "KR-DEMO-001", "Contributor/KM", "Request Workflow", "Request tạo bài viết tri thức", "Assignee KC-001; Article KRA-DEMO-001", url("knowledge-request-detail", { id: "KR-DEMO-001" }), "Happy path article"],
      ["FL-04", "KR-DEMO-002", "Knowledge Manager", "Resolved Request", "Request duplicate/resolved", "Liên kết SOP-NET-007", url("resolved-request", { id: "KR-DEMO-002" }), "Demo không tạo mới"],
      ["FL-04", "KR-DEMO-004", "Knowledge Manager", "Knowledge Request Detail", "Request chuyển FL-03", "Mở SOP task từ request", url("knowledge-request-detail", { id: "KR-DEMO-004" }), "Nối FL-04 -> FL-03"],
      ["FL-05", "LR-2026-0011", "Knowledge Manager", "Lifecycle Review Detail", "Review task SOP-NET-007 đến hạn", "Decision Reconfirm", url("lifecycle-review-detail", { id: "LR-2026-0011" }), "Happy path lifecycle"],
      ["FL-05", "LR-2026-0012", "Knowledge Manager", "Lifecycle Review Detail", "Review task SOP-IOT-003 bị flagged", "Decision Revise", url("lifecycle-review-detail", { id: "LR-2026-0012" }), "Nối revision"],
      ["FL-05", "RT-2026-0031", "Contributor", "My Revision Tasks", "Revision task từ lifecycle", "Mở FL-03 nếu targetFlow FL-03", url("my-revision-tasks"), "Nối FL-05 -> FL-03"],
      ["FL-06", "Mất điện -> Sụt áp", "Quản trị viên", "Synonym Manager", "Synonym taxonomy ảnh hưởng FL-01", "Term: Mất điện; Concept: FAULT_VOLTAGE_DROP", url("admin-synonyms"), "Publish rồi verify query Mất điện"],
      ["FL-06", "Contributor / SOP / APPROVE", "Quản trị viên", "Permission Matrix", "Case bị chặn bởi SoD", "Bấm chip Phê duyệt ở Contributor + SOP", url("admin-permissions"), "Expected: INVALID Impact Preview"],
      ["FL-06", "RESET FL06", "Quản trị viên", "Demo Data", "Confirm text reset Admin seed", "Nhập đúng RESET FL06", url("admin-demo-data"), "Role quay về Quản trị viên"]
    ]
  },
  {
    name: "08_Checklist",
    title: "Checklist tổng duyệt demo FL-01 đến FL-06",
    subtitle: "Dùng để kiểm tra trước khi demo chính thức hoặc quay video.",
    rows: [
      ["FL", "Checklist cần tick", "Vai trò", "Data/route kiểm tra", "Đạt?", "Ghi chú", "", ""],
      ["FL-01", "Tìm được SOP-NET-007 bằng query CityTouch node offline + CTN-1108", "Field Technician", url("search-results", { query: "CityTouch node offline", assetId: "CTN-1108" }), "", "", "", ""],
      ["FL-01", "No-result tạo được yêu cầu bổ sung FL-04", "Field Technician", url("search-results", { query: "khong co tri thuc demo 999" }), "", "", "", ""],
      ["FL-02", "Draft field submission đi đủ 4 bước và gửi kiểm duyệt", "Field Technician", url("field-submission", { id: "SUB-2026-0042", step: "context" }), "", "", "", ""],
      ["FL-02", "KM request changes và FT resubmit được", "Knowledge Manager / Field Technician", "SUB-2026-0043 / SUB-2026-0044", "", "", "", ""],
      ["FL-03", "Contributor mở SOP task, chỉnh draft và gửi duyệt", "Contributor", "SOPTASK-2026-008 / SOPD-2026-0012", "", "", "", ""],
      ["FL-03", "KM publish SOP version và xem version history", "Knowledge Manager", url("sop-version-history", { id: "SOP-NET-007" }), "", "", "", ""],
      ["FL-04", "No-result request được triage thành article", "Field Technician / KM / Contributor", "KR-DEMO-001", "", "", "", ""],
      ["FL-04", "Duplicate/resolved và transfer FL-03 giải thích được", "Knowledge Manager", "KR-DEMO-002 / KR-DEMO-004", "", "", "", ""],
      ["FL-05", "KM mở lifecycle dashboard, review queue, review detail", "Knowledge Manager", "LR-2026-0011 / LR-2026-0012", "", "", "", ""],
      ["FL-05", "Decision Reconfirm hoặc Revise tạo event/decision đúng", "Knowledge Manager", url("lifecycle-review-detail", { id: "LR-2026-0012" }), "", "", "", ""],
      ["FL-05", "Revision task nối sang FL-03", "Contributor", "RT-2026-0031", "", "", "", ""],
      ["FL-06", "Tab Admin chỉ hiện với Quản trị viên", "Quản trị viên / Field Technician", url("admin-dashboard"), "", "", "", ""],
      ["FL-06", "Role simulator chặn direct admin URL với Field Technician", "Quản trị viên mô phỏng Field Technician", url("admin-role-simulator"), "", "", "", ""],
      ["FL-06", "Publish synonym Mất điện -> Sụt áp và verify FL-01", "Quản trị viên", url("admin-synonyms"), "", "", "", ""],
      ["FL-06", "Permission SoD chặn Contributor approve SOP", "Quản trị viên", url("admin-permissions"), "", "", "", ""],
      ["FL-06", "Audit detail có actor, role, time, object, before/after, reason, result", "Quản trị viên", url("admin-audit-log"), "", "", "", ""]
    ]
  }
];

function setValue(sheet, address, value) {
  sheet.getRange(address).values = [[value]];
}

const templateTheme = { dark: "#003366", mid: "#1F477B", light: "#D5E3FF", pale: "#EEF4FF", border: "#CBD5E1" };
const sheetThemes = {
  "00_Cách dùng": templateTheme,
  "01_FL01": templateTheme,
  "02_FL02": templateTheme,
  "03_FL03": templateTheme,
  "04_FL04": templateTheme,
  "05_FL05": templateTheme,
  "06_FL06": templateTheme,
  "07_E2E_Tổng hợp": templateTheme,
  "08_Data Demo": templateTheme,
  "09_Checklist": templateTheme
};

const roleStyles = [
  { match: "Field Technician", fill: "#E6F4EA", font: "#137333" },
  { match: "Contributor", fill: "#EFE7FF", font: "#5B4B8A" },
  { match: "Knowledge Manager", fill: "#E8F0FE", font: "#1F477B" },
  { match: "Quản trị viên", fill: "#FFF1D6", font: "#8A4F12" },
  { match: "Administrator", fill: "#FFF1D6", font: "#8A4F12" }
];

function themeFor(name) {
  return sheetThemes[name] || sheetThemes["00_Cách dùng"];
}

function escapeFormulaText(value) {
  return String(value).replace(/"/g, '""');
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
  if (typeof value === "string" && value.startsWith(baseUrl) && value !== `${baseUrl}/`) return routeFromUrl(value);
  return value;
}

function styleTitle(range, theme) {
  range.format.fill = theme.dark;
  range.format.font = { color: "#FFFFFF", bold: true, size: 20, name: "Aptos" };
  range.format.wrapText = true;
}

function styleSubtitle(range, theme) {
  range.format.fill = theme.light;
  range.format.font = { color: "#1A1C1F", bold: false, size: 11, name: "Aptos" };
  range.format.wrapText = true;
}

function styleContext(range, theme) {
  range.format.fill = theme.pale;
  range.format.font = { color: theme.dark, bold: false, size: 11, name: "Aptos" };
  range.format.wrapText = true;
}

function styleHeader(range, theme) {
  range.format.fill = theme.mid;
  range.format.font = { color: "#FFFFFF", bold: true, size: 11, name: "Aptos" };
  range.format.wrapText = true;
  range.format.horizontalAlignment = "center";
  range.format.borders = { preset: "all", style: "thin", color: theme.border };
}

function styleBody(range, theme) {
  range.format.wrapText = true;
  range.format.verticalAlignment = "top";
  range.format.font = { color: "#1A1C1F", size: 11, name: "Aptos" };
  range.format.borders = { preset: "all", style: "thin", color: theme.border };
}

function styleRoleCell(cell, value) {
  const style = roleStyles.find((item) => String(value || "").includes(item.match));
  if (!style) return;
  cell.format.font = { color: "#1A1C1F", bold: false, size: 11, name: "Aptos" };
}

function styleStepCell(cell, theme) {
  cell.format.fill = "#FFFFFF";
  cell.format.font = { color: "#111827", bold: true, size: 11, name: "Aptos" };
  cell.format.horizontalAlignment = "center";
}

function styleLinkCell(cell, theme) {
  cell.format.font = { color: theme.dark, bold: false, size: 11, name: "Aptos" };
}

function effectiveColumnCount(config) {
  return Math.max(...config.rows.map((rowValues) => {
    let last = 0;
    rowValues.forEach((value, index) => {
      if (value !== "" && value !== null && value !== undefined) last = index + 1;
    });
    return last;
  }), 1);
}

function writeRunbookSheet(workbook, config) {
  const sheet = workbook.worksheets.add(config.name);
  const theme = themeFor(config.name);
  sheet.showGridLines = false;
  const totalCols = effectiveColumnCount(config);
  sheet.getRangeByIndexes(0, 0, 1, totalCols).merge();
  sheet.getRangeByIndexes(1, 0, 1, totalCols).merge();
  sheet.getRangeByIndexes(3, 0, 1, totalCols).merge();
  setValue(sheet, "A1", config.title);
  setValue(sheet, "A2", config.subtitle);
  setValue(sheet, "A4", `Cách dùng nhanh: mở prototype tại ${baseUrl}/ → bấm Reset Demo → đi theo sheet chi tiết hoặc sheet 07_E2E_Tổng hợp.`);
  styleTitle(sheet.getRangeByIndexes(0, 0, 1, totalCols), theme);
  styleSubtitle(sheet.getRangeByIndexes(1, 0, 1, totalCols), theme);
  styleContext(sheet.getRangeByIndexes(3, 0, 1, totalCols), theme);

  const startRow = 5;
  const displayRows = config.rows.map((item) => Array.from({ length: totalCols }, (_, index) => displayValue(item[index] ?? "")));
  sheet.getRangeByIndexes(startRow, 0, displayRows.length, totalCols).values = displayRows;
  styleHeader(sheet.getRangeByIndexes(startRow, 0, 1, totalCols), theme);
  if (config.rows.length > 1) {
    styleBody(sheet.getRangeByIndexes(startRow + 1, 0, config.rows.length - 1, totalCols), theme);
  }
  sheet.freezePanes.freezeRows(startRow + 1);

  const widths = [7, 18, 23, 38, 38, 38, 30, 30];
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, Math.max(config.rows.length + startRow + 2, 8), 1).format.columnWidth = width;
  });
  sheet.getRangeByIndexes(0, 0, Math.max(config.rows.length + startRow + 2, 8), totalCols).format.rowHeight = 54;
  sheet.getRangeByIndexes(0, 0, 1, totalCols).format.rowHeight = 28;
  sheet.getRangeByIndexes(1, 0, 1, totalCols).format.rowHeight = 32;
  sheet.getRangeByIndexes(2, 0, 1, totalCols).format.rowHeight = 14;
  sheet.getRangeByIndexes(3, 0, 1, totalCols).format.rowHeight = 22;
  sheet.getRangeByIndexes(startRow, 0, 1, totalCols).format.rowHeight = 22;

  for (let rowIndex = 1; rowIndex < config.rows.length; rowIndex += 1) {
    const sourceRow = config.rows[rowIndex];
    const absoluteRow = startRow + rowIndex;
    const rowRange = sheet.getRangeByIndexes(absoluteRow, 0, 1, totalCols);
    rowRange.format.fill = "#FFFFFF";
    styleStepCell(sheet.getCell(absoluteRow, 0), theme);
    styleRoleCell(sheet.getCell(absoluteRow, 1), sourceRow[1]);
    sourceRow.forEach((value, colIndex) => {
      if (typeof value === "string" && value.startsWith(baseUrl) && value !== `${baseUrl}/`) {
        styleLinkCell(sheet.getCell(absoluteRow, colIndex), theme);
      }
    });
  }

  if (config.name === "09_Checklist") {
    const firstDataRow = startRow + 1;
    const count = Math.max(config.rows.length - 1, 1);
    sheet.getRangeByIndexes(firstDataRow, 4, count, 1).format.fill = { color: "#FFF7ED" };
    sheet.getRangeByIndexes(firstDataRow, 4, count, 1).format.borders = { preset: "all", style: "thin", color: "#FDBA74" };
  }
  return sheet;
}

const e2eSummarySheet = {
  name: "07_E2E_Tổng hợp",
  title: "E2E tổng hợp - Demo liền mạch FL-01 đến FL-06",
  subtitle: "Đi theo bảng này khi cần demo nhanh toàn bộ prototype: từ tìm kiếm tri thức, gửi case hiện trường, cập nhật SOP, yêu cầu bổ sung, lifecycle review đến admin taxonomy/audit.",
  rows: [
    ["Chặng", "Vai trò", "Màn hình", "Thao tác chính", "Data mẫu", "Kết quả nối luồng", "Mở nhanh", "Ghi chú"],
    ["Chuẩn bị", "Field Technician", "Dashboard", "Bấm Reset Demo, kiểm tra sidebar tiếng Việt.", "Role mặc định Field Technician; prototype tại http://localhost:5175/.", "Dữ liệu seed sạch để bắt đầu FL-01.", `${baseUrl}/`, "Làm trước khi quay/demo."],
    ["FL-01", "Field Technician", "Cơ sở tri thức", "Tìm tri thức bằng query + asset, mở SOP-NET-007.", "Query: CityTouch node offline; Asset: CTN-1108.", "Mở SOP phù hợp và đánh dấu đã áp dụng.", url("search-results", { query: "CityTouch node offline", assetId: "CTN-1108" }), "Entry chính của FL-01."],
    ["FL-01 → FL-02", "Field Technician", "Chi tiết SOP", "Bấm Ghi nhận tri thức hiện trường từ SOP đã áp dụng.", "SOP-NET-007; WO-2026-00421; ghi chú xử lý gateway/reset cụm.", "Form FL-02 được pre-fill từ tri thức đã dùng.", url("request", { tab: "field-capture" }), "Điểm nối đầu tiên."],
    ["FL-02", "Field Technician", "Field Submission Wizard", "Đi 4 bước Context, Resolution, Evidence, Review rồi gửi duyệt.", "SUB-2026-0042; ảnh mock; lesson: kiểm tra nguồn dùng chung.", "Submission chuyển SUBMITTED/RESUBMITTED.", url("field-submission", { id: "SUB-2026-0042", step: "context" }), "Demo theo tab 02_FL02 nếu cần chi tiết."],
    ["FL-02 → FL-03", "Knowledge Manager", "Review Detail", "Duyệt SUB-2026-0043 và publish tri thức hiện trường.", "Publication type: Repair Case; sopPotential: UPDATE_EXISTING.", "Tạo đầu vào SOP task cho Contributor.", url("review-detail", { id: "SUB-2026-0043" }), "Nối case field sang SOP."],
    ["FL-03", "Contributor", "SOP Editor", "Mở SOPTASK-2026-008, chỉnh SOPD-2026-0012, thêm bước kiểm tra nguồn dùng chung.", "SOP target: SOP-NET-007; source: SUB-2026-0043.", "Draft SOP gửi sang hàng đợi review.", url("sop-editor", { id: "SOPD-2026-0012", step: "procedure" }), "Contributor không tự approve."],
    ["FL-03", "Knowledge Manager", "SOP Review Detail", "Review SOPD-2026-0015 và publish version mới.", "Version note: bổ sung kiểm tra nguồn dùng chung.", "SOP-NET-007 có version mới, quay lại FL-01 thấy nội dung cập nhật.", url("sop-review-detail", { id: "SOPD-2026-0015" }), "Kết thúc happy path SOP."],
    ["FL-01 → FL-04", "Field Technician", "No-result Search", "Tìm query không có kết quả, bấm Yêu cầu bổ sung tri thức.", "Query: khong co tri thuc demo 999; Asset: CTN-1108.", "Form yêu cầu bổ sung có pre-fill context.", url("search-results", { query: "khong co tri thuc demo 999" }), "Demo thiếu tri thức."],
    ["FL-04", "Knowledge Manager / Contributor", "Knowledge Request Workflow", "KM triage KR-DEMO-001, Contributor soạn KRA-DEMO-001, KM approve publish.", "KR-DEMO-001; assignee KC-001; related SOP-NET-007.", "Request đóng RESOLVED/PUBLISHED, nội dung vào kho tri thức.", url("knowledge-request-triage", { id: "KR-DEMO-001" }), "Có nhánh duplicate/transfer trong tab 04_FL04."],
    ["FL-05", "Knowledge Manager", "Lifecycle Dashboard / Review Detail", "Mở dashboard vòng đời, reconfirm LR-2026-0011 hoặc revise LR-2026-0012.", "SOP-NET-007 REVIEW_DUE; SOP-IOT-003 FLAGGED; IR-2026-0075.", "Tạo decision/event hoặc revision task RT-2026-0031.", url("lifecycle-review-detail", { id: "LR-2026-0012" }), "Nối lại FL-03 khi revise SOP."],
    ["FL-06", "Quản trị viên", "Admin Console", "Mô phỏng role, kiểm tra permission SoD, tạo synonym Mất điện → Sụt áp, publish.", "Permission test: Contributor/SOP/APPROVE; synonym: FAULT_VOLTAGE_DROP.", "Audit ghi event, taxonomy version tăng.", url("admin-synonyms"), "Admin không có backend thật."],
    ["FL-06 → FL-01", "Quản trị viên / Field Technician", "Search Verify", "Sau khi publish synonym, quay lại FL-01 tìm Mất điện.", "Query: Mất điện.", "Search mở rộng bằng synonym và trả kết quả liên quan Sụt áp/VOLTAGE_DROP.", url("search-results", { query: "Mất điện" }), "Đóng vòng E2E."],
    ["Kết thúc", "Quản trị viên", "Audit Log / Seed Data", "Mở audit log, sau đó reset Admin seed nếu cần.", "Audit ADM-EVT-*; confirm text: RESET FL06.", "Có bằng chứng actor/role/time/before-after và dữ liệu sẵn sàng demo lại.", url("admin-audit-log"), "Dùng cùng tab 09_Checklist."]
  ]
};

const dataSheet = sheets.find((sheetConfig) => sheetConfig.name === "07_Data_Demo");
if (dataSheet) dataSheet.name = "08_Data Demo";

const checklistSheet = sheets.find((sheetConfig) => sheetConfig.name === "08_Checklist");
if (checklistSheet) checklistSheet.name = "09_Checklist";

for (const sheetConfig of sheets) {
  sheetConfig.rows = sheetConfig.rows.map((rowValues) => rowValues.map((value) => {
    if (typeof value !== "string") return value;
    return value
      .replaceAll("07_Data_Demo", "08_Data Demo")
      .replaceAll("08_Checklist", "09_Checklist");
  }));
}

const outputSheets = [
  ...sheets.slice(0, 7),
  e2eSummarySheet,
  ...sheets.slice(7)
];

const workbook = Workbook.create();
outputSheets.forEach((sheetConfig) => writeRunbookSheet(workbook, sheetConfig));

await fs.mkdir(outDir, { recursive: true });

const overview = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 6000,
  tableMaxRows: 4,
  tableMaxCols: 4,
  tableMaxCellChars: 80
});
console.log(overview.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan"
});
console.log(errors.ndjson);

for (const sheetConfig of outputSheets) {
  const preview = await workbook.render({ sheetName: sheetConfig.name, range: "A1:H18", scale: 1, format: "png" });
  const bytes = new Uint8Array(await preview.arrayBuffer());
  await fs.writeFile(`${outDir}/preview_${sheetConfig.name}.png`, bytes);
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`Saved ${outputPath}`);

export const fallbackData = {
  project: {
    course: "KMS301",
    name: "Knowledge Operations Cockpit",
    subtitle:
      "Không gian điều hành tri thức cho dự án: gom dữ liệu, chuẩn hóa SOP, ghi bài học kinh nghiệm và xuất báo cáo có bằng chứng.",
    semester: "Summer 2026",
    owner: "KMS301 Project Team"
  },
  metrics: [
    { label: "Độ sẵn sàng tri thức", value: "92%", trend: "tăng 8% sau chuẩn hóa SOP" },
    { label: "Quy trình đang quản trị", value: "18", trend: "4 quy trình cần review" },
    { label: "Insight có thể tái sử dụng", value: "34", trend: "7 insight mới tuần này" },
    { label: "Dòng nhật ký/bằng chứng", value: "126", trend: "đồng bộ theo thời gian thực" }
  ],
  signals: [
    { label: "Capture", value: "Live", detail: "Ghi nhận quyết định, bối cảnh, dữ liệu và minh chứng" },
    { label: "Validate", value: "Review", detail: "Kiểm tra độ tin cậy trước khi đưa vào kho tri thức" },
    { label: "Reuse", value: "Ready", detail: "Đưa SOP và lesson learned vào luồng vận hành" }
  ],
  knowledgeAreas: [
    {
      title: "Kho tri thức dự án",
      description: "Tập trung tài liệu, insight, quyết định và bằng chứng để nhóm không mất ngữ cảnh.",
      pulse: "Active"
    },
    {
      title: "Bộ máy SOP",
      description: "Biến kinh nghiệm thành quy trình có đầu vào, người phụ trách, tiêu chí hoàn thành và rủi ro.",
      pulse: "Review"
    },
    {
      title: "Vòng lặp học hỏi",
      description: "Chuyển lỗi, thay đổi và quyết định khó thành bài học có thể dùng lại ở sprint sau.",
      pulse: "Learning"
    },
    {
      title: "Báo cáo minh chứng",
      description: "Tạo nhật ký hoạt động có ngày, owner, trạng thái và proof phục vụ thuyết trình môn học.",
      pulse: "Audit"
    }
  ],
  processes: [
    {
      stage: "01",
      title: "Thu thập tri thức",
      owner: "Research Lead",
      status: "Đang chạy",
      detail: "Tổng hợp phỏng vấn, tài liệu, ảnh/video minh chứng, quyết định và ghi chú thô từ hoạt động nhóm."
    },
    {
      stage: "02",
      title: "Chuẩn hóa SOP",
      owner: "Process Owner",
      status: "Cần review",
      detail: "Chuyển tri thức thô thành quy trình dễ làm theo, có checklist, owner, output và điểm kiểm soát."
    },
    {
      stage: "03",
      title: "Kiểm chứng & chấm điểm",
      owner: "Quality Reviewer",
      status: "Ổn định",
      detail: "Đối chiếu bằng chứng, đánh giá độ tin cậy, phát hiện lỗ hổng và ghi lại phiên bản cập nhật."
    },
    {
      stage: "04",
      title: "Tái sử dụng",
      owner: "Knowledge Admin",
      status: "Sẵn sàng",
      detail: "Đưa SOP, bài học kinh nghiệm và báo cáo vào dashboard để nhóm tra cứu và dùng lại nhanh."
    }
  ],
  lessons: [
    {
      title: "Ghi lại bối cảnh ngay khi ra quyết định",
      impact: "Cao",
      source: "Sprint 02 retro",
      lesson:
        "Quyết định thường bị mất lý do sau vài ngày. Khi log có bối cảnh, giả định và bằng chứng, nhóm dễ bảo vệ lựa chọn trong báo cáo."
    },
    {
      title: "SOP phải có tiêu chí hoàn thành",
      impact: "Trung bình",
      source: "SOP review",
      lesson:
        "Một quy trình chỉ liệt kê bước làm vẫn chưa đủ. Cần nêu output cụ thể để thành viên mới biết khi nào công việc thật sự xong."
    },
    {
      title: "Bài học tốt nhất đến từ lỗi nhỏ",
      impact: "Cao",
      source: "Weekly sync",
      lesson:
        "Các lỗi nhỏ nếu được ghi sớm sẽ trở thành cảnh báo hữu ích. Nếu chờ cuối kỳ mới tổng hợp, nhóm thường chỉ còn nhớ kết quả."
    }
  ],
  reports: [
    {
      date: "2026-06-03",
      activity: "Khởi tạo knowledge cockpit",
      owner: "Product Lead",
      status: "Done",
      evidence: "FE/BE scaffold"
    },
    {
      date: "2026-06-04",
      activity: "Mapping dữ liệu từ 5 template vào mô hình hệ thống",
      owner: "Content Lead",
      status: "In progress",
      evidence: "Domain framework"
    },
    {
      date: "2026-06-05",
      activity: "Chuẩn hóa quy trình SOP nhóm",
      owner: "Process Owner",
      status: "Planned",
      evidence: "SOP flow"
    },
    {
      date: "2026-06-07",
      activity: "Tổng hợp lesson learned và proof",
      owner: "Quality Reviewer",
      status: "Planned",
      evidence: "Audit log"
    }
  ],
  media: {
    videoTitle: "Knowledge Flow Demo",
    videoUrl: "https://videos.pexels.com/video-files/3196287/3196287-uhd_2560_1440_25fps.mp4",
    posterHint: "Video đóng vai trò ambient background cho luồng capture, validate và reuse tri thức."
  }
};

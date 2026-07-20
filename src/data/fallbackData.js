export const fallbackData = {
  user: {
    name: "Alex Chen",
    role: "Quản lý vận hành",
    bureau: "Cục Chiếu sáng Đường phố LA"
  },
  kpis: [
    {
      label: "Mục đã ghi nhận",
      value: "124",
      trend: "+12%",
      detail: "Bài học mới trong tháng này",
      tone: "good"
    },
    {
      label: "Tỷ lệ tái sử dụng tri thức",
      value: "52%",
      trend: "+8%",
      detail: "Case được xử lý bằng SOP/case cũ",
      tone: "primary"
    },
    {
      label: "Đang chờ duyệt",
      value: "8",
      trend: "Nghiêm trọng",
      detail: "Đang chờ xác minh",
      tone: "warning"
    },
    {
      label: "Mức giảm MTTR",
      value: "15%",
      trend: "+4.2h",
      detail: "Cải thiện hiệu suất",
      tone: "good"
    }
  ],
  recentIncidents: [
    {
      id: "SL-8921-W",
      type: "Mất kết nối nút",
      status: "Nghiêm trọng",
      date: "24 Thg 10, 08:12",
      action: "Cần SOP"
    },
    {
      id: "SL-3345-N",
      type: "Suy giảm tế bào quang điện",
      status: "Đang xử lý",
      date: "24 Thg 10, 07:45",
      action: "Đã gán đội"
    },
    {
      id: "SL-1102-E",
      type: "Lỗi bộ điều khiển",
      status: "Đã phân công",
      date: "23 Thg 10, 21:10",
      action: "Review"
    },
    {
      id: "SL-4491-S",
      type: "Ngắt thiết bị chống sét",
      status: "Đã giải quyết",
      date: "23 Thg 10, 19:30",
      action: "Đóng case"
    }
  ],
  alerts: [
    "Cần sét đánh địa cực - Khu vực 4",
    "Không khớp phần mềm cơ sở",
    "Cảnh báo độ trễ thấp"
  ],
  knowledgeItems: [
    {
      id: "KMS-2042",
      title: "Series Circuit Fault: Open Neutral at Node 42",
      category: "Mạch nối tiếp",
      assetType: "Cơ sở hạ tầng",
      severity: "Lỗi nghiêm trọng",
      status: "Đã phê duyệt",
      symptom:
        "Toàn bộ tuyến đèn khu vực Bắc nhấp nháy, sụt áp liên tục. Đo điện áp đầu nguồn ổn định nhưng tại cột 42 chỉ đạt 50V.",
      rootCause:
        "Đứt ngầm dây trung tính do thi công công trình ngầm cắt phải, gây hiện tượng điện áp nổi.",
      repairAction:
        "Cô lập mạch, xác nhận vị trí hở trung tính bằng megohmmeter, thay đoạn cáp và cập nhật bản đồ cáp ngầm.",
      lesson:
        "Không kết luận lỗi driver LED khi nhiều cột cùng nhấp nháy; cần kiểm tra trung tính trước khi thay thiết bị.",
      updated: "12/10/2023",
      owner: "Maria Lopez"
    },
    {
      id: "KMS-1988",
      title: "Mất kết nối NEMA Socket Node",
      category: "IoT Sensor",
      assetType: "Đèn LED",
      severity: "Cảnh báo",
      status: "Đã phê duyệt",
      symptom:
        "Hệ thống báo mất tín hiệu hàng loạt từ các node khu vực trung tâm sau mưa lớn.",
      rootCause:
        "Nhiễu sóng do trạm BTS mới lắp đặt gần đó gây tần số đệm mạng Zigbee.",
      repairAction:
        "Đổi kênh mesh, reset node theo cụm 20 thiết bị và cập nhật cấu hình gateway.",
      lesson:
        "Khi mất kết nối theo cụm, ưu tiên kiểm tra nhiễu mạng và gateway trước khi thay socket.",
      updated: "05/11/2023",
      owner: "Kenji Mori"
    },
    {
      id: "KMS-1871",
      title: "Nước rò rỉ vào móng cột điện",
      category: "Cơ sở hạ tầng",
      assetType: "Cột đèn",
      severity: "Đã xử lý",
      status: "Đã phê duyệt",
      symptom:
        "Aptomat nhánh nhảy liên tục khi trời mưa lớn. Phát hiện nước đọng trong hộp nối chân cột.",
      rootCause:
        "Gioăng cao su nắp cột bị thoái hóa, kết hợp với cốt nền đường thay đổi sau sửa chữa vỉa hè.",
      repairAction:
        "Ngắt nguồn, hút nước, thay gioăng, bọc đầu nối IP68 và nâng cao cổ hộp nối.",
      lesson:
        "Với cột ở vùng ngập cục bộ, checklist cần thêm bước kiểm tra cao độ nền sau mỗi đợt thi công đô thị.",
      updated: "20/09/2023",
      owner: "Ravi Patel"
    }
  ],
  reviewQueue: [
    {
      id: "REV-771",
      title: "Smart Controller RF Signal Interference in District 7",
      category: "Hardware",
      submittedBy: "Mark Chen",
      priority: "Cao",
      age: "6 ngày trước",
      symptom:
        "Node điều khiển ngắt kết nối không ổn định, dữ liệu điện áp bị trễ 12-18 phút tại cụm đường cao tốc.",
      rootCause:
        "Nhiễu RF từ thiết bị truyền dẫn gần trạm trung chuyển làm giảm chất lượng mesh.",
      repairAction:
        "Đổi kênh truyền, tách gateway dự phòng, cập nhật nhãn vị trí để đội mạng kiểm tra định kỳ.",
      lesson:
        "Các lỗi RF cần được tag theo địa lý để phát hiện cụm nhiễu thay vì xem từng node đơn lẻ."
    },
    {
      id: "REV-772",
      title: "Thermal Management Failure on Series 4 Fixtures",
      category: "LED Array",
      submittedBy: "Sarah Jenkins",
      priority: "Trung bình",
      age: "2 ngày trước",
      symptom: "Độ sáng giảm mạnh sau 40 phút vận hành trong ngày nóng.",
      rootCause: "Keo tản nhiệt lão hóa khiến driver tự hạ công suất.",
      repairAction: "Thay pad tản nhiệt, vệ sinh khoang driver, ghi nhận lot thiết bị.",
      lesson: "Khi lỗi chỉ xuất hiện sau khi nóng, cần chạy burn-in test trước khi đóng case."
    }
  ],
  sops: [
    {
      code: "SOP-HV-2024-001",
      title: "Bảo trì máy biến áp cao thế",
      category: "An toàn",
      assetType: "Máy biến áp",
      owner: "John Doe",
      updated: "12 tháng 10, 2023",
      reviewCycle: "Hàng năm",
      status: "Đang hoạt động",
      summary:
        "Quy trình LOTO, xả tụ, kiểm tra trực quan và tái cấp điện an toàn cho máy biến áp phục vụ mạng chiếu sáng.",
      risk: "Cao",
      steps: ["Cách ly & LOTO", "Xả tụ điện", "Kiểm tra bằng mắt", "Làm sạch & bảo trì", "Tái cấp điện & kiểm tra"]
    },
    {
      code: "SOP-IOT-2024-014",
      title: "Hiệu chuẩn kết nối nút thông minh",
      category: "Kỹ thuật",
      assetType: "Smart Node",
      owner: "Nina Brown",
      updated: "02 tháng 9, 2023",
      reviewCycle: "6 tháng",
      status: "Đang hoạt động",
      summary:
        "Kiểm tra gateway, reset node, đồng bộ firmware và xác minh dữ liệu telemetry sau hiệu chuẩn.",
      risk: "Trung bình",
      steps: ["Kiểm tra gateway", "Quét node", "Đồng bộ firmware", "Xác minh telemetry"]
    },
    {
      code: "SOP-EMG-2024-006",
      title: "Quy trình ứng phó bão khẩn cấp",
      category: "Khẩn cấp",
      assetType: "Khu vực sự cố",
      owner: "Ops Center",
      updated: "18 tháng 8, 2023",
      reviewCycle: "Theo mùa",
      status: "Cần đánh giá",
      summary:
        "Ưu tiên tuyến đường chính, phân bổ xe thang, kiểm tra nguy cơ điện giật và cập nhật 311.",
      risk: "Cao",
      steps: ["Phân loại khu vực", "Cô lập điện", "Điều phối đội", "Báo cáo cộng đồng"]
    }
  ],
  activity: [
    "M. Kowalski đã cập nhật SOP Bảo vệ Chống sét",
    "Hệ thống đã lưu Tri thức #8821",
    "J. Doe đã xác minh Bài học Smart Node V2",
    "Reviewer yêu cầu bổ sung ảnh hiện trường cho REV-771"
  ]
};

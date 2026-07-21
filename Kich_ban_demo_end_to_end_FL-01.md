# Kịch Bản Demo End-to-End FL-01

## 1. Mục tiêu demo

Demo luồng FL-01: **Tìm kiếm và sử dụng tri thức** trong prototype FrontEnd KMS.

Mục tiêu cần chứng minh:

- Người dùng có thể tìm tri thức bằng từ khóa và bộ lọc.
- Hệ thống trả về kết quả phù hợp từ mock data.
- Người dùng mở chi tiết tri thức/SOP để áp dụng ngoài hiện trường.
- Người dùng ghi nhận đã áp dụng tri thức.
- Người dùng gửi feedback Helpful/Not Helpful.
- Khi không tìm thấy kết quả, hệ thống cho tạo yêu cầu bổ sung tri thức và pre-fill dữ liệu.
- Prototype có mô phỏng phân quyền theo role, dù chưa có backend/login thật.

## 2. Chuẩn bị trước khi demo

URL chạy prototype:

```text
http://localhost:5173/?screen=dashboard&v=fl01
```

Role khởi đầu:

```text
Field Technician
```

Dữ liệu dùng trong demo:

```text
Query thành công: CityTouch node offline
Query không có kết quả: quantum relay mismatch
SOP chính: SOP-NET-007
SOP restricted: SOP-HV-002
SOP outdated: SOP-IOT-003
```

Trước khi demo, bấm:

```text
Reset Demo
```

Mục đích: đưa recent searches, feedback, application state và request draft về trạng thái sạch.

## 3. Persona demo

Người dùng chính:

```text
Field Technician
```

Bối cảnh:

```text
Kỹ thuật viên đang xử lý sự cố nhiều Smart Node/CityTouch Node bị mất kết nối tại hiện trường. Người dùng cần tìm nhanh SOP hoặc repair case đã được kiểm chứng để xử lý đúng quy trình.
```

Role phụ để demo phân quyền:

```text
Knowledge Manager
```

Mục đích:

```text
Chứng minh prototype có mô phỏng quyền xem nội dung restricted.
```

## 4. Luồng chính: Tìm kiếm, mở tri thức, áp dụng và feedback

### Bước 1: Vào màn hình tìm kiếm tri thức

Thao tác trên giao diện:

1. Mở trang Dashboard.
2. Đảm bảo role trên topbar là `Field Technician`.
3. Ở sidebar bên trái, bấm tab `Cơ sở tri thức`.

Kết quả mong đợi:

```text
Hệ thống chuyển sang màn hình Tìm kiếm nâng cao.
Sidebar vẫn giữ tiếng Việt và bố cục giống Dashboard.
```

Lời thoại gợi ý:

```text
Ở FL-01, Field Technician bắt đầu bằng việc vào Cơ sở tri thức để tìm SOP, repair case hoặc bài học liên quan đến sự cố đang gặp.
```

### Bước 2: Nhập query tìm kiếm

Thao tác trên giao diện:

1. Tại ô tìm kiếm, nhập:

```text
CityTouch node offline
```

2. Giữ trạng thái mặc định là `Published`.
3. Có thể chọn thêm filter nếu muốn demo rõ hơn:

```text
Loại nội dung: SOP
Thiết bị: CityTouch Node hoặc Smart Node
Loại lỗi: Mất kết nối
```

4. Bấm nút `Tìm kiếm`.

Kết quả mong đợi:

```text
Hệ thống chuyển sang màn hình Kết quả tìm kiếm.
URL có screen=search-results và query đã nhập.
```

Lời thoại gợi ý:

```text
Prototype hiện dùng mock data và search logic phía FrontEnd. Query tiếng Anh như CityTouch node offline vẫn map được về nội dung tiếng Việt nhờ bộ keyword/synonym mô phỏng.
```

### Bước 3: Đọc danh sách kết quả

Thao tác trên giao diện:

1. Quan sát danh sách kết quả.
2. Tìm card có nội dung:

```text
SOP-NET-007
Chẩn đoán nhiều Smart Node mất kết nối đồng thời
```

3. Kiểm tra các metadata trên card:

```text
Loại nội dung: SOP
Trạng thái: Published
Thiết bị/liên quan: CityTouch Node, Smart Node
Loại lỗi: Mất kết nối
```

Kết quả mong đợi:

```text
Kết quả phù hợp xuất hiện ở danh sách.
Người dùng thấy được thông tin đủ để đánh giá nhanh nội dung có liên quan hay không.
```

Lời thoại gợi ý:

```text
Ở bước này, người dùng không cần mở từng tài liệu ngẫu nhiên. Card kết quả đã hiển thị loại tri thức, trạng thái, độ liên quan và thông tin chính để chọn đúng nội dung.
```

### Bước 4: Mở chi tiết tri thức/SOP

Thao tác trên giao diện:

1. Trên card `SOP-NET-007`, bấm `Mở nội dung`.

Kết quả mong đợi:

```text
Hệ thống mở màn hình chi tiết SOP.
Nội dung chi tiết không bị đổi sidebar sang tiếng Anh.
```

Các phần cần chỉ ra khi trình bày:

```text
Triệu chứng
Nguyên nhân gốc
Điều kiện áp dụng
Các bước xử lý
Cảnh báo an toàn
Nội dung liên quan
```

Lời thoại gợi ý:

```text
Sau khi chọn kết quả, Field Technician xem chi tiết SOP để biết khi nào được áp dụng, cần kiểm tra điều kiện gì, và thao tác theo checklist nào.
```

### Bước 5: Áp dụng tri thức

Thao tác trên giao diện:

1. Ở panel hành động bên phải, bấm `Mark as Applied`.
2. Trong modal, giữ outcome mặc định:

```text
RESOLVED_FULLY
```

3. Nhập ghi chú:

```text
Áp dụng thành công cho cụm node mất kết nối sau mưa lớn.
```

4. Bấm `Confirm Apply`.

Kết quả mong đợi:

```text
Modal đóng lại.
Panel hành động hiển thị: Đã áp dụng: RESOLVED_FULLY
```

Lời thoại gợi ý:

```text
Khi kỹ thuật viên áp dụng SOP ngoài hiện trường, prototype cho ghi nhận kết quả áp dụng. Trong bản thật, sự kiện này có thể được backend dùng để tính reuse rate và hiệu quả tri thức.
```

### Bước 6: Gửi feedback

Thao tác trên giao diện:

1. Bấm `Helpful`.

Kết quả mong đợi:

```text
Nút Helpful chuyển sang trạng thái active.
Hệ thống ghi nhận feedback vào localStorage của prototype.
```

Lời thoại gợi ý:

```text
Feedback giúp Knowledge Manager biết nội dung nào thực sự hữu ích ở hiện trường, từ đó ưu tiên duy trì hoặc cải thiện tri thức.
```

Kết thúc luồng chính:

```text
Người dùng đã hoàn thành FL-01 end-to-end: tìm kiếm, đánh giá kết quả, mở chi tiết, áp dụng SOP và gửi feedback.
```

## 5. Luồng phụ 1: Không tìm thấy kết quả và tạo yêu cầu bổ sung tri thức

### Bước 1: Thực hiện search không có kết quả

Thao tác trên giao diện:

1. Từ sidebar, bấm `Cơ sở tri thức`.
2. Nhập query:

```text
quantum relay mismatch
```

3. Bấm `Tìm kiếm`.

Kết quả mong đợi:

```text
Hệ thống hiển thị trạng thái Không tìm thấy kết quả phù hợp.
```

Lời thoại gợi ý:

```text
Nếu hệ thống chưa có tri thức phù hợp, FL-01 không dừng ở màn hình rỗng mà dẫn người dùng sang bước tạo yêu cầu bổ sung tri thức.
```

### Bước 2: Tạo yêu cầu bổ sung tri thức

Thao tác trên giao diện:

1. Bấm `Yêu cầu bổ sung tri thức`.

Kết quả mong đợi:

```text
Hệ thống chuyển sang màn hình Gửi yêu cầu bổ sung tri thức.
Form được pre-fill từ query/filter vừa tìm.
Tiêu đề mặc định: Yêu cầu tri thức cho: quantum relay mismatch
```

2. Bấm `Gửi yêu cầu`.

Kết quả mong đợi:

```text
Prototype ghi nhận yêu cầu bổ sung tri thức ở localStorage/mock state.
```

Lời thoại gợi ý:

```text
Luồng này giúp biến khoảng trống tri thức thành request có cấu trúc, để Knowledge Manager có thể review và bổ sung sau.
```

## 6. Luồng phụ 2: Kiểm tra phân quyền xem nội dung restricted

### Bước 1: Field Technician mở nội dung restricted

Thao tác trên giao diện:

1. Trên topbar, chọn role:

```text
Field Technician
```

2. Mở nội dung restricted:

```text
SOP-HV-002 - Bảo trì máy biến áp cao thế
```

Có thể mở bằng URL demo:

```text
http://localhost:5173/?screen=sop-detail&id=SOP-HV-002
```

Kết quả mong đợi:

```text
Hệ thống hiển thị Access Denied.
Không hiển thị nội dung chi tiết của SOP restricted.
```

Lời thoại gợi ý:

```text
Dù prototype chưa có backend và login thật, phần UI đã mô phỏng rule visibility theo role để thể hiện ý tưởng phân quyền.
```

### Bước 2: Knowledge Manager mở cùng nội dung

Thao tác trên giao diện:

1. Trên topbar, đổi role sang:

```text
Knowledge Manager
```

2. Mở lại:

```text
SOP-HV-002
```

Kết quả mong đợi:

```text
Hệ thống hiển thị chi tiết SOP restricted.
```

Lời thoại gợi ý:

```text
Knowledge Manager có quyền xem nội dung restricted để quản lý, rà soát hoặc cập nhật tri thức.
```

## 7. Luồng phụ 3: Nội dung outdated hoặc superseded

### Bước 1: Mở nội dung outdated

Thao tác trên giao diện:

1. Mở nội dung:

```text
SOP-IOT-003
```

Kết quả mong đợi:

```text
Hệ thống hiển thị banner cảnh báo nội dung quá hạn review hoặc outdated.
```

2. Nếu có nút `View replacement`, bấm để chuyển sang nội dung thay thế.

Lời thoại gợi ý:

```text
FL-01 không chỉ tìm được tri thức, mà còn cảnh báo nếu nội dung đã cũ để tránh kỹ thuật viên áp dụng nhầm quy trình không còn phù hợp.
```

### Bước 2: Mở nội dung superseded

Thao tác trên giao diện:

1. Mở nội dung:

```text
SOP-NET-005
```

2. Bấm `View Current Version`.

Kết quả mong đợi:

```text
Hệ thống chuyển sang phiên bản hiện hành, ví dụ SOP-NET-007.
```

Lời thoại gợi ý:

```text
Nội dung bị thay thế vẫn có thể tồn tại để tham chiếu, nhưng hệ thống hướng người dùng sang bản hiện hành.
```

## 8. Checklist nghiệm thu FL-01 khi demo

Khi demo xong, cần tick được các ý sau:

- [ ] Sidebar giữ tiếng Việt và không đổi layout khi chuyển màn hình.
- [ ] Tab `Cơ sở tri thức` mở đúng màn hình search FL-01.
- [ ] Search query `CityTouch node offline` trả về kết quả phù hợp.
- [ ] Kết quả có thể mở sang màn hình detail.
- [ ] Detail hiển thị nội dung đủ để áp dụng tri thức.
- [ ] `Mark as Applied` mở modal và lưu trạng thái áp dụng.
- [ ] `Helpful` hoặc `Not Helpful` ghi nhận feedback.
- [ ] Query không có kết quả dẫn sang `Gửi yêu cầu`.
- [ ] Form gửi yêu cầu được pre-fill từ query/filter.
- [ ] Role `Field Technician` bị chặn khi xem nội dung restricted.
- [ ] Role `Knowledge Manager` xem được nội dung restricted.
- [ ] Outdated/Superseded content có cảnh báo và link sang bản thay thế/hiện hành.

## 9. Gợi ý thứ tự demo ngắn nhất

Nếu thời gian trình bày ngắn, dùng thứ tự sau:

1. `Dashboard` -> `Cơ sở tri thức`.
2. Search `CityTouch node offline`.
3. Mở `SOP-NET-007`.
4. Bấm `Mark as Applied` -> `Confirm Apply`.
5. Bấm `Helpful`.
6. Search `quantum relay mismatch`.
7. Bấm `Yêu cầu bổ sung tri thức`.
8. Demo role restricted với `SOP-HV-002`.

Thứ tự này đủ để chứng minh toàn bộ FL-01 theo hướng end-to-end trong prototype.


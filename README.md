# Ôn tập trắc nghiệm FE (PRM393 & ITE302c)

Ứng dụng luyện đề trắc nghiệm đa môn viết bằng **React + Vite**, tối ưu để deploy tĩnh lên **Vercel** — vào chọn môn và làm bài ngay không cần đăng nhập, tự động lưu tiến độ và bộ nhớ đệm trực tiếp trên trình duyệt của từng người dùng.

---

## 1. Môn học hiện có

- **PRM393**: 5 bộ đề FE SP26 & SU26 (248 câu hỏi gốc, 158 câu đã lọc trùng), kèm ảnh chụp đề gốc, giải thích chi tiết và tab **Lý thuyết 13 chương (Flutter & Dart)**.
- **ITE302c**: 11 bộ đề FE & RE từ SP24 đến SU26 (660 câu hỏi gốc, 367 câu đã lọc trùng), tự động sắp xếp theo trình tự kỳ học FPT, kèm ảnh chụp đề gốc, giải thích chi tiết và tab **Lý thuyết 10 chương (Ethics in IT)**.

---

## 2. Tính năng chính

- **Landing page tối giản**: chọn môn học trực tiếp qua thẻ mã môn (`PRM393`, `ITE302c`).
- **Tự lưu tiến độ theo từng môn trên máy người dùng**: mọi câu đã làm và cài đặt hiển thị được lưu tự động trong `localStorage`, đồng bộ khi mở nhiều tab.
- **Bộ nhớ đệm cục bộ**: kết hợp HTTP `Cache-Control` (Vercel CDN) và Service Worker (`public/sw.js`) giúp cache đề thi, tài liệu và ảnh đề gốc ngay trên máy người dùng.

---

## 3. Cấu trúc thư mục

```text
├── index.html                           # Trang gốc Vite
├── package.json                         # Khai báo React, Vite và scripts
├── vite.config.js                       # Cấu hình Vite
├── vercel.json                          # Cấu hình deploy & Cache-Control cho Vercel
├── .vercelignore                        # Loại trừ file cục bộ khi deploy
├── public/
│   ├── sw.js                            # Service Worker cache dữ liệu & ảnh đề gốc
│   ├── data/
│   │   ├── questions.json               # Ngân hàng đề PRM393 (5 bộ đề)
│   │   ├── ite302c-questions.json       # Ngân hàng đề ITE302c (11 bộ đề)
│   │   ├── TAI_LIEU_ON_TAP_PRM393.md    # Tài liệu ôn tập PRM393 (13 chương)
│   │   └── TAI_LIEU_ON_TAP_ITE302C.md   # Tài liệu ôn tập ITE302c (10 chương)
│   └── images/                          # Ảnh chụp đề gốc PRM393 & ITE302c
└── src/
    ├── main.jsx                         # Điểm khởi chạy React & đăng ký Service Worker
    ├── App.jsx                          # Điều hướng chọn môn & không gian luyện đề
    ├── styles.css                       # Giao diện tối giản Sáng / Tối
    ├── components/
    │   ├── LandingPage.jsx              # Trang chọn môn tối giản dạng card mã môn
    │   ├── QuestionCard.jsx             # Thẻ câu hỏi, chấm điểm & xem ảnh đề gốc
    │   └── StudyGuide.jsx               # Trình đọc tài liệu lý thuyết
    └── lib/
        ├── subjects.js                  # Cấu hình danh sách môn học
        ├── quiz.js                      # Xử lý ngân hàng đề, lọc trùng, chấm điểm
        └── storage.js                   # Lưu tiến độ & cài đặt theo từng môn
```

---

## 4. Chạy local & Deploy lên Vercel

```powershell
# Cài đặt thư viện
npm install

# Chạy local (http://localhost:5173)
npm run dev

# Build bản production vào thư mục dist/
npm run build

# Deploy bằng Vercel CLI (hoặc push GitHub để Vercel tự deploy)
vercel --prod
```

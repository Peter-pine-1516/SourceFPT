# PRM393 FE Quiz & Tài Liệu Ôn Tập Toàn Diện

Đọc tài liệu lý thuyết PRM393 tại [TAI_LIEU_ON_TAP_PRM393.md](./public/data/TAI_LIEU_ON_TAP_PRM393.md) hoặc xem trực tiếp trên tab **Lý thuyết** của ứng dụng.

Ứng dụng luyện đề trắc nghiệm **PRM393 (Flutter & Dart)** viết bằng **React + Vite**, tối ưu để deploy tĩnh lên **Vercel** — vào học và làm bài ngay không cần đăng nhập, tự động lưu tiến độ và bộ nhớ đệm trực tiếp trên trình duyệt của từng người dùng.

---

## 1. Tính năng chính

- **5 bộ đề FE SP26 & SU26** (248 câu hỏi gốc, 158 câu đã lọc trùng) kèm ảnh chụp đề gốc và giải thích chi tiết.
- **Tab Lý thuyết 12 chương** có mục lục nhanh và tìm kiếm theo từ khoá.
- **Tự lưu tiến độ trên máy từng người dùng**: mọi câu đã làm và cài đặt hiển thị được lưu tự động trong `localStorage`, đồng bộ khi mở nhiều tab.
- **Sao lưu & Khôi phục tiến độ**: hỗ trợ xuất/nhập tiến độ dưới dạng file `.json` khi cần chuyển thiết bị hoặc trình duyệt.
- **Bộ nhớ đệm cục bộ**: kết hợp HTTP `Cache-Control` (Vercel CDN) và Service Worker (`public/sw.js`) giúp cache đề thi, tài liệu và 300 ảnh đề gốc ngay trên máy người dùng.

---

## 2. Cấu trúc thư mục

```text
PRM393/
├── index.html                           # Trang gốc Vite
├── package.json                         # Khai báo React, Vite và scripts
├── vite.config.js                       # Cấu hình Vite
├── vercel.json                          # Cấu hình deploy & Cache-Control cho Vercel
├── .vercelignore                        # Loại trừ file cục bộ khi deploy
├── public/
│   ├── sw.js                            # Service Worker cache dữ liệu & ảnh đề gốc
│   ├── data/
│   │   ├── questions.json               # Ngân hàng 248 câu hỏi (5 bộ đề)
│   │   └── TAI_LIEU_ON_TAP_PRM393.md    # Tài liệu ôn tập 12 chương
│   └── images/                          # 5 thư mục chứa 300 ảnh chụp đề gốc
│       ├── PRM393 - SP26 - B5 - FE/
│       ├── PRM393 - SP26 - FE/
│       ├── PRM393 - SU26 - B5 - FE/
│       ├── PRM393 - SU26 - FE/
│       └── PRM393 - SU26 - FE - RE/
└── src/
    ├── main.jsx                         # Điểm khởi chạy React & đăng ký Service Worker
    ├── App.jsx                          # Giao diện chính, bộ lọc, phím tắt & đồng bộ tab
    ├── styles.css                       # Giao diện tối giản Sáng / Tối
    ├── components/
    │   ├── QuestionCard.jsx             # Thẻ câu hỏi, chấm điểm & xem ảnh đề gốc
    │   └── StudyGuide.jsx               # Trình đọc tài liệu lý thuyết
    └── lib/
        ├── quiz.js                      # Xử lý ngân hàng đề, lọc trùng, chấm điểm
        └── storage.js                   # Lưu tiến độ & cài đặt trong localStorage
```

---

## 3. Chạy local & Deploy lên Vercel

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

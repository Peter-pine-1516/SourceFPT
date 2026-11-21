# PRM393 FE Quiz & Tài Liệu Ôn Tập Toàn Diện

Đọc tài liệu lý thuyết PRM393 tại [TAI_LIEU_ON_TAP_PRM393.md](./public/data/TAI_LIEU_ON_TAP_PRM393.md) hoặc xem trực tiếp trên tab **Lý thuyết** của ứng dụng.

Ứng dụng luyện đề trắc nghiệm **PRM393 (Flutter & Dart)** viết bằng **React + Vite**, tối ưu để deploy tĩnh lên **Vercel**, xử lý đăng nhập/đăng ký cơ bản và lưu bộ nhớ đệm hoàn toàn trên máy tính của từng người dùng.

---

## 1. Tính năng chính

- **5 bộ đề FE SP26 & SU26** (248 câu hỏi gốc, 158 câu đã lọc trùng) kèm ảnh chụp đề gốc và giải thích chi tiết.
- **Tab Lý thuyết 12 chương** có mục lục nhanh và tìm kiếm theo từ khoá.
- **Đăng nhập / Đăng ký cục bộ**: mỗi tài khoản lưu riêng tiến độ làm bài và cấu hình giao diện trong `localStorage` của trình duyệt (mật khẩu băm SHA-256).
- **Sao lưu & Khôi phục tiến độ**: hỗ trợ xuất/nhập tiến độ dưới dạng file `.json`.
- **Bộ nhớ đệm trên thiết bị người dùng**: kết hợp HTTP `Cache-Control` (Vercel CDN) và Service Worker (`public/sw.js`) giúp cache đề thi, tài liệu và 300 ảnh đề gốc ngay trên trình duyệt.

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
    │   ├── AuthView.jsx                 # Form đăng nhập / đăng ký cục bộ
    │   ├── QuestionCard.jsx             # Thẻ câu hỏi, chấm điểm & xem ảnh đề gốc
    │   └── StudyGuide.jsx               # Trình đọc tài liệu lý thuyết
    └── lib/
        ├── quiz.js                      # Xử lý ngân hàng đề, lọc trùng, chấm điểm
        └── storage.js                   # Quản lý tài khoản & tiến độ trong localStorage
```

---

## 3. Chạy local

```powershell
# Cài đặt thư viện
npm install

# Khởi chạy môi trường phát triển (http://localhost:5173)
npm run dev

# Build bản production vào thư mục dist/
npm run build

# Xem thử bản build production
npm run preview
```

---

## 4. Deploy lên Vercel

### Cách 1: Kết nối GitHub (Khuyên dùng)
1. Push mã nguồn lên GitHub.
2. Vào [vercel.com/new](https://vercel.com/new), chọn repository và bấm **Deploy**.
3. Vercel tự nhận diện framework **Vite** và áp dụng cấu hình từ `vercel.json`.

### Cách 2: Vercel CLI
```powershell
npm install -g vercel
vercel login
vercel --prod
```

# PRM393 FE Quiz & Tài Liệu Ôn Tập Toàn Diện

👉 **ĐỌC LÝ THUYẾT PRM393 TRƯỚC KHI LÀM ĐỀ TẠI ĐÂY:** **[TAI_LIEU_ON_TAP_PRM393.md](./TAI_LIEU_ON_TAP_PRM393.md)** *(hoặc bấm ngay tab **📖 Lý thuyết** đầu tiên trên giao diện Web App `http://127.0.0.1:3000`)*.

Ứng dụng luyện đề trắc nghiệm **PRM393 (Flutter & Dart)** giao diện tối giản (kèm đủ 5 bộ đề `SP26` & `SU26` đã kiểm chứng 100%).

---

## 1. Cách chạy ứng dụng

### Cách nhanh nhất (Windows)
Double-click vào file `run.bat` — ứng dụng sẽ tự chạy `cargo run` và mở trình duyệt tại `http://127.0.0.1:3000`.

### Các lệnh Cargo cơ bản (nên gõ trong Terminal để quen tay với Rust)
```powershell
# 1. Kiểm tra cú pháp & kiểu dữ liệu cực nhanh (không sinh file .exe)
cargo check

# 2. Chạy bộ kiểm thử tự động (kiểm tra đủ 248 câu hỏi, 158 câu lọc trùng & toàn bộ file ảnh gốc)
cargo test

# 3. Biên dịch & khởi chạy Web Server tại http://127.0.0.1:3000
cargo run

# 4. (Tuỳ chọn) Để trình gợi ý Clippy rà soát code chuẩn phong cách Rust (idiomatic Rust)
cargo clippy
```

---

## 2. Cấu trúc thư mục chuẩn Cargo

```text
PRM393/
├── Cargo.toml                  # Khai báo tên package và các thư viện (crates): axum, tokio, serde...
├── run.bat                     # Script khởi chạy nhanh trên Windows
├── data/
│   ├── questions.json          # 248 câu hỏi đã kiểm chứng từ 300 ảnh gốc của 5 bộ đề
│   └── progress.json           # Tự động sinh ra khi làm bài để lưu kết quả đúng/sai
├── static/                     # Giao diện Web tối giản (gọi REST API tới Backend Rust)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/                        # Toàn bộ mã nguồn ngôn ngữ Rust (.rs)
│   ├── main.rs                 # Điểm vào chương trình (Entry point), cấu hình Router & mở cổng 3000
│   ├── models.rs               # Khai báo Struct, Option<T>, BTreeMap & ánh xạ JSON bằng Serde
│   ├── error.rs                # Định nghĩa Enum lỗi riêng (AppError) & chuyển thành HTTP status
│   ├── store.rs                # Logic nghiệp vụ: nạp đề, lọc trùng, chấm đúng/sai, lưu file & Unit Tests
│   └── handlers.rs             # Các hàm async nhận HTTP Request và trả JSON/ảnh về trình duyệt
└── PRM393 - ... (5 thư mục ảnh gốc phục vụ nút "Xem ảnh đề gốc")
```

---

## 3. Lộ trình đọc code để học Rust nhanh nhất

1. **`src/models.rs` — Làm quen kiểu dữ liệu trong Rust**
   - Học cách khai báo `struct` với trường `pub`.
   - Hiểu vì sao Rust **không có `null`** mà dùng `Option<String>` (`Some(...)` hoặc `None`).
   - Hiểu macro `#[derive(Debug, Clone, Serialize, Deserialize)]` tự động sinh code chuyển đổi JSON.
2. **`src/error.rs` — Xử lý lỗi không dùng `try/catch`**
   - Học `enum AppError` (Enum trong Rust mang theo được dữ liệu bên trong như `NotFound(String)`).
   - Học cách `match` (Pattern Matching) yêu cầu xử lý vét cạn mọi trường hợp lỗi.
3. **`src/store.rs` — Trái tim của Rust: Ownership, Borrowing & Concurrency**
   - Phân biệt `String` (sở hữu vùng nhớ) và `&str` (mượn tham chiếu chỉ đọc, không tốn chi phí copy).
   - Hiểu `RwLock<ProgressData>` giúp nhiều request đọc điểm cùng lúc và khoá an toàn khi ghi file.
   - Đọc phần `#[cfg(test)] mod tests` ở cuối file để thấy cách viết Unit Test ngay trong cùng file `.rs`.
4. **`src/handlers.rs` & `src/main.rs` — Lập trình bất đồng bộ (`async/await`)**
   - Học `Arc<AppStore>` để chia sẻ state giữa các luồng của Tokio runtime.
   - Học toán tử `?` giúp truyền lỗi ngắn gọn thay vì viết nhiều tầng `if/else`.

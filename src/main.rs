//! Điểm khởi chạy chính (`main.rs`) của ứng dụng Rust PRM393 Quiz.
//!
//! Lộ trình đọc code gợi ý cho cậu khi mới học Rust:
//! 1. `src/models.rs`   -> Cách khai báo `struct`, `Option<T>`, `Vec<T>` và parse JSON với `Serde`.
//! 2. `src/error.rs`    -> Cách xử lý lỗi bằng `enum` + `Result<T, E>` thay cho `try/catch`.
//! 3. `src/store.rs`    -> Cách quản lý bộ nhớ (Ownership, Borrowing, `RwLock`, `HashMap`) & viết Unit Test.
//! 4. `src/handlers.rs` -> Cách viết REST API bất đồng bộ (`async/await`) với `Axum`.
//! 5. `src/main.rs`     -> Cách ghép các module lại và chạy HTTP Web Server.

mod error;
mod handlers;
mod models;
mod store;

use axum::{
    routing::{get, post},
    Router,
};
use std::{env, path::PathBuf, sync::Arc};
use store::AppStore;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    // Xác định thư mục gốc chứa `data/` và `static/`
    let base_dir = env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

    // Nạp ngân hàng 248 câu hỏi (5 bộ đề) + khôi phục tiến độ làm bài
    let store = match AppStore::load(&base_dir) {
        Ok(s) => Arc::new(s),
        Err(err) => {
            eprintln!("❌ Lỗi khởi tạo dữ liệu: {}", err);
            std::process::exit(1);
        }
    };

    // Khởi tạo Router kết nối các API endpoints và thư mục giao diện `static/`
    let static_dir = base_dir.join("static");
    let app = Router::new()
        .route("/api/exams", get(handlers::list_exams))
        .route("/api/exams/:exam_id", get(handlers::get_exam_detail))
        .route("/api/check", post(handlers::check_answer))
        .route("/api/reset-question", post(handlers::reset_question))
        .route("/api/reset-exam", post(handlers::reset_exam))
        .route("/api/image/:uid", get(handlers::serve_question_image))
        .fallback_service(ServeDir::new(static_dir))
        .with_state(store);

    let addr = "127.0.0.1:3000";
    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(l) => l,
        Err(_) => {
            eprintln!("⚠️ Cổng {} đang được sử dụng (có thể server đã bật sẵn rồi).", addr);
            eprintln!("👉 Cậu mở thẳng http://{} trên trình duyệt nhé!", addr);
            std::process::exit(1);
        }
    };

    println!("========================================================");
    println!("🦀 PRM393 Quiz Server (Rust + Axum) đang chạy tại:");
    println!("👉 http://{}", addr);
    println!("Nhấn Ctrl + C để dừng server.");
    println!("========================================================");

    axum::serve(listener, app)
        .await
        .expect("Lỗi khi vận hành HTTP server");
}

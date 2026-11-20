//! Module `error.rs`: Minh hoạ cách định nghĩa kiểu lỗi riêng (`enum AppError`)
//! và chuyển đổi lỗi thành HTTP Response bằng cách cài đặt (implement) trait `IntoResponse`.

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;

/// Trong Rust không có `try/catch` hay `Exception` như Java/Dart.
/// Thay vào đó, hàm có thể thất bại sẽ trả về `Result<T, AppError>`.
#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    BadRequest(String),
    Internal(String),
}

#[derive(Serialize)]
struct ErrorBody {
    error: String,
}

/// Cài đặt trait `IntoResponse` giúp Axum tự động biến `Err(AppError)` thành JSON HTTP response.
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        };

        (status, Json(ErrorBody { error: message })).into_response()
    }
}

//! Module `handlers.rs`: Chứa các hàm xử lý HTTP request (Route Handlers) của Axum.
//!
//! Kiến thức Rust & Axum trọng tâm:
//! - `async fn`: Hàm bất đồng bộ giúp server phục vụ hàng nghìn kết nối mà không tốn nhiều RAM.
//! - Extractors (`State`, `Path`, `Query`, `Json`): Axum tự động bóc tách dữ liệu từ HTTP request
//!   và kiểm tra kiểu ngay lúc biên dịch (Compile-time type safety).
//! - Toán tử `?`: Nếu hàm bên trong trả về `Err(e)`, tự động return lỗi đó ra ngoài gọn gàng.

use crate::{
    error::AppError,
    models::{
        CheckAnswerRequest, CheckAnswerResponse, ExamDetailResponse, ExamSummaryResponse,
        QuestionQuery, ResetExamRequest, ResetQuestionRequest, StatsOnlyResponse,
    },
    store::AppStore,
};
use axum::{
    extract::{Path, Query, State},
    http::{header, StatusCode},
    response::IntoResponse,
    Json,
};
use std::{fs, sync::Arc};

/// Kiểu dùng chung cho toàn bộ handlers: `Arc` (Atomic Reference Counted) cho phép
/// chia sẻ quyền đọc `AppStore` giữa nhiều luồng (thread) một cách an toàn tuyệt đối.
pub type SharedStore = Arc<AppStore>;

/// `GET /api/exams` — Trả về danh sách các bộ đề kèm số câu Đúng / Sai / Đã làm.
pub async fn list_exams(
    State(store): State<SharedStore>,
) -> Result<Json<Vec<ExamSummaryResponse>>, AppError> {
    let exams = store.list_exams()?;
    Ok(Json(exams))
}

/// `GET /api/exams/:exam_id?search=...&wrongOnly=true` — Lấy câu hỏi của 1 bộ đề.
pub async fn get_exam_detail(
    State(store): State<SharedStore>,
    Path(exam_id): Path<String>,
    Query(query): Query<QuestionQuery>,
) -> Result<Json<ExamDetailResponse>, AppError> {
    let detail = store.get_exam_detail(&exam_id, &query)?;
    Ok(Json(detail))
}

/// `POST /api/check` — Làm tới câu nào thì chấm đúng/sai ngay câu đó trên Backend Rust!
pub async fn check_answer(
    State(store): State<SharedStore>,
    Json(payload): Json<CheckAnswerRequest>,
) -> Result<Json<CheckAnswerResponse>, AppError> {
    let result = store.check_answer(&payload.exam_id, &payload.uid, payload.picked)?;
    Ok(Json(result))
}

/// `POST /api/reset-question` — Làm lại 1 câu hỏi cụ thể.
pub async fn reset_question(
    State(store): State<SharedStore>,
    Json(payload): Json<ResetQuestionRequest>,
) -> Result<Json<StatsOnlyResponse>, AppError> {
    let stats = store.reset_question(&payload.exam_id, &payload.uid)?;
    Ok(Json(StatsOnlyResponse { stats }))
}

/// `POST /api/reset-exam` — Xoá kết quả để làm lại từ đầu bộ đề đang chọn.
pub async fn reset_exam(
    State(store): State<SharedStore>,
    Json(payload): Json<ResetExamRequest>,
) -> Result<Json<StatsOnlyResponse>, AppError> {
    let stats = store.reset_exam(&payload.exam_id)?;
    Ok(Json(StatsOnlyResponse { stats }))
}

/// `GET /api/image/:uid` — Đọc và trả về file ảnh `.png` gốc của câu hỏi.
pub async fn serve_question_image(
    State(store): State<SharedStore>,
    Path(uid): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let img_path = store.resolve_image_path(&uid)?;
    let bytes = fs::read(&img_path)
        .map_err(|e| AppError::Internal(format!("Không đọc được ảnh {:?}: {}", img_path, e)))?;

    Ok((StatusCode::OK, [(header::CONTENT_TYPE, "image/png")], bytes))
}

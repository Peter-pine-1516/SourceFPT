//! Module `models.rs`: Định nghĩa các cấu trúc dữ liệu (`struct`) của ứng dụng.
//!
//! Kiến thức Rust trọng tâm:
//! - `#[derive(...)]`: Tự động sinh code cho các trait phổ biến (`Debug`, `Clone`, `Serialize`, `Deserialize`).
//! - `Option<T>`: Thay thế hoàn toàn `null` (chỉ có 2 trạng thái: `Some(giá_trị)` hoặc `None`).
//! - `BTreeMap<K, V>`: Map luôn giữ các key (`A`, `B`, `C`, `D`) theo thứ tự bảng chữ cái.
//! - `#[serde(rename_all = "camelCase")]`: Tự động ánh xạ `snake_case` của Rust sang `camelCase` của JSON/JS.

use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashMap};

// ============================================================================
// 1. Dữ liệu gốc đọc từ file `data/questions.json`
// ============================================================================

#[derive(Debug, Clone, Deserialize)]
pub struct RawQuestionBank {
    pub exams: Vec<RawExam>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RawExam {
    pub id: String,
    pub title: String,
    pub short_title: String,
    pub folder: String,
    pub questions: Vec<RawQuestion>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RawQuestion {
    pub uid: String,
    pub number: usize,
    pub file: String,
    pub alt_file: Option<String>,
    pub choose_count: usize,
    pub question: String,
    pub code: Option<String>,
    pub options: BTreeMap<String, String>,
    pub answer: Vec<String>,
    pub explanation: String,
}

// ============================================================================
// 2. Dữ liệu nội bộ lưu trên RAM của Server Rust
// ============================================================================

#[derive(Debug, Clone)]
pub struct ExamRecord {
    pub id: String,
    pub title: String,
    pub short_title: String,
    /// Danh sách `uid` câu hỏi thuộc bộ đề này (giữ đúng thứ tự câu 1..N)
    pub question_uids: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct QuestionRecord {
    pub uid: String,
    pub number: usize,
    pub exam_title: String,
    pub folder: String,
    pub file: String,
    pub alt_file: Option<String>,
    pub sources: Vec<String>,
    pub choose_count: usize,
    pub question: String,
    pub code: Option<String>,
    pub options: BTreeMap<String, String>,
    pub answer: Vec<String>,
    pub explanation: String,
}

/// Dữ liệu lưu tiến độ làm bài xuống file `data/progress.json`:
/// Map từ `question_uid` -> danh sách đáp án người dùng đã chọn (ví dụ `["B"]`).
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ProgressData {
    pub answers: HashMap<String, Vec<String>>,
}

// ============================================================================
// 3. Các kiểu dữ liệu trả về qua REST API (DTO - Data Transfer Objects)
// ============================================================================

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExamStats {
    pub correct: usize,
    pub wrong: usize,
    pub answered: usize,
    pub total: usize,
    pub accuracy_percent: usize,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExamSummaryResponse {
    pub id: String,
    pub title: String,
    pub short_title: String,
    pub question_count: usize,
    pub stats: ExamStats,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AttemptResult {
    pub picked: Vec<String>,
    pub correct_answer: Vec<String>,
    pub is_correct: bool,
    pub explanation: String,
    pub image_url: String,
}

/// Thông tin câu hỏi gửi xuống Frontend:
/// Lưu ý: Nếu người dùng CHƯA làm câu này (`attempt == None`), đáp án đúng sẽ được giấu kín trên Server!
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionView {
    pub uid: String,
    pub number: usize,
    pub exam_title: String,
    pub sources: Vec<String>,
    pub choose_count: usize,
    pub question: String,
    pub code: Option<String>,
    pub options: BTreeMap<String, String>,
    pub attempt: Option<AttemptResult>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExamDetailResponse {
    pub id: String,
    pub title: String,
    pub short_title: String,
    pub stats: ExamStats,
    pub questions: Vec<QuestionView>,
}

// ============================================================================
// 4. Các kiểu dữ liệu nhận từ Request của Frontend
// ============================================================================

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionQuery {
    pub search: Option<String>,
    pub wrong_only: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckAnswerRequest {
    pub exam_id: String,
    pub uid: String,
    pub picked: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckAnswerResponse {
    pub attempt: AttemptResult,
    pub stats: ExamStats,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResetQuestionRequest {
    pub exam_id: String,
    pub uid: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResetExamRequest {
    pub exam_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatsOnlyResponse {
    pub stats: ExamStats,
}

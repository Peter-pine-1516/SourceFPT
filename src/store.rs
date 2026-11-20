//! Module `store.rs`: Quản lý dữ liệu đề thi trên bộ nhớ (RAM) và lưu tiến độ làm bài.
//!
//! Kiến thức Rust trọng tâm:
//! - Ownership & Borrowing (`&str`, `&self`): Đọc dữ liệu mà không cần copy dư thừa.
//! - `RwLock<ProgressData>`: Khoá đọc/ghi an toàn đa luồng (nhiều request đọc cùng lúc, ghi tuần tự).
//! - Iterator chains (`.iter()`, `.filter()`, `.map()`, `.collect()`): Xử lý danh sách theo phong cách hàm.
//! - Unit Testing (`#[cfg(test)]`): Kiểm thử tự động tích hợp sẵn trong `cargo test`.

use crate::{
    error::AppError,
    models::{
        AttemptResult, CheckAnswerResponse, ExamDetailResponse, ExamRecord, ExamStats,
        ExamSummaryResponse, ProgressData, QuestionQuery, QuestionRecord, QuestionView,
        RawQuestionBank,
    },
};
use std::{
    collections::{HashMap, HashSet},
    fs,
    path::{Path, PathBuf},
    sync::RwLock,
};

pub struct AppStore {
    /// Thư mục gốc của project (dùng để tìm thư mục ảnh đề gốc)
    base_dir: PathBuf,
    /// Đường dẫn file lưu tiến độ làm bài (`data/progress.json`)
    progress_path: PathBuf,
    /// Danh sách các tab bộ đề (5 đề gốc + tab "Lọc trùng" + tab "Tất cả")
    exams: Vec<ExamRecord>,
    /// Bảng tra cứu nhanh thông tin câu hỏi theo `uid` (`O(1)`)
    questions_by_uid: HashMap<String, QuestionRecord>,
    /// Trạng thái câu trả lời của người dùng (bọc trong `RwLock` để thay đổi an toàn khi server đang chạy)
    progress: RwLock<ProgressData>,
}

impl AppStore {
    /// Đọc `data/questions.json`, dựng danh sách đề (bao gồm đề "Lọc trùng" và "Tất cả"),
    /// đồng thời khôi phục tiến độ làm bài từ `data/progress.json` (nếu có).
    pub fn load(base_dir: impl AsRef<Path>) -> Result<Self, String> {
        let base_dir = base_dir.as_ref().to_path_buf();
        let questions_path = base_dir.join("data").join("questions.json");
        let progress_path = base_dir.join("data").join("progress.json");

        let json_text = fs::read_to_string(&questions_path)
            .map_err(|e| format!("Không đọc được file {:?}: {}", questions_path, e))?;

        let bank: RawQuestionBank = serde_json::from_str(&json_text)
            .map_err(|e| format!("Lỗi cú pháp JSON trong {:?}: {}", questions_path, e))?;

        let mut exams = Vec::new();
        let mut questions_by_uid = HashMap::new();
        let mut all_uids = Vec::new();

        // Dùng để gom các câu hỏi trùng nội dung xuyên suốt 5 bộ đề
        let mut unique_index_by_key: HashMap<String, usize> = HashMap::new();
        let mut unique_questions: Vec<QuestionRecord> = Vec::new();

        for raw_exam in bank.exams {
            let mut exam_uids = Vec::with_capacity(raw_exam.questions.len());

            for rq in raw_exam.questions {
                let source_tag = format!("{} #{}", raw_exam.short_title, rq.number);
                let norm_key = format!(
                    "{}||{}",
                    normalize_text(&rq.question),
                    normalize_text(rq.code.as_deref().unwrap_or(""))
                );

                // Cập nhật bộ đề "Lọc trùng" (chỉ giữ bản đầu tiên, cộng dồn danh sách nguồn đề)
                if let Some(&idx) = unique_index_by_key.get(&norm_key) {
                    unique_questions[idx].sources.push(source_tag.clone());
                } else {
                    let next_num = unique_questions.len() + 1;
                    let unique_uid = format!("unique-q{:03}", next_num);
                    unique_index_by_key.insert(norm_key, unique_questions.len());

                    unique_questions.push(QuestionRecord {
                        uid: unique_uid,
                        number: next_num,
                        exam_title: raw_exam.short_title.clone(),
                        folder: raw_exam.folder.clone(),
                        file: rq.file.clone(),
                        alt_file: rq.alt_file.clone(),
                        sources: vec![source_tag.clone()],
                        choose_count: rq.choose_count,
                        question: rq.question.clone(),
                        code: rq.code.clone(),
                        options: rq.options.clone(),
                        answer: rq.answer.clone(),
                        explanation: rq.explanation.clone(),
                    });
                }

                // Lưu câu hỏi gốc vào bảng tra cứu chung
                let record = QuestionRecord {
                    uid: rq.uid.clone(),
                    number: rq.number,
                    exam_title: raw_exam.short_title.clone(),
                    folder: raw_exam.folder.clone(),
                    file: rq.file,
                    alt_file: rq.alt_file,
                    sources: vec![source_tag],
                    choose_count: rq.choose_count,
                    question: rq.question,
                    code: rq.code,
                    options: rq.options,
                    answer: rq.answer,
                    explanation: rq.explanation,
                };

                exam_uids.push(record.uid.clone());
                all_uids.push(record.uid.clone());
                questions_by_uid.insert(record.uid.clone(), record);
            }

            exams.push(ExamRecord {
                id: raw_exam.id,
                title: raw_exam.title,
                short_title: raw_exam.short_title,
                question_uids: exam_uids,
            });
        }

        // Đăng ký các câu hỏi của tab "Lọc trùng"
        let mut unique_uids = Vec::with_capacity(unique_questions.len());
        for uq in unique_questions {
            unique_uids.push(uq.uid.clone());
            questions_by_uid.insert(uq.uid.clone(), uq);
        }

        exams.push(ExamRecord {
            id: "unique".to_string(),
            title: "Tổng hợp không trùng câu".to_string(),
            short_title: "Lọc trùng".to_string(),
            question_uids: unique_uids,
        });

        exams.push(ExamRecord {
            id: "all".to_string(),
            title: "Tất cả đề (Gộp nguyên bản)".to_string(),
            short_title: "Tất cả".to_string(),
            question_uids: all_uids,
        });

        // Đọc file progress.json nếu đã từng làm bài trước đó
        let initial_progress = if progress_path.exists() {
            fs::read_to_string(&progress_path)
                .ok()
                .and_then(|txt| serde_json::from_str::<ProgressData>(&txt).ok())
                .unwrap_or_default()
        } else {
            ProgressData::default()
        };

        Ok(Self {
            base_dir,
            progress_path,
            exams,
            questions_by_uid,
            progress: RwLock::new(initial_progress),
        })
    }

    /// Lấy danh sách tóm tắt tất cả bộ đề kèm thống kê tiến độ hiện tại.
    pub fn list_exams(&self) -> Result<Vec<ExamSummaryResponse>, AppError> {
        let progress = self
            .progress
            .read()
            .map_err(|_| AppError::Internal("Lỗi khoá đọc RwLock".to_string()))?;

        let list = self
            .exams
            .iter()
            .map(|exam| ExamSummaryResponse {
                id: exam.id.clone(),
                title: exam.title.clone(),
                short_title: exam.short_title.clone(),
                question_count: exam.question_uids.len(),
                stats: self.compute_stats_locked(exam, &progress),
            })
            .collect();

        Ok(list)
    }

    /// Lấy chi tiết một bộ đề và danh sách câu hỏi (hỗ trợ lọc câu sai & tìm kiếm từ khoá).
    pub fn get_exam_detail(
        &self,
        exam_id: &str,
        query: &QuestionQuery,
    ) -> Result<ExamDetailResponse, AppError> {
        let exam = self.find_exam(exam_id)?;
        let progress = self
            .progress
            .read()
            .map_err(|_| AppError::Internal("Lỗi khoá đọc RwLock".to_string()))?;

        let stats = self.compute_stats_locked(exam, &progress);
        let wrong_only = query.wrong_only.unwrap_or(false);
        let search_kw = query
            .search
            .as_deref()
            .map(str::trim)
            .filter(|s| !s.is_empty())
            .map(str::to_lowercase);

        let mut questions = Vec::new();
        for uid in &exam.question_uids {
            let Some(q) = self.questions_by_uid.get(uid) else {
                continue;
            };

            let picked_opt = progress.answers.get(uid);

            // Nếu bật lọc "Chỉ hiện câu sai" -> bỏ qua câu chưa làm hoặc đã làm đúng
            if wrong_only {
                match picked_opt {
                    Some(picked) if !is_answer_match(&q.answer, picked) => {}
                    _ => continue,
                }
            }

            // Nếu có từ khoá tìm kiếm -> kiểm tra trong nội dung câu hỏi, code và các đáp án
            if let Some(ref kw) = search_kw {
                if !matches_keyword(q, kw) {
                    continue;
                }
            }

            let attempt = picked_opt.map(|picked| self.build_attempt_result(q, picked));

            questions.push(QuestionView {
                uid: q.uid.clone(),
                number: q.number,
                exam_title: q.exam_title.clone(),
                sources: q.sources.clone(),
                choose_count: q.choose_count,
                question: q.question.clone(),
                code: q.code.clone(),
                options: q.options.clone(),
                attempt,
            });
        }

        Ok(ExamDetailResponse {
            id: exam.id.clone(),
            title: exam.title.clone(),
            short_title: exam.short_title.clone(),
            stats,
            questions,
        })
    }

    /// Chấm đúng/sai ngay lập tức cho 1 câu hỏi và lưu lại kết quả.
    pub fn check_answer(
        &self,
        exam_id: &str,
        uid: &str,
        picked: Vec<String>,
    ) -> Result<CheckAnswerResponse, AppError> {
        let exam = self.find_exam(exam_id)?;
        let q = self
            .questions_by_uid
            .get(uid)
            .ok_or_else(|| AppError::NotFound(format!("Không tìm thấy câu hỏi '{}'", uid)))?;

        // Chuẩn hoá danh sách lựa chọn (in hoa, loại trùng)
        let mut normalized_picked: Vec<String> = picked
            .into_iter()
            .map(|s| s.trim().to_uppercase())
            .collect();
        normalized_picked.sort();
        normalized_picked.dedup();

        if normalized_picked.len() != q.choose_count {
            return Err(AppError::BadRequest(format!(
                "Câu hỏi này yêu cầu chọn đúng {} đáp án",
                q.choose_count
            )));
        }

        for key in &normalized_picked {
            if !q.options.contains_key(key) {
                return Err(AppError::BadRequest(format!(
                    "Đáp án '{}' không hợp lệ",
                    key
                )));
            }
        }

        let stats = {
            let mut progress = self
                .progress
                .write()
                .map_err(|_| AppError::Internal("Lỗi khoá ghi RwLock".to_string()))?;

            progress
                .answers
                .insert(uid.to_string(), normalized_picked.clone());
            self.save_progress_locked(&progress)?;
            self.compute_stats_locked(exam, &progress)
        };

        let attempt = self.build_attempt_result(q, &normalized_picked);
        Ok(CheckAnswerResponse { attempt, stats })
    }

    /// Xoá kết quả đã chọn của 1 câu hỏi để người dùng làm lại câu đó.
    pub fn reset_question(&self, exam_id: &str, uid: &str) -> Result<ExamStats, AppError> {
        let exam = self.find_exam(exam_id)?;
        let mut progress = self
            .progress
            .write()
            .map_err(|_| AppError::Internal("Lỗi khoá ghi RwLock".to_string()))?;

        progress.answers.remove(uid);
        self.save_progress_locked(&progress)?;
        Ok(self.compute_stats_locked(exam, &progress))
    }

    /// Xoá toàn bộ kết quả đã làm của bộ đề hiện tại.
    pub fn reset_exam(&self, exam_id: &str) -> Result<ExamStats, AppError> {
        let exam = self.find_exam(exam_id)?;
        let mut progress = self
            .progress
            .write()
            .map_err(|_| AppError::Internal("Lỗi khoá ghi RwLock".to_string()))?;

        for uid in &exam.question_uids {
            progress.answers.remove(uid);
        }
        self.save_progress_locked(&progress)?;
        Ok(self.compute_stats_locked(exam, &progress))
    }

    /// Tìm đường dẫn file ảnh `.png` gốc của câu hỏi để phục vụ tính năng "Xem ảnh đề gốc".
    pub fn resolve_image_path(&self, uid: &str) -> Result<PathBuf, AppError> {
        let q = self
            .questions_by_uid
            .get(uid)
            .ok_or_else(|| AppError::NotFound(format!("Không tìm thấy câu hỏi '{}'", uid)))?;

        // Ưu tiên `alt_file` (bản chụp có in đáp án tham khảo của FUExam ở đề SU26 - FE)
        let filename = q.alt_file.as_deref().unwrap_or(&q.file);
        let full_path = self.base_dir.join(&q.folder).join(filename);

        if !full_path.is_file() {
            return Err(AppError::NotFound(format!(
                "Không tìm thấy file ảnh gốc {:?}",
                full_path
            )));
        }

        Ok(full_path)
    }

    // ========================================================================
    // Các hàm nội bộ (Private helper methods)
    // ========================================================================

    fn find_exam(&self, exam_id: &str) -> Result<&ExamRecord, AppError> {
        self.exams
            .iter()
            .find(|e| e.id == exam_id)
            .ok_or_else(|| AppError::NotFound(format!("Không tìm thấy bộ đề '{}'", exam_id)))
    }

    fn build_attempt_result(&self, q: &QuestionRecord, picked: &[String]) -> AttemptResult {
        AttemptResult {
            picked: picked.to_vec(),
            correct_answer: q.answer.clone(),
            is_correct: is_answer_match(&q.answer, picked),
            explanation: q.explanation.clone(),
            image_url: format!("/api/image/{}", q.uid),
        }
    }

    fn compute_stats_locked(&self, exam: &ExamRecord, progress: &ProgressData) -> ExamStats {
        let mut correct = 0;
        let mut wrong = 0;

        for uid in &exam.question_uids {
            if let (Some(q), Some(picked)) =
                (self.questions_by_uid.get(uid), progress.answers.get(uid))
            {
                if is_answer_match(&q.answer, picked) {
                    correct += 1;
                } else {
                    wrong += 1;
                }
            }
        }

        let answered = correct + wrong;
        let total = exam.question_uids.len();
        let accuracy_percent = if answered > 0 {
            ((correct as f64 / answered as f64) * 100.0).round() as usize
        } else {
            0
        };

        ExamStats {
            correct,
            wrong,
            answered,
            total,
            accuracy_percent,
        }
    }

    fn save_progress_locked(&self, progress: &ProgressData) -> Result<(), AppError> {
        let json = serde_json::to_string_pretty(progress)
            .map_err(|e| AppError::Internal(format!("Lỗi chuyển đổi JSON: {}", e)))?;
        fs::write(&self.progress_path, json)
            .map_err(|e| AppError::Internal(format!("Lỗi lưu file tiến độ: {}", e)))?;
        Ok(())
    }
}

/// So sánh tập hợp đáp án người dùng chọn với đáp án chuẩn (không phụ thuộc thứ tự).
fn is_answer_match(expected: &[String], picked: &[String]) -> bool {
    if expected.len() != picked.len() {
        return false;
    }
    let set_a: HashSet<&str> = expected.iter().map(String::as_str).collect();
    let set_b: HashSet<&str> = picked.iter().map(String::as_str).collect();
    set_a == set_b
}

/// Chuẩn hoá chuỗi (chữ thường + gộp khoảng trắng) để phát hiện câu trùng giữa các đề.
fn normalize_text(input: &str) -> String {
    input
        .split_whitespace()
        .collect::<Vec<&str>>()
        .join(" ")
        .to_lowercase()
}

fn matches_keyword(q: &QuestionRecord, kw_lower: &str) -> bool {
    if q.question.to_lowercase().contains(kw_lower) {
        return true;
    }
    if let Some(ref code) = q.code {
        if code.to_lowercase().contains(kw_lower) {
            return true;
        }
    }
    q.options
        .values()
        .any(|opt_text| opt_text.to_lowercase().contains(kw_lower))
}

// ============================================================================
// Unit Tests: Chạy lệnh `cargo test` để kiểm tra toàn bộ logic và dữ liệu đề!
// ============================================================================
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_question_bank_and_images_integrity() {
        let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let store = AppStore::load(&manifest_dir).expect("Phải nạp thành công questions.json");

        let summaries = store.list_exams().expect("Phải liệt kê được danh sách đề");
        // 5 đề gốc + 1 đề Lọc trùng + 1 đề Tất cả = 7 tab
        assert_eq!(summaries.len(), 7);

        let all_summary = summaries.iter().find(|s| s.id == "all").unwrap();
        assert_eq!(all_summary.question_count, 248);

        let unique_summary = summaries.iter().find(|s| s.id == "unique").unwrap();
        assert_eq!(unique_summary.question_count, 158);

        // Kiểm tra từng câu hỏi đều có ảnh đề gốc tồn tại thực tế trên ổ đĩa
        for uid in store.questions_by_uid.keys() {
            let img_path = store
                .resolve_image_path(uid)
                .expect("Mọi câu hỏi phải trỏ tới file ảnh hợp lệ");
            assert!(img_path.exists());
        }
    }

    #[test]
    fn test_answer_matching_logic() {
        let expected = vec!["B".to_string()];
        assert!(is_answer_match(&expected, &["B".to_string()]));
        assert!(!is_answer_match(&expected, &["C".to_string()]));
    }
}

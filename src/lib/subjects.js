export const SUBJECTS = [
  {
    id: "PRM393",
    code: "PRM393",
    title: "PRM393 FE",
    badge: "5 bộ đề SP26 & SU26",
    subtitle: "Làm câu nào chấm ngay câu đó",
    guideLabel: "Tài liệu lý thuyết",
    guideSubject: "PRM393",
    guideExtra: "(Flutter & Dart)",
    questionsPath: "/data/questions.json",
    guidePath: "/data/TAI_LIEU_ON_TAP_PRM393.md",
    progressKey: "prm393_progress_v1",
    prefsKey: "prm393_prefs_v1",
    defaultExamId: "guide",
    legacyMigration: true,
  },
  {
    id: "ITE302c",
    code: "ITE302c",
    title: "ITE302c FE",
    badge: "11 bộ đề SP24 – SU26",
    subtitle: "Làm câu nào chấm ngay câu đó",
    questionsPath: "/data/ite302c-questions.json",
    guidePath: null,
    progressKey: "ite302c_progress_v1",
    prefsKey: "ite302c_prefs_v1",
    defaultExamId: "sp24-fe",
    legacyMigration: false,
  },
];

export function getSubjectById(id) {
  if (!id) return null;
  const target = String(id).trim().toLowerCase();
  return SUBJECTS.find((s) => s.id.toLowerCase() === target) || null;
}

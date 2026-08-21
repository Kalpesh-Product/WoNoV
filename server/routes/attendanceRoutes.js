const {
  getAttendance,
  correctAttendance,
  recordAttendance,
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getAllAttendance,
  bulkInsertAttendance,
  approveCorrectionRequest,
  rejectCorrectionRequest,
  getAttendanceRequests,
} = require("../controllers/attendanceControllers");
const upload = require("../config/multerConfig");

const router = require("express").Router();
router.post("/clock-in", clockIn);
router.patch("/clock-out", clockOut);
router.patch("/start-break", startBreak);
router.patch("/end-break", endBreak);
router.post("/correct-attendance", correctAttendance);
router.patch(
  "/approve-correct-attendance/:attendanceId",
  approveCorrectionRequest
);
router.patch(
  "/reject-correct-attendance/:attendanceId",
  rejectCorrectionRequest
);
router.get("/get-attendance-requests", getAttendanceRequests);
router.get("/get-all-attendance", getAllAttendance);
router.get("/get-attendance/:id", getAttendance);
const attendanceUpload = [
  upload.fields([
    { name: "attendance", maxCount: 1 },
    { name: "attandance", maxCount: 1 },
  ]),
  (req, res, next) => {
    req.file =
      req.files?.attendance?.[0] || req.files?.attandance?.[0] || null;
    next();
  },
];

router.post(
  "/bulk-insert-attendance",
  ...attendanceUpload,
  bulkInsertAttendance,
);
// Backward compatibility for the existing misspelled endpoint.
router.post(
  "/bulk-insert-attandance",
  ...attendanceUpload,
  bulkInsertAttendance,
);

module.exports = router;

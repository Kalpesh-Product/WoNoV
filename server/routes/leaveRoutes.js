const {
  requestLeave,
  fetchAllLeaves,
  fetchLeavesBeforeToday,
  approveLeave,
  rejectLeave,
  bulkInsertLeaves,
  fetchPastLeaves,
  fetchUserLeaves,
} = require("../controllers/leavesControllers/leavesControllers");
const {
  createLeaveType,
  fetchAllLeaveTypes,
  deleteLeaveType,
  softDeleteLeaveType,
} = require("../controllers/leavesControllers/leaveTypesControllers");
const router = require("express").Router();
const upload = require("../config/multerConfig");

router.post("/request-leave", requestLeave);
router.get("/view-all-leaves", fetchAllLeaves);
router.get("/view-past-leaves", fetchPastLeaves);
router.get("/view-leaves/:id", fetchUserLeaves);
router.put("/approve-leave/:id", approveLeave);
router.put("/reject-leave/:id", rejectLeave);
router.post("/create-leave-type", createLeaveType);
router.get("/view-all-leave-types", fetchAllLeaveTypes);
router.delete("/delete-leave-type/:id", deleteLeaveType);
router.put("/soft-delete-leave-type/:id", softDeleteLeaveType);
router.post("/bulk-insert-leaves", upload.single("leaves"), bulkInsertLeaves);

module.exports = router;

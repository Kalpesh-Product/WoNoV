const upload = require("../config/multerConfig");
const {
  addMeetings,
  getMeetings,
  addHousekeepingTask,
  deleteHousekeepingTask,
  getMeetingsByTypes,
  cancelMeeting,
  getAvaliableUsers,
  getMyMeetings,
  getSingleRoomMeetings,
  extendMeeting,
  updateMeetingStatus,
  getAllCompanies,
  updateMeeting,
  updateMeetingDetails,
} = require("../controllers/meetingsControllers/meetingsControllers");
const {
  getReviews,
  addReview,
  replyReview,
} = require("../controllers/meetingsControllers/reviewsController");
const {
  addRoom,
  getRooms,
  updateRoom,
} = require("../controllers/meetingsControllers/roomsController");

const router = require("express").Router();

router.post("/create-meeting", addMeetings);
router.post("/create-room", upload.single("room"), addRoom);
router.post("/create-review", addReview);
router.post("/create-reply", replyReview);
router.patch("/extend-meeting", extendMeeting);
router.patch("/update-meeting-details", updateMeetingDetails);
router.get("/get-rooms", getRooms);
router.get("/get-meetings", getMeetings);
router.get("/get-room-meetings/:roomId", getSingleRoomMeetings);
router.get("/my-meetings", getMyMeetings);
router.get("/get-reviews", getReviews);
router.get("/get-meetings-type", getMeetingsByTypes);
router.patch("/update-room/:id", upload.single("room"), updateRoom);
router.patch("/create-housekeeping-tasks", addHousekeepingTask);
router.delete("/delete-housekeeping-tasks", deleteHousekeepingTask);
router.patch("/cancel-meeting/:meetingId", cancelMeeting);
router.get("/get-available-users", getAvaliableUsers);
router.patch("/update-meeting/:meetingId", updateMeeting); //Update payment details
router.patch("/update-meeting-status", updateMeetingStatus);
router.get("/get-all-companies", getAllCompanies);

module.exports = router;

const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
  getAllEvents,
  createEvent,
  getNormalEvents,
  getHolidays,
  deleteEvent,
  extendEvent,
  getBirthdays,
  bulkInsertEvents,
} = require("../controllers/eventsController/eventsController");

router.post("/create-event", createEvent);
router.get("/all-events", getAllEvents);
router.get("/get-events", getNormalEvents);
router.get("/get-holidays", getHolidays);
router.get("/get-birthdays", getBirthdays);
router.get("/extend-meeting", extendEvent);
router.patch("/delete-event/:id", deleteEvent);
router.post("/bulk-insert-events", upload.single("events"), bulkInsertEvents);

module.exports = router;

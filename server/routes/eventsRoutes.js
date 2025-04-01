const router = require("express").Router();
const {
  getAllEvents,
  createEvent,
  getNormalEvents,
  getHolidays,
  deleteEvent,
  extendEvent,
  getBirthdays,
} = require("../controllers/eventsController/eventsController");

router.post("/create-event", createEvent);
router.get("/all-events", getAllEvents);
router.get("/get-events", getNormalEvents);
router.get("/get-holidays", getHolidays);
router.get("/get-birthdays", getBirthdays);
router.get("/extend-meeting", extendEvent);
router.patch("/delete-event/:id", deleteEvent);

module.exports = router;

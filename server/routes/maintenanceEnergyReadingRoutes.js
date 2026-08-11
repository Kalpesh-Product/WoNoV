const router = require("express").Router();
const {
  getStEnergyFormData,
  getStEnergyReadings,
  addStEnergyReadings,
  editStEnergyReading,
  getStEnergyMonthlyFormData,
  getStEnergyMonthlyReadings,
  addStEnergyMonthlyReadings,
  editStEnergyMonthlyReading,
  getDtcEnergyMonthlyFormData,
  getDtcEnergyMonthlyReadings,
  addDtcEnergyMonthlyReadings,
  editDtcEnergyMonthlyReading,
  getDtcEnergyFormData,
  getDtcEnergyReadings,
  addDtcEnergyReadings,
  editDtcEnergyReading,
  getDailyReadingHistory,
} = require("../controllers/maintenanceControllers/MaintenanceEnergyReadingController");
router.get("/energy-daily-history/:module", getDailyReadingHistory);
// ST Daily Routes
router.get("/get-st-energy-daily/form-data", getStEnergyFormData);
router.get("/get-st-energy-daily", getStEnergyReadings);
router.post("/add-st-energy-daily", addStEnergyReadings);
router.patch("/edit-st-energy-daily/:id", editStEnergyReading);

// ST Monthly Routes
router.get("/get-st-energy-monthly/form-data", getStEnergyMonthlyFormData);
router.get("/get-st-energy-monthly", getStEnergyMonthlyReadings);
router.post("/add-st-energy-monthly", addStEnergyMonthlyReadings);
router.patch("/edit-st-energy-monthly/:id", editStEnergyMonthlyReading);

// DTC monthly routes
router.get("/get-dtc-energy-monthly/form-data", getDtcEnergyMonthlyFormData);
router.get("/get-dtc-energy-monthly", getDtcEnergyMonthlyReadings);
router.post("/add-dtc-energy-monthly", addDtcEnergyMonthlyReadings);
router.patch("/edit-dtc-energy-monthly/:id", editDtcEnergyMonthlyReading);

// DTC daily routes
router.get("/get-dtc-energy-daily/form-data", getDtcEnergyFormData);
router.get("/get-dtc-energy-daily", getDtcEnergyReadings);
router.post("/add-dtc-energy-daily", addDtcEnergyReadings);
router.patch("/edit-dtc-energy-daily/:id", editDtcEnergyReading);

//General Routes
router.get("/form-data", getStEnergyFormData);
router.get("/", getStEnergyReadings);
router.post("/", addStEnergyReadings);
router.patch("/:id", editStEnergyReading);

module.exports = router;

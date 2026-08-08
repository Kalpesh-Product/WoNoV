const router = require("express").Router();
const {
  getStEnergyFormData,
  getStEnergyReadings,
  addStEnergyReadings,
  editStEnergyReading,
} = require("../controllers/maintenanceControllers/MaintenanceEnergyReadingController");

router.get("/get-st-energy-daily/form-data", getStEnergyFormData);
router.get("/get-st-energy-daily", getStEnergyReadings);
router.post("/add-st-energy-daily", addStEnergyReadings);
router.patch("/edit-st-energy-daily/:id", editStEnergyReading);

router.get("/form-data", getStEnergyFormData);
router.get("/", getStEnergyReadings);
router.post("/", addStEnergyReadings);
router.patch("/:id", editStEnergyReading);

module.exports = router;

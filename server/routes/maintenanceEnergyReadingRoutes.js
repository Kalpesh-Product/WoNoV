const router = require("express").Router();
const {
  getStEnergyFormData,
  getStEnergyReadings,
  addStEnergyReadings,
  editStEnergyReading,
} = require("../controllers/maintenanceControllers/MaintenanceEnergyReadingController");

router.get("/form-data", getStEnergyFormData);
router.get("/", getStEnergyReadings);
router.post("/", addStEnergyReadings);
router.patch("/:id", editStEnergyReading);

module.exports = router;
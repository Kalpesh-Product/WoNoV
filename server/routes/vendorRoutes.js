const router = require("express").Router();
const {
  onboardVendor,
  fetchVendors,
  updateVendor,
} = require("../controllers/vendorControllers/vendorController");

router.post("/onboard-vendor", onboardVendor);
router.patch("/update-vendor/:vendorId", updateVendor);
router.get("/get-vendors/:departmentId", fetchVendors);
module.exports = router;

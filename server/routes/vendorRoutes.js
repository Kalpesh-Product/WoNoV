const router = require("express").Router();
const {
  onboardVendor,
  fetchVendors,
} = require("../controllers/vendorControllers/vendorController");

router.post("/onboard-vendor", onboardVendor);
router.get("/get-vendors", fetchVendors);
module.exports = router;

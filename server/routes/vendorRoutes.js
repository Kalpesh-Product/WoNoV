const upload = require("../config/multerConfig");

const router = require("express").Router();
const {
  onboardVendor,
  fetchVendors,
  updateVendor,
  bulkInsertVendors,
} = require("../controllers/vendorControllers/vendorController");

router.post("/onboard-vendor", onboardVendor);
router.patch("/update-vendor/:vendorId", updateVendor);
router.get("/get-vendors/:departmentId", fetchVendors);
router.post(
  "/bulk-insert-vendors/:departmentId",
  upload.single("vendors"),
  bulkInsertVendors
);
module.exports = router;

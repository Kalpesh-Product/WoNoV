const router = require("express").Router();
const {
  createInventory,
  getInventories,
  updateInventory,
  bulkInsertInventory,
} = require("../controllers/inventoryControllers/inventoryControllers");
const upload = require("../config/multerConfig");

router.post("/add-inventory-item", createInventory);
router.get("/get-inventories", getInventories);
router.patch("/update-inventory/:id", updateInventory);
router.post(
  "/bulk-insert-inventory/:departmentId",
  upload.single("inventory"),
  bulkInsertInventory
);

module.exports = router;

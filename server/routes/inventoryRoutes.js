const router = require("express").Router();
const {
  createInventory,
  getInventories,
  updateInventory,
  editInventory,
  bulkInsertInventory,
  deleteInventory,
  restoreInventory,
} = require("../controllers/inventoryControllers/inventoryControllers");
const upload = require("../config/multerConfig");

router.post("/add-inventory-item", createInventory);
router.get("/get-inventories", getInventories);
router.patch("/update-inventory/:id", updateInventory);
router.patch("/edit-inventory/:id", editInventory);
router.delete("/:id", deleteInventory);
router.patch("/:id/restore", restoreInventory);
router.post(
  "/bulk-insert-inventory/:departmentId",
  upload.single("inventory"),
  bulkInsertInventory
);

module.exports = router;

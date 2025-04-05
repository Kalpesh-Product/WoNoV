const router = require("express").Router();
const {
createInventory,
deleteInventory,
getInventories,
getInventoryById,
updateInventory
} = require("../controllers/inventoryControllers/inventoryControllers");

router.post("/add-inventory-item", createInventory);

module.exports = router;

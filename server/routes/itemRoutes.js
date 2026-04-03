const router = require("express").Router();
const {
  addItem,
  getItems,
  updateItem,
} = require("../controllers/itemControllers");

router.post("/", addItem);
router.get("/", getItems);
router.patch("/:id", updateItem);

module.exports = router;

const router = require("express").Router();
const { addItem, getItems } = require("../controllers/itemControllers");

router.post("/", addItem);
router.get("/", getItems);

module.exports = router;

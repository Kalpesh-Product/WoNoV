const upload = require("../config/multerConfig");

const router = require("express").Router();
const {
  addItem,
  getItems,
  updateItem,
  bulkUploadItems,
} = require("../controllers/itemControllers");

router.post("/", addItem);
router.get("/", getItems);
router.patch("/:id", updateItem);
router.post("/upload/:department", upload.single("itemFile"), bulkUploadItems);

module.exports = router;

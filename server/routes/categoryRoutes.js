const upload = require("../config/multerConfig");
const {
  addAssetCategory,
  addSubCategory,
  updateCategory,
  updateSubCategory,
  getCategory,
  getSubCategory,
  bulkUploadCategory,
} = require("../controllers/assetsControllers/categoryControllers");

const router = require("express").Router();

router.post("/create-category", addAssetCategory);
router.post("/create-subcategory", addSubCategory);
router.patch("/update-category", updateCategory);
router.patch("/update-subcategory", updateSubCategory);
router.get("/get-category", getCategory);
router.get("/get-subcategory", getSubCategory);
router.post(
  "/bulk-upload-category/:department/:appliesTo",
  upload.single("category"),
  bulkUploadCategory,
);

module.exports = router;

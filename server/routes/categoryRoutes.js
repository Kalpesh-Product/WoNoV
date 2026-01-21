const {
  addAssetCategory,
  addSubCategory,
  updateCategory,
  updateSubCategory,
  getCategory,
  getSubCategory,
} = require("../controllers/assetsControllers/categoryControllers");

const router = require("express").Router();

router.post("/create-asset-category", addAssetCategory);
router.post("/create-asset-subcategory", addSubCategory);
router.patch("/update-asset-category", updateCategory);
router.patch("/update-asset-subcategory", updateSubCategory);
router.get("/get-category", getCategory);
router.get("/get-subcategory", getSubCategory);

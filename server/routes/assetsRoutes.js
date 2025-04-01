const upload = require("../config/multerConfig");
const router = require("express").Router();
const {
  addAsset,
  editAsset,
  getAssets,
} = require("../controllers/assetsControllers/assetsControllers");
const {
  addSubCategory,
  addAssetCategory,
  disableCategory,
  disableSubCategory,
  getCategory,
  getSubCategory,
} = require("../controllers/assetsControllers/categoryControllers");

const {
  assignAsset,
  processAssetRequest,
  revokeAsset,
  getAssetRequests,
} = require("../controllers/assetsControllers/assignAssetController");

// Asset Management Routes
router.post("/create-asset", upload.single("asset-image"), addAsset);
router.patch("/update-asset/:assetId", upload.single("asset-image"), editAsset);
router.get("/get-assets", getAssets);
router.post("/create-asset-category", addAssetCategory);
router.post("/create-asset-subcategory", addSubCategory);
router.patch("/disable-asset-category/:assetCategoryId", disableCategory);
router.patch(
  "/disable-asset-subcategory/:assetSubCategoryId",
  disableSubCategory
);
router.get("/get-category", getCategory);
router.get("/get-subcategory/", getSubCategory);

// Asset Assignment Routes
router.post("/new-asset-assignment", assignAsset);
router.post("/process-asset-request", processAssetRequest);
router.post("/revoke-asset", revokeAsset);
router.get("/get-asset-requests", getAssetRequests);

module.exports = router;

const upload = require("../config/multerConfig");
const router = require("express").Router();
const {
  addAsset,
  editAsset,
  getAssets,
  getAssetsWithDepartments,
  bulkInsertAssets,
} = require("../controllers/assetsControllers/assetsControllers");
const {
  addSubCategory,
  addAssetCategory,
  disableCategory,
  disableSubCategory,
  getCategory,
  getSubCategory,
  updateCategory,
  updateSubCategory,
} = require("../controllers/assetsControllers/categoryControllers");

const {
  processAssetRequest,
  revokeAsset,
  getAssetRequests,
  requestAsset,
  assignAsset,
} = require("../controllers/assetsControllers/assignAssetController");

// Asset Management Routes
router.post("/create-asset", upload.single("asset-image"), addAsset);
router.patch(
  "/update-asset/:assetId",
  upload.fields([
    { name: "assetImage", maxCount: 1 },
    { name: "warrantyDocument", maxCount: 1 },
  ]),
  editAsset
);
router.get("/get-assets", getAssets);
router.get("/get-assets-with-departments", getAssetsWithDepartments);
router.post("/create-asset-category", addAssetCategory);
router.post("/create-asset-subcategory", addSubCategory);
router.post(
  "/bulk-insert-assets/:department",
  upload.single("assets"),
  bulkInsertAssets
);
router.patch("/update-asset-category", updateCategory);
router.patch("/update-asset-subcategory", updateSubCategory);
router.get("/get-category", getCategory);
router.get("/get-subcategory", getSubCategory);

// Asset Assignment Routes
router.post("/new-asset-assignment", assignAsset);
router.post("/request-asset", requestAsset);
router.patch("/process-asset-request", processAssetRequest);
router.patch("/revoke-asset/:assigneddAssetId", revokeAsset);
router.get("/get-asset-requests", getAssetRequests);

module.exports = router;

const upload = require("../config/multerConfig");
const router = require("express").Router();
const {
  addAsset,
  editAsset,
  getAssets,
  getAssetsWithDepartments,
  bulkInsertAssets,
  bulkAssignedAssets,
  deleteAsset,
  restoreAsset,
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
  deleteCategory,
  restoreCategory,
  deleteSubCategory,
  restoreSubCategory,
} = require("../controllers/assetsControllers/categoryControllers");

const {
  processAssetRequest,
  revokeAsset,
  getAssetRequests,
  requestAsset,
  assignAsset,
} = require("../controllers/assetsControllers/assignAssetController");

// Asset Management Routes
router.post(
  "/create-asset",
  upload.fields([
    { name: "asset-image", maxCount: 1 },
    { name: "assetImage", maxCount: 1 },
    { name: "warrantyDocument", maxCount: 1 },
  ]),
  addAsset,
);
router.patch(
  "/update-asset/:assetId",
  upload.fields([
    { name: "assetImage", maxCount: 1 },
    { name: "warrantyDocument", maxCount: 1 },
  ]),
  editAsset,
);
router.get("/get-assets", getAssets);
router.get("/get-assets-with-departments", getAssetsWithDepartments);
router.post("/create-category", addAssetCategory);
router.post("/create-subcategory", addSubCategory);
router.post(
  "/bulk-insert-assets/:department",
  upload.single("assets"),
  bulkInsertAssets,
);
router.post(
  "/bulk-assign-assets/:department",
  upload.single("assigned-assets"),
  bulkAssignedAssets,
);
router.patch("/update-category", updateCategory);
router.patch("/update-subcategory", updateSubCategory);
router.get("/get-category", getCategory);
router.get("/get-subcategory", getSubCategory);
router.delete("/category/:categoryId", deleteCategory);
router.patch("/category/:categoryId/restore", restoreCategory);
router.delete("/subcategory/:subCategoryId", deleteSubCategory);
router.patch("/subcategory/:subCategoryId/restore", restoreSubCategory);
router.delete("/asset/:assetId", deleteAsset);
router.patch("/asset/:assetId/restore", restoreAsset);

// Asset Assignment Routes
router.post("/new-asset-assignment", assignAsset);
router.post("/request-asset", requestAsset);
router.patch("/process-asset-request", processAssetRequest);
router.patch("/revoke-asset/:assigneddAssetId", revokeAsset);
router.get("/get-asset-requests", getAssetRequests);

module.exports = router;

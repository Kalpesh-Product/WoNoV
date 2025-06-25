const router = require("express").Router();
const upload = require("../config/multerConfig");

const {
  addCompany,
  getCompanies,
  addCompanyLogo,
  updateActiveStatus,
  getCompanyData,
  getCompanyLogo,
  getHierarchy,
  getCompanyAttandances,
  updateCompanySubItem,
} = require("../controllers/companyControllers/companyControllers");

const {
  addNewHouseKeepingMember,
  getHouseKeepingStaff,
} = require("../controllers/companyControllers/houseKeepingController");

const {
  uploadCompanyDocument,
  getCompanyDocuments,
  uploadDepartmentDocument,
  getDepartmentDocuments,
  addCompanyKyc,
  getCompanyKyc,
  getComplianceDocuments,
  uploadComplianceDocument,
} = require("../controllers/companyControllers/documentControllers");
const {
  addEmployeeType,
} = require("../controllers/companyControllers/employeeTypeControllers");
const {
  addLeaveType,
} = require("../controllers/companyControllers/leaveTypeControllers");
const {
  addShift,
} = require("../controllers/companyControllers/shiftControllers");
const {
  addBuilding,
  bulkInsertUnits,
  uploadUnitImage,
  addUnit,
  fetchUnits,
  fetchBuildings,
  assignPrimaryUnit,
  updateUnit,
} = require("../controllers/companyControllers/workLocationControllers");
const {
  createDepartment,
} = require("../controllers/companyControllers/departmentControllers");

const {
  bulkInsertJobApplications,
  createJobApplication,
  getJobApplications,
} = require("../controllers/companyControllers/jobApplicationsController");

// const {
//   getComplianceDocuments,
//   uploadComplianceDocument,
// } = require("../controllers/companyControllers/complianceDocumentController");

router.post("/create-company", addCompany);
router.get("/get-companies", getCompanies);
router.get("/company-hierarchy", getHierarchy);
router.get("/company-attandances", getCompanyAttandances);
router.post("/add-department", createDepartment);
router.patch("/update-company-data", updateCompanySubItem);
router.post("/add-employee-type", addEmployeeType);
router.post("/add-leave-type", addLeaveType);
router.post("/add-building", addBuilding);
router.get("/buildings", fetchBuildings);
router.post("/add-unit", addUnit);
router.patch(
  "/update-unit",
  upload.fields([
    { name: "clearImage", maxCount: 1 },
    { name: "occupiedImage", maxCount: 1 },
  ]),
  updateUnit
);
router.patch("/assign-primary-unit", assignPrimaryUnit);
router.get("/fetch-units", fetchUnits);
router.post("/bulk-add-locations", upload.single("units"), bulkInsertUnits);
router.get("/get-company-data", getCompanyData);
router.post("/update-active-status/:field", updateActiveStatus);
router.post("/add-company-logo", upload.single("logo"), addCompanyLogo);
router.get("/get-company-logo", getCompanyLogo);
router.post("/add-kyc-document", upload.single("kyc"), addCompanyKyc);
router.get("/get-kyc", getCompanyKyc);

router.get("/get-compliance-documents", getComplianceDocuments);
router.post(
  "/add-compliance-document",
  upload.single("document"),
  uploadComplianceDocument
);

router.post("/add-shift", addShift);
router.post(
  "/bulk-insert-job-applications",
  upload.single("job-applications"),
  bulkInsertJobApplications
);

router.post("/add-job-application", createJobApplication);
router.get("/get-job-applications", getJobApplications);

router.post("/add-housekeeping-member", addNewHouseKeepingMember);
router.get("/housekeeping-members", getHouseKeepingStaff);

router.post(
  "/upload-company-document",

  upload.single("document"),
  uploadCompanyDocument
);
router.post(
  "/add-department-document/:departmentId",

  upload.single("department-document"),
  uploadDepartmentDocument
);

router.post(
  "/upload-location-image",
  upload.single("locationImage"),
  uploadUnitImage
);
router.get("/get-company-documents/:type", getCompanyDocuments);
router.get("/get-department-documents", getDepartmentDocuments);

module.exports = router;

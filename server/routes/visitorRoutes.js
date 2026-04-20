const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
  fetchVisitors,
  addVisitor,
  updateVisitor,
  Convettoclient,
  fetchExternalCompanies,
  updateExternalCompany,
  fetchTeamMembers,
  bulkInsertExternalClients,
  updateVisitorPayment,
  updateDayPassVisitPayment,
  updateDayPassPaymentVerification,
  rebookClient,
  convertVisitorToClient,
} = require("../controllers/visitorControllers/visitorController");

router.get("/fetch-visitors", fetchVisitors);
router.get("/fetch-team-members", fetchTeamMembers);
router.post(
  "/add-visitor",
  upload.fields([
    {
      name: "panFile",
      maxCount: 1,
    },
    {
      name: "gstFile",
      maxCount: 1,
    },
    {
      name: "otherFile",
      maxCount: 1,
    },
  ]),
  addVisitor,
);
router.get("/fetch-external-companies", fetchExternalCompanies);
router.patch(
  "/update-external-company/:externalCompanyId",
  updateExternalCompany,
);
router.patch(
  "/update-visitor/:visitorId",
  upload.fields([
    {
      name: "panFile",
      maxCount: 1,
    },
    {
      name: "gstFile",
      maxCount: 1,
    },
    {
      name: "otherFile",
      maxCount: 1,
    },
  ]),
  updateVisitor,
);
router.patch(
  "/convettoclient/:visitorId",
  upload.fields([
    {
      name: "panFile",
      maxCount: 1,
    },
    {
      name: "gstFile",
      maxCount: 1,
    },
    {
      name: "otherFile",
      maxCount: 1,
    },
  ]),
  Convettoclient,
);
router.patch(
  "/payment/:visitorId",
  upload.single("paymentProof"),
  updateVisitorPayment,
);
router.patch(
  "/day-pass/payment/:externalVisitId",
  upload.single("paymentProof"),
  updateDayPassVisitPayment,
);
router.patch(
  "/day-pass/payment-verification",
  updateDayPassPaymentVerification,
);
router.post(
  "/bulk-upload-external-clients",
  upload.single("external-clients"),
  bulkInsertExternalClients,
);
router.post("/rebook-client/:externalVisitId", rebookClient);
router.post("/convert-to-client/:visitorId", convertVisitorToClient);

module.exports = router;

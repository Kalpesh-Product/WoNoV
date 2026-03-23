const router = require("express").Router();
const {
  getIncomeAndExpanse,
  uploadClientInvoice,
  getInvoices,
  updatePaymentStatus,
} = require("../controllers/financeControllers/financeControllers");
const {
  addLandlordDocument,
  getLandlordDocuments,
  createLandlord,
  updateLandlordDocument,
} = require("../controllers/financeControllers/landlordControllers");
const {
  getClientAgreements,
  createClientAgreementClient,
  addClientAgreement,
  updateClientAgreement,
} = require("../controllers/financeControllers/clientAgreementControllers");
const upload = require("../config/multerConfig");

router.get("/income-expense", getIncomeAndExpanse);
router.get("/client-invoices", getInvoices);
router.patch("/update-payment-status/:invoiceId", updatePaymentStatus);
router.post(
  "/upload-client-invoice",
  upload.single("client-invoice"),
  uploadClientInvoice
);
router.post("/create-landlord", createLandlord);
router.post(
  "/add-landlord-agreement",
  upload.single("agreement"),
  addLandlordDocument
);
router.get("/get-landlord-agreements", getLandlordDocuments);
router.patch(
  "/landlord-agreements/document",
  upload.single("agreement"),
  updateLandlordDocument
);
router.get("/client-agreements", getClientAgreements);
router.post("/client-agreements/client", createClientAgreementClient);
router.post(
  "/client-agreements/agreement",
  upload.single("agreement"),
  addClientAgreement
);
router.patch(
  "/client-agreements/agreement",
  upload.single("agreement"),
  updateClientAgreement
);
module.exports = router;
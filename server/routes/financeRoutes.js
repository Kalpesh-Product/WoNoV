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
} = require("../controllers/financeControllers/landlordControllers");
const upload = require("../config/multerConfig");

router.get("/income-expense", getIncomeAndExpanse);
router.get("/client-invoices", getInvoices);
router.patch("/update-payment-status/:invoiceId", updatePaymentStatus);
router.post(
  "/upload-client-invoice",
  upload.single("client-invoice"),
  uploadClientInvoice
);
router.post(
  "/add-landlord-agreement",
  upload.single("agreement"),
  addLandlordDocument
);
router.get("/get-landlord-agreements", getLandlordDocuments);
module.exports = router;

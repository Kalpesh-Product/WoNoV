const router = require("express").Router();
const {
  getIncomeAndExpanse,
  uploadClientInvoice,
  getInvoices,
} = require("../controllers/financeControllers/financeControllers");
const upload = require("../config/multerConfig");

router.get("/income-expense", getIncomeAndExpanse);
router.get("/client-invoices", getInvoices);
router.post(
  "/upload-client-invoice",
  upload.single("client-invoice"),
  uploadClientInvoice
);
module.exports = router;

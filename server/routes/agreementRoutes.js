const router = require("express").Router();
const {
  addAgreement,
  getAgreements,
  deleteAgreement,
  updateAgreementStatus,
} = require("../controllers/companyControllers/userAgreementControllers");
const upload = require("../config/multerConfig");

router.post("/add-agreement", upload.single("agreement"), addAgreement);
router.get("/all-agreements/:userId", getAgreements);
router.patch("/update-agreement-status", updateAgreementStatus);
router.patch("/delete-agreement/:agreementId", deleteAgreement);

module.exports = router;

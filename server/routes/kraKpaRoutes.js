const router = require("express").Router();
const {
  listIndividualMonthlyKpa,
  getIndividualMonthlyKpaReviewAccess,
  createIndividualMonthlyKpa,
  updateIndividualMonthlyKpa,
  completeIndividualMonthlyKpa,
  deleteIndividualMonthlyKpa,
} = require("../controllers/performanceControllers/kraKpaIndividualMonthlyKpaController");
const {
  listSelfKra,
  listSelfKraLeadOptions,
  createSelfKra,
  updateSelfKra,
  completeSelfKra,
  deleteSelfKra,
} = require("../controllers/performanceControllers/kraKpaSelfKraController");

router.get("/individual-monthly-kpa", listIndividualMonthlyKpa);
router.get("/individual-monthly-kpa/review-access", getIndividualMonthlyKpaReviewAccess);
router.post("/individual-monthly-kpa", createIndividualMonthlyKpa);
router.patch("/individual-monthly-kpa/:id/complete", completeIndividualMonthlyKpa);
router.patch("/individual-monthly-kpa/:id", updateIndividualMonthlyKpa);
router.delete("/individual-monthly-kpa/:id", deleteIndividualMonthlyKpa);
router.get("/self-kra", listSelfKra);
router.get("/self-kra/lead-options", listSelfKraLeadOptions);
router.post("/self-kra", createSelfKra);
router.patch("/self-kra/:id/complete", completeSelfKra);
router.patch("/self-kra/:id", updateSelfKra);
router.delete("/self-kra/:id", deleteSelfKra);

module.exports = router;

const router = require("express").Router();
const {
  fetchVisitors,
  addVisitor,
  updateVisitor,
  fetchExternalCompanies,
} = require("../controllers/visitorControllers/visitorController");

router.get("/fetch-visitors", fetchVisitors);
router.post("/add-visitor", addVisitor);
router.get("/fetch-external-companies", fetchExternalCompanies);
router.patch("/update-visitor/:visitorId", updateVisitor);

module.exports = router;

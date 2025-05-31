const router = require("express").Router();
const {
  fetchVisitors,
  addVisitor,
  updateVisitor,
  fetchExternalCompanies,
  fetchTeamMembers,
} = require("../controllers/visitorControllers/visitorController");

router.get("/fetch-visitors", fetchVisitors);
router.get("/fetch-team-members", fetchTeamMembers);
router.post("/add-visitor", addVisitor);
router.get("/fetch-external-companies", fetchExternalCompanies);
router.patch("/update-visitor/:visitorId", updateVisitor);

module.exports = router;

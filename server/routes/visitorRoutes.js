const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
  fetchVisitors,
  addVisitor,
  updateVisitor,
  fetchExternalCompanies,
  fetchTeamMembers,
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
  addVisitor
);
router.get("/fetch-external-companies", fetchExternalCompanies);
router.patch("/update-visitor/:visitorId", updateVisitor);

module.exports = router;

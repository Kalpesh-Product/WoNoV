const router = require("express").Router();
const upload = require("../config/multerConfig");

const {
  createTemplate,
  getTemplate,
  editTemplate,
  getTemplates,
  getInActiveTemplates,
  activateTemplate,
  getInActiveTemplate,
  createWebsiteTemplate,
} = require("../controllers/websiteControllers/websiteTemplateControllers");

router.post("/create-website", upload.any(), createTemplate);
router.post("/create-website-template", createWebsiteTemplate);
router.patch("/edit-website", upload.any(), editTemplate);
router.patch("/activate-website", activateTemplate);
router.get("/get-website/:company", getTemplate);
router.get("/get-websites", getTemplates);
router.get("/get-inactive-website", getInActiveTemplate);
router.get("/get-inactive-websites", getInActiveTemplates);

module.exports = router;

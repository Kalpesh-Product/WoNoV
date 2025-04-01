const router = require("express").Router();
const {createTemplates,
    saveEditor,
    loadPage,
    getTemplates,
    deletePage,
    deleteTemplate,
    addPage,
    getPages} = require("../controllers/websiteControllers/websiteController")

//get fucntions
router.post("/createTemplate", createTemplates)
router.post('/save', saveEditor)
router.get('/load/:templateName/:pageName',loadPage)
router.get('/templates',getTemplates)
router.get('/templates/:templateName', getPages)
router.delete('/deletePage/:templateName/:pageName',deletePage)
router.delete('/deletePage/:templateName',deleteTemplate)
router.post('/templates/:templateName/addPage', addPage)

module.exports = router
const router = require("express").Router();
const {
    addDesignation
} = require("../controllers/designationsControllers/designationsController");

router.post("/add-designation", addDesignation)

module.exports = router;
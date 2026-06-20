const {
  addPrintout,
  editPrintout,
  getPrintouts,
} = require("../controllers/printoutControllers");

const router = require("express").Router();

router.post("/", addPrintout);
router.patch("/:id", editPrintout);
router.get("/:id?", getPrintouts);

module.exports = router;

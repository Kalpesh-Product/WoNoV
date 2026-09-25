const {
  addPrintout,
  deletePrintout,
  editPrintout,
  getPrintouts,
  restorePrintout,
} = require("../controllers/printoutControllers");

const router = require("express").Router();

router.post("/", addPrintout);
router.patch("/:id", editPrintout);
router.patch("/:id/restore", restorePrintout);
router.delete("/:id", deletePrintout);
router.get("/:id?", getPrintouts);

module.exports = router;

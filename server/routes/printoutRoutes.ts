import { Router } from "express";
import {
  addPrintout,
  editPrintout,
  getPrintouts,
} from "../controllers/printoutControllers";

const router = Router();

router.post("/", addPrintout);
router.patch("/:id", editPrintout);
router.get("/:id?", getPrintouts);

export default router;

import { Router } from "express";
import * as referenceController from "@/controllers/reference.controller.js";

const router = Router();

router.get("/", referenceController.getAllReferensiPaginated);
router.get('/search', referenceController.searchReferensi);
// router.get('/public', referenceController.getPublicReferensi);
router.get("/:id", referenceController.getReferenceById);
router.post("/", referenceController.createReference);
router.put("/:id", referenceController.updateReference);
router.delete("/:id", referenceController.deleteReference);

export default router;

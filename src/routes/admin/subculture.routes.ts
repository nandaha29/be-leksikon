import express from "express";
import * as subcultureController from "../../controllers/subculture.controller.js";

const router = express.Router();

router.get("/", subcultureController.getAllSubcultures);
router.get("/:id", subcultureController.getSubcultureById);
router.post("/", subcultureController.createSubculture);
router.put("/:id", subcultureController.updateSubculture);
router.delete("/:id", subcultureController.deleteSubculture);

router
  .route('/:id/assets')
  .get(subcultureController.getSubcultureAssets)
  .post(subcultureController.addAssetToSubculture);

router
  .route('/:id/assets/:assetId')
  .delete(subcultureController.removeAssetFromSubculture);

export default router;

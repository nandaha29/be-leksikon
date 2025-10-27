import express from "express";
import * as subcultureController from "../../controllers/subculture.controller.js";

const router = express.Router();

router.get("/", subcultureController.getAllSubculturesPaginated);
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

  // 🔹 Tambahkan route baru ini
// router.get("/culture/:culture_id/subcultures", subcultureController.getSubculturesByCulture);
router.get("/:cultureId/subcultures", subcultureController.getSubculturesByCulture);

export default router;

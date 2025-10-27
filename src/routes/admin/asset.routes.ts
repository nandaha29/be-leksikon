import { Router } from 'express';
import multer from 'multer';
import * as assetController from '@/controllers/asset.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory for upload to blob

// Admin
router.get('/', assetController.getAllAssetsPaginated);
router.get('/search', assetController.searchAssets);
router.get('/:id', assetController.getAssetById);
router.post('/upload', upload.single('file'), assetController.createAsset);
router.put('/:id', upload.single('file'), assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);
router.post('/bulk-upload', upload.array('files'), assetController.bulkUploadAssets);


// Public SCHEMA BELUM ADA STATUS PUBLIC APA BELUM
// router.get('/public/assets/:id/file', assetController.getPublicAssetFile);

export default router;

import { Router } from 'express';
import * as cultureController from '@/controllers/culture.controller.js';

const router = Router();

// Route for getting all and creating new
router
  .route('/')
  .get(cultureController.getAllCulturesPaginated)
  .post(cultureController.createCulture);

// Route for getting, updating, and deleting by ID
router
  .route('/:id')
  .get(cultureController.getCultureById)
  .put(cultureController.updateCulture)
  .delete(cultureController.deleteCulture);

export default router;
import { Router } from 'express';
import * as domainController from '@/controllers/domainKodifikasi.controller.js';

const router = Router();

// Route for getting all and creating new domains
router
  .route('/')
  .get(domainController.getDomains)
  .post(domainController.createDomain);

// Route for getting, updating, and deleting by ID
router
  .route('/:id')
  .get(domainController.getDomainById)
  .put(domainController.updateDomain)
  .delete(domainController.deleteDomain);

export default router;
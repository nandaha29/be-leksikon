import { Router } from 'express';
import * as contributorController from '@/controllers/contributor.controller.js';

const router = Router();

router.get('/search', contributorController.searchContributors);
router.get('/', contributorController.getContributors);
router.get('/:id', contributorController.getContributorById);
router.post('/', contributorController.createContributor);
router.put('/:id', contributorController.updateContributor);
router.delete('/:id', contributorController.deleteContributor);


export default router;

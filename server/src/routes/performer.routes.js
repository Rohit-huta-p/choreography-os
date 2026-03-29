import { Router } from 'express';
import * as performerController from '../controllers/performer.controller.js';
import auth from '../middleware/auth.js';
import ownership from '../middleware/ownership.js';

const router = Router();

router.use(auth);

router.post('/:id/performers', ownership, performerController.create);
router.patch('/:id/performers/:perfId', ownership, performerController.update);
router.delete('/:id/performers/:perfId', ownership, performerController.remove);

export default router;

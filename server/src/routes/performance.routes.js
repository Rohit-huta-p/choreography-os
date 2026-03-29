import { Router } from 'express';
import * as performanceController from '../controllers/performance.controller.js';
import auth from '../middleware/auth.js';
import ownership from '../middleware/ownership.js';

const router = Router();

router.use(auth);

router.post('/:id/performances', ownership, performanceController.create);
router.patch('/:id/performances/:perfId', ownership, performanceController.update);
router.delete('/:id/performances/:perfId', ownership, performanceController.remove);

export default router;

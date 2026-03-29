import { Router } from 'express';
import * as showflowController from '../controllers/showflow.controller.js';
import auth from '../middleware/auth.js';
import ownership from '../middleware/ownership.js';

const router = Router();

router.use(auth);

router.get('/:id/showflow', ownership, showflowController.get);
router.put('/:id/showflow', ownership, showflowController.replace);
router.patch('/:id/showflow/entries/:entryIndex', ownership, showflowController.updateEntry);

export default router;

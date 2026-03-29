import { Router } from 'express';
import * as propController from '../controllers/prop.controller.js';
import auth from '../middleware/auth.js';
import ownership from '../middleware/ownership.js';

const router = Router();

router.use(auth);

router.post('/:id/props', ownership, propController.create);
router.patch('/:id/props/:propId', ownership, propController.update);
router.delete('/:id/props/:propId', ownership, propController.remove);

export default router;

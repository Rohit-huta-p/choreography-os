import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import auth from '../middleware/auth.js';
import ownership from '../middleware/ownership.js';

const router = Router();

router.use(auth);

router.get('/', projectController.list);
router.post('/', projectController.create);
router.get('/:id', ownership, projectController.getById);
router.patch('/:id', ownership, projectController.update);
router.delete('/:id', ownership, projectController.remove);
router.post('/:id/duplicate', ownership, projectController.duplicate);

export default router;

import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import auth from '../middleware/auth.js';
import ownership from '../middleware/ownership.js';

const router = Router();

router.use(auth);

router.post('/:id/tasks', ownership, taskController.create);
router.patch('/:id/tasks/:taskId', ownership, taskController.update);
router.delete('/:id/tasks/:taskId', ownership, taskController.remove);

export default router;

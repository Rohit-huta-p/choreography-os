import { Router } from 'express';
import * as canvasController from '../controllers/canvas.controller.js';
import auth from '../middleware/auth.js';
import ownership from '../middleware/ownership.js';
import { canvasBatchLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(auth);

router.get('/:id/canvas-objects', ownership, canvasController.list);
router.post('/:id/canvas-objects', ownership, canvasController.create);
router.patch('/:id/canvas-objects/batch', ownership, canvasBatchLimiter, canvasController.batchUpdate);
router.patch('/:id/canvas-objects/:objectId', ownership, canvasController.update);
router.delete('/:id/canvas-objects/:objectId', ownership, canvasController.remove);

export default router;

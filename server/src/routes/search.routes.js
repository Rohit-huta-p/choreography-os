import { Router } from 'express';
import * as searchController from '../controllers/search.controller.js';
import auth from '../middleware/auth.js';
import ownership from '../middleware/ownership.js';
import { searchLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(auth);

router.get('/:id/search', ownership, searchLimiter, searchController.search);

export default router;

import { z } from 'zod';
import * as performanceService from '../services/performance.service.js';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  songs: z
    .array(z.object({ name: z.string(), artist: z.string().optional(), duration_seconds: z.number().optional() }))
    .optional(),
  status: z.enum(['NOT_STARTED', 'TEACHING', 'ALMOST_DONE', 'DONE']).optional(),
  notes: z.string().max(5000).optional(),
  color_tag: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  songs: z
    .array(z.object({ name: z.string(), artist: z.string().optional(), duration_seconds: z.number().optional() }))
    .optional(),
  status: z.enum(['NOT_STARTED', 'TEACHING', 'ALMOST_DONE', 'DONE']).optional(),
  notes: z.string().max(5000).optional(),
  performer_ids: z.array(z.string()).optional(),
  prop_ids: z.array(z.string()).optional(),
  color_tag: z.string().nullable().optional(),
});

export const create = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const perf = await performanceService.create(req.params.id, data);
    res.status(201).json({ performance: perf });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const perf = await performanceService.update(req.params.perfId, data);
    res.json({ performance: perf });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await performanceService.remove(req.params.perfId);
    res.json({ message: 'Performance deleted' });
  } catch (err) {
    next(err);
  }
};

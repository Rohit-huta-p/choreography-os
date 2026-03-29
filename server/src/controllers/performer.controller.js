import { z } from 'zod';
import * as performerService from '../services/performer.service.js';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().max(100).optional(),
  contact: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.string().max(100).nullable().optional(),
  contact: z.string().max(200).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export const create = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const performer = await performerService.create(req.params.id, data);
    res.status(201).json({ performer });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const performer = await performerService.update(req.params.perfId, data);
    res.json({ performer });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await performerService.remove(req.params.perfId);
    res.json({ message: 'Performer deleted' });
  } catch (err) {
    next(err);
  }
};

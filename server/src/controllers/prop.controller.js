import { z } from 'zod';
import * as propService from '../services/prop.service.js';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(1).optional(),
  status: z.enum(['PENDING', 'ACQUIRED']).optional(),
  performance_ids: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  quantity: z.number().int().min(1).optional(),
  status: z.enum(['PENDING', 'ACQUIRED']).optional(),
  performance_ids: z.array(z.string()).optional(),
});

export const create = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const prop = await propService.create(req.params.id, data);
    res.status(201).json({ prop });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const prop = await propService.update(req.params.propId, data);
    res.json({ prop });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await propService.remove(req.params.propId);
    res.json({ message: 'Prop deleted' });
  } catch (err) {
    next(err);
  }
};

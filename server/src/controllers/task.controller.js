import { z } from 'zod';
import * as taskService from '../services/task.service.js';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  tasks: z
    .array(z.object({ text: z.string().min(1).max(500), completed: z.boolean().optional(), order: z.number().int() }))
    .optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  tasks: z
    .array(z.object({ text: z.string().min(1).max(500), completed: z.boolean().optional(), order: z.number().int() }))
    .optional(),
});

export const create = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const task = await taskService.create(req.params.id, data);
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const task = await taskService.update(req.params.taskId, data);
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await taskService.remove(req.params.taskId);
    res.json({ message: 'Task block deleted' });
  } catch (err) {
    next(err);
  }
};

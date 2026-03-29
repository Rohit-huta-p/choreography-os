import { z } from 'zod';
import * as showflowService from '../services/showflow.service.js';

const entrySchema = z.object({
  performance_id: z.string(),
  duration_minutes: z.number().min(0).optional(),
  transition_notes: z.string().max(1000).optional(),
  order: z.number().int().min(0),
});

const replaceSchema = z.object({
  entries: z.array(entrySchema),
});

const updateEntrySchema = z.object({
  duration_minutes: z.number().min(0).optional(),
  transition_notes: z.string().max(1000).nullable().optional(),
});

export const get = async (req, res, next) => {
  try {
    const showFlow = await showflowService.get(req.params.id);
    res.json({ showFlow });
  } catch (err) {
    next(err);
  }
};

export const replace = async (req, res, next) => {
  try {
    const data = replaceSchema.parse(req.body);
    const showFlow = await showflowService.replace(req.params.id, data.entries);
    res.json({ showFlow });
  } catch (err) {
    next(err);
  }
};

export const updateEntry = async (req, res, next) => {
  try {
    const data = updateEntrySchema.parse(req.body);
    const entryIndex = parseInt(req.params.entryIndex, 10);
    const showFlow = await showflowService.updateEntry(req.params.id, entryIndex, data);
    res.json({ showFlow });
  } catch (err) {
    next(err);
  }
};

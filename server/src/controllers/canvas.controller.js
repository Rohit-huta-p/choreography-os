import { z } from 'zod';
import * as canvasService from '../services/canvas.service.js';

const createSchema = z.object({
  type: z.enum(['performance', 'roster', 'props_board', 'show_flow', 'task']),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  size: z.object({ width: z.number(), height: z.number() }).optional(),
});

const updateSchema = z.object({
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  size: z.object({ width: z.number(), height: z.number() }).optional(),
  z_index: z.number().optional(),
  collapsed: z.boolean().optional(),
});

const batchSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      position: z.object({ x: z.number(), y: z.number() }),
    })
  ),
});

export const list = async (req, res, next) => {
  try {
    const objects = await canvasService.getCanvasObjects(req.params.id);
    res.json({ canvasObjects: objects });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const result = await canvasService.createCanvasObject(req.params.id, data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const obj = await canvasService.updateCanvasObject(req.params.objectId, data);
    res.json({ canvasObject: obj });
  } catch (err) {
    next(err);
  }
};

export const batchUpdate = async (req, res, next) => {
  try {
    const data = batchSchema.parse(req.body);
    await canvasService.batchUpdatePositions(data.updates);
    res.json({ message: 'Batch update successful' });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await canvasService.deleteCanvasObject(req.params.objectId);
    res.json({ message: 'Canvas object deleted' });
  } catch (err) {
    next(err);
  }
};

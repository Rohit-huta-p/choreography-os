import { z } from 'zod';
import * as projectService from '../services/project.service.js';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  event_date: z.string().datetime().optional(),
  template: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  event_date: z.string().datetime().nullable().optional(),
});

export const list = async (req, res, next) => {
  try {
    const projects = await projectService.listProjects(req.user.id);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const project = await projectService.createProject(req.user.id, data);
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await projectService.getProjectFull(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const project = await projectService.updateProject(req.params.id, data);
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await projectService.softDeleteProject(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

export const duplicate = async (req, res, next) => {
  try {
    const project = await projectService.duplicateProject(req.user.id, req.params.id);
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

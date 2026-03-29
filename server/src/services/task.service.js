import Task from '../models/Task.js';
import CanvasObject from '../models/CanvasObject.js';
import AppError from '../utils/AppError.js';

export const create = async (projectId, data) => {
  return Task.create({ project_id: projectId, ...data });
};

export const update = async (taskId, updates) => {
  const task = await Task.findByIdAndUpdate(taskId, updates, { new: true, runValidators: true });
  if (!task) throw new AppError('Task block not found', 404);
  return task;
};

export const remove = async (taskId) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) throw new AppError('Task block not found', 404);
  await CanvasObject.deleteOne({ reference_id: taskId });
  return task;
};

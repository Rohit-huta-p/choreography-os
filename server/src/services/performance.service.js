import Performance from '../models/Performance.js';
import CanvasObject from '../models/CanvasObject.js';
import AppError from '../utils/AppError.js';

export const create = async (projectId, data) => {
  return Performance.create({ project_id: projectId, ...data });
};

export const update = async (perfId, updates) => {
  const perf = await Performance.findByIdAndUpdate(perfId, updates, { new: true, runValidators: true });
  if (!perf) throw new AppError('Performance not found', 404);
  return perf;
};

export const remove = async (perfId) => {
  const perf = await Performance.findByIdAndDelete(perfId);
  if (!perf) throw new AppError('Performance not found', 404);
  await CanvasObject.deleteOne({ reference_id: perfId });
  return perf;
};

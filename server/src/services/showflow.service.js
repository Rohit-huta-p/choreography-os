import ShowFlow from '../models/ShowFlow.js';
import AppError from '../utils/AppError.js';

export const get = async (projectId) => {
  let showFlow = await ShowFlow.findOne({ project_id: projectId });
  if (!showFlow) {
    showFlow = await ShowFlow.create({ project_id: projectId, entries: [] });
  }
  return showFlow;
};

export const replace = async (projectId, entries) => {
  const showFlow = await ShowFlow.findOneAndUpdate(
    { project_id: projectId },
    { entries },
    { new: true, upsert: true, runValidators: true }
  );
  return showFlow;
};

export const updateEntry = async (projectId, entryIndex, updates) => {
  const showFlow = await ShowFlow.findOne({ project_id: projectId });
  if (!showFlow) throw new AppError('Show flow not found', 404);
  if (entryIndex < 0 || entryIndex >= showFlow.entries.length) {
    throw new AppError('Entry index out of range', 400);
  }

  Object.assign(showFlow.entries[entryIndex], updates);
  await showFlow.save();
  return showFlow;
};

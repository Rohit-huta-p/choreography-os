import Performer from '../models/Performer.js';
import Performance from '../models/Performance.js';
import CanvasObject from '../models/CanvasObject.js';
import AppError from '../utils/AppError.js';

export const create = async (projectId, data) => {
  return Performer.create({ project_id: projectId, ...data });
};

export const update = async (performerId, updates) => {
  const performer = await Performer.findByIdAndUpdate(performerId, updates, { new: true, runValidators: true });
  if (!performer) throw new AppError('Performer not found', 404);
  return performer;
};

export const remove = async (performerId) => {
  const performer = await Performer.findByIdAndDelete(performerId);
  if (!performer) throw new AppError('Performer not found', 404);

  // Remove from all performances
  await Performance.updateMany(
    { performer_ids: performerId },
    { $pull: { performer_ids: performerId } }
  );

  return performer;
};

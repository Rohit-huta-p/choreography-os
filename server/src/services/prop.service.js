import Prop from '../models/Prop.js';
import Performance from '../models/Performance.js';
import AppError from '../utils/AppError.js';

export const create = async (projectId, data) => {
  return Prop.create({ project_id: projectId, ...data });
};

export const update = async (propId, updates) => {
  const prop = await Prop.findByIdAndUpdate(propId, updates, { new: true, runValidators: true });
  if (!prop) throw new AppError('Prop not found', 404);
  return prop;
};

export const remove = async (propId) => {
  const prop = await Prop.findByIdAndDelete(propId);
  if (!prop) throw new AppError('Prop not found', 404);

  // Remove from all performances
  await Performance.updateMany(
    { prop_ids: propId },
    { $pull: { prop_ids: propId } }
  );

  return prop;
};

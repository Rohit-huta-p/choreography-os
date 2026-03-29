import CanvasObject from '../models/CanvasObject.js';
import Performance from '../models/Performance.js';
import Performer from '../models/Performer.js';
import Prop from '../models/Prop.js';
import ShowFlow from '../models/ShowFlow.js';
import Task from '../models/Task.js';
import AppError from '../utils/AppError.js';

const entityModelMap = {
  performance: Performance,
  roster: Performer,
  props_board: Prop,
  show_flow: ShowFlow,
  task: Task,
};

export const getCanvasObjects = async (projectId) => {
  return CanvasObject.find({ project_id: projectId });
};

export const createCanvasObject = async (projectId, { type, position, size }) => {
  let referenceDoc;

  switch (type) {
    case 'performance':
      referenceDoc = await Performance.create({ project_id: projectId, title: 'New Performance' });
      break;
    case 'roster':
      // Roster is a virtual container — create a placeholder performer doc
      referenceDoc = await Performer.create({ project_id: projectId, name: '__roster__' });
      break;
    case 'props_board':
      referenceDoc = await Prop.create({ project_id: projectId, name: '__props_board__' });
      break;
    case 'show_flow':
      referenceDoc = await ShowFlow.create({ project_id: projectId, entries: [] });
      break;
    case 'task':
      referenceDoc = await Task.create({ project_id: projectId, title: 'New Checklist', tasks: [] });
      break;
    default:
      throw new AppError(`Invalid block type: ${type}`, 400);
  }

  const canvasObj = await CanvasObject.create({
    project_id: projectId,
    type,
    position: position || { x: 100, y: 100 },
    size: size || { width: 300, height: 200 },
    reference_id: referenceDoc._id,
  });

  return { canvasObject: canvasObj, entity: referenceDoc };
};

export const updateCanvasObject = async (objectId, updates) => {
  const allowed = ['position', 'size', 'z_index', 'collapsed'];
  const filtered = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }

  const obj = await CanvasObject.findByIdAndUpdate(objectId, filtered, { new: true });
  if (!obj) throw new AppError('Canvas object not found', 404);
  return obj;
};

export const batchUpdatePositions = async (updates) => {
  const ops = updates.map(({ id, position }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { position } },
    },
  }));
  await CanvasObject.bulkWrite(ops);
};

export const deleteCanvasObject = async (objectId) => {
  const obj = await CanvasObject.findById(objectId);
  if (!obj) throw new AppError('Canvas object not found', 404);

  // Delete the referenced entity
  const Model = entityModelMap[obj.type];
  if (Model) {
    await Model.findByIdAndDelete(obj.reference_id);
  }

  await CanvasObject.findByIdAndDelete(objectId);
  return obj;
};

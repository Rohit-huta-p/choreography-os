import Performance from '../models/Performance.js';
import Performer from '../models/Performer.js';
import Prop from '../models/Prop.js';
import Task from '../models/Task.js';
import CanvasObject from '../models/CanvasObject.js';

export const search = async (projectId, query) => {
  if (!query || query.trim().length === 0) return [];

  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [performances, performers, props, tasks, canvasObjects] = await Promise.all([
    Performance.find({ project_id: projectId, title: regex }),
    Performer.find({ project_id: projectId, name: regex }),
    Prop.find({ project_id: projectId, name: regex }),
    Task.find({ project_id: projectId, $or: [{ title: regex }, { 'tasks.text': regex }] }),
    CanvasObject.find({ project_id: projectId }),
  ]);

  const objectMap = new Map();
  for (const co of canvasObjects) {
    objectMap.set(co.reference_id.toString(), co);
  }

  const results = [];

  for (const p of performances) {
    const co = objectMap.get(p._id.toString());
    results.push({ type: 'performance', id: p._id, title: p.title, canvasObjectId: co?._id, position: co?.position });
  }
  for (const p of performers) {
    results.push({ type: 'performer', id: p._id, title: p.name });
  }
  for (const p of props) {
    const co = objectMap.get(p._id.toString());
    results.push({ type: 'prop', id: p._id, title: p.name, canvasObjectId: co?._id, position: co?.position });
  }
  for (const t of tasks) {
    const co = objectMap.get(t._id.toString());
    results.push({ type: 'task', id: t._id, title: t.title, canvasObjectId: co?._id, position: co?.position });
  }

  return results;
};

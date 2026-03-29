import Project from '../models/Project.js';
import CanvasObject from '../models/CanvasObject.js';
import Performance from '../models/Performance.js';
import Performer from '../models/Performer.js';
import Prop from '../models/Prop.js';
import ShowFlow from '../models/ShowFlow.js';
import Task from '../models/Task.js';
import AppError from '../utils/AppError.js';

export const listProjects = async (userId) => {
  return Project.find({ user_id: userId, is_deleted: false }).sort({ updated_at: -1 });
};

export const createProject = async (userId, { title, event_date }) => {
  return Project.create({ user_id: userId, title, event_date });
};

export const getProjectFull = async (projectId) => {
  const [project, canvasObjects, performances, performers, props, showFlow, tasks] =
    await Promise.all([
      Project.findById(projectId),
      CanvasObject.find({ project_id: projectId }),
      Performance.find({ project_id: projectId }),
      Performer.find({ project_id: projectId }),
      Prop.find({ project_id: projectId }),
      ShowFlow.findOne({ project_id: projectId }),
      Task.find({ project_id: projectId }),
    ]);

  if (!project) throw new AppError('Project not found', 404);

  return { project, canvasObjects, performances, performers, props, showFlow, tasks };
};

export const updateProject = async (projectId, updates) => {
  const project = await Project.findByIdAndUpdate(projectId, updates, { new: true, runValidators: true });
  if (!project) throw new AppError('Project not found', 404);
  return project;
};

export const softDeleteProject = async (projectId) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { is_deleted: true, deleted_at: new Date() },
    { new: true }
  );
  if (!project) throw new AppError('Project not found', 404);
  return project;
};

export const duplicateProject = async (userId, projectId) => {
  const source = await getProjectFull(projectId);

  const newProject = await Project.create({
    user_id: userId,
    title: `${source.project.title} (Copy)`,
    event_date: source.project.event_date,
  });

  const performerMap = new Map();
  for (const p of source.performers) {
    const newP = await Performer.create({
      project_id: newProject._id,
      name: p.name,
      role: p.role,
      contact: p.contact,
      notes: p.notes,
    });
    performerMap.set(p._id.toString(), newP._id);
  }

  const propMap = new Map();
  for (const p of source.props) {
    const newP = await Prop.create({
      project_id: newProject._id,
      name: p.name,
      quantity: p.quantity,
      status: 'PENDING',
      performance_ids: [],
    });
    propMap.set(p._id.toString(), newP._id);
  }

  const perfMap = new Map();
  for (const p of source.performances) {
    const newPerf = await Performance.create({
      project_id: newProject._id,
      title: p.title,
      songs: p.songs,
      status: 'NOT_STARTED',
      notes: p.notes,
      performer_ids: p.performer_ids.map((id) => performerMap.get(id.toString())).filter(Boolean),
      prop_ids: p.prop_ids.map((id) => propMap.get(id.toString())).filter(Boolean),
      color_tag: p.color_tag,
    });
    perfMap.set(p._id.toString(), newPerf._id);
  }

  // Update prop -> performance links
  for (const p of source.props) {
    const newPropId = propMap.get(p._id.toString());
    const newPerfIds = p.performance_ids.map((id) => perfMap.get(id.toString())).filter(Boolean);
    if (newPerfIds.length > 0) {
      await Prop.findByIdAndUpdate(newPropId, { performance_ids: newPerfIds });
    }
  }

  if (source.showFlow) {
    await ShowFlow.create({
      project_id: newProject._id,
      entries: source.showFlow.entries.map((e) => ({
        performance_id: perfMap.get(e.performance_id?.toString()),
        duration_minutes: e.duration_minutes,
        transition_notes: e.transition_notes,
        order: e.order,
      })),
    });
  }

  for (const t of source.tasks) {
    await Task.create({
      project_id: newProject._id,
      title: t.title,
      tasks: t.tasks.map((item) => ({ text: item.text, completed: false, order: item.order })),
    });
  }

  // Duplicate canvas objects with updated reference_ids
  const refMap = new Map([...perfMap, ...performerMap, ...propMap]);
  for (const co of source.canvasObjects) {
    const newRefId = refMap.get(co.reference_id?.toString());
    if (newRefId) {
      await CanvasObject.create({
        project_id: newProject._id,
        type: co.type,
        position: co.position,
        size: co.size,
        z_index: co.z_index,
        collapsed: co.collapsed,
        reference_id: newRefId,
      });
    }
  }

  return newProject;
};

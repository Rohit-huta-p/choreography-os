import Project from '../models/Project.js';
import AppError from '../utils/AppError.js';

const ownership = async (req, res, next) => {
  const projectId = req.params.id || req.params.projectId;
  if (!projectId) {
    return next(new AppError('Project ID required', 400));
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }
  if (project.user_id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this project', 403));
  }
  if (project.is_deleted) {
    return next(new AppError('Project has been deleted', 404));
  }

  req.project = project;
  next();
};

export default ownership;

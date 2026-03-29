import AppError from '../utils/AppError.js';

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(
      Object.assign(new AppError('Validation failed', 400), {
        name: 'VALIDATION_ERROR',
        details,
      })
    );
  }
  req.validated = result.data;
  next();
};

export default validate;

import * as searchService from '../services/search.service.js';

export const search = async (req, res, next) => {
  try {
    const results = await searchService.search(req.params.id, req.query.q);
    res.json({ results });
  } catch (err) {
    next(err);
  }
};

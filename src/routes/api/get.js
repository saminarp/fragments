// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const fragments = await Fragment.byUser(req.user, req.query.expand);
    logger.info('GET request for fragments data: ', { user: req.user, fragments });
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (error) {
    logger.error(error);
    res.status(500).json(createErrorResponse(error));
  }
};

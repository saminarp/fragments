// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byUser(req.user, false);
    logger.info('GET request for fragment data: ', { user: req.user, fragment });
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error(error);
    res.status(500).json(createErrorResponse(error));
  }
};

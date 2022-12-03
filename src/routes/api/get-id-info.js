const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    if (!fragment) return res.status(404).json(createErrorResponse(404, 'Not Found'));
    res.status(200).json(createSuccessResponse({ fragment: fragment })); // returns Fragment Metadata
  } catch (err) {
    logger.error({ err }, 'Error getting fragment by id');
    res.status(404).json(createErrorResponse(404, 'Error getting fragment information'));
  }
};

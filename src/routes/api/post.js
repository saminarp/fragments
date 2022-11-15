const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const API_URL = process.env.API_URL || 'http://localhost:8080';

module.exports = async (req, res) => {
  try {
    const fragment = new Fragment({
      ownerId: req.user,
      type: req.get('Content-Type'),
      size: Buffer.byteLength(req.body),
    });
    await fragment.save();
    await fragment.setData(req.body);
    logger.info(`Created fragment data for user ${req.user}`, { fragment });
    res.set('Location', `${API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error('Fragment cannot be created due to ' + error);
    return res.status(500).json(createErrorResponse(500, error.message));
  }
};
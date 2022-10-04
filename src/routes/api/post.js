const { createSuccessResponse, createErrorResponse } = require('../../response');

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const fragment = new Fragment({ ownerId: req.user, type: req.get('Content-Type') });
    await fragment.save();
    //logger.info('BODY: ' + req.body);
    await fragment.setData(req.body);
    res.status(201).json(createSuccessResponse(fragment));
    logger.info(`Created ID:${fragment.id}`);
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message));
  }
};

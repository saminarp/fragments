const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    if (!fragment) {
      res.status(404).json(createErrorResponse('Fragment not found'));
      logger.error(`Fragment not found: ${req.params.id}`);
      throw new Error(`Fragment not found: ${req.params.id}`);
      //check if reg.params.id is null
    } else {
      const location = (`Location`, `${process.env.API_URL}/v1/fragments/${fragment.id}`);
      logger.info(`Fragment location: ${location}`);
    }
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message));
    logger.error(`Error fetching fragment: ${error.message}`);
  }
};

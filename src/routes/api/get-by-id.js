const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    const fragmentData = await fragment.getData().then((data) => data.toString());
    res
      .status(200)
      .json(
        createSuccessResponse({ size: fragment.size, type: fragment.type, data: fragmentData })
      );
  } catch (err) {
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    logger.error('Fragment not found: ' + err);
  }
};

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const md = require('markdown-it')();
module.exports = async (req, res) => {
  // extract the fragment ID from the request
  let id = req.params.id;
  let ext = id.split('.').pop();
  id = id.split('.').shift();
  // Supported Content-Types
  const contentType =
    ext === 'txt'
      ? 'text/plain'
      : ext === 'md'
      ? 'text/markdown'
      : ext === 'html'
      ? 'text/html'
      : ext === 'json'
      ? 'application/json'
      : '';

  logger.debug(`GET /api/fragment/${id} (contentType=${contentType})`);
  logger.debug(`ID IS ${req.user}, params are ${JSON.stringify(id)}`);
  try {
    const fragment = await Fragment.byId(req.user, id);
    const fragmentData = await fragment.getData();

    if (contentType) {
      let type = md.render(fragmentData.toString());
      res.status(200).setHeader('Content-Type', contentType).send(type);
    } else {
      res.set('Content-Type', fragment.type);
      res.status(200).send(fragmentData);
      logger.info(
        createSuccessResponse({
          fragment: fragmentData,
          contentType: fragment.type,
        })
      );
    }
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
    logger.error('Fragment not found: ' + error);
  }
};

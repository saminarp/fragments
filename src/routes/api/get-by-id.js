const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  let id = req.params.id;
  let ext = id.split('.').pop();
  id = id.split('.').shift();

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
      let type = require('markdown-it')().render(fragmentData.toString());
      res.setHeader('Content-Type', contentType);
      res.status(200).send(type);
    } else {
      res.set('Content-Type', fragment.type);
      res.status(200).send(fragmentData);
      logger.info(
        createSuccessResponse({
          fragment: fragmentData,
          contentType: fragment.type,
        })
      );
      return;
    }
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
    logger.error('Fragment not found: ' + error);
  }
};

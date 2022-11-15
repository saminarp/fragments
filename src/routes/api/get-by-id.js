const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  const id = req.params.id;
  const ext = id.indexOf('.') > -1 ? id.substring(id.lastIndexOf('.')) : '';
  const fragmentId = id.substring(0, id.length - ext.length);

  try {
    const fragment = await Fragment.byId(req.user, fragmentId);

    switch (ext) {
      // Extension not specified, return the default format (text/plain)
      case '': {
        const rawData = await fragment.getData();
        res.set('Content-Type', fragment.type);
        return res.status(200).send(rawData);
      }

      default: {
        // extension specified, proceed to convert to the specified format
        const { convertedData, mimeType } = await fragment.convertedData(ext);
        if (!fragment.formats.includes(ext))
          return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));

        logger.debug(createSuccessResponse({ data: convertedData, mimeType }));
        res.set('Content-Type', mimeType);
        res.setHeader('content-length', fragment.size);
        return res.status(200).send(convertedData);
      }
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const path = require('path');

module.exports = async (req, res) => {
  const ext = path.extname(req.params.id);
  const fragmentId = path.basename(req.params.id, ext);

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

        //res.set('Content-Type', mimeType);
        res.type(mimeType);
        res.setHeader('content-length', fragment.size);
        return res.status(200).send(convertedData);
      }
    }
  } catch (error) {
    logger.error(error);
    return res.status(404).json(createErrorResponse(415, 'Unsupported Media Type'));
  }
};

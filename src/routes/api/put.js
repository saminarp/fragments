const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    if (req.get('Content-Type') !== fragment.type) {
      logger.warn(
        "Error - Bad Request: Content-Type of the request does not match the existing fragment's type"
      );
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            "Content-Type of the request must match the existing fragment's type"
          )
        );
    }

    await fragment.setData(req.body);
    await fragment.save();

    fragment.toJSON = () => {
      return {
        id: fragment.id,
        created: fragment.created,
        updated: fragment.updated,
        size: fragment.size,
        type: fragment.type,
        // formats function is returning an array of accepted content types
        formats: fragment.formats,
      };
    };
    res.status(200).json(createSuccessResponse({ fragment: fragment }));
  } catch (err) {
    logger.error({ err }, 'Error getting fragment by id at PUT request');
    res.status(404).json(createErrorResponse(404, 'Error getting fragment id'));
  }
};

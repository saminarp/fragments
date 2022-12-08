const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const oldFragment = await Fragment.byId(req.user, req.params.id);

    if (req.get('Content-Type') !== oldFragment.type) {
      logger.error('Exited with Bad Request - Content-Type does not match existing fragment type');
      return res.status(400).json(createErrorResponse(400, 'Bad Request'));
    }

    const newFragment = new Fragment({
      ownerId: req.user,
      id: req.params.id,
      created: oldFragment.created,
      updated: new Date().toISOString(),
      type: req.get('Content-Type'),
    });

    await newFragment.save();
    await newFragment.setData(req.body);

    newFragment.toJSON = () => {
      return {
        id: newFragment.id,
        created: oldFragment.created, // created time (unchanged)
        updated: newFragment.updated, // updated time
        size: newFragment.size,
        type: oldFragment.type,
        formats: [newFragment.type], // array of fragment types
      };
    };

    res.status(200).json(createSuccessResponse({ newFragment: newFragment }));
  } catch (err) {
    logger.error({ err }, 'Error getting fragment by id');

    res.status(404).json(createErrorResponse(404, 'Error getting fragment information'));
  }
};

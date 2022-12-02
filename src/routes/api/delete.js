const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  const id = req.params.id;
  try {
    await Fragment.byId(req.user, id);
    await Fragment.delete(req.user, id);
    res.status(200).json(createSuccessResponse());
  } catch (err) {
    res.status(404).json(createErrorResponse(404, err.message));
  }
};

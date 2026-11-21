const renderApiGuide = require('../templates/apiGuideTemplate');
const { port } = require('../config');

function showApiGuide(req, res) {
  return res.type('html').send(renderApiGuide({ port }));
}

module.exports = { showApiGuide };

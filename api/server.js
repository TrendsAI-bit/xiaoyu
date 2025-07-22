const serve = require('serve');
const path = require('path');

module.exports = (req, res) => {
  serve(path.join(__dirname, '../dist'))(req, res);
};

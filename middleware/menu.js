const menuConfig = require('../config/menu');

module.exports = function(req, res, next) {
    // Make menuConfig available to all views
    res.locals.menuConfig = menuConfig;
    next();
}; 
var express = require('express');
var configurations = module.exports;
var app = express();
var server = require('http').createServer(app);
var nconf = require('nconf');
var settings = require('./settings')(app, configurations, express);
var whitelist = require('./whitelist');

nconf.argv().env().file({ file: 'local.json' });

/* Filters for routes */

var isLoggedIn = function(req, res, next) {
  if (req.session.email && whitelist.indexOf(req.session.email) > -1) {
    next();
  } else {
    res.status(400);
    next(new Error('Invalid login'));
  }
};

require('express-persona')(app, {
  audience: nconf.get('domain') + ':' + nconf.get('authPort')
});

app.use(function(req, res) {
  res.sendfile(__dirname + '/views/layout.jade');
});

// routes
require('./routes')(app, isLoggedIn);

app.listen(process.env.PORT || nconf.get('port'));

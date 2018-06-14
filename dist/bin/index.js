#!/usr/bin/env node
'use strict';

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.on('unhandledRejection', reason => {
  throw reason;
});

process.on('uncaughtException', error => {
  throw error;
});

// eslint-disable-next-line no-unused-expressions
_yargs2.default.env('USUS').commandDir('commands').help().wrap(80).argv;
//# sourceMappingURL=index.js.map
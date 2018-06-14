#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.builder = exports.baseConfiguration = exports.desc = exports.command = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _usus = require('../../usus');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const command = exports.command = 'render';
const desc = exports.desc = 'Renders page using Chrome Debugging Protocol. Extracts CSS used to render the page. Renders HTML with the blocking CSS made asynchronous. Inlines the critical CSS.';

const baseConfiguration = exports.baseConfiguration = {
  chromePort: {
    description: 'Port of an existing Chrome instance. See "Controlling the Chrome instance" in the ūsus cookbook.',
    type: 'number'
  },
  cookies: {
    description: 'Sets a cookie with the given cookie data. Must be provided as key=value pairs, e.g. foo=bar.',
    type: 'array'
  },
  delay: {
    default: 5000,
    description: 'Defines how many milliseconds to wait after the "load" event has been fired before capturing the styles used to load the page. This is important if resources appearing on the page are being loaded asynchronously.'
  },
  'deviceMetricsOverride.deviceScaleFactor': {
    default: 1,
    description: 'Overriding device scale factor value.',
    type: 'number'
  },
  'deviceMetricsOverride.fitWindow': {
    default: false,
    description: 'Whether a view that exceeds the available browser window area should be scaled down to fit.',
    type: 'boolean'
  },
  'deviceMetricsOverride.height': {
    default: 1080,
    description: 'Overriding width value in pixels (minimum 0, maximum 10000000).',
    type: 'number'
  },
  'deviceMetricsOverride.mobile': {
    default: false,
    description: 'Whether to emulate mobile device. This includes viewport meta tag, overlay scrollbars, text autosizing and more.',
    type: 'boolean'
  },
  'deviceMetricsOverride.width': {
    default: 1920,
    description: 'Overriding height value in pixels (minimum 0, maximum 10000000).',
    type: 'number'
  },
  extractStyles: {
    default: false,
    description: 'Extracts CSS used to render the page.',
    type: 'boolean'
  },
  inlineStyles: {
    default: false,
    description: 'Inlines the styles required to render the document.',
    type: 'boolean'
  },
  preloadFonts: {
    default: true,
    description: 'Adds rel=preload for all fonts required to render the page.',
    type: 'boolean'
  },
  preloadStyles: {
    default: true,
    description: 'Adds rel=preload for all styles removed from <head>. Used with inlineStyles=true.',
    type: 'boolean'
  }
};

// eslint-disable-next-line flowtype/no-weak-types
const builder = exports.builder = yargs => {
  yargs.options(Object.assign({}, baseConfiguration, {
    url: {
      demand: true,
      description: 'The URL to render.'
    }
  })).epilogue(`
Usage:

# Renders static HTML. Equivalent to https://prerender.io/.
$ usus render --url http://gajus.com/

# Extracts CSS used to render the page.
$ usus render --url http://gajus.com/ --extractStyles true

# Inlines styles required to render the page.
$ usus render --url http://gajus.com/ --inlineStyles true

# Use cookies when loading the page.
$ usus render --url http://gajus.com/ --cookies foo=bar,baz=qux

# Render emulating a mobile device (example is using iPhone 6 parameters).
$ usus render --url http://gajus.com/ --deviceMetricsOverride.deviceScaleFactor 2 --deviceMetricsOverride.fitWindow false --deviceMetricsOverride.height 1334 --deviceMetricsOverride.mobile true --deviceMetricsOverride.width 750
    `);
};

// eslint-disable-next-line flowtype/no-weak-types
const handler = exports.handler = (() => {
  var _ref = _asyncToGenerator(function* (argv) {
    const cookies = [];

    if (argv.cookies) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = argv.cookies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          const tuple = _step.value;

          var _tuple$split = tuple.split('=', 2),
              _tuple$split2 = _slicedToArray(_tuple$split, 2);

          const key = _tuple$split2[0],
                value = _tuple$split2[1];


          const cookie = {
            name: key,
            value
          };

          cookies.push(cookie);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    const css = yield (0, _usus.render)(argv.url, Object.assign({}, argv, {
      cookies
    }));

    // eslint-disable-next-line no-console
    console.log(css);
  });

  return function handler(_x) {
    return _ref.apply(this, arguments);
  };
})();
//# sourceMappingURL=render.js.map
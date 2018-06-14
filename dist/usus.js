'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = exports.launchChrome = undefined;

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _chromeLauncher = require('chrome-launcher');

var _chromeRemoteInterface = require('chrome-remote-interface');

var _chromeRemoteInterface2 = _interopRequireDefault(_chromeRemoteInterface);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _surgeon = require('surgeon');

var _surgeon2 = _interopRequireDefault(_surgeon);

var _bluefeather = require('bluefeather');

var _createConfiguration = require('./factories/createConfiguration');

var _createConfiguration2 = _interopRequireDefault(_createConfiguration);

var _normalizeNetworkResourceUrl = require('./utilities/normalizeNetworkResourceUrl');

var _normalizeNetworkResourceUrl2 = _interopRequireDefault(_normalizeNetworkResourceUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug2.default)('usus');

const launchChrome = exports.launchChrome = () => {
  return (0, _chromeLauncher.launch)({
    chromeFlags: ['--disable-gpu', '--headless', '--no-sandbox']
  });
};

const inlineStyles = (() => {
  var _ref = _asyncToGenerator(function* (DOM, Runtime, rootNodeId, styles) {
    // @todo I am sure there is a better way to do this,
    // but I cannot find it documented in the https://chromedevtools.github.io/devtools-protocol/tot/DOM/
    // e.g. How to create a new node using CDP DOM API?
    yield Runtime.evaluate({
      expression: `
      {
        const styleElement = document.createElement('div');
        styleElement.setAttribute('id', 'usus-inline-styles');
        document.head.appendChild(styleElement);
      }
    `
    });

    const nodeId = (yield DOM.querySelector({
      nodeId: rootNodeId,
      selector: '#usus-inline-styles'
    })).nodeId;

    debug('#usus-inline-styles nodeId %d', nodeId);

    const stylesheet = `<style>${styles}</style>`;

    yield DOM.setOuterHTML({
      nodeId,
      outerHTML: stylesheet
    });
  });

  return function inlineStyles(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

const inlineImports = (() => {
  var _ref2 = _asyncToGenerator(function* (DOM, Runtime, rootNodeId, styleImports) {
    // @todo See note in inlineStyles.

    yield Runtime.evaluate({
      expression: `
      {
        const scriptElement = document.createElement('div');
        scriptElement.setAttribute('id', 'usus-style-import');
        document.body.appendChild(scriptElement);
      }
    `
    });

    const nodeId = (yield DOM.querySelector({
      nodeId: rootNodeId,
      selector: '#usus-style-import'
    })).nodeId;

    debug('#usus-style-import nodeId %d', nodeId);

    yield DOM.setOuterHTML({
      nodeId,
      outerHTML: styleImports.join('\n')
    });
  });

  return function inlineImports(_x5, _x6, _x7, _x8) {
    return _ref2.apply(this, arguments);
  };
})();

const inlineStylePreload = (() => {
  var _ref3 = _asyncToGenerator(function* (DOM, Runtime, rootNodeId, styleImports) {
    // @todo See note in inlineStyles.

    yield Runtime.evaluate({
      expression: `
      {
        const scriptElement = document.createElement('div');
        scriptElement.setAttribute('id', 'usus-style-preload');
        document.head.appendChild(scriptElement);
      }
    `
    });

    const nodeId = (yield DOM.querySelector({
      nodeId: rootNodeId,
      selector: '#usus-style-preload'
    })).nodeId;

    debug('#usus-style-preload nodeId %d', nodeId);

    const x = (0, _surgeon2.default)();

    const styleUrls = x('select link {0,} | read attribute href', styleImports.join(''));

    const stylePreloadLinks = styleUrls.map(function (styleUrl) {
      return `<link rel="preload" href="${styleUrl}" as="style">`;
    });

    yield DOM.setOuterHTML({
      nodeId,
      outerHTML: stylePreloadLinks.join('\n')
    });
  });

  return function inlineStylePreload(_x9, _x10, _x11, _x12) {
    return _ref3.apply(this, arguments);
  };
})();

const inlineFontPreload = (() => {
  var _ref4 = _asyncToGenerator(function* (DOM, Runtime, rootNodeId, fontUrls) {
    // @todo See note in inlineStyles.

    yield Runtime.evaluate({
      expression: `
      {
        const scriptElement = document.createElement('div');
        scriptElement.setAttribute('id', 'usus-font-preload');
        document.head.appendChild(scriptElement);
      }
    `
    });

    const nodeId = (yield DOM.querySelector({
      nodeId: rootNodeId,
      selector: '#usus-font-preload'
    })).nodeId;

    debug('#usus-font-preload nodeId %d', nodeId);

    const stylePreloadLinks = fontUrls.map(function (fontUrl) {
      return `<link rel="preload" href="${fontUrl}" as="font">`;
    });

    yield DOM.setOuterHTML({
      nodeId,
      outerHTML: stylePreloadLinks.join('\n')
    });
  });

  return function inlineFontPreload(_x13, _x14, _x15, _x16) {
    return _ref4.apply(this, arguments);
  };
})();

const render = exports.render = (() => {
  var _ref5 = _asyncToGenerator(function* (url, userConfiguration = {}) {
    const configuration = (0, _createConfiguration2.default)(userConfiguration);

    debug('rendering URL %s', JSON.stringify(configuration));

    let chrome;
    let chromePort;

    if (configuration.chromePort) {
      debug('attempting to use the user provided instance of Chrome (port %d)', configuration.chromePort);

      chromePort = configuration.chromePort;
    } else {
      chrome = yield launchChrome();
      chromePort = chrome.port;
    }

    const protocol = yield (0, _chromeRemoteInterface2.default)({
      port: chromePort
    });

    const end = (() => {
      var _ref6 = _asyncToGenerator(function* () {
        yield protocol.close();

        if (!chrome) {
          return;
        }

        yield chrome.kill();
      });

      return function end() {
        return _ref6.apply(this, arguments);
      };
    })();

    const CSS = protocol.CSS,
          DOM = protocol.DOM,
          Emulation = protocol.Emulation,
          Network = protocol.Network,
          Page = protocol.Page,
          Runtime = protocol.Runtime;


    yield DOM.enable();
    yield CSS.enable();
    yield Page.enable();
    yield Runtime.enable();
    yield Network.enable();

    Emulation.setDeviceMetricsOverride(configuration.deviceMetricsOverride);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = configuration.cookies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        const cookie = _step.value;

        Network.setCookie({
          name: cookie.name,
          url,
          value: cookie.value
        });
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

    const inlineStylesheetIndex = [];
    const alienFrameStylesheetIndex = [];

    CSS.styleSheetAdded(function ({ header }) {
      // eslint-disable-next-line no-use-before-define
      const mainFrameId = frameId;

      if (!mainFrameId) {
        throw new Error('Stylesheet has been added before frameId has been established.');
      }

      if (header.frameId !== mainFrameId) {
        alienFrameStylesheetIndex.push(header.styleSheetId);
      }

      if (header.isInline) {
        inlineStylesheetIndex.push(header.styleSheetId);
      }
    });

    yield CSS.startRuleUsageTracking();

    const frame = yield Page.navigate({
      url
    });

    const downloadedFontUrls = [];

    Network.requestWillBeSent(function (request) {
      if (request.frameId !== frame.frameId) {
        debug('ignoring HTTP request; alien frame');

        return;
      }

      const tokens = _url2.default.parse(request.request.url);

      const pathname = tokens.pathname;

      if (!pathname) {
        debug('ignoring HTTP request; URL is missing pathname');

        return;
      }

      if (!pathname.endsWith('.woff') && !pathname.endsWith('.woff2')) {
        debug('ignoring HTTP request; network resource is not a supported font');

        return;
      }

      downloadedFontUrls.push((0, _normalizeNetworkResourceUrl2.default)(url, tokens.href));
    });

    const frameId = frame.frameId;

    let usedStyles;

    usedStyles = yield new Promise(function (resolve) {
      Page.loadEventFired(_asyncToGenerator(function* () {
        debug('"load" event received; waiting %d milliseconds before capturing the CSS coverage report', configuration.delay);

        yield (0, _bluefeather.delay)(configuration.delay);

        debug('alien stylesheets', inlineStylesheetIndex);
        debug('inline stylesheets', inlineStylesheetIndex);

        const rules = yield CSS.takeCoverageDelta();

        const usedRules = rules.coverage.filter(function (rule) {
          return rule.used;
        });

        const slices = [];

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = usedRules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            const usedRule = _step2.value;

            if (alienFrameStylesheetIndex.includes(usedRule.styleSheetId)) {
              debug('skipping alien stylesheet %d', usedRule.styleSheetId);

              // eslint-disable-next-line no-continue
              continue;
            }

            if (inlineStylesheetIndex.includes(usedRule.styleSheetId)) {
              debug('skipping inline stylesheet %d', usedRule.styleSheetId);

              // eslint-disable-next-line no-continue
              continue;
            }

            const stylesheet = yield CSS.getStyleSheetText({
              styleSheetId: usedRule.styleSheetId
            });

            slices.push(stylesheet.text.slice(usedRule.startOffset, usedRule.endOffset));
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        resolve(slices.join(''));
      }));
    });

    yield CSS.stopRuleUsageTracking();

    if (configuration.formatStyles) {
      usedStyles = yield configuration.formatStyles(usedStyles);
    }

    const rootDocument = yield DOM.getDocument();

    if (configuration.inlineStyles) {
      const styleImportNodeIds = (yield DOM.querySelectorAll({
        nodeId: rootDocument.root.nodeId,
        selector: 'head link[rel="stylesheet"]'
      })).nodeIds;

      debug('found %d style imports contained in the <head> element', styleImportNodeIds.length);

      const styleImportLinks = [];

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = styleImportNodeIds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          const styleImportNodeId = _step3.value;

          const styleImportNodeHtml = yield DOM.getOuterHTML({
            nodeId: styleImportNodeId
          });

          // @todo Add ability to conditionally allow certain nodes.
          debug('found CSS import; removing import from the <head> element', styleImportNodeHtml);

          yield DOM.removeNode({
            nodeId: styleImportNodeId
          });

          styleImportLinks.push(styleImportNodeHtml.outerHTML);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      if (configuration.preloadStyles) {
        yield inlineStylePreload(DOM, Runtime, rootDocument.root.nodeId, styleImportLinks);
      }

      if (configuration.preloadFonts) {
        yield inlineFontPreload(DOM, Runtime, rootDocument.root.nodeId, downloadedFontUrls);
      }

      if (usedStyles) {
        yield inlineStyles(DOM, Runtime, rootDocument.root.nodeId, usedStyles);
      }

      yield inlineImports(DOM, Runtime, rootDocument.root.nodeId, styleImportLinks);

      const rootOuterHTMLWithInlinedStyles = (yield DOM.getOuterHTML({
        nodeId: rootDocument.root.nodeId
      })).outerHTML;

      yield end();

      return rootOuterHTMLWithInlinedStyles;
    }

    if (configuration.extractStyles) {
      yield end();

      // @todo Document that `extractStyles` does not return the inline stylesheets.
      // @todo Document that `extractStyles` does not return the alien stylesheets.

      return usedStyles;
    }

    const rootOuterHTML = (yield DOM.getOuterHTML({
      nodeId: rootDocument.root.nodeId
    })).outerHTML;

    yield end();

    return rootOuterHTML;
  });

  return function render(_x17) {
    return _ref5.apply(this, arguments);
  };
})();
//# sourceMappingURL=usus.js.map
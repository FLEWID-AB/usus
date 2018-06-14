'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * It is important to load to use relative URLs when the protocol and host match.
 * This is because pre-rendering might be done against a different URL than the
 * actual website, e.g. https://raw.gajus.com/ instead of https://gajus.com/.
 * Therefore, we need to ensure that resources are loaded relative to the
 * current host.
 */
exports.default = (targetUrl, resourceUrl) => {
  const targetUrlTokens = _url2.default.parse(targetUrl);
  const resourceUrlTokens = _url2.default.parse(resourceUrl);

  if (targetUrlTokens.protocol !== resourceUrlTokens.protocol || targetUrlTokens.host !== resourceUrlTokens.host) {
    return resourceUrl;
  }

  return String(resourceUrlTokens.path);
};
//# sourceMappingURL=normalizeNetworkResourceUrl.js.map
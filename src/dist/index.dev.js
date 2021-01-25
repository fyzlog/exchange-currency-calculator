"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var compose = function compose() {
  for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return function (x) {
    return fns.reduceRight(function (acc, fn) {
      return fn(acc);
    }, x);
  };
};

var debug = function debug(data) {
  return console.debug(data), data;
};

var logError = function logError(error) {
  return console.error(error);
};

var filterByList = function filterByList(list) {
  return function (item) {
    return list.includes(item);
  };
};

var mapByField = function mapByField(field) {
  return function (list) {
    return list.map(function (item) {
      return item[field];
    });
  };
};

var numberToFixed = function numberToFixed(fixed) {
  return function (num) {
    return Math.round(num * Math.pow(10, fixed)) / Math.pow(10, fixed);
  };
};

var sumList = function sumList(list) {
  return list.reduce(function (result, item) {
    return result + item;
  }, 0);
};

var multiplicate = function multiplicate(a) {
  return function (b) {
    return a * b;
  };
};

var _fetch = function _fetch() {
  return typeof fetch === 'undefined' ? require('node-fetch') : fetch;
};

var createURL = function createURL(urlStr) {
  var url = new URL(urlStr);
  return function (params) {
    Object.keys(params).forEach(function (key) {
      return url.searchParams.append(key, params[key]);
    });
    return url;
  };
};

var exchangeRatesURL = createURL('https://openexchangerates.org/api/latest.json');

var getExchangeRates = function getExchangeRates(apiConfig) {
  return _fetch()(exchangeRatesURL(apiConfig));
};

var filterByCodes = function filterByCodes(codes) {
  return filterByList(codes);
};

var codesFromConfig = mapByField('currencyCode');
var numberToPrice = numberToFixed(2);

var toJSON = function toJSON(response) {
  return response.json();
};

var checkResults = function checkResults(response) {
  return !response || response.hasOwnProperty('error') ? Promise.reject("".concat(response.message, ": ").concat(response.description)) : response;
};

var filterExchangeRates = function filterExchangeRates(exchangeRatesFilter) {
  return function (_ref) {
    var rates = _ref.rates;
    return Object.fromEntries(Object.entries(rates).filter(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
          code = _ref3[0],
          rate = _ref3[1];

      return exchangeRatesFilter(code);
    }));
  };
};

var filterExchangeRatesComposition = compose(filterExchangeRates, filterByCodes, codesFromConfig);

var checkExchangeRates = function checkExchangeRates(exchangeRates) {
  return Object.keys(exchangeRates).length ? exchangeRates : Promise.reject('Exchange rates not found. Bad or empty exchange config.');
};

var shoppingCartTotalPrice = function shoppingCartTotalPrice(shoppingCart) {
  return sumList(mapByField('price')(shoppingCart));
};

var calcExchangePrice = function calcExchangePrice(price) {
  return multiplicate(price);
};

var shoppingCartTotalExchangePrice = function shoppingCartTotalExchangePrice(exchangeConfig) {
  return function (exchangePrice) {
    return function (exchangeRates) {
      return exchangeConfig.reduce(function (result, configItem) {
        result[configItem.currencyField] = numberToPrice(exchangePrice(exchangeRates[configItem.currencyCode]));
        return result;
      }, {});
    };
  };
};

var exchangeCalculator = function exchangeCalculator(apiConfig) {
  return function (exchangeConfig) {
    return function (shoppingCart) {
      if (!apiConfig) {
        return Promise.reject('API config is not defined');
      }

      if (!exchangeConfig) {
        return Promise.reject('Exchange config is not defined');
      }

      return getExchangeRates(apiConfig).then(toJSON).then(checkResults).then(filterExchangeRatesComposition(exchangeConfig)).then(checkExchangeRates).then(shoppingCartTotalExchangePrice(exchangeConfig)(calcExchangePrice(shoppingCartTotalPrice(shoppingCart))));
    };
  };
};

module.exports = {
  exchangeCalculator: exchangeCalculator
};
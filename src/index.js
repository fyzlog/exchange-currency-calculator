const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

const debug = (data) => (console.debug(data), data);
const logError = (error) => console.error(error);

const filterByList = (list) => (item) => list.includes(item);
const mapByField = (field) => (list) => list.map((item) => item[field]);
const numberToFixed = (fixed) => (num) => Math.round(num * (10 ** fixed)) / (10 ** fixed);
const sumList = (list) => list.reduce((result, item) => result + item, 0);
const multiplicate = (a) => (b) => a * b;

const _fetch = () => typeof fetch === 'undefined' ? require('node-fetch') : fetch;

const createURL = (urlStr) => {
    const url = new URL(urlStr);

    return (params) => {
        Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
     
        return url;
    };
};
const exchangeRatesURL = createURL('https://openexchangerates.org/api/latest.json');
const getExchangeRates = (apiConfig) => _fetch()(exchangeRatesURL(apiConfig));

const filterByCodes = (codes) => filterByList(codes);
const codesFromConfig = mapByField('currencyCode');
const numberToPrice = numberToFixed(2);

const toJSON = (response) => response.json();

const checkResults = (response) => (
    !response || response.hasOwnProperty('error') ? 
        Promise.reject(`${response.message}: ${response.description}`) : 
        response
);

const filterExchangeRates = (exchangeRatesFilter) => ({rates}) => (
    Object.fromEntries(
        Object.entries(rates).filter(([code, rate]) => (
            exchangeRatesFilter(code)
        ))
    )
);
const filterExchangeRatesComposition = compose(
    filterExchangeRates, 
    filterByCodes, 
    codesFromConfig
);

const checkExchangeRates = (exchangeRates) => (
    Object.keys(exchangeRates).length ? 
        exchangeRates : 
        Promise.reject('Exchange rates not found. Bad or empty exchange config.')
);

const shoppingCartTotalPrice = (shoppingCart) => sumList(mapByField('price')(shoppingCart));
const calcExchangePrice = (price) => multiplicate(price);
const shoppingCartTotalExchangePrice = (exchangeConfig) => (exchangePrice) => (exchangeRates) => (
    exchangeConfig.reduce((result, configItem) => {
        result[configItem.currencyField] = numberToPrice(exchangePrice(exchangeRates[configItem.currencyCode]));

        return result;
    }, {})
);

const exchangeCalculator = (apiConfig) => (exchangeConfig) => (shoppingCart) => {
    if (!apiConfig) {
        return Promise.reject('API config is not defined');
    }
    if (!exchangeConfig) {
        return Promise.reject('Exchange config is not defined');
    }

    return getExchangeRates(apiConfig)
        .then(toJSON)
        .then(checkResults)
        .then(filterExchangeRatesComposition(exchangeConfig))
        .then(checkExchangeRates)
        .then(shoppingCartTotalExchangePrice(exchangeConfig)(calcExchangePrice(shoppingCartTotalPrice(shoppingCart))));
};

module.exports = {
    exchangeCalculator
};
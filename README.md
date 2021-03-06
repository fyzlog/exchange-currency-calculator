# Exchange Currency Calculator

Exchange currency calculator for test task.

## Requirements

Exchange Currency Calculator used [openexchangerates API](https://docs.openexchangerates.org/docs/latest-json). You are need to obtain working APP ID from [openexchangerates](https://openexchangerates.org).

## Install

```bash
npm install git+https://github.com/fyzlog/exchange-currency-calculator --save
```

## Usage example

```javascript
const exchangeCalculator = require('exchange-currency-calculator').exchangeCalculator;

// setup config with app_id from openexchangerates.org API and base currency, e.g. USD
const appExchangeCalculator = exchangeCalculator({ app_id: '<YOUR-OPENEXCHANGERATES-APP-ID>', base: '<BASE-CURRENCY>' });

// setup exchange currencies config
const appExampleExchangeCalculator = appExchangeCalculator([
    { currencyCode: 'RUB', currencyField: 'rubles' },
    { currencyCode: 'EUR', currencyField: 'euros' },
    { currencyCode: 'USD', currencyField: 'US dollars' },
    { currencyCode: 'GBP', currencyField: 'pounds' },
    { currencyCode: 'JPY', currencyField: 'yens' }
]);

// calculate exchange rates by exchange currencies config for list of items
const selectedCart = [
    { price: 5 },
    { price: 12 },
    { price: 31 },
    { price:  18}
];
const totalCartPrice = appExampleExchangeCalculator(selectedCart)
    .then((totalCartPrice) => {}) // {'rubles': number, 'euros': number, 'US dollars': number, 'pounds': number, 'yens': number}
    .catch((error) => {}); // Errors generated by API and library
```

## Example

[exchange-currency-calculator-test](https://github.com/fyzlog/exchange-currency-calculator-test)


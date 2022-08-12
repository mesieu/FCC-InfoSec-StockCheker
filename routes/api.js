'use strict';
const Handler = require('../controllers/handler.js');
const {contentSecurityPolicy} = require('helmet');
const {setUncaughtExceptionCaptureCallback, nextTick} = require('process');
const {privateDecrypt} = require('crypto');

module.exports = function (app) {
  app.route('/api/stock-prices').get(function (req, res, next) {
    let handler = new Handler();
    let likes = 0;
    let stockSymbol = req.query.stock;
    if (req.query.like === 'true') likes = 1;
    if (!Array.isArray(stockSymbol)) {
      handler.findStock(stockSymbol, (err, stock) => {
        if (err) return next(err);
        if (stock) {
          handler.getStockPrice(stockSymbol, (err, price) => {
            if (err) return next(err);
          });
        }
      });
    } else {
    }
  });
};

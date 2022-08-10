'use strict';
const Handler = require('../controllers/handler.js');
const axios = require('axios');
const {contentSecurityPolicy} = require('helmet');
const {setUncaughtExceptionCaptureCallback, nextTick} = require('process');
const {privateDecrypt} = require('crypto');

module.exports = function (app) {
  app.route('/api/stock-prices').get(function (req, res, next) {
    let handler = new Handler();
    let likes = 0;
    let stockSymbol = req.query.stock;
    if (req.query.like === 'true') likes = 1;
    if (!Array.isArray(req.query.stock)) {
      axios
        .get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`)
        .then((response) => {
          handler.findOneAndUpdateOrCreate(stockSymbol, response.data['latestPrice'], likes, (err, stock) => {
            if (err) res.send(next(err));
            res.json({
              name: stock.name,
              price: stock.price,
              likes: stock.likes,
            });
          });
        })
        .catch((err) => {
          res.send(next(err));
        });
    } else {
      let stockData = [];
      let firstStockSymbol = stockSymbol[0];
      let secondStockSymbol = stockSymbol[1];
      axios
        .get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${firstStockSymbol}/quote`)
        .then((response) => {
          handler.findOneAndUpdateOrCreate(stockSymbol, response.data['latestPrice'], likes, (err, stock) => {
            if (err) res.send(next(err));
            stockData.push({
              name: stock.name,
              price: stock.price,
              likes: stock.likes,
            });
          });
        })
        .catch((err) => {
          res.send(next(err));
        });
      axios
        .get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${secondStockSymbol}/quote`)
        .then((response) => {
          handler.findOneAndUpdateOrCreate(stockSymbol, response.data['latestPrice'], likes, (err, stock) => {
            if (err) res.send(next(err));
            stockData.push({
              name: stock.name,
              price: stock.price,
              likes: stock.likes,
            });
          });
        })
        .catch((err) => {
          res.send(next(err));
        });
      console.log("I'm here");
    }
  });
};

'use strict';
const Handler = require('../controllers/handler.js');
const {contentSecurityPolicy} = require('helmet');
const {setUncaughtExceptionCaptureCallback, nextTick} = require('process');
const {privateDecrypt} = require('crypto');

module.exports = function (app) {
  app.route('/api/stock-prices').get(function (req, res, next) {
    const handler = new Handler();
    let likes = 0;
    const stockSymbol = req.query.stock;
    const address = req.socket.remoteAddress;
    if (req.query.like === 'true') likes = 1;
    // Get single price and total likes
    if (!Array.isArray(stockSymbol)) {
      handler.getStockPrice(stockSymbol, (err, price) => {
        if (err) return next(err);
        handler.findStock(stockSymbol, (err, stock) => {
          if (err) return next(err);
          if (stock) {
            handler.updateStock(stock, likes, (err, updatedStock) => {
              if (err) return next(err);
              res.json({
                stockData: {
                  stock: stockSymbol,
                  price: price,
                  likes: updatedStock.likes,
                },
              });
            });
          } else {
            handler.createStock(stockSymbol, likes, (err, createdStock) => {
              if (err) return next(err);
              res.json({
                stockData: {
                  stock: stockSymbol,
                  price: price,
                  likes: createdStock.likes,
                },
              });
            });
          }
        });
      });
      // Compare and get relative likes
    } else {
      // Create or Update stocks in DB
      stockSymbol.forEach((stockSymbol) => {
        handler.findStock(stockSymbol, (err, stock) => {
          if (err) return next(err);
          if (stock) {
            handler.updateStock(stock, likes, (err, updatedStock) => {
              if (err) return next(err);
            });
          } else {
            handler.createStock(stockSymbol, likes, (err, createdStock) => {
              if (err) return next(err);
            });
          }
        });
      });
      let firstStockSymbol = stockSymbol[0];
      let secondStockSymbol = stockSymbol[1];
      handler.getStockPrice(firstStockSymbol, (err, firstStockPrice) => {
        if (err) return next(err);
        handler.getStockPrice(secondStockSymbol, (err, secondStockPrice) => {
          if (err) return next(err);
          handler.findStock(firstStockSymbol, (err, firstStock) => {
            if (err) return next(err);
            handler.findStock(secondStockSymbol, (err, secondStock) => {
              if (err) return next(err);
              let firstRelativeLikes = firstStock.likes - secondStock.likes;
              let secondRelativeLikes = secondStock.likes - firstStock.likes;
              res.json({
                stockData: [
                  {
                    stock: firstStock.name,
                    price: firstStockPrice,
                    rel_likes: firstRelativeLikes,
                  },
                  {
                    stock: secondStock.name,
                    price: secondStockPrice,
                    rel_likes: secondRelativeLikes,
                  },
                ],
              });
            });
          });
        });
      });
    }
  });
};

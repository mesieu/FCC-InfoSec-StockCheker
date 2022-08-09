'use strict';
const Handler = require('../controllers/handler.js');
const https = require('https');
const axios = require('axios');

// const mongoose = require('mongoose');
const {contentSecurityPolicy} = require('helmet');
const {setUncaughtExceptionCaptureCallback, nextTick} = require('process');
const {privateDecrypt} = require('crypto');
// const mongo_URI = process.env.MONGO_URI;
// mongoose.connect(mongo_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const stockSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
//   likes: { type: Number, required: true },
// });

// const Stock = mongoose.model('Stock', stockSchema);

module.exports = function (app) {
  app.route('/api/stock-prices').get(function (req, res, next) {
    let handler = new Handler();
    let likes = 0;
    if (req.query.like === 'true') likes = 1;
    if (!Array.isArray(req.query.stock)) {
      let stockSymbol = req.query.stock;
      axios
        .get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`)
        .then((response) => {
          handler.findOneAndUpdateOrCreate(stockSymbol, response.data['latestPrice'], likes, (err, stock) => {
            if (err) return next(err);
            res.json({
              name: stock.name,
              price: stock.price,
              likes: stock.likes,
            });
          });
        })
        .catch((err) => {
          return next(err);
        });
    } else {
      req.query.stock.forEach((stockSymbol) => {
        axios
          .get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`)
          .then((response) => {
            handler.findOneAndUpdateOrCreate(stockSymbol, response.data['latestPrice'], likes, (err, stock) => {
              if (err) return next(err);
              res.json({
                name: stock.name,
                price: stock.price,
                likes: stock.likes,
              });
            });
          })
          .catch((err) => {
            return next(err);
          });
      });
    }
  });
};

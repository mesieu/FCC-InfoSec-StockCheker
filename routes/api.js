'use strict';
const Handler = require('../controllers/handler.js');
const https = require('https');
const axios = require('axios');

const mongoose = require('mongoose');
const { contentSecurityPolicy } = require('helmet');
const { setUncaughtExceptionCaptureCallback } = require('process');
const mongo_URI = process.env.mongo_URI;
mongoose.connect(mongo_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const stockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  likes: { type: Number, required: true },
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = function (app) {
  let handler = new Handler();
  app.route('/api/stock-prices').get(function (req, res, next) {
    let stockSymbol = req.query.stock;
    let likes = 0;
    if (req.query.like === true) {
      likes = 1;
    }

    axios
      .get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`)
      .then((response) => {
        Stock.findOne({ name: stockSymbol }, (err, stock) => {
          if (err) return next(err);
          if (stock) {
            res.json({
              name: stock.name,
              price: stock.price,
              likes: stock.likes,
            });
          } else {
            const newStock = new Stock({
              name: stockSymbol,
              price: response.data['latestPrice'],
              likes: likes,
            });
            newStock.save((err, stock) => {
              if (err) return next(err);
              res.json({
                name: stock.name,
                price: stock.price,
                likes: stock.likes,
              });
            });
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
    // findOrCreate Stock Schema
  });
};

// https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/[symbol]/quote
// symbol = msft | goog | aapl | ...

// https.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`, (response) => {
//   let data = '';
//   response.on('data', (chunk) => {
//     data += chunk;
//   });
//   response
//     .on('end', () => {
//       let dataJSON = JSON.parse(data);
//       price = dataJSON.latestPrice;
//       // console.log(price);
//     })
//     .on('error', (error) => {
//       return res.send(error);
//     });
// });

// Stock.findOne({ name: stockSymbol }, (err, stock) => {
//   if (err) return next(err);
//   if (stock === null) {
//     Stock.create({ name: stockSymbol, price: price, likes: 0 }, (err, stock) => {
//       if (err) return next(err);
//       console.log(stock);
//       return res.json(stock);
//     });
//   } else {
//   }
// });

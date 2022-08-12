const axios = require('axios');

const mongoose = require('mongoose');
const mongo_URI = process.env.MONGO_URI;
mongoose.connect(mongo_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const stockSchema = new mongoose.Schema({
  name: {type: String, required: true},
  price: {type: Number, required: true},
  likes: {type: Number, required: true},
});

const Stock = mongoose.model('Stock', stockSchema);

function Handler() {
  this.getStockPrice = (stockSymbol, done) => {
    axios
      .get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`)
      .then((response) => {
        return done(null, reponse.data['latestPrice']);
      })
      .catch((err) => {
        return done(err, null);
      });
  };

  this.findStock = (stockSymbol, done) => {
    Stock.findOne({name: stockSymbol}, (err, stock) => {
      if (err) return done(err, null);
      return done(null, stock);
    });
  };

  this.createStock = (stockSymbol, price, likes, done) => {
    let newStock = new Stock({
      name: stockSymbol,
      price: price,
      likes: likes,
    });
    newStock.save().then((savedStock) => {
      return done(null, savedStock);
    });
  };

  this.updateStock = (stock, price, likes, done) => {
    stock.price = price;
    stock.likes += likes;
    stock.save().then((savedStock) => {
      return done(null, savedStock);
    });
  };

  // this.getStock = (stockSymbol, likes, done) => {
  //   axios
  //     .get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`)
  //     .then((response) => {
  //       this.findOneAndUpdateOrCreate(stockSymbol, response.data['latestPrice'], likes, (err, stock) => {
  //         if (err) return done(err, null);
  //         return done(null, {
  //           name: stock.name,
  //           price: stock.price,
  //           likes: stock.likes,
  //         });
  //       });
  //     })
  //     .catch((err) => {
  //       return done(err, null);
  //     });
  // };

  // this.findOneAndUpdateOrCreate = (stockSymbol, price, likes, done) => {
  //   Stock.findOne({name: stockSymbol}, (err, stock) => {
  //     if (err) return done(err, null);
  //     if (stock) {
  //       stock.price = price;
  //       stock.likes += likes;
  //       stock.save().then((savedStock) => {
  //         return done(null, savedStock);
  //       });
  //     } else {
  //       let newStock = new Stock({
  //         name: stockSymbol,
  //         price: price,
  //         likes: likes,
  //       });
  //       newStock.save().then((savedStock) => {
  //         return done(null, savedStock);
  //       });
  //     }
  //   });
  // };

  this.getStockDataArray = (firstStockSymbol, secondStockSymbol, done) => {
    Stock.find({name: {$in: [firstStockSymbol, secondStockSymbol]}}, (err, stocks) => {
      if (err) return done(err, null);
      return done(null, stocks);
    });
  };
}

module.exports = Handler;

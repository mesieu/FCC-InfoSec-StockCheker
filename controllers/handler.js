const axios = require('axios');

const mongoose = require('mongoose');
const mongo_URI = process.env.MONGO_URI;
mongoose.connect(mongo_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const stockSchema = new mongoose.Schema({
  name: {type: String, required: true},
  likes: {type: Number, required: true},
});

const Stock = mongoose.model('Stock', stockSchema);

function Handler() {
  this.getStockPrice = (stockSymbol, done) => {
    axios
      .get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`)
      .then((response) => {
        return done(null, response.data['latestPrice']);
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

  this.createStock = (stockSymbol, likes, done) => {
    let newStock = new Stock({
      name: stockSymbol,
      likes: likes,
    });
    newStock.save().then((createdStock) => {
      return done(null, createdStock);
    });
  };

  this.updateStock = (stock, likes, done) => {
    stock.likes += likes;
    stock.save().then((updatedStock) => {
      return done(null, updatedStock);
    });
  };

  this.getStockDataArray = (firstStockSymbol, secondStockSymbol, done) => {
    Stock.find({name: {$in: [firstStockSymbol, secondStockSymbol]}}, (err, stocks) => {
      if (err) return done(err, null);
      return done(null, stocks);
    });
  };

  this.findIP = () => {};

  this.saveIP = () => {};

  this.hashIP = () => {};
}

module.exports = Handler;

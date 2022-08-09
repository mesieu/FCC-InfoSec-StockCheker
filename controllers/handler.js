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
  this.findOneAndUpdateOrCreate = (stockSymbol, price, likes, done) => {
    Stock.findOne({name: stockSymbol}, (err, stock) => {
      if (err) return done(err, null);
      if (stock) {
        stock.price = price;
        stock.likes += likes;
        stock.save().then((savedStock) => {
          return done(null, savedStock);
        });
      } else {
        let newStock = new Stock({
          name: stockSymbol,
          price: price,
          likes: likes,
        });
        newStock.save().then((savedStock) => {
          return done(null, savedStock);
        });
      }
    });
  };
}

module.exports = Handler;

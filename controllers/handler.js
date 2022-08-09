// const mongoose = require('mongoose');
// const mongo_URI = process.env.mongo_URI;
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

function Handler() {
  this.findOrCreateStock = (stockSymbol, done) => {
    Stock.findOne({ name: stockSymbol }, (err, stock) => {
      if (err) return done(err);
      if (stock === null) {
      }
    });
  };
}

module.exports = Handler;

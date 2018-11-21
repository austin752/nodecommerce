const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
        {
            productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
            },
            qty: { type: Number, required: true },
            total: { type: Number, required: true }
        }
        ]
    }
});

userSchema.methods.addToCart = function(product) {
  const cpi = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQty = 1;
  const cartItems = [...this.cart.items];

  if (cpi >= 0) {
    newQty = this.cart.items[cpi].qty + 1;
    cartItems[cpi].qty = newQty;
    cartItems[cpi].total = newQty * product.price
  } else {
    cartItems.push({
      productId: product._id,
      qty: newQty,
      total: product.price
    });
  }
  const updatedCart = {
    items: cartItems
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
    const cartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });
    this.cart.items = cartItems;
    return this.save();
  };

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
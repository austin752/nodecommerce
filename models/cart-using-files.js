const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {
	static addProduct(id, productPrice) {
	  // Fetch the previous cart
	  fs.readFile(p, (err, fc) => {
			let cart = { products: [], totalPrice: 0 };
			if (!err) {
				cart = JSON.parse(fc);
			}
			// Analyze the cart => Find existing product
			const epi = cart.products.findIndex(
				prod => prod.id === id
			);
			const existingProduct = cart.products[epi];
			let updatedProduct;
			// Add new product/ increase quantity
			if (existingProduct) {
				updatedProduct = { ...existingProduct };
				updatedProduct.qty = updatedProduct.qty + 1;
				cart.products = [...cart.products];
				cart.products[epi] = updatedProduct;
			} else {
				updatedProduct = { id: id, qty: 1 };
				cart.products = [...cart.products, updatedProduct];
			}
			cart.totalPrice = cart.totalPrice + +productPrice;
			fs.writeFile(p, JSON.stringify(cart), err => {
				console.log(err);
			});
	  });
	}
  
	static deleteProduct(id, productPrice) {
	  fs.readFile(p, (err, fc) => {
			if (err) {
				return;
			}
			const updatedCart = { ...JSON.parse(fc) };
			const product = updatedCart.products.find(prod => prod.id === id);
			if (!product) {
				return;
			}
			const productQty = product.qty;
			updatedCart.products = updatedCart.products.filter(
				prod => prod.id !== id
			);
			updatedCart.totalPrice =
				updatedCart.totalPrice - productPrice * productQty;
		
			fs.writeFile(p, JSON.stringify(updatedCart), err => {
				console.log(err);
			});
	  });
	}
  
	static getCart(cb) {
	  fs.readFile(p, (err, fc) => {
			const cart = JSON.parse(fc);
			if (err) {
				cb(null);
			} else {
				cb(cart);
			}
			});
		};
  }
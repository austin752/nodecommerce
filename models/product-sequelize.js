// const db = require('../util/database')
// const Cart = require('./cart')

// module.exports = class Product {
//   constructor(id, title, image, desc, price) {
//     this.id = id;
//     this.title = title;
//     this.image = image;
//     this.desc = desc;
//     this.price = price;
//   }

//   save() {
//     db.execute('INSERT INTO products (title, price, desc) VALUES(?,?,?,?');
//     [this.title, this.price, this.desc]
//   }

//   static deleteById(id) {
    
//   }

//   static fetchAll() {
//     return db.execute('SELECT * FROM products');
//   }

//   static findById(id, ){
//     db.execute('SELECT * FROM products WHERE prducts.id = ?');
//   }
// };
const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Product = sequelize.define('product', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title : Sequelize.STRING,
  price:{
    type: Sequelize.DOUBLE,
    allowNUll: false
  },
  image:{
    type:Sequelize.STRING,
    allowNUll: false
  },
  desc:{
    type:Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Product;
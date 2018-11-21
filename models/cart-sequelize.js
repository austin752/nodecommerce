const Sequelize = require('sequelize');
const sequelize = ('../util/database');

const Cart = sequelize.define('cart', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    qty: Sequelize.INTEGER
});

module.exports = Cart;
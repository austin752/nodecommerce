const Sequelize = require('sequelize');
const sequelize = ('../util/database');

const orderItem = sequelize.define('orderItem', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    qty: Sequelize.INTEGER
});

module.exports = orderItem;
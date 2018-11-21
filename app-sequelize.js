const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const sequelize = require('./util/database')

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const shopController = require('./controllers/shop');
const Product = require('./models/product');
const User = require('./models/users');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const orderItem = require('./models/order-item');

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// 404 error
app.use(shopController.err404);

app.use((req, res, next) => {
    User.findById(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

Product.belongsTo(User, {
    constraints: true, 
    onDelete: 'CASCADE'
});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem})


sequelize
    // use force: true to overwrite database
    //.sync({force: true})
    .sync()
    .then(result => {
        return User.findById(1);
    })
    .then(user => {
        if(!user){
            return User.create({name: 'Austin', email: 'email@eail.com'})
        }
        return user;
    })
    .then(user =>{
        user.createCart();
        app.listen(3000);

    })
    .then(cart =>{
        app.listen(3000);

    })
    .catch(err => {console.log(err)});

module.exports = app;
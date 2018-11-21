const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/products/:prodId', shopController.getProduct);
router.get('/orders', isAuth, shopController.getOrders);
router.get('/cart', isAuth, shopController.getCart);
router.post('/add-to-cart', isAuth, shopController.postCart);
router.post('/delete-item', isAuth, shopController.postCartDeleteItem);
router.get('/checkout', isAuth, shopController.getCheckout);
router.get('/orders/:orderId', isAuth, shopController.getInvoice);


module.exports = router;

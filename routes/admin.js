const path = require('path');
const express = require('express');
const adminController = require('../controllers/admin');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const { check } = require('express-validator/check');

// -- admin catalog page
router.get('/products', isAuth, adminController.getProducts);

// -- get and post add product page
router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', [
    check('title', 'Title must be longer than 5 characters')
        .isString()
        .isLength({ min: 5 })
        .trim(),
    check('image', 'Must be a valid image').trim(),
    check('price', 'Must have a valid price').isFloat().trim(),
    check('desc', 'The description must be between 5 and 300 characters including whitespace')
        .isLength({ min: 5, max: 50 })
        .trim()
], isAuth, adminController.postAddProduct);

// -- get and post edit product page
router.get('/edit-product/:prodId', isAuth, adminController.getEditProduct);
router.post('/edit-product/', [
    check('title', 'Title must be longer than 5 characters')
        .isString()
        .isLength({ min: 5 })
        .trim(),
    check('image', 'Must be a valid image').trim(),
    check('price', 'Must have a valid price').isFloat().trim(),
    check('desc', 'The description must be between 5 and 300 characters including whitespace')
        .isLength({ min: 5, max: 300 })
        .trim()
], isAuth, adminController.postEditProduct);

router.delete('/products/:prodId', isAuth, adminController.deleteProduct
);

module.exports = router;

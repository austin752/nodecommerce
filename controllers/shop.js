const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
//const stripe = require('stripe')(process.env.STRIPE_KEY);
const stripe = require("stripe")("sk_test_isI03GLVyjFFLxEIhsaRJlIh");

const Product = require('../models/product');
const Order = require('../models/order');

ITEMS_PER_PAGE = 10;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  if(req.user){
    userEmail = req.session.user.email;
  }else{
    userEmail = '';
  }
  let totalItems;
  Product.find()
    .countDocuments()
    .then(numProd =>{
      totalItems = numProd;
      return Product
        .find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
        res.render('store/product-list', {
          product: products,
          pageTitle: 'Products',
          path: '/products',
          userEmail: userEmail,
          totalProducts: totalItems,
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
      })
      .catch(err => {
        console.log(err);
      });
};

exports.getProduct = (req, res, next) => {
  if(req.user){
    userEmail = req.session.user.email;
  }else{
    userEmail = '';
  }
  const prodId = req.params.prodId;
  Product.findById(prodId)
    .then(product => {
      res.render('store/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  if(req.user){
    userEmail = req.session.user.email;
  }else{
    userEmail = ''
  }
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProd =>{
      totalItems = numProd;
      return Product
        .find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
        res.render('store/index', {
          product: products,
          pageTitle: 'Shop',
          path: '/',
          userEmail: userEmail,
          totalProducts: totalItems,
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
      })
      .catch(err => {
        console.log(err);
      });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('store/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.prodId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      //console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteItem = (req, res, next) => {
  const prodId = req.body.prodId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express
  let totalSum = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      user.cart.items.forEach(p =>{
        totalSum += p.qty * p.productId.price;
      });
      console.log(totalSum, 'total sum');
      const products = user.cart.items.map(i => {
        return { qty: i.qty, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id
        },
        products: products,
        orderTotal: totalSum
      });
      return order.save();
    })
    .then(result => {
      const charge = stripe.charges.create({
        amount: totalSum * 100,
        currency: 'usd',
        description: 'Your order - ' + result._id.toString(),
        source: token,
        metadata: {order_id: result._id.toString()}
      });
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  const userEmail = req.session.user.email;
  Order.find({'user.userId': req.user._id})
   .then(orders => {
      res.render('store/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        userEmail: userEmail,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(24).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.qty * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              ' - ' +
              prod.qty +
              ' x ' +
              '$' +
              prod.product.price
          );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch(err => next(err));
};

exports.getCheckout = (req, res, next) => {
  const userEmail = req.session.user.email;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.qty * p.productId.price;
      });
      res.render('store/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,
        userEmail: userEmail,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.err404 = (req, res, next) => {
  const userEmail = req.session.user.email;
    res.render('404', {
        pageTitle: 'Page Not Found',
        userEmail: userEmail,
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.err500 = (req, res, next) => {
  const userEmail = req.session.user.email;
  res.render('500', {
      pageTitle: 'Page Not Found',
      userEmail: userEmail,
      isAuthenticated: req.session.isLoggedIn
  });
};

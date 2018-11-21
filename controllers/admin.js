const {validationResult} = require('express-validator/check');

const Product = require('../models/product');
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
  const userEmail = req.session.user.email;
  if(!req.session.isLoggedIn){
    return res.redirect('/login');
  }
  res.render('admin/add-product', {
    pageTitle: 'Admin - Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    userEmail: userEmail,
    isAuthenticated: req.session.isLoggedIn,
    oldInput: {title: '', price: '', image: '', desc: ''},
    validationErrors: [], 
    errMsg: null
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageFile = req.file;
  const price = req.body.price;
  const desc = req.body.desc;
  //console.log(imageFile, 'file');
  if (!imageFile) {
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        desc: desc
      },
      errMsg: 'Attached file is not an image.',
      validationErrors: []
    });
  }

  const err = validationResult(req);

  if (!err.isEmpty()) {
    console.log(err.array());
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        desc: desc
      },
      errMsg: err.array()[0].msg,
      validationErrors: err.array()
    });
  }
  
  const imagePath = req.file.path;
  //console.log(imagePath, 'image path');
  const product = new Product({
    title: title,
    image: imagePath,
    price: price,
    desc: desc,
    userId: req.user._id
  });
  product
    .save()
    .then(result => {
      //console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getEditProduct = (req, res, next) => {
  const userEmail = req.session.user.email;
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.prodId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Admin - Edit Product',
        path: '/admin/edit-product',
        product: product,
        editing: editMode,
        hasError: false,
        userEmail: userEmail,
        isAuthenticated: req.session.isLoggedIn,
        oldInput: {prodId: prodId, title: '', price: '', desc: ''},
        validationErrors: []
      });
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.prodId;
  const title = req.body.title;
  const imageFile = req.file;
  const price = req.body.price;
  const desc = req.body.desc;

  if (!imageFile) {
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        desc: desc
      },
      errMsg: 'Attached file is not an image.',
      validationErrors: []
    });
  }

  const err = validationResult(req);
  if (!err.isEmpty()) {
    console.log(err.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageFile: imageFile,
        price: price,
        desc: desc
      },
      errMsg: err.array()[0].msg,
      validationErrors: err.array()
    });
  }

  const imagePath = req.file.path;
  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/');
      }
      product.title = title,
      product.image = imagePath,
      product.price = price,
      product.desc = desc,
      product._id = prodId
      // if(image){
      //   fileHelper.deleteFile(product);
      //   product.imageUrl = imagePath;
      // }
      return product
      .save()
      .then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      })
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.getProducts = (req, res, next) => {
//   Product.find({userId: req.user._id})
//       .then(products => {
//       res.render('admin/products', {
//         product: products,
//         pageTitle: 'Admin - Catalog',
//         path: '/admin/products',
//         isAuthenticated: req.session.isLoggedIn
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.getProducts = (req, res, next) =>{
  const userEmail = req.session.user.email;
  const page = +req.query.page || 1;
  let totalItems;
  Product.find({userId: req.user._id})
    .countDocuments()
    .then(numProd =>{
      totalItems = numProd;
      return Product
        .find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
        res.render('admin/products', {
          product: products,
          pageTitle: 'All Products',
          path: 'admin/products',
          userEmail: userEmail,
          totalProducts: totalItems,
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
          isAuthenticated: req.session.isLoggedIn
        });
      })
      .catch(err => {
        console.log(err);
      });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.prodId;
  //const userId = req.params.userId;
  Product
    .findOne({ _id: prodId, userId: req.user._id })
    .then(product => {
      // if (userId != req.user._id) {
      //   res.status(500).json({errMsg: 'You can\'t delete this item'});
      // };
      if (!product) {
        return next(new Error('Product not found.'));
      }
      fileHelper.deleteFile(product);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    //.deleteOne({_id: prodId, userId: req.user._id})
    .then(() => {
      console.log('product deleted')
      res.status(200).json({message: 'Item deleted'});
    })
    .catch(err => {
      res.status(500).json({message: 'Deleting item failed.'});
    });
};
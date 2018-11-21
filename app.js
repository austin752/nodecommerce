const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const MONGODB_URI = 'mongodb+srv://austin752:somepassword@cluster0-0ynct.mongodb.net/shop?retryWrites=true'
const store = new MongoDbStore({
  uri:MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');
const User = require('./models/user');

// -- multer
const multer = require('multer');
const crypto = require("crypto");
// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'images')
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString() + '-' + file.originalname);
//   }
// });

const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/')
  },
  filename: function (req, file, callback) {
    crypto.pseudoRandomBytes(16, function(err, raw) {
      if (err) return callback(err);
    
      callback(null, raw.toString('hex') + path.extname(file.originalname));
      //callback(null, new Date().toISOString() + '-' + file.originalname);
    });
  }
});

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === 'image/png' ||
//     file.mimetype === 'image/jpg' ||
//     file.mimetype === 'image/jpeg'
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

const fileFilter = function (req, file, cb) {
  // accept image only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage: imgStorage, fileFilter: fileFilter }).single('image');
app.use(upload);

// // -- end multer

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(session({
  secret:'thisissupposedtobeareallylongstringofcharacters', 
  resave: false, 
  saveUninitialized: false,
  store: store
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user){
        return next();
      }
      req.email = user.email
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err)
      throw newError(err);
    });
});

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.post('/create-order', isAuth, shopController.postOrder);

app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

//500 error
app.use('/500', shopController.err500);

// 404 error
app.use(shopController.err404);

// app.use((error, req, res, next) =>{
//   res.status(500).render('/500', {
//     pageTitle: 'Error!',
//     path: '/500'
//   });
// });

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(result => {
    app.listen(3000);
    console.log('connected');
  })
  .catch(err => console.log(err));

module.exports = multer;
module.exports.imgStorage = imgStorage;

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGrid = require('nodemailer-sendgrid-transport');
const {validationResult} = require('express-validator/check');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendGrid({
  auth:{
    api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
  let msg = req.flash('error');
  if(msg.length > 0){
    msg = msg[0];
  }else{
    msg = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errMsg: msg,
    oldInput: {email: '', password: ''},
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errMsg: err.array()[0].msg,
      oldInput: {email: email, password: password},
      validationErrors: err.array()
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          isAuthenticated: false,
          errMsg: msg,
          oldInput: {email: '', password: ''},
          validationErrors: []
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getReg = (req, res, next) => {
  let msg = req.flash('error');
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render('auth/registration', {
    path: '/registration',
    pageTitle: 'Registration',
    errMsg: msg,
    oldInput: {email: '', password: ''},
    validationErrors: []
  });
};

exports.postReg = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const err = validationResult(req);
  if (!err.isEmpty()) {
    //console.log(err.array());
    return res.status(422).render('auth/registration', {
      path: '/registration',
      pageTitle: 'Registration',
      errMsg: err.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        passwordConf: req.body.passwordConf
      },
      validationErrors: err.array()
    });
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      // return transporter.sendMail({
      //   to: email,
      //   from: 'shop@node-complete.com',
      //   subject: 'Signup succeeded!',
      //   html: '<h1>You successfully signed up!</h1>'
      // });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.postReg = (req, res, next) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   const err = validationResult(req);
//   if (!err.isEmpty()) {
//     console.log(err.array());
//     return res.status(422).render('auth/registration', {
//       path: '/registration',
//       pageTitle: 'Registration',
//       errMsg: err.array()[0].msg,
//       oldInput: {email: email, password: password},
//       validationErrors: err.array(),
//     });
//   }
//   console.log(errMsg);
//   bcrypt
//     .hash(password, 12)
//     .then(hashedPassword => {
//       const user = new User({
//         email: email,
//         password: hashedPassword,
//         cart: { items: [] }
//       });
//       return user.save();
//     })
//     .then(result => {
//       res.redirect('/login');
//       // return transporter.sendMail({
//       //   to: email,
//       //   from: 'test@test.com',
//       //   subject: 'Signup succeessful!',
//       //   html: '<h1>Signup succeessful!</h1>'
//       // });
//     })
//     .catch(err => {
//       console.log(err);
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getResetPass = (req, res, next) => {
  let msg = req.flash('error');
  if(msg.length > 0){
    msg = msg[0];
  }else{
    msg = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    isAuthenticated: req.isLoggedIn
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExp = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'test@test.com',
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `
        });
      })
      .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExp: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errMsg: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExp: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExp = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
const express = require('express');
const {check} = require('express-validator/check');
const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user');

router.get('/login', authController.getLogin);
router.post(
  '/login',
  [
    check('email', 'Please enter a valid email address')
      .isEmail()
      .normalizeEmail()
      .custom((value, {req}) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (!userDoc) {
            return Promise.reject(
              'E-Mail not found, please try again.'
            );
          }
        });
      }),
    check('password', 'Password has to be valid.').isLength({ min: 5 }).isAlphanumeric().trim()
  ],
  authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/registration', authController.getReg);

router.post('/registration',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail()
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address if forbidden.');
        // }
        // return true;
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      }),
    check(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    check('passwordConf')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      })
  ],
  authController.postReg
);

router.get('/reset', authController.getResetPass);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
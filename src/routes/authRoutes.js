const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

const {
  register, login, logout, verifyEmail,
  isLoggedIn, resendOtp,
  changePassword,
  forgotPassword,
  resetPasswordWithOtp
} = authController

const { isAuth } = require('../middleware/authMiddleware')

router.post('/signup', register)

router.post('/signin', login)

router.post('/signout', logout)

router.post('/verify-email', isAuth, verifyEmail)

router.post('/resend-otp', isAuth, resendOtp)

router.post('/forgot-password', forgotPassword)

router.post('/reset-password', resetPasswordWithOtp)

router.post('/change-password', isAuth, changePassword)

router.get('/is-auth', isLoggedIn)

module.exports = router

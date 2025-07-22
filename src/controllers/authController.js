const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { generateOtp } = require('../utility/core')
const { sendWelcomeEmail, sendOtpEmail } = require('../service/emailService')

const {
  registerValidation,
  loginValidation
} = require('../validation/validation')
// const { generateOTP } = require('../utility/otpUtility')
// const Token = require('../models/tokenModel')
const { removePassword } = require('../utility/core')

const generateRandom17Digits = () => {
  const randomDigits =
    Math.floor(Math.random() * 900000000000) + 100000000000

  return `40${randomDigits.toString().padStart(11, '0')}`
}

// Register
exports.register = async (req, res) => {
  // const { error } = registerValidation(req.body)
  // if (error) return res.status(400).send(error.details[0].message)

  const emailExists = await User.findOne({ email: req.body.email })
  if (emailExists) return res.status(400).send('Email already exists')

  // Hash passwords
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(req.body.password, salt)

  // Create a new user
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    countryCode: req.body.countryCode,
    password: hashedPassword,
    location: {
      address: req.body.address,
      state: req.body.state || ''
    },
    otp: generateOtp(),
    isEmailConfirmed: false,
    occupation: req.body.occupation,
    annualIncomeRange: req.body.annualIncomeRange,
    accountType: req.body.accountType,
    ssnTIN: req.body.ssnTIN,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.sex
  })

  console.log(user.otp, 'user.otp')

  user.account.number = generateRandom17Digits()

  // send welcome email
  await sendWelcomeEmail(user)

  await sendOtpEmail(user, user.otp)

  try {
    await user.save()
    return res.status(200).json({
      message: 'User registered successfully'
    })
  } catch (err) {
    res.status(400).send(err)
  }
}

// Login
exports.login = async (req, res) => {
  // Validate data before creating a user
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  // Check if email exists
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send('Email does not exist')

  // remove password from user object
  const { password, ...otherDetails } = user._doc

  // Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password)
  if (!validPass) return res.status(400).send('Incorrect password')

  // Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)

  if (user.isAccountDisabled) {
    return res.status(400).json({
      status: false,
      message: 'Your account has been disabled please contact support'
    })
  }

  res
    .cookie('suToken', token, {
      maxAge: 50000 * 60 * 24,
      // httpOnly: true,
      sameSite: 'lax'
      // secure: true
    })
    .status(200)
    .json({
      message: 'Logged in successfully',
      token,
      user: otherDetails,
      status: 200
    })
}

// receive otp and verify
exports.verifyEmail = async (req, res) => {
  const { otp } = req.body

  if (!otp) {
    return res.status(400).json({
      status: false,
      message: 'Email and OTP are required'
    })
  }

  const user = req.user

  // if (user.isEmailConfirmed) {
  //   return res.status(400).json({
  //     status: false,
  //     message: 'Email has already been verified'
  //   })
  // }

  if (!user.otp) {
    return res.status(400).json({
      status: false,
      message: 'OTP has not been generated'
    })
  }

  if (user.otp !== otp) {
    return res.status(400).json({
      status: false,
      message: 'Invalid OTP'
    })
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      user._id,
      { isEmailConfirmed: true, otp: '' },
      { new: true }
    )

    res.status(200).json({
      status: true,
      data: updatedUser,
      message: 'Email verified successfully'
    })
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Email could not be verified'
    })
  }
}

// resend otp
exports.resendOtp = async (req, res) => {
  const user = req.user

  // if (user.isEmailConfirmed) {
  //   return res.status(400).json({
  //     status: false,
  //     message: 'Email has already been verified'
  //   })
  // }

  const otp = generateOtp()

  try {
    await User.findOneAndUpdate({ _id: user._id }, { otp }, { new: true })

    await sendOtpEmail(user, otp)

    res.status(200).json({
      status: true,
      message: 'OTP sent successfully'
    })
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'OTP could not be sent'
    })
  }
}

// Logout
exports.logout = async (req, res) => {
  res.clearCookie('suToken')
  res.cookie('suToken', '', {
    maxAge: '1',
    expires: new Date(Date.now() - 86400)
  })
  res.status(200).json({
    message: 'Logged out successfully'
  })
}

//

// change password with old password and new password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      status: false,
      message: 'Old password and new password are required'
    })
  }

  const user = await User.findOne({ _id: req.user._id })
  if (!user) {
    return res.status(400).json({
      status: false,
      message: 'User does not exist'
    })
  }

  const isValid = await bcrypt.compare(oldPassword, user.password)
  if (!isValid) {
    return res.status(400).json({
      status: false,
      message: 'Invalid old password'
    })
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(newPassword, salt)

  try {
    await User.findOneAndUpdate(
      { _id: user._id },
      { password: hash },
      { new: true }
    )

    res.status(200).json({
      status: true,
      message: 'Password changed successfully'
    })
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Password could not be changed'
    })
  }
}

// Forgot Password - Initiate OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({
      status: false,
      message: 'Email is required'
    })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(404).json({
      status: false,
      message: 'User with this email does not exist'
    })
  }

  const otp = generateOtp()
  user.otp = otp
  // Optionally, set an OTP expiry time here if your model supports it
  // user.otpExpires = Date.now() + 3600000; // 1 hour

  try {
    await user.save()
    await sendOtpEmail(user, otp) // Reusing existing OTP email service
    res.status(200).json({
      status: true,
      message: 'OTP sent to your email address. Please use it to reset your password.'
    })
  } catch (err) {
    console.error('Forgot Password Error:', err)
    res.status(500).json({
      status: false,
      message: 'Error processing request. Please try again later.'
    })
  }
}

// Reset Password with OTP
exports.resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      status: false,
      message: 'Email, OTP, and new password are required'
    })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(404).json({
      status: false,
      message: 'User not found'
    })
  }

  if (user.otp !== otp) {
    return res.status(400).json({
      status: false,
      message: 'Invalid or expired OTP'
    })
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(newPassword, salt)

  user.password = hashedPassword
  user.otp = '' // Clear OTP after successful reset
  // user.otpExpires = undefined; // Clear OTP expiry if you set one

  try {
    await user.save()
    // Optionally, send a password change confirmation email here
    res.status(200).json({
      status: true,
      message: 'Password has been reset successfully.'
    })
  } catch (err) {
    console.error('Reset Password Error:', err)
    res.status(500).json({
      status: false,
      message: 'Error resetting password. Please try again.'
    })
  }
}

// check if user is logged in
exports.isLoggedIn = async (req, res) => {
  try {
    const token = req.cookies.suToken
    if (!token) return res.status(200).json({ status: false })

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err.message)
        return res.status(200).json({ status: false })
      } else {
        console.log(decodedToken)
        const user = await User.findById(decodedToken._id)
        const userData = removePassword(user)
        res.status(200).json({ status: true, user: userData })
      }
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: false })
  }
}

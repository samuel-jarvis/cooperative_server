const User = require('../models/userModel')
const mongoose = require('mongoose')
const cloudinaryUpload = require('../config/cloudinaryUpload')
const { successResponse, errorResponse } = require('../utility/response')

const { removePassword } = require('../utility/core')

// update the user's profile
exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) return res.status(400).send('User not found')

  // Update the user's profile
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    {
      // firstName: req.body.firstName,
      // lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      location: {
        address: req.body.address,
        state: req.body.state
      }
    },
    { new: true }
  )
  const { password, ...otherDetails } = updated._doc

  try {
    return successResponse(res, otherDetails, 'User Profile Updated Successfully')
  } catch (err) {
    console.log('Error: ', err)
    return errorResponse(res, err)
  }
}

// complete onboarding add bio and interest
exports.uploadVerificationDocument = async (req, res) => {
  const userId = req.user._id
  // passportImageFile
  // documentFile
  // proofOfAddressFile

  const { documentType, dateOfBirth } = req.body

  if (!mongoose.Types.ObjectId.isValid(userId)) { return res.status(404).send('No user with that id') }

  try {
    const user = await User.findById(userId)

    if (!user) return res.status(400).send('User not found')

    console.log(req.files)

    const passportImageFile = req.files.passportImageFile ? req.files.passportImageFile[0] : null
    const documentFile = req.files.documentFile ? req.files.documentFile[0] : null
    const proofOfAddressFile = req.files.proofOfAddressFile ? req.files.proofOfAddressFile[0] : null

    if (!passportImageFile || !documentFile || !proofOfAddressFile) {
      return res.status(400).send('Please upload all files')
    }

    // use promise.all to upload all files
    const [passportResult, documentFrontResult, proofOfAddressResult] = await Promise.all([
      cloudinaryUpload.image(passportImageFile.path),
      cloudinaryUpload.image(documentFile.path),
      cloudinaryUpload.image(proofOfAddressFile.path)
    ])

    if (!passportResult || !documentFrontResult || !proofOfAddressResult) {
      return res.status(400).send('Error uploading files')
    }

    user.verification = {
      document: {
        public_id: documentFrontResult.public_id,
        url: documentFrontResult.secure_url
      },
      proofOfAddress: {
        public_id: proofOfAddressResult.public_id,
        url: proofOfAddressResult.secure_url
      },
      documentType
    }

    user.dateOfBirth = dateOfBirth
    user.verificationStatus = 'pending'

    user.profilePicture = {
      public_id: passportResult.public_id,
      url: passportResult.secure_url
    }

    await user.save()

    return res.status(200).json({
      status: 'success',
      message: 'Complete Verification File Upload Successfully',
      data: user
    })
  } catch (error) {
    console.log('Error: ', error)
    return res.status(500).json(error)
  }
}

// update user profile picture
exports.updateProfilePicture = async (req, res) => {
  const fileStr = req.body.image
  const user = await User.findById(req.user._id)
  if (!user) return res.status(400).send('User not found')

  const profilePicture = user.profilePicture
  if (!profilePicture) return res.status(400).send('profilePicture not found')

  try {
    const result = await cloudinaryUpload.image(fileStr)
    if (!result) return res.status(400).send('Error uploading image')

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        profilePicture: {
          public_id: result.public_id,
          url: result.secure_url
        }
      },
      { new: true }
    )

    const { password, ...otherDetails } = updated._doc
    return res.status(200).json({
      message: 'User Profile Picture Updated Successfully',
      data: otherDetails
    })
  } catch (err) {
    console.log('Error: ', err)
    res.status(400).json(err)
  }
}

// get current logged user profile
exports.getMe = async (req, res) => {
  const user = req.user
  if (!user) return res.status(400).send('User not found')

  const userDetails = removePassword(user)

  try {
    return res.status(200).json({
      message: 'User Profile Fetched Successfully',
      data: userDetails
    })
  } catch (err) {
    console.log('Error: ', err)
    res.status(400).json(err)
  }
}

// admin endpoint to get all users\

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('firstName lastName email phone location')
    return res.status(200).json({
      message: 'Users Fetched Successfully',
      data: users
    })
  } catch (err) {
    console.log('Error: ', err)
    res.status(400).json(err)
  }
}

// get user by id
exports.getUserById = async (req, res) => {
  const userId = req.params.id

  if (!mongoose.Types.ObjectId.isValid(userId)) { return res.status(404).send('No user with that id') }

  try {
    const user = await User.findById(userId)
    return res.status(200).json({
      message: 'User Fetched Successfully',
      data: user
    })
  } catch (err) {
    console.log('Error: ', err)
    res.status(400).json(err)
  }
}

// get user by email
exports.getUserByEmail = async (req, res) => {
  const email = req.params.email

  try {
    const user = await User.findOne({ email })
    return res.status(200).json({
      message: 'User Fetched Successfully',
      data: user
    })
  } catch (err) {
    console.log('Error: ', err)
    res.status(400).json(err)
  }
}

// admin update user.account with savings, checkings, number
exports.updateUserAccount = async (req, res) => {
  const userId = req.params.id

  const { savings, checking, number } = req.body

  if (!mongoose.Types.ObjectId.isValid(userId)) { return res.status(404).send('No user with that id') }

  try {
    const user = await User.findById(userId)

    user.account = {
      number: number || user.account.number,
      savings: savings || user.account.savings,
      checking: checking || user.account.checking
    }

    await user.save()

    res.status(200).json({
      status: 'success',
      message: 'User Account Updated Successfully',
      data: user
    })
  } catch (error) {
    res.status(500).json(error)
  }
}

// update all user info if provided
exports.updateUser = async (req, res) => {
  const body = req.body
  const userId = req.params.id

  if (!mongoose.Types.ObjectId.isValid(userId)) { return res.status(404).send('No user with that id') }

  try {
    const user = await User.findByIdAndUpdate(userId, body, { new: true })

    res.status(200).json({
      status: 'success',
      message: 'User Updated Successfully',
      data: user
    })
  } catch (error) {
    res.status(500).json(error)
  }
}

exports.deleteUser = async (req, res) => {
  const userId = req.params.id

  if (!mongoose.Types.ObjectId.isValid(userId)) { return res.status(404).send('No user with that id') }

  try {
    await User.findByIdAndDelete(userId)

    res.status(200).json({
      status: 'success',
      message: 'User Deleted Successfully'
    })
  } catch (error) {
    res.status(500).json(error)
  }
}

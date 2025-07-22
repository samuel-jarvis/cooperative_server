const express = require('express')
const router = express.Router()
const userControllers = require('../controllers/userControllers')
const multer = require('multer')

// passportImageFile
// documentFile
// proofOfAddressFile

const upload = multer({
  storage: multer.diskStorage({})
})

// single route for uploading files
const uploadFiles = upload.fields([
  { name: 'passportImageFile', maxCount: 1 },
  { name: 'documentFile', maxCount: 1 },
  { name: 'proofOfAddressFile', maxCount: 1 }
])

const {
  updateProfile,
  getMe,
  uploadVerificationDocument,
  updateProfilePicture
} = userControllers

const { isAuth, isAdmin } = require('../middleware/authMiddleware')

router.patch('/profile', isAuth, updateProfile)

router.post('/verification', isAuth, uploadFiles, uploadVerificationDocument)

router.post('/profile-picture', isAuth, updateProfilePicture)

router.get('/me', isAuth, getMe)

// admin routes

// admin routes
router.get('/admin', isAuth, isAdmin, userControllers.getAllUsers)

router.get('/admin/:id', isAuth, isAdmin, userControllers.getUserById)

router.get('/admin/email/:email', isAuth, isAdmin, userControllers.getUserByEmail)

router.put('/admin/account/:id', isAuth, isAdmin, userControllers.updateUserAccount)

router.put('/admin/:id', isAuth, isAdmin, userControllers.updateUser)

router.delete('/admin/:id', isAuth, isAdmin, userControllers.deleteUser)

module.exports = router

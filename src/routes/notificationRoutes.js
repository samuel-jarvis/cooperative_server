const express = require('express')
const router = express.Router()

const {
  getNotifications
} = require('../controllers/notificationController')

const { isAuth } = require('../middleware/authMiddleware')

router.get('/', isAuth, getNotifications)

module.exports = router

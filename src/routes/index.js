const express = require('express')
const router = express.Router()

const authRoutes = require('./authRoutes')
const userRoutes = require('./userRoutes')
const profileRoutes = require('./profileRoutes')
const transactionRoutes = require('./transactionRoutes')
const walletRoutes = require('./walletRoutes')
const notificationRoutes = require('./notificationRoutes')
const contactRoutes = require('./contactRoutes')
const loanRoutes = require('./loanRoutes')
const supportTicketRoutes = require('./supportTicketRoutes')

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/profile', profileRoutes)
router.use('/transaction', transactionRoutes)
router.use('/wallet', walletRoutes)
router.use('/notifications', notificationRoutes)
router.use('/contacts', contactRoutes)
router.use('/loans', loanRoutes)
router.use('/support-tickets', supportTicketRoutes)

module.exports = router

const express = require('express')
const router = express.Router()
const supportTicketControllers = require('../controllers/supportTicketController')
const { isAuth, isAdmin } = require('../middleware/authMiddleware')

const {
  createSupportTicket,
  getAllSupportTickets,
  deleteSupportTicket,
} = supportTicketControllers

router.post('/', isAuth, createSupportTicket)
router.get('/', isAuth, isAdmin, getAllSupportTickets)
router.delete('/:id', isAuth, isAdmin, deleteSupportTicket)

module.exports = router
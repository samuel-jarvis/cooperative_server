const express = require('express')
const router = express.Router()

const {
  addLoan,
  getLoans
} = require('../controllers/loanController')

const { isAuth } = require('../middleware/authMiddleware')

router.post('/', isAuth, addLoan)

router.get('/', isAuth, getLoans)

module.exports = router

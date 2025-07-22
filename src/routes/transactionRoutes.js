const express = require('express')
const router = express.Router()

const {
  getAllTransactions, getAllUserTransactions, getTransactionById,
  addTransaction, createTransferTransaction, createInternalTransfer,
  deleteTransaction,
  getAllTransactionsForUser, updateTransaction
} = require('../controllers/transactionController')

const { isAuth, isAdmin } = require('../middleware/authMiddleware')

router.get('/', isAuth, getAllUserTransactions)

router.get('/:id', isAuth, getTransactionById)

router.post('/transfer', isAuth, createTransferTransaction)

router.post('/internal-transfer', isAuth, createInternalTransfer)

// admin endpoints
router.get('/admin', isAuth, isAdmin, getAllTransactions)

router.post('/admin/:id', isAuth, isAdmin, addTransaction)

router.delete('/admin/:id', isAuth, isAdmin, deleteTransaction)

router.get('/admin/:id', isAuth, isAdmin, getAllTransactionsForUser)

router.put('/admin/:id', isAuth, isAdmin, updateTransaction)

module.exports = router

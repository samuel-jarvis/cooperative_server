const Transaction = require('../models/transactionModel')
const User = require('../models/userModel')

exports.getAllUserTransactions = async (req, res) => {
  const { page, limit } = req.query
  const pageNumber = parseInt(page) || 1
  const limitNumber = parseInt(limit) || 20

  try {
    const query = {
      user: req.user._id
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
    const totalTransactions = await Transaction.countDocuments(query)
    const totalPages = Math.ceil(totalTransactions / limitNumber)
    const hasNextPage = pageNumber < totalPages
    const hasPreviousPage = pageNumber > 1
    const nextPage = hasNextPage ? pageNumber + 1 : null
    const previousPage = hasPreviousPage ? pageNumber - 1 : null

    res.status(200).json({
      status: 'success',
      data: transactions,
      message: 'Transactions retrieved successfully',
      pagination: {
        totalTransactions,
        totalPages,
        currentPage: pageNumber,
        hasNextPage,
        hasPreviousPage,
        nextPage,
        previousPage
      }
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

exports.getTransactionById = async (req, res) => {
  const transactionId = req.params.id

  try {
    const transaction = await Transaction.findById(transactionId)
    if (!transaction) { return res.status(404).json({ message: 'Transaction not found' }) }
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          message: 'You do not have permission to view this transaction'
        })
    }
    res.status(200).json({
      status: 'success',
      data: transaction,
      message: 'Transaction retrieved successfully'
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

exports.createTransferTransaction = async (req, res) => {
  const body = req.body
  const { from, amount, to, description, beneficiaryName } = body

  try {
    if (from === to) {
      return res
        .status(400)
        .json({ message: 'Cannot transfer to the same account' })
    }

    const user = req.user

    if (user.isBlocked) {
      return res
        .status(400)
        .json({ message: 'Please contact support to continue' })
    }

    const userAccount = user.account

    if (from === 'savings') {
      if (userAccount.savings < amount) {
        return res
          .status(400)
          .json({ message: 'Insufficient funds in savings account' })
      }
    } else if (from === 'checking') {
      if (userAccount.checking < amount) {
        return res
          .status(400)
          .json({ message: 'Insufficient funds in checking account' })
      }
    }

    if (user.isAccountDisabled) {
      return res
        .status(400)
        .json({
          message: 'Your account has been disabled please contact support'
        })
    }

    const transaction = await Transaction.create({
      user: user._id,
      amount,
      description: `Transfer to ${beneficiaryName}: ${description}`,
      transactionType: 'debit',
      metadata: {
        ...body
      },
      type: 'transfer'
    })

    if (from === 'savings') {
      userAccount.savings -= amount
    }

    if (from === 'checking') {
      userAccount.checking -= amount
    }

    await user.save()

    res.status(201).json({
      status: 'success',
      data: transaction,
      message: 'Transaction created successfully'
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

// transfer from savings to checking or vice versa
exports.createInternalTransfer = async (req, res) => {
  const { from, amount, to } = req.body

  if (from === to) {
    return res
      .status(400)
      .json({ message: 'Cannot transfer to the same account' })
  }

  // from string to number
  const amountNumber = Number(amount)

  const user = req.user

  const userAccount = user.account

  if (from === 'savings') {
    if (userAccount.savings < amountNumber) {
      return res
        .status(400)
        .json({ message: 'Insufficient funds in savings account' })
    }
  } else if (from === 'checking') {
    if (userAccount.checking < amountNumber) {
      return res
        .status(400)
        .json({ message: 'Insufficient funds in checking account' })
    }
  }

  if (user.isAccountDisabled) {
    return res
      .status(400)
      .json({
        message: 'Your account has been disabled please contact support'
      })
  }

  try {
    const transaction = await Transaction.create({
      user: user._id,
      amount: amountNumber,
      description: `Transfer to ${to} from ${from}`,
      transactionType: 'transfer',
      transfer: {
        from,
        to
      }
    })

    if (from === 'savings') {
      userAccount.savings -= amountNumber
      userAccount.checking += amountNumber
    }

    if (from === 'checking') {
      userAccount.checking -= amountNumber
      userAccount.savings += amountNumber
    }

    await user.save()

    res.status(201).json({
      status: 'success',
      data: transaction,
      message: 'Transaction created successfully'
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

// admin
// get all transactions
exports.getAllTransactions = async (req, res) => {
  const { userId } = req.query

  const query = {}
  try {
    if (userId) {
      query.user = userId
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 })
    res.status(200).json({
      status: 'success',
      data: transactions,
      message: 'Transactions retrieved successfully'
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

exports.transferTransaction = async (req, res) => {
  const user = req.user

  try {
    console.log(req.body)
    const {
      amount,
      accountType,
      name,
      description,
      accountNumber,
      bankName,
      routingNumber
    } = req.body

    const userExist = await User.findById(user._id)
    if (!userExist) return res.status(404).json({ message: 'User not found' })

    if (accountType === 'savings') {
      if (user.account.savings < amount) {
        return res
          .status(400)
          .json({ message: 'Insufficient funds in savings account' })
      }
      user.account.savings -= amount
    } else if (accountType === 'checking') {
      if (user.account.checking < amount) {
        return res
          .status(400)
          .json({ message: 'Insufficient funds in checking account' })
      }
      user.account.checking -= amount
    } else {
      return res.status(400).json({ message: 'Invalid account type' })
    }

    // Save the updated user
    await user.save()

    // Create the transaction
    const transaction = await Transaction.create({
      user: user._id,
      amount,
      transactionType: 'debit',
      accountType,
      description: `Transfer to ${name}`,
      date: new Date(),
      metadata: {
        accountType,
        name,
        accountNumber,
        bankName,
        routingNumber,
        description
      }
    })

    res.status(200).json({
      status: 'success',
      data: transaction,
      message: 'Transfer completed successfully'
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

// admin
// add transaction for user with id
exports.addTransaction = async (req, res) => {
  const userId = req.params.id

  // find user
  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ message: 'User not found' })

  try {
    const transaction = await Transaction.create({
      user: userId,
      amount: req.body.amount,
      description: req.body.description,
      transactionType: req.body.transactionType,
      date: req.body.date
    })

    res.status(201).json({
      status: 'success',
      data: transaction,
      message: 'Transaction created successfully'
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

// admin
// delete transaction with id
exports.deleteTransaction = async (req, res) => {
  const transactionId = req.params.id

  try {
    const transaction = await Transaction.findByIdAndDelete(transactionId)
    if (!transaction) { return res.status(404).json({ message: 'Transaction not found' }) }

    res.status(200).json({
      status: 'success',
      data: transaction,
      message: 'Transaction deleted successfully'
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

// get all transactions for a user
exports.getAllTransactionsForUser = async (req, res) => {
  const userId = req.params.id

  try {
    const transactions = await Transaction.find({ user: userId }).sort({
      createdAt: -1
    })
    res.status(200).json({
      status: 'success',
      data: transactions,
      message: 'Transactions retrieved successfully'
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

// update transaction using find one and update
exports.updateTransaction = async (req, res) => {
  const transactionId = req.params.id

  try {
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      req.body,
      { new: true }
    )

    if (!transaction) { return res.status(404).json({ message: 'Transaction not found' }) }

    res.status(200).json({
      status: 'success',
      data: transaction,
      message: 'Transaction updated successfully'
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

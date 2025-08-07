const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  transactionType: {
    type: String,
    enum: ['debit', 'credit', 'transfer'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  metadata: {
    type: Object,
    required: false
  },
  type: {
    type: String
  }
}, { timestamps: true })

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction

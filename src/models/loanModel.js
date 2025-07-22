const mongoose = require('mongoose')
const loanSchema = mongoose.Schema({
  loanAmount: {
    type: String,
    required: true
  },
  loanType: {
    type: String,
    required: true
  },
  loanDuration: {
    type: String,
    required: true
  },
  loanInterest: {
    type: String,
    required: true
  },
  loanPurpose: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'Pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Loan', loanSchema)

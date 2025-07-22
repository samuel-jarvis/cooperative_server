const User = require('../models/userModel')
const mongoose = require('mongoose')
const Loan = require('../models/loanModel')

const { successResponse, errorResponse } = require('../utility/response')

exports.addLoan = async (req, res) => {
  const { loanAmount, loanType, loanDuration, loanInterest, loanPurpose } = req.body

  const loan = new Loan({
    loanAmount,
    loanType,
    loanDuration,
    loanInterest,
    loanPurpose,
    user: req.user._id
  })

  try {
    const savedLoan = await loan.save()
    return successResponse(res, savedLoan, 'Loan Application Successful')
  } catch (err) {
    console.log('Error: ', err)
    return errorResponse(res, err)
  }
}

exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user._id })
    return successResponse(res, loans, 'Loans Fetched Successfully')
  } catch (err) {
    console.log('Error: ', err)
    return errorResponse(res, err)
  }
}

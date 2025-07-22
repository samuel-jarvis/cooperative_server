const mongoose = require('mongoose')

const contactSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: false
    },
    email: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: false
    },
    message: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Contact', contactSchema)

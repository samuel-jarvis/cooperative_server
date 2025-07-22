const mongoose = require('mongoose')

const notificationModel = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    otherUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    type: {
      type: String,
      default: 'session',
      enum: ['session', 'follow']
    },
    referenceId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Notification', notificationModel)

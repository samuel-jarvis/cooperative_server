const Notification = require('../models/notificationModel')

const {
  successResponse,
  errorResponse
} = require('../utility/response')

// get all notifications
// @ route : GET /api/notifications
// @ access : private

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 })
    return successResponse(res, notifications)
  } catch (error) {
    return errorResponse(res, error.message)
  }
}

const SupportTicket = require('../models/supportTicketModel');
const User = require('../models/userModel');

exports.createSupportTicket = async (req, res) => {
  const { subject, message, priority } = req.body;

  try {
    const user = req.user;

    const supportTicket = await SupportTicket.create({
      user: user._id,
      subject,
      message,
      priority,
    });

    res.status(201).json({
      status: 'success',
      data: supportTicket,
      message: 'Support ticket created successfully',
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// admin
// get all support tickets
exports.getAllSupportTickets = async (req, res) => {
  const { userId } = req.query;

  const query = {};
  try {
    if (userId) {
      query.user = userId;
    }

    const supportTickets = await SupportTicket.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: supportTickets,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// delete support ticket with id
exports.deleteSupportTicket = async (req, res) => {
  const supportTicketId = req.params.id;

  try {
    const supportTicket = await SupportTicket.findByIdAndDelete(supportTicketId);
    if (!supportTicket) return res.status(404).json({ message: 'Support ticket not found' });

    res.status(200).json({
      status: 'success',
      data: supportTicket,
      message: 'Support ticket deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
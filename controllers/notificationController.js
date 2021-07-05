const Notification = require('../models/notification');

exports.readNotification = async (req, res) => {
  try {
    const notify_id = req.params.id;
    const notification = await Notification.findById(notify_id);

    notification.unread = !notification.unread;

    await notification.save();
    return res.status(200).json({
      success: true,
      msg: 'Notification status changed!',
      notification,
    });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

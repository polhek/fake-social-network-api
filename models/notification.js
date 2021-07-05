const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    text: { type: String, required: true },
    from_user: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['comment', 'like'] },
    unread: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);

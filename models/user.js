const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true },
  profile_img_url: { type: String, required: true },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friend_send: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friend_requests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  notifications: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],
  facebook_id: { type: String },
  password: { type: String },
});

module.exports = mongoose.model('User', UserSchema);

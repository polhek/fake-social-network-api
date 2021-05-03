const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//! Ustvari schemo za userja!
const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  profile_img_url: { type: String, required: true },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friend_requests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('User', UserSchema);

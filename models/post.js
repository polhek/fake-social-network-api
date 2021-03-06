const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    image_url: { type: String },
  },
  { timestamps: true }
);

//! Loh de nebu dilal...
PostSchema.pre('remove', async function (next) {
  await this.model('Comment').deleteMany({ _id: { $in: this.comments } }, next);
});

module.exports = mongoose.model('Post', PostSchema);

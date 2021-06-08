const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

//! Loh de nebu dilal...
PostSchema.pre('remove', async function (next) {
  await this.model('Comment').deleteMany({ _id: { $in: this.comments } }, next);
});

module.exports = mongoose.model('Post', PostSchema);

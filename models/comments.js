const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//! Ustvari schemo za commente!
const CommentSchema = new Schema({});

module.exports = mongoose.model('Comment', CommentSchema);

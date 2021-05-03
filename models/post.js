const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//! Ustvari schemo za poste!
const PostSchema = new Schema({});

module.exports = mongoose.model('Post', PostSchema);

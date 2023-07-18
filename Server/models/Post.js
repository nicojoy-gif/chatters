const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    max: 500
  },
  title: {
    type: String,
    max: 200
  },
  subtitle: {
    type: String,
    max: 200
  },
  tags: {
    type: [String], // Define tags as an array of strings
  },
  img: {
    type: String,
  },
  likes: {
    type: Array,
    default: [],
  },
  comment: {
    type: Array,
    default: []
  },
  bookmarks: {
    type: Array,
    default: []
  },
  view: {
    type: Array,
    default: []
  }
}, { timestamps: true })

module.exports = mongoose.model('Post', PostSchema)

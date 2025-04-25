// models/index.js
const mongoose = require('mongoose');
const StudentProfile = require('./StudentProfile');
const ChatMessage = require('./ChatMessage');

module.exports = {
  StudentProfile,
  ChatMessage
};
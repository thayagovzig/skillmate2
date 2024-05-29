const mongoose = require('mongoose');

const clientengagementSchema = new mongoose.Schema({
  engagement: {
    type: String,
    required: true,
  },
  budgettype: {
    type: String,
    required: true,
    trim: true,
  },
  estimatedbudget: {
    type: String,
    required: true,
  },
  profilelevel: {
    type: String,
    required: true,
  },
  deadline: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  submitrequirements: {
    type: String,
  },
  similarproject: {
    type: String,
  },
  postRequirement:{
    type: String,
    required: true,
  }
});

const ClientEngagement = mongoose.model('ClientEngagement', clientengagementSchema);
module.exports = ClientEngagement;

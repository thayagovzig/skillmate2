const mongoose = require('mongoose');
const ClientEngagement = require('./projectengagement'); // Ensure correct path to clientengagement.js

const clientSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
    trim: true,
  },
  email: {
    required: true,
    type: String,
    trim: true,
    validate: {
      validator: (value) => {
        const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return value.match(re);
      },
      message: "Please enter a valid email address",
    },
  },
  type: {
    type: String,
    default: "client",
  },
  projectengagement: [ClientEngagement.schema]
});

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;

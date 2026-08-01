const mongoose = require("mongoose");

const coupleSchema = new mongoose.Schema({

  coupleName: {
    type: String,
    required: true
  },

  aboutUs: {
    type: String,
    default: ""
  },

  photoUrl: {
    type: String,
    default: null
  },

  startDate: {
    type: Date,
    default: null
  },

  anniversaryDate: {
    type: Date,
    default: null
  },

  partnerA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  partnerB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  inviteToken: String,
  inviteExpires: Date,

  isActive: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Couple", coupleSchema);

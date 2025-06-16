const mongoose = require("mongoose");

const AdminStatusSchema = new mongoose.Schema({
  disabled: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("AdminStatus", AdminStatusSchema);

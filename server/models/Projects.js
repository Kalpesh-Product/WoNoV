const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  projectName:{
    type:String,
    required:true
  },
  
  Department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  description: {
    type: String,
    required: true,
  },
  project:{
    type: String,
    
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  priority:{
    type: String,
    

  },
  startdate: {
    type: Date,
    required: true,
  },
  enddate:{
    type: Date,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },
  
  extension: {
    isExtended: {
      type: Boolean,
    },
    extendedDate: {
      type: Date,
    },
    extendedTime: {
      type: String,
      match: /^([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
    },
    reason: {
      type: String,
    },
  },
});

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;

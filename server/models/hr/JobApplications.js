const mongoose = require("mongoose");

const jobApplicationsSchema = new mongoose.Schema({
  companyData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  jobPosition: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  mobileNumber: {
    type: String,
  },
  location: {
    type: String,
  },
  experienceInYears: {
    type: String,
  },
  linkedInProfileUrl: {
    type: String,
  },
  currentMonthlySalary: {
    type: String,
  },
  expectedMonthlySalary: {
    type: String,
  },
  howSoonYouCanJoinInDays: {
    type: String,
  },
  willRelocateToGoa: {
    type: String,
  },
  whoAreYouAsPerson: {
    type: String,
  },
  skillSetsForJob: {
    type: String,
  },
  whyShouldWeConsiderYou: {
    type: String,
  },
  willingToBootstrap: {
    type: String,
  },
  message: {
    type: String,
  },
  finalSubmissionDate: {
    type: Date,
  },
  resumeLink: {
    type: String,
  },
  status: {
    type: String,
    default: "Pending",
  },
  remarks: {
    type: String,
  },
});

const JobApplicationSchema = mongoose.model(
  "JobApplication",
  jobApplicationsSchema
);
module.exports = JobApplicationSchema;

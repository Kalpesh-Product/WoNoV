const JobApplications = require("../../models/hr/JobApplications");
const { handleDocumentUpload } = require("../../config/s3Config");
const Company = require("../../models/hr/Company");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const JobApplicationSchema = require("../../models/hr/JobApplications");
const mongoose = require("mongoose");

const editableApplicationFields = [
  "jobPosition",
  "name",
  "email",
  "dateOfBirth",
  "mobileNumber",
  "location",
  "experienceInYears",
  "linkedInProfileUrl",
  "currentMonthlySalary",
  "expectedMonthlySalary",
  "howSoonYouCanJoinInDays",
  "willRelocateToGoa",
  "whoAreYouAsPerson",
  "skillSetsForJob",
  "whyShouldWeConsiderYou",
  "willingToBootstrap",
  "message",
  "finalSubmissionDate",
  "status",
  "remarks",
];

const applicationScope = (id, company) => ({
  _id: id,
  isDeleted: { $ne: true },
  $or: [{ companyData: company }, { companyData: null }],
});

const bulkInsertJobApplications = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "CSV file is required." });
    }

    const jobApplications = [];
    const stream = Readable.from(file.buffer);

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const invalidDates = [];

        const dob = row["Date of Birth"];
        const submissionDate = row["Submission Date"];
        const parsedDob = dob ? new Date(dob) : null;
        const parsedSubmissionDate = submissionDate
          ? new Date(submissionDate)
          : null;

        if (dob && isNaN(parsedDob.getTime())) {
          invalidDates.push({ field: "Date of Birth", value: dob, row });
        }
        if (submissionDate && isNaN(parsedSubmissionDate.getTime())) {
          invalidDates.push({
            field: "Submission Date",
            value: submissionDate,
            row,
          });
        }

        if (invalidDates.length) {
          console.warn("Invalid date(s) found:", invalidDates);
        }

        jobApplications.push({
          companyData: req.company,
          jobPosition: row["Job Position"],
          name: row["Name"],
          email: row["Email"],
          dateOfBirth:
            !parsedDob || isNaN(parsedDob.getTime()) ? null : parsedDob,
          mobileNumber: row["Mobile Number"],
          location: row["Location"],
          experienceInYears: row["Experience (in years)"] || null,
          linkedInProfileUrl: row["LinkedIn Profile URL"],
          currentMonthlySalary: row["Current Monthly Salary"] || null,
          expectedMonthlySalary: row["Expected Salary"] || null,
          howSoonYouCanJoinInDays: row["How Soon You Can Join (Days)"] || null,
          willRelocateToGoa: row["Will You Relocate to Goa (Yes/No)"],
          whoAreYouAsPerson: row["Who are you as a person"],
          skillSetsForJob:
            row[
              "What skill sets do you have for the job that you have applied"
            ],
          whyShouldWeConsiderYou:
            row["Why should we consider you for joining our company"],
          willingToBootstrap:
            row["Are you willing to bootstrap to join a growing startup"],
          message: row["Message"],
          finalSubmissionDate:
            !parsedSubmissionDate || isNaN(parsedSubmissionDate.getTime())
              ? null
              : parsedSubmissionDate,
          resumeLink: row["Resume Link"],
          status: row["Status"] || "Pending",
          remarks: row["Remarks"],
        });
      })

      .on("end", async () => {
        await JobApplications.insertMany(jobApplications);
        res
          .status(200)
          .json({ message: "Job applications inserted successfully." });
      })
      .on("error", (error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

const createJobApplication = async (req, res, next) => {
  try {
    const company = req.company;

    // Destructure form fields from request body
    const {
      jobPosition,
      name,
      email,
      dateOfBirth,
      mobileNumber,
      location,
      experienceInYears,
      linkedInProfileUrl,
      currentMonthlySalary,
      expectedMonthlySalary,
      howSoonYouCanJoinInDays,
      willRelocateToGoa,
      whoAreYouAsPerson,
      skillSetsForJob,
      whyShouldWeConsiderYou,
      willingToBootstrap,
      message,
      finalSubmissionDate,
      status,
      remarks,
    } = req.body;

    if (!name?.trim() || !email?.trim() || !req.file?.buffer) {
      return res.status(400).json({
        message: "Name, email, and resume are required.",
      });
    }

    const companyData = await Company.findOne({ _id: company }).lean().exec();

    // Upload resume file to Cloudinary
    let resumeLink = "";
    if (req.file && req.file.buffer) {
      const uploadResult = await handleDocumentUpload(
        req.file.buffer,
        `${companyData.companyName}/resumes/${jobPosition}/${name}`,
        req.file.originalname,
      );
      resumeLink = uploadResult.secure_url;
    }

    // Create and save job application
    const application = new JobApplications({
      companyData: company,
      jobPosition,
      name,
      email,
      dateOfBirth,
      mobileNumber,
      location,
      experienceInYears,
      linkedInProfileUrl,
      currentMonthlySalary,
      expectedMonthlySalary,
      howSoonYouCanJoinInDays,
      willRelocateToGoa,
      whoAreYouAsPerson,
      skillSetsForJob,
      whyShouldWeConsiderYou,
      willingToBootstrap,
      message,
      finalSubmissionDate,
      resumeLink,
      status: status || "Pending",
      remarks,
    });

    await application.save();

    res
      .status(201)
      .json({ message: "Application submitted successfully", application });
  } catch (error) {
    next(error);
  }
};

const getJobApplications = async (req, res, next) => {
  try {
    const companyId = req.company;

    const applications = await JobApplicationSchema.find({
      isDeleted: { $ne: true },
      $or: [{ companyData: companyId }, { companyData: null }],
    })
      .sort({ createdAt: -1 })
      .exec();

    return res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

const updateJobApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid job application ID." });
    }

    const application = await JobApplications.findOne(
      applicationScope(id, req.company),
    );
    if (!application) {
      return res.status(404).json({ message: "Job application not found." });
    }

    editableApplicationFields.forEach((field) => {
      if (req.body[field] !== undefined) application[field] = req.body[field];
    });

    if (!application.name?.trim() || !application.email?.trim()) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    if (req.file?.buffer) {
      const company = await Company.findById(req.company).lean().exec();
      const uploadResult = await handleDocumentUpload(
        req.file.buffer,
        `${company.companyName}/resumes/${application.jobPosition}/${application.name}`,
        req.file.originalname,
      );
      application.resumeLink = uploadResult.secure_url;
    }

    if (!application.resumeLink) {
      return res.status(400).json({ message: "Resume is required." });
    }

    await application.save();
    return res.status(200).json({
      message: "Job application updated successfully.",
      application,
    });
  } catch (error) {
    next(error);
  }
};

const archiveJobApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid job application ID." });
    }

    const application = await JobApplications.findOneAndUpdate(
      applicationScope(id, req.company),
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true },
    );

    if (!application) {
      return res.status(404).json({ message: "Job application not found." });
    }

    return res.status(200).json({
      message: "Job application deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobApplications };

module.exports = {
  bulkInsertJobApplications,
  createJobApplication,
  getJobApplications,
  updateJobApplication,
  archiveJobApplication,
};

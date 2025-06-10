const JobApplications = require("../../models/hr/JobApplications");
const { handleDocumentUpload } = require("../../config/cloudinaryConfig");
const Company = require("../../models/hr/Company");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const JobApplicationSchema = require("../../models/hr/JobApplications");

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
    } = req.body;

    const companyData = await Company.findOne({ _id: company }).lean().exec();

    // Upload resume file to Cloudinary
    let resumeLink = "";
    if (req.file && req.file.buffer) {
      const uploadResult = await handleDocumentUpload(
        req.file.buffer,
        `${companyData.companyName}/resumes/${jobPosition}/${name}`,
        req.file.originalname
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

    const applications = await JobApplicationSchema.find()
      .sort({ createdAt: -1 })
      .exec();

    return res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobApplications };

module.exports = {
  bulkInsertJobApplications,
  createJobApplication,
  getJobApplications,
};

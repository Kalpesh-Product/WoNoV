const axios = require("axios");
const Permission = require("../../models/Permissions");

const APPLICATION_LIST_PERMISSION = "hr_job_application_list_tab";
const DEFAULT_SUBMISSIONS_URL = "http://localhost:3011/api/submissions";

const normalizeApplication = (row) => ({
  externalSubmissionId: String(row.id ?? ""),
  source: String(row.source ?? "website"),
  jobPosition: row.job_position ?? "",
  name: row.name ?? "",
  email: row.email ?? "",
  dateOfBirth: row.dob ?? null,
  mobileNumber: row.mobile ?? "",
  location: row.location ?? "",
  experienceInYears: row.experience ?? "",
  linkedInProfileUrl: row.linkedin ?? "",
  currentMonthlySalary: row.currentmonthlysalary ?? "",
  expectedMonthlySalary: row.expectedsalary ?? "",
  howSoonYouCanJoinInDays: String(row.canjoin ?? ""),
  willRelocateToGoa: row.relocategoa ?? "",
  whoAreYouAsPerson: row.personality ?? "",
  skillSetsForJob: row.skills ?? "",
  relevantExperience: row.specialexperience ?? "",
  willingToBootstrap: row.willing ?? "",
  message: row.message ?? "",
  finalSubmissionDate: row.createdAt ?? null,
  websiteStatus: row.status ?? "",
  status:
    String(row.status ?? "").toLowerCase() === "new"
      ? "Pending"
      : (row.status ?? "Pending"),
  notificationStatus: row.notificationStatus ?? "",
  hasResume: Boolean(row.hasResume),
  resumeFilename: row.resumeFilename ?? "",
});

const getWebsiteJobApplications = async (req, res, next) => {
  try {
    const assigned = await Permission.findOne({ user: req.user })
      .select("permissions")
      .lean();
    if (!assigned?.permissions?.includes(APPLICATION_LIST_PERMISSION)) {
      return res
        .status(403)
        .json({ message: "You do not have access to job applications." });
    }

    const apiKey = process.env.SUBMISSIONS_API_KEY;
    if (!apiKey) {
      return res
        .status(503)
        .json({
          message:
            "Website applications API key is not configured on the server.",
        });
    }

    const url = new URL(
      process.env.JOB_APPLICATION_SUBMISSIONS_URL || DEFAULT_SUBMISSIONS_URL,
    );
    url.search = "";
    url.searchParams.set("kind", "application");
    const response = await axios.get(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000,
    });
    if (!Array.isArray(response.data?.data) || !response.data?.pagination) {
      return res
        .status(502)
        .json({
          message: "The website returned an invalid applications response.",
        });
    }

    const pagination = response.data.pagination;
    return res.json({
      data: response.data.data.map(normalizeApplication),
      pagination: {
        page: Number(pagination.page) || 1,
        pageSize: Number(pagination.pageSize) || response.data.data.length,
        total: Number(pagination.total) || 0,
        filteredTotal: Number(pagination.filteredTotal) || 0,
      },
    });
  } catch (error) {
    if (error.isAxiosError) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return res
          .status(502)
          .json({
            message:
              "Website applications API key was rejected. Check SUBMISSIONS_API_KEY on the server.",
          });
      }
      return res
        .status(502)
        .json({ message: "Website applications are temporarily unavailable." });
    }
    return next(error);
  }
};

module.exports = { getWebsiteJobApplications };

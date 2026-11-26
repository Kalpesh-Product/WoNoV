const axios = require("axios");
const Permission = require("../../models/Permissions");

const APPLICATION_LIST_PERMISSION = "hr_job_application_list_tab";

const hasApplicationAccess = async (user) => {
  const assigned = await Permission.findOne({ user }).select("permissions").lean();
  return assigned?.permissions?.includes(APPLICATION_LIST_PERMISSION);
};

const submissionsUrl = () => {
  const url = new URL(process.env.LOCAL_BIZNEST_URL || process.env.PROD_BIZNEST_URL);
  url.search = "";
  return url;
};

const careerFields = {
  name: "name", email: "email", dateOfBirth: "dob", mobileNumber: "mobile",
  location: "location", experienceInYears: "experience", linkedInProfileUrl: "linkedin",
  currentMonthlySalary: "currentmonthlysalary", expectedMonthlySalary: "expectedsalary",
  howSoonYouCanJoinInDays: "canjoin", willRelocateToGoa: "relocategoa",
  whoAreYouAsPerson: "personality", skillSetsForJob: "skills", relevantExperience: "specialexperience",
  willingToBootstrap: "willing", message: "message", status: "status",
};

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
  resumeLink: row.resumeLink ?? "",
});

const getWebsiteJobApplications = async (req, res, next) => {
  try {
    if (!await hasApplicationAccess(req.user)) {
      return res
        .status(403)
        .json({ message: "You do not have access to job applications." });
    }

    const apiKey = process.env.SUBMISSIONS_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        message:
          "Website applications API key is not configured on the server.",
      });
    }

    const url = submissionsUrl();
    url.searchParams.set("kind", "application");
    const response = await axios.get(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000,
    });
    if (!Array.isArray(response.data?.data) || !response.data?.pagination) {
      return res.status(502).json({
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
        return res.status(502).json({
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

const updateWebsiteJobApplication = async (req, res, next) => {
  try {
    if (!await hasApplicationAccess(req.user)) {
      return res.status(403).json({ message: "You do not have access to job applications." });
    }
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ message: "Invalid website application ID." });
    }
    const input = req.body;
    if (!input || typeof input !== "object" || Array.isArray(input) || !Object.keys(input).length ||
      Object.entries(input).some(([field, value]) => !Object.hasOwn(careerFields, field) || typeof value !== "string")) {
      return res.status(400).json({ message: "Send only changed job application fields as text." });
    }
    const key = process.env.SUBMISSIONS_WRITE_API_KEY;
    if (!key) return res.status(503).json({ message: "Website applications write key is not configured." });

    const url = submissionsUrl();
    url.pathname = `${url.pathname.replace(/\/$/, "")}/career/${id}`;
    const fields = Object.fromEntries(Object.entries(input).map(([field, value]) => [careerFields[field], value]));
    const { data } = await axios.patch(url.toString(), fields, {
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      timeout: 10000,
    });
    if (!data?.data || String(data.data.id) !== id) {
      return res.status(502).json({ message: "The website returned an invalid application response." });
    }
    return res.json({ application: normalizeApplication(data.data) });
  } catch (error) {
    if (!error.isAxiosError) return next(error);
    const status = error.response?.status;
    if ([400, 404, 409, 422].includes(status)) {
      return res.status(status).json({ message: error.response?.data?.message || "The website rejected the application edit." });
    }
    if (status === 401 || status === 403) {
      return res.status(502).json({ message: "Website applications write key was rejected." });
    }
    return res.status(502).json({ message: "Website application editing is temporarily unavailable." });
  }
};

module.exports = { getWebsiteJobApplications, updateWebsiteJobApplication };

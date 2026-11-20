const axios = require("axios");
const Partnership = require("../../models/sales/Partnership");
const Permission = require("../../models/Permissions");
const { handleDocumentUpload, handleDocumentDelete } = require("../../config/s3Config");
const {
  PROD_BIZNEST_SUBMISSIONS_URL,
  PROD_MEWO_SUBMISSIONS_URL,
} = require("../../config/submissionsConfig");

const PARTNERSHIP_PERMISSION = "sales_partners_mix_bag_card";
const SUBMISSION_KINDS = ["partnership", "startup", "subscription", "contact"];
const PARTNERSHIP_STATUSES = ["Pending", "Follow Up", "Converted", "Not Proceeding"];
const PARTNERSHIP_FIELDS = [
  "id",
  "kind",
  "source",
  "status",
  "createdAt",
  "updatedAt",
  "name",
  "email",
  "mobile",
  "count",
  "sdate",
  "pagename",
  "category",
  "dob",
  "location",
  "experience",
  "linkedin",
  "currentmonthlysalary",
  "expectedsalary",
  "canjoin",
  "relocategoa",
  "personality",
  "skills",
  "specialexperience",
  "willing",
  "message",
  "job_position",
  "notificationStatus",
  "hasResume",
  "resumeFilename",
];
const MEWO_FIELDS = [
  "id",
  "source",
  "status",
  "name",
  "email",
  "phone",
  "subject",
  "message",
  "startupName",
  "websiteUrl",
  "linkedinProfileUrl",
  "presentation",
  "createdAt",
  "updatedAt",
];
const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const normalizePhone = (value) => {
  const digits = String(value || "").replace(/[^\d]/g, "");
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
};
const validPhone = (value, kind) => {
  if (kind === "partnership") return /^\d{10}$/.test(value);
  return (
    /^(?:\+91|0)?\d{10}$/.test(value) && /^\d{10}$/.test(normalizePhone(value))
  );
};
const validUrl = (value) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
const validLinkedInProfileUrl = (value) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ["linkedin.com", "www.linkedin.com"].includes(
        url.hostname.toLowerCase(),
      ) &&
      /^\/(?:in|company)\/[^/\s]+\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
};

const requirePartnershipAccess = async (req, res, next) => {
  try {
    const assigned = await Permission.findOne({ user: req.user })
      .select("permissions")
      .lean();
    if (!assigned?.permissions?.includes(PARTNERSHIP_PERMISSION)) {
      return res
        .status(403)
        .json({ message: "You do not have access to enquiries." });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

const getPartnership = async (req, res, next) => {
  try {
    const kind = String(req.query.kind || "partnership").toLowerCase();
    if (!SUBMISSION_KINDS.includes(kind)) {
      return res.status(400).json({ message: "Invalid submission type." });
    }
    const submissions = await Partnership.find({ company: req.company, kind })
      .sort({ createdAt: -1 })
      .lean();
    return res.json(submissions);
  } catch (error) {
    return next(error);
  }
};

const createPartnership = async (req, res, next) => {
  try {
    const kind = String(req.body.kind || "partnership").toLowerCase();
    if (!SUBMISSION_KINDS.includes(kind)) {
      return res.status(400).json({ message: "Invalid submission type." });
    }
    if (
      [
        "name",
        "email",
        "mobile",
        "phone",
        "subject",
        "message",
        "startupName",
        "websiteUrl",
        "linkedinProfileUrl",
      ].some(
        (field) =>
          req.body[field] != null && typeof req.body[field] !== "string",
      )
    ) {
      return res.status(400).json({ message: "Form fields must be text." });
    }
    const name = (req.body.name ?? "").trim();
    const email = (req.body.email ?? "").trim();
    const phone = (req.body.phone ?? req.body.mobile ?? "").trim();
    const subject = (req.body.subject ?? "").trim();
    const message = (req.body.message ?? "").trim();
    const startupName = (req.body.startupName ?? "").trim();
    const websiteUrl = (req.body.websiteUrl ?? "").trim();
    const linkedinProfileUrl = (req.body.linkedinProfileUrl ?? "").trim();
    if (kind !== "subscription" && !name) {
      return res.status(400).json({ message: "Name is required." });
    }
    if (!validEmail(email)) {
      return res
        .status(400)
        .json({ field: "email", message: "Enter a valid email address." });
    }
    if (kind === "partnership" && !validPhone(phone, kind)) {
      return res
        .status(400)
        .json({ field: "mobile", message: "Enter a 10-digit mobile number." });
    }
    if (kind !== "partnership" && phone && !validPhone(phone, kind)) {
      return res
        .status(400)
        .json({
          field: "phone",
          message: "Enter a 10-digit phone number (optional 0 or +91 prefix).",
        });
    }
    if (kind !== "subscription" && !message) {
      return res.status(400).json({ message: "Message is required." });
    }
    if (message.length > 500) {
      return res
        .status(400)
        .json({ message: "Message must be 500 characters or fewer." });
    }
    if (kind === "contact" && !subject) {
      return res.status(400).json({ message: "Subject is required." });
    }
    if (kind === "startup" && !startupName) {
      return res.status(400).json({ message: "Startup name is required." });
    }
    if (websiteUrl && !validUrl(websiteUrl)) {
      return res.status(400).json({ message: "Enter a valid website URL." });
    }
    if (linkedinProfileUrl && !validLinkedInProfileUrl(linkedinProfileUrl)) {
      return res
        .status(400)
        .json({
          field: "linkedinProfileUrl",
          message: "Enter a LinkedIn profile URL.",
        });
    }
    if (req.file && kind !== "startup") {
      return res
        .status(400)
        .json({
          message: "Only startup enquiries can include a presentation.",
        });
    }
    if (
      req.file &&
      (req.file.size > 10 * 1024 * 1024 ||
        ![
          "application/pdf",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ].includes(req.file.mimetype))
    ) {
      return res
        .status(400)
        .json({
          message: "Presentation must be a PDF or PowerPoint file up to 10 MB.",
        });
    }
    const emailNormalized = email.toLowerCase();
    const phoneNormalized = phone ? normalizePhone(phone) : undefined;
    const existing = await Partnership.find({ company: req.company, kind })
      .select("email emailNormalized mobile phone phoneNormalized")
      .lean();
    if (
      existing.some(
        (entry) =>
          (entry.emailNormalized || entry.email || "").trim().toLowerCase() ===
          emailNormalized,
      )
    ) {
      return res
        .status(409)
        .json({
          field: "email",
          message: "This email already has an enquiry in this tab.",
        });
    }
    if (
      phoneNormalized &&
      existing.some(
        (entry) =>
          normalizePhone(
            entry.phoneNormalized || entry.phone || entry.mobile,
          ) === phoneNormalized,
      )
    ) {
      return res
        .status(409)
        .json({
          field: kind === "partnership" ? "mobile" : "phone",
          message: "This phone number already has an enquiry in this tab.",
        });
    }
    let presentation;
    if (req.file) {
      const uploaded = await handleDocumentUpload(
        req.file.buffer,
        "sales/enquiries/presentations",
        req.file.originalname,
      );
      presentation = {
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: uploaded.secure_url,
        key: uploaded.public_id,
      };
    }
    const submission = await Partnership.create({
      company: req.company,
      kind,
      name,
      email,
      emailNormalized,
      mobile: kind === "partnership" ? phone : undefined,
      phone: kind !== "partnership" ? phone : undefined,
      phoneNormalized,
      subject: kind === "contact" ? subject : undefined,
      startupName: kind === "startup" ? startupName : undefined,
      websiteUrl: kind === "startup" ? websiteUrl : undefined,
      linkedinProfileUrl: kind === "startup" ? linkedinProfileUrl : undefined,
      presentation,
      message,
      source: "local",
      sourceCompany: "Local",
      status: kind === "subscription" ? "Subscribed" : "Pending",
      pagename: kind[0].toUpperCase() + kind.slice(1),
    });
    return res.status(201).json(submission);
  } catch (error) {
    if (error.code === 11000) {
      const phoneConflict = Object.hasOwn(
        error.keyPattern || {},
        "phoneNormalized",
      );
      return res.status(409).json({
        field: phoneConflict
          ? String(req.body.kind).toLowerCase() === "partnership"
            ? "mobile"
            : "phone"
          : "email",
        message: phoneConflict
          ? "This phone number already has an enquiry in this tab."
          : "This email already has an enquiry in this tab.",
      });
    }
    return next(error);
  }
};

const updatePartnership = async (req, res, next) => {
  try {
    const submission = await Partnership.findOne({
      _id: req.params.id,
      company: req.company,
      kind: { $in: ["partnership", "startup", "contact"] },
    });
    if (!submission) return res.status(404).json({ message: "Enquiry not found." });
    const kind = submission.kind;
    const phoneField = kind === "partnership" ? "mobile" : "phone";
    const fields = kind === "partnership"
      ? ["name", "email", "mobile", "message"]
      : kind === "startup"
        ? ["name", "email", "phone", "startupName", "websiteUrl", "linkedinProfileUrl", "message"]
        : ["name", "email", "phone", "subject", "message"];
    if (fields.some((field) => typeof req.body[field] !== "string")) {
      return res.status(400).json({ message: "Complete the enquiry form." });
    }
    if (req.body.status != null && !PARTNERSHIP_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ field: "status", message: "Select a valid status." });
    }
    const values = Object.fromEntries(fields.map((field) => [field, req.body[field].trim()]));
    const { name, message } = values;
    const email = values.email.toLowerCase();
    const phone = values[phoneField];
    if (!name) return res.status(400).json({ field: "name", message: "Name is required." });
    if (!validEmail(email)) return res.status(400).json({ field: "email", message: "Enter a valid email address." });
    if ((kind === "partnership" || phone) && !validPhone(phone, kind)) {
      return res.status(400).json({ field: phoneField, message: kind === "partnership" ? "Enter a 10-digit mobile number." : "Enter a 10-digit phone number (optional 0 or +91 prefix)." });
    }
    if (!message || message.length > 500) {
      return res.status(400).json({ field: "message", message: "Enter a message within 500 characters." });
    }
    if (kind === "contact" && !values.subject) return res.status(400).json({ field: "subject", message: "Subject is required." });
    if (kind === "startup" && !values.startupName) return res.status(400).json({ field: "startupName", message: "Startup name is required." });
    if (kind === "startup" && values.websiteUrl && !validUrl(values.websiteUrl)) return res.status(400).json({ field: "websiteUrl", message: "Enter a valid website URL." });
    if (kind === "startup" && values.linkedinProfileUrl && !validLinkedInProfileUrl(values.linkedinProfileUrl)) return res.status(400).json({ field: "linkedinProfileUrl", message: "Enter a LinkedIn profile URL." });
    if (req.file && kind !== "startup") return res.status(400).json({ message: "Only startup enquiries can include a presentation." });
    if (req.file && (req.file.size > 10 * 1024 * 1024 || ![
      "application/pdf", "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ].includes(req.file.mimetype))) return res.status(400).json({ field: "presentation", message: "Presentation must be a PDF or PowerPoint file up to 10 MB." });
    const others = await Partnership.find({
      _id: { $ne: submission._id },
      company: req.company,
      kind,
    }).select("email emailNormalized mobile phone phoneNormalized").lean();
    const emailChanged = (submission.email || "").trim().toLowerCase() !== email;
    if (emailChanged && others.some((entry) => (entry.emailNormalized || entry.email || "").trim().toLowerCase() === email)) {
      return res.status(409).json({ field: "email", message: "This email already has an enquiry in this tab." });
    }
    const phoneNormalized = phone ? normalizePhone(phone) : undefined;
    const phoneChanged = normalizePhone(submission[phoneField]) !== (phoneNormalized || "");
    if (phoneChanged && phoneNormalized && others.some((entry) => normalizePhone(entry.phoneNormalized || entry.phone || entry.mobile) === phoneNormalized)) {
      return res.status(409).json({ field: phoneField, message: "This phone number already has an enquiry in this tab." });
    }
    const previousPresentationKey = submission.presentation?.key;
    let uploadedPresentationKey;
    if (req.file) {
      const uploaded = await handleDocumentUpload(req.file.buffer, "sales/enquiries/presentations", req.file.originalname);
      uploadedPresentationKey = uploaded.public_id;
      submission.presentation = { filename: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size, url: uploaded.secure_url, key: uploadedPresentationKey };
    } else if (kind === "startup" && req.body.removePresentation === "true") {
      submission.presentation = undefined;
    }
    submission.set({ ...values, email, emailNormalized: email, phoneNormalized });
    if (req.body.status != null) submission.status = req.body.status;
    if (!phoneNormalized) submission.phoneNormalized = undefined;
    try {
      await submission.save();
    } catch (error) {
      if (uploadedPresentationKey) await handleDocumentDelete(uploadedPresentationKey).catch(() => {});
      throw error;
    }
    if (previousPresentationKey && (req.file || req.body.removePresentation === "true")) {
      await handleDocumentDelete(previousPresentationKey).catch(() => {});
    }
    return res.json(submission);
  } catch (error) {
    if (error.code === 11000) {
      const phoneConflict = Object.hasOwn(error.keyPattern || {}, "phoneNormalized");
      return res.status(409).json({
        field: phoneConflict ? (typeof req.body.mobile === "string" ? "mobile" : "phone") : "email",
        message: phoneConflict
          ? "This phone number already has an enquiry in this tab."
          : "This email already has an enquiry in this tab.",
      });
    }
    return next(error);
  }
};

const updatePartnershipStatus = async (req, res, next) => {
  try {
    if (!PARTNERSHIP_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ message: "Choose Pending, Follow Up, Converted, or Not Proceeding." });
    }
    const submission = await Partnership.findOneAndUpdate(
      { _id: req.params.id, company: req.company, kind: { $in: ["partnership", "startup", "contact"] } },
      { $set: { status: req.body.status } },
      { new: true, runValidators: true },
    );
    if (!submission) return res.status(404).json({ message: "Enquiry not found." });
    return res.json(submission);
  } catch (error) {
    return next(error);
  }
};

const getWebsitePartnership = async (req, res) => {
  const kind = String(req.query.kind || "partnership").toLowerCase();
  if (!SUBMISSION_KINDS.includes(kind)) {
    return res.status(400).json({ message: "Invalid submission type." });
  }
  const isMeWo = kind !== "partnership";
  const apiKey = isMeWo
    ? process.env.MEWO_SUBMISSIONS_API_KEY
    : process.env.SUBMISSIONS_API_KEY;
  if (!apiKey) {
    return res
      .status(503)
      .json({
        message: `${isMeWo ? "MeWo" : "BIZNest"} submissions API key is not configured on the server.`,
      });
  }
  try {
    const url = new URL(
      isMeWo
        ? process.env.MEWO_SUBMISSIONS_URL || PROD_MEWO_SUBMISSIONS_URL
        : process.env.PARTNERSHIP_SUBMISSIONS_URL ||
            process.env.PARTNER_SUBMISSIONS_URL ||
            PROD_BIZNEST_SUBMISSIONS_URL,
    );
    url.search = "";
    url.searchParams.set("kind", kind);
    const response = await axios.get(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000,
    });
    if (!Array.isArray(response.data?.data)) {
      return res
        .status(502)
        .json({
          message: "The website returned an invalid submissions response.",
        });
    }
    return res.json({
      data: response.data.data.map((row) => {
        const submission = Object.fromEntries(
          (isMeWo ? MEWO_FIELDS : PARTNERSHIP_FIELDS).map((field) => [
            field,
            row[field] ?? null,
          ]),
        );
        submission.kind = kind;
        submission.sourceCompany = isMeWo ? "MeWo" : "BIZNest";
        submission.status =
          String(row.status ?? "").toLowerCase() === "new"
            ? "Pending"
            : (row.status ?? "Pending");
        return submission;
      }),
      pagination: response.data.pagination ?? null,
    });
  } catch (error) {
    return res.status(502).json({
      message:
        error.response?.status === 401 || error.response?.status === 403
          ? "Website submissions API key was rejected."
          : "Website submissions are temporarily unavailable.",
    });
  }
};

module.exports = {
  requirePartnershipAccess,
  getPartnership,
  createPartnership,
  updatePartnership,
  updatePartnershipStatus,
  getWebsitePartnership,
};

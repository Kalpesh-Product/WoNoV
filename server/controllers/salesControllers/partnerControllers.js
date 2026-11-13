const axios = require("axios");
const Partner = require("../../models/sales/Partner");
const Permission = require("../../models/Permissions");

const PARTNERS_PERMISSION = "sales_partners_mix_bag_card";
const DEFAULT_SUBMISSIONS_URL = "http://localhost:3011/api/submissions";
const PARTNER_FIELDS = [
  "id", "kind", "source", "status", "createdAt", "updatedAt", "name",
  "email", "mobile", "count", "sdate", "pagename", "category", "dob",
  "location", "experience", "linkedin", "currentmonthlysalary", "expectedsalary",
  "canjoin", "relocategoa", "personality", "skills", "specialexperience",
  "willing", "message", "job_position", "notificationStatus", "hasResume",
  "resumeFilename",
];

const requirePartnersAccess = async (req, res, next) => {
  try {
    const assigned = await Permission.findOne({ user: req.user })
      .select("permissions")
      .lean();
    if (!assigned?.permissions?.includes(PARTNERS_PERMISSION)) {
      return res.status(403).json({ message: "You do not have access to partners." });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

const getPartners = async (req, res, next) => {
  try {
    const partners = await Partner.find({ company: req.company })
      .sort({ createdAt: -1 })
      .lean();
    return res.json(partners);
  } catch (error) {
    return next(error);
  }
};

const createPartner = async (req, res, next) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const email = String(req.body.email ?? "").trim();
    const mobile = String(req.body.mobile ?? "").trim();
    const message = String(req.body.message ?? "").trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Name and a valid email are required." });
    }
    const partner = await Partner.create({
      company: req.company,
      name,
      email,
      mobile,
      message,
      source: "local",
      status: "Pending",
      pagename: "Partner",
    });
    return res.status(201).json(partner);
  } catch (error) {
    return next(error);
  }
};

const getWebsitePartners = async (req, res) => {
  const apiKey = process.env.SUBMISSIONS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: "Website submissions API key is not configured on the server." });
  }
  try {
    const url = new URL(process.env.PARTNER_SUBMISSIONS_URL || DEFAULT_SUBMISSIONS_URL);
    url.search = "";
    url.searchParams.set("kind", "partnership");
    const response = await axios.get(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000,
    });
    if (!Array.isArray(response.data?.data)) {
      return res.status(502).json({ message: "The website returned an invalid partners response." });
    }
    return res.json({
      data: response.data.data.map((row) => {
        const partner = Object.fromEntries(PARTNER_FIELDS.map((field) => [field, row[field] ?? null]));
        partner.status = String(row.status ?? "").toLowerCase() === "new"
          ? "Pending"
          : row.status ?? "Pending";
        return partner;
      }),
      pagination: response.data.pagination ?? null,
    });
  } catch (error) {
    return res.status(502).json({
      message: error.response?.status === 401 || error.response?.status === 403
        ? "Website submissions API key was rejected."
        : "Website partners are temporarily unavailable.",
    });
  }
};

module.exports = {
  requirePartnersAccess,
  getPartners,
  createPartner,
  getWebsitePartners,
};

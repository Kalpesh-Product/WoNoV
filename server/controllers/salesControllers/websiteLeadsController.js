const axios = require("axios");
const Lead = require("../../models/sales/Lead");
const SalesLog = require("../../models/sales/salesLog");
const WEB_LEAD_FIELDS = { name: "Name", email: "Email", mobile: "Mobile", status: "Status" };
const WEB_LEAD_STATUSES = ["Cold", "Mild", "Hot", "Closed"];
const validId = (value) => /^[a-f\d]{24}$/i.test(value || "");

const websiteUrl = () => {
  const url = new URL(process.env.LOCAL_BIZNEST_URL || process.env.PROD_BIZNEST_URL);
  url.search = "";
  return url;
};
const WEBSITE_LEAD_KINDS = new Set([
  "book-your-subscription",
  "work-from-cafe",
  "car-renting",
  "co-living-space",
  "co-working-space",
  "exclusive-campus",
  "exclusive-workations",
  "managed-workspace",
  "meetings-and-conferences",
  "private-apartments-villas",
  "private-workspace",
  "training-and-events",
  "virtual-office",
  "yacht-renting",
  "co-working-goa",
  "meeting-rooms-goa",
  "virtual-office-goa",
  "workation-goa",
  "partnership",
  "application",
  "product",
]);

const getWebsiteLeads = async (req, res, next) => {
  const kind = String(req.query.kind || "book-your-subscription").toLowerCase();
  const provider = req.query.provider || "biznest";
  if (provider !== "biznest" || !WEBSITE_LEAD_KINDS.has(kind)) {
    return res.status(400).json({ message: "Invalid submission type." });
  }

  const apiKey = process.env.SUBMISSIONS_API_KEY;
  if (!apiKey) {
    return res
      .status(503)
      .json({ message: "Website submissions API key is not configured." });
  }

  try {
    const url = websiteUrl();
    url.searchParams.set("kind", kind);

    const submissions = [];
    let page = 1;
    let hasNextPage = false;

    do {
      if (page > 200) {
        return res
          .status(502)
          .json({
            message:
              "The website returned too many submission pages. Please narrow the form type.",
          });
      }
      if (page > 1) url.searchParams.set("page", String(page));
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
      submissions.push(...response.data.data);
      const pagination = response.data.pagination;
      hasNextPage = Boolean(
        pagination?.hasNextPage ??
        (pagination?.totalPages && page < Number(pagination.totalPages)),
      );
      page += 1;
    } while (hasNextPage);

    return res.json({ data: submissions, kind });
  } catch (error) {
    if (!error.isAxiosError) return next(error);
    return res.status(502).json({
      message:
        error.response?.status === 401 || error.response?.status === 403
          ? "Website submissions API key was rejected."
          : "Website submissions are temporarily unavailable.",
    });
  }
};

const updateBizNestLead = async (req, res, next) => {
  const { id } = req.params;
  if (!validId(id)) return res.status(400).json({ message: "Invalid website lead ID." });
  const input = req.body;
  if (!input || typeof input !== "object" || Array.isArray(input) || !Object.keys(input).length ||
      Object.entries(input).some(([field, value]) => !Object.hasOwn(WEB_LEAD_FIELDS, field) || typeof value !== "string")) {
    return res.status(400).json({ message: "Send only changed lead fields as text." });
  }
  const values = Object.fromEntries(Object.entries(input).map(([field, value]) => [field, value.trim()]));
  const validations = {
    name: (value) => value.length > 0 && value.length <= 200,
    email: (value) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    mobile: (value) => /^[1-9]\d{9}$/.test(value),
    status: (value) => WEB_LEAD_STATUSES.includes(value),
  };
  for (const [field, value] of Object.entries(values)) {
    if (!validations[field](value)) return res.status(400).json({ field, message: `Enter a valid ${WEB_LEAD_FIELDS[field].toLowerCase()}.` });
  }
  const readKey = process.env.SUBMISSIONS_API_KEY;
  const writeKey = process.env.SUBMISSIONS_WRITE_API_KEY;
  if (!readKey || !writeKey) return res.status(503).json({ message: "BIZNest lead edit keys are not configured." });

  try {
    const url = websiteUrl();
    const lookup = new URL(url);
    lookup.searchParams.set("kind", "product");
    lookup.searchParams.set("pageSize", "100");
    let before;
    for (let page = 1; page <= 200; page += 1) {
      lookup.searchParams.set("page", String(page));
      const { data } = await axios.get(lookup.toString(), {
        headers: { Authorization: `Bearer ${readKey}` }, timeout: 10000,
      });
      if (!Array.isArray(data?.data)) return res.status(502).json({ message: "Invalid BIZNest submissions response." });
      before = data.data.find((row) => row.id === id && row.kind === "product");
      if (before || !data.pagination?.hasNextPage) break;
    }
    if (!before) return res.status(404).json({ message: "BIZNest lead not found." });
    const current = (field) => field === "status" && (!before.status || before.status.toLowerCase() === "new")
      ? "Pending" : String(before[field] ?? "").trim();
    const changes = Object.entries(values).filter(([field, value]) => value !== current(field));
    if (!changes.length) return res.json({ message: "No changes to save." });
    url.pathname = `${url.pathname.replace(/\/$/, "")}/product/${id}`;
    const response = await axios.patch(url.toString(), Object.fromEntries(changes), {
      headers: { Authorization: `Bearer ${writeKey}`, "Content-Type": "application/json" }, timeout: 10000,
    });
    try {
      await SalesLog.create({
        company: req.company, performedBy: req.user, ipAddress: req.ip || "unknown",
        action: "Website Lead Edited", websiteEnquiryId: id, enquiryKind: "product",
        changes: { fields: changes.map(([field, value]) => ({
          field, label: WEB_LEAD_FIELDS[field], oldValue: current(field) || null,
          newValue: response.data?.data?.[field] ?? value,
        })) },
      });
    } catch (error) {
      console.error("BIZNest lead edit history could not be saved", error.name);
      return res.status(500).json({ message: "The lead was updated, but its edit history could not be saved. Refresh before editing again." });
    }
    return res.json(response.data);
  } catch (error) {
    if (!error.isAxiosError) return next(error);
    const status = error.response?.status;
    if ([400, 404, 409, 422].includes(status)) {
      return res.status(status).json({ message: error.response?.data?.message || "BIZNest rejected the lead edit." });
    }
    return res.status(502).json({ message: "BIZNest lead editing is temporarily unavailable." });
  }
};

const getLeadEditHistory = async (req, res, next) => {
  const { source, id } = req.params;
  if (!validId(id)) return res.status(400).json({ message: "Invalid lead ID." });
  const { company } = req;
  let match;
  if (source === "local") {
    match = { lead: id, action: "Lead Edited" };
  } else if (source === "biznest") {
    match = { websiteEnquiryId: id, enquiryKind: "product", action: "Website Lead Edited" };
  } else {
    return res.status(400).json({ message: "Invalid lead source." });
  }
  try {
    if (source === "local" && !await Lead.exists({ _id: id, company })) {
      return res.status(404).json({ message: "Lead not found." });
    }
    const entries = await SalesLog.find({ company, ...match }).sort({ createdAt: -1, _id: -1 })
      .populate("performedBy", "firstName middleName lastName").lean();
    return res.json(entries.map(({ _id, createdAt, performedBy, changes }) => ({
      _id, editedAt: createdAt, editedBy: performedBy, changes: changes?.fields || [],
    })));
  } catch (error) {
    return next(error);
  }
};

module.exports = { getWebsiteLeads, updateBizNestLead, getLeadEditHistory };

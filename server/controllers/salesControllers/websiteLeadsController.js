const axios = require("axios");
const {
  PROD_BIZNEST_SUBMISSIONS_URL,
} = require("../../config/submissionsConfig");
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
  if (!WEBSITE_LEAD_KINDS.has(kind)) {
    return res.status(400).json({ message: "Invalid submission type." });
  }

  const apiKey = process.env.SUBMISSIONS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: "Website submissions API key is not configured." });
  }

  try {
    const url = new URL(
      process.env.WEBSITE_LEADS_SUBMISSIONS_URL || PROD_BIZNEST_SUBMISSIONS_URL,
    );
    url.search = "";
    url.searchParams.set("kind", kind);

    const submissions = [];
    let page = 1;
    let hasNextPage = false;

    do {
      if (page > 200) {
        return res.status(502).json({ message: "The website returned too many submission pages. Please narrow the form type." });
      }
      if (page > 1) url.searchParams.set("page", String(page));
      const response = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 10000,
      });
      if (!Array.isArray(response.data?.data)) {
        return res.status(502).json({ message: "The website returned an invalid submissions response." });
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

module.exports = { getWebsiteLeads };

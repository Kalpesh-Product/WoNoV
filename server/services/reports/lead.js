const Lead = require("../../models/sales/Lead");

const LEAD_POPULATE_OPTIONS = [
  {
    path: "serviceCategory",
    select: "serviceName",
  },
  {
    path: "proposedLocations",
    select: "unitNo unitName building",
    model: "Unit",
    populate: {
      path: "building",
      select: "buildingName",
      model: "Building",
    },
  },
];

const normalizeLeadIdentity = (lead = {}) =>
  String(
    lead.emailAddress || lead.contactNumber || lead.companyName || lead._id,
  )
    .trim()
    .toLowerCase();

const formatLeadReportRow = (lead = {}) => ({
  dateOfContact: lead.dateOfContact,
  companyName: lead.companyName,
  serviceCategory: lead.serviceCategory?.serviceName || lead.serviceCategory,
  leadStatus: lead.leadStatus,
  proposedLocations: Array.isArray(lead.proposedLocations)
    ? lead.proposedLocations
        .map((location) =>
          [
            location?.unitNo,
            location?.unitName,
            location?.building?.buildingName,
          ]
            .filter(Boolean)
            .join(" - "),
        )
        .filter(Boolean)
        .join(", ")
    : "",
  sector: lead.sector,
  headOfficeLocation: lead.headOfficeLocation,
  officeInGoa: lead.officeInGoa,
  pocName: lead.pocName,
  designation: lead.designation,
  contactNumber: lead.contactNumber,
  emailAddress: lead.emailAddress,
  leadSource: lead.leadSource,
  period: lead.period,
  openDesks: lead.openDesks,
  cabinDesks: lead.cabinDesks,
  totalDesks: lead.totalDesks,
  clientBudget: lead.clientBudget,
  startDate: lead.startDate,
  remarksComments: lead.remarksComments,
  lastFollowUpDate: lead.lastFollowUpDate,
});

const fetchLeadReportService = async ({
  company,
  dateFilter,
  isReport = false,
}) => {
  const filter = { company };

  if (dateFilter?.dateOfContact) {
    filter.dateOfContact = dateFilter.dateOfContact;
  }

  const leads = await Lead.find(filter)
    .populate(LEAD_POPULATE_OPTIONS)
    .sort({ dateOfContact: -1, createdAt: -1 })
    .lean()
    .exec();

  const uniqueLeads = Array.from(
    leads
      .reduce((leadMap, lead) => {
        const leadKey = normalizeLeadIdentity(lead);

        if (!leadMap.has(leadKey)) {
          leadMap.set(leadKey, lead);
        }

        return leadMap;
      }, new Map())
      .values(),
  );

  if (isReport) {
    return uniqueLeads.map(formatLeadReportRow);
  }

  return uniqueLeads;
};

module.exports = {
  fetchLeadReportService,
  LEAD_POPULATE_OPTIONS,
};

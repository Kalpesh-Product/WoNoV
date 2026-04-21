require("dotenv").config();
const mongoose = require("mongoose");
const Visitor = require("../models/visitor/Visitor");
const ExternalVisits = require("../models/visitor/ExternalVisits");

const MONGO_URI = process.env.DB_URL;

if (!MONGO_URI) {
  console.error(
    "Missing MongoDB connection string. Set MONGO_URL or MONGODB_URI.",
  );
  process.exit(1);
}

const mapVisitorToExternalVisit = (visitor) => ({
  visitorId: visitor._id,
  company: visitor.company,
  legacyVisitorEntryId: visitor._id,
  visitorType: visitor.visitorType,
  dateOfVisit: visitor.dateOfVisit || visitor.createdAt,
  checkIn: visitor.checkIn || visitor.dateOfVisit || visitor.createdAt,
  checkOut: visitor.checkOut || null,
  checkedInBy: visitor.checkedInBy || null,
  checkedOutBy: visitor.checkedOutBy || null,
  amount: visitor.amount || 0,
  discount: visitor.discount || 0,
  gstAmount: visitor.gstAmount || 0,
  totalAmount: visitor.totalAmount || 0,
  paymentStatus: visitor.paymentStatus || false,
  paymentMode: visitor.paymentMode || null,
  paymentProof: visitor.paymentProof || {},
  unit: visitor.unit || null,
  notes:
    visitor.notes || "Backfilled from Visitor legacy payment/check-in schema",
  purposeOfVisit: visitor.purposeOfVisit || "",
  scheduledDate: visitor.scheduledDate || null,
  scheduledStartTime: visitor.scheduledStartTime || null,
  scheduledEndTime: visitor.scheduledEndTime || null,
  toMeetCompany: visitor.toMeetCompany || null,
  department: visitor.department || null,
  visitorRoles: Array.isArray(visitor.visitorRoles)
    ? visitor.visitorRoles
    : visitor.visitorFlag
      ? [visitor.visitorFlag]
      : ["Visitor"],
  visitorFlag: visitor.visitorFlag || null,
  toMeet: visitor.toMeet || null,
  clientToMeet: visitor.clientToMeet || null,
  meeting: visitor.meeting || null,
  visitorCompany: visitor.visitorCompany || "",
  building: visitor.building || null,
});

const migrate = async () => {
  await mongoose.connect(MONGO_URI);

  const cursor = Visitor.find({}).cursor();
  let migrated = 0;
  let skipped = 0;

  for await (const visitor of cursor) {
    const existing = await ExternalVisits.findOne({
      visitorId: visitor._id,
      legacyVisitorEntryId: visitor._id,
    }).select("_id");

    if (existing) {
      skipped += 1;
      continue;
    }

    await ExternalVisits.create(mapVisitorToExternalVisit(visitor));

    migrated += 1;
  }

  await mongoose.disconnect();
  console.log(
    `External visits migration complete. Migrated: ${migrated}, Skipped: ${skipped}`,
  );
};

migrate().catch(async (error) => {
  console.error("Migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

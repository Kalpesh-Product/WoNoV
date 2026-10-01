const mongoose = require("mongoose");
const Visitor = require("../models/visitor/Visitor");
const ExternalVisits = require("../models/visitor/ExternalVisits");
const Unit = require("../models/locations/Unit");

// A reservation has scheduled times; actual attendance starts at check-in.
const buildMeetingVisit = (meeting, visitor, unit) => ({
  visitorId: visitor._id,
  company: meeting.company,
  meeting: meeting._id,
  visitorType: "Meeting",
  visitorFlag: "Client",
  visitorRoles: [...new Set([...(visitor.visitorRoles || []), "Client"])],
  purposeOfVisit: "Meeting Room Booking",
  dateOfVisit: meeting.startTime,
  scheduledDate: meeting.startDate,
  scheduledStartTime: meeting.startTime,
  scheduledEndTime: meeting.endTime,
  checkIn: null,
  checkOut: null,
  checkedInBy: null,
  checkedOutBy: null,
  unit: unit?._id || null,
  amount: meeting.paymentBaseAmount || 0,
  gstAmount: meeting.paymentGstAmount || 0,
  totalAmount: meeting.paymentAmount || 0,
  discount: meeting.discountAmount || 0,
  paymentStatus: meeting.paymentStatus === true,
  paymentMode: meeting.paymentMode || null,
  paymentProof: {},
  paymentVerification: meeting.paymentVerification || "Pending",
});

const bookExternalMeetingVisit = async (meeting, room) => {
  await mongoose.connection.transaction(async (session) => {
    const visitor = await Visitor.findOne({
      _id: meeting.externalClient, company: meeting.company,
    }).session(session).lean();
    if (!visitor) throw new Error("External visitor not found in this company");
    const unit = room.location
      ? await Unit.findOne({ _id: room.location, company: meeting.company })
          .select("building").session(session).lean()
      : null;
    await meeting.save({ session });
    const visit = buildMeetingVisit(meeting, visitor, unit);
    await ExternalVisits.create([visit], { session });
    const { visitorId, company, ...latestVisit } = visit;
    await Visitor.updateOne(
      { _id: visitorId, company },
      { $set: { ...latestVisit, building: unit?.building || visitor.building || null } },
      { session, runValidators: true },
    );
  });
  return meeting;
};

module.exports = { bookExternalMeetingVisit, buildMeetingVisit };

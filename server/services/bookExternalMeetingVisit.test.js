const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Visitor = require("../models/visitor/Visitor");
const ExternalVisits = require("../models/visitor/ExternalVisits");
const Unit = require("../models/locations/Unit");
const { bookExternalMeetingVisit, buildMeetingVisit } = require("./bookExternalMeetingVisit");
const id = () => new mongoose.Types.ObjectId();
const fixture = () => ({
  meeting: { _id: id(), company: id(), externalClient: id(),
    startDate: new Date("2026-10-02T00:00:00Z"),
    startTime: new Date("2026-10-02T04:30:00Z"),
    endTime: new Date("2026-10-02T05:30:00Z") },
  visitor: { _id: id(), visitorRoles: ["Visitor"], amount: 850, checkIn: new Date() },
});

test("meeting reservations validate without fabricating actual check-in", async () => {
  const { meeting, visitor } = fixture();
  const visit = buildMeetingVisit(meeting, visitor, { _id: id() });
  await new ExternalVisits(visit).validate();
  assert.equal(visit.checkIn, null);
  assert.equal(visit.checkedInBy, null);
  assert.equal(visit.scheduledStartTime, meeting.startTime);
  assert.equal(visit.meeting, meeting._id);
  assert.equal(visit.amount, 0);
  assert.equal(visitor.amount, 850);
  assert.deepEqual(visit.visitorRoles, ["Visitor", "Client"]);
  assert.equal(visit.legacyVisitorEntryId, undefined);
});

test("day pass visits still require actual check-in", async () => {
  const visit = new ExternalVisits({ visitorId: id(), company: id(), visitorType: "Full-Day Pass" });
  await assert.rejects(visit.validate(), /checkIn/);
});

test("all booking writes use one session and the company-scoped visitor", async (t) => {
  const { meeting, visitor } = fixture();
  const session = {};
  const writes = [];
  t.mock.method(mongoose.connection, "transaction", async (fn) => fn(session));
  t.mock.method(Visitor, "findOne", (filter) => {
    assert.equal(filter.company, meeting.company);
    assert.equal(filter._id, meeting.externalClient);
    return { session: (value) => { assert.equal(value, session); return { lean: async () => visitor }; } };
  });
  t.mock.method(ExternalVisits, "create", async ([visit], options) => {
    assert.equal(options.session, session); writes.push(visit);
  });
  t.mock.method(Visitor, "updateOne", async (filter, update, options) => {
    assert.equal(filter._id, visitor._id);
    assert.equal(filter.company, meeting.company);
    assert.equal(options.session, session);
    assert.equal(update.$set.meeting, meeting._id);
    assert.equal(update.$set.checkIn, null);
    writes.push(update);
  });
  meeting.save = async (options) => { assert.equal(options.session, session); writes.push(meeting); };
  await bookExternalMeetingVisit(meeting, {});
  assert.equal(writes.length, 3);
});

test("missing or cross-company visitors cannot create a meeting", async (t) => {
  const { meeting } = fixture();
  t.mock.method(mongoose.connection, "transaction", async (fn) => fn({}));
  t.mock.method(Visitor, "findOne", () => ({ session: () => ({ lean: async () => null }) }));
  meeting.save = async () => assert.fail("Meeting must not be saved");
  await assert.rejects(bookExternalMeetingVisit(meeting, {}), /External visitor not found/);
});

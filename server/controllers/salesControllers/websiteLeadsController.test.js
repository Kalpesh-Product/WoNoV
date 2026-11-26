const test = require("node:test");
const assert = require("node:assert/strict");
const axios = require("axios");
const Lead = require("../../models/sales/Lead");
const SalesLog = require("../../models/sales/salesLog");
const { editLead } = require("./leadsControllers");
const { getWebsiteLeads, updateBizNestLead, getLeadEditHistory } = require("./websiteLeadsController");

const id = "6ae85be06b9f7a5f95395425";
const company = "6ae85be06b9f7a5f95395426";
const user = "6ae85be06b9f7a5f95395427";
const next = (error) => { throw error; };
const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("BIZNest product edits forward only changed values and save company-scoped history", async (t) => {
  const keys = { SUBMISSIONS_API_KEY: "read-key", SUBMISSIONS_WRITE_API_KEY: "write-key", LOCAL_BIZNEST_URL: "http://localhost:3011/api/submissions" };
  const previous = Object.fromEntries(Object.keys(keys).map((key) => [key, process.env[key]]));
  Object.assign(process.env, keys);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  t.mock.method(axios, "get", async (url, options) => {
    assert.equal(new URL(url).searchParams.get("kind"), "product");
    assert.equal(options.headers.Authorization, "Bearer read-key");
    return { data: { data: [{ id, kind: "product", name: "Before", status: "new" }] } };
  });
  const patch = t.mock.method(axios, "patch", async (url, fields, options) => {
    assert.equal(url, `http://localhost:3011/api/submissions/product/${id}`);
    assert.deepEqual(fields, { name: "After", status: "Hot" });
    assert.equal(options.headers.Authorization, "Bearer write-key");
    return { data: { data: { name: "After", status: "Hot" } } };
  });
  let log;
  t.mock.method(SalesLog, "create", async (entry) => { log = entry; });
  const res = response();
  await updateBizNestLead({ params: { id }, company, user, body: { name: " After ", status: "Hot" } }, res, next);
  assert.equal(res.statusCode, 200);
  assert.equal(patch.mock.callCount(), 1);
  assert.equal(log.company, company);
  assert.equal(log.performedBy, user);
  assert.deepEqual(log.changes.fields, [
    { field: "name", label: "Name", oldValue: "Before", newValue: "After" },
    { field: "status", label: "Status", oldValue: "Pending", newValue: "Hot" },
  ]);

  const invalid = response();
  await updateBizNestLead({ params: { id }, body: { status: "Custom" } }, invalid, next);
  assert.equal(invalid.statusCode, 400);
  assert.equal(patch.mock.callCount(), 1);
});

test("Unique Leads loads BIZNest product and subscription records and rejects MeWo", async (t) => {
  const keys = { SUBMISSIONS_API_KEY: "biznest-read-key", LOCAL_BIZNEST_URL: "http://localhost:3011/api/submissions" };
  const previous = Object.fromEntries(Object.keys(keys).map((key) => [key, process.env[key]]));
  Object.assign(process.env, keys);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  t.mock.method(axios, "get", async (url, options) => {
    assert.equal(url, "http://localhost:3011/api/submissions?kind=product");
    assert.equal(options.headers.Authorization, "Bearer biznest-read-key");
    return { data: { data: [{ id, kind: "product", source: "/Cafe.html" }] } };
  });
  const res = response();
  await getWebsiteLeads({ query: { kind: "product" } }, res, next);
  assert.deepEqual(res.body.data, [{ id, kind: "product", source: "/Cafe.html" }]);
  const rejected = response();
  await getWebsiteLeads({ query: { provider: "mewo", kind: "startup" } }, rejected, next);
  assert.equal(rejected.statusCode, 400);

  const changes = [{ field: "status", label: "Status", oldValue: "Pending", newValue: "Converted" }];
  const createdAt = new Date("2026-11-25");
  t.mock.method(SalesLog, "find", (filter) => {
    assert.deepEqual(filter, { company, websiteEnquiryId: id, enquiryKind: "product", action: "Website Lead Edited" });
    return {
      sort() { return this; },
      populate() { return this; },
      async lean() { return [{ _id: id, createdAt, performedBy: { firstName: "Test" }, changes: { fields: changes } }]; },
    };
  });
  const history = response();
  await getLeadEditHistory({ params: { source: "biznest", id }, company }, history, next);
  assert.deepEqual(history.body, [{ _id: id, editedAt: createdAt, editedBy: { firstName: "Test" }, changes }]);
});

test("local lead changes are recorded and limited to the active company", async (t) => {
  const date = new Date("2026-11-25");
  const original = {
    _id: id, companyName: "Example", dateOfContact: date, startDate: date, leadStatus: "Cold",
    serviceCategory: { _id: id, serviceName: "Desk" }, proposedLocations: [{ _id: id, unitNo: "A" }],
    officeInGoa: false, pocName: "Example", contactNumber: "9876543210", leadSource: "Referral",
    openDesks: 1, cabinDesks: 0, totalDesks: 1, clientBudget: 500,
  };
  t.mock.method(Lead, "findOne", (filter) => {
    if (filter.companyName) return Promise.resolve(null);
    assert.deepEqual(filter, { _id: id, company });
    return { populate: async () => original };
  });
  t.mock.method(Lead, "findOneAndUpdate", (filter, update) => {
    assert.deepEqual(filter, { _id: id, company });
    assert.equal(update.$set.leadStatus, "Hot");
    return { populate: async () => ({ ...original, leadStatus: "Hot" }) };
  });
  let log;
  t.mock.method(SalesLog, "create", async (entry) => { log = entry; });
  const res = response();
  await editLead({
    body: { ...original, leadId: id, leadStatus: "Hot", serviceCategory: id, proposedLocations: id },
    company, user,
  }, res, next);
  assert.equal(res.statusCode, 200);
  assert.equal(log.lead, id);
  assert.equal(log.company, company);
  assert.deepEqual(log.changes.fields, [{ field: "leadStatus", label: "Lead Status", oldValue: "Cold", newValue: "Hot" }]);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const loadService = () => {
  const calls = [];
  const records = [{ name: "Cafe supplier" }];
  const context = { module: { exports: {} }, require(name) {
    assert.equal(name, "../../models/hr/Vendor");
    return { find(filter) {
      calls.push(filter);
      return { populate() { return this; }, lean() { return this; }, async exec() { return records; } };
    } };
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "vendor.js"), "utf8"), context);
  return { service: context.module.exports.fetchVendorReportService, calls, records };
};

test("Cafe vendor list scopes its query to Cafe and the current company", async () => {
  const { service, calls, records } = loadService();
  const result = await service({ company: "company-one", query: { departmentId: "cafe" } });
  assert.equal(result, records);
  assert.equal(calls[0].company, "company-one");
  assert.equal(calls[0].departmentId, "cafe");
});
test("other vendor lists continue to use their requested department", async () => {
  const { service, calls } = loadService();
  await service({ company: "company-one", query: { departmentId: "sales" } });
  assert.equal(calls[0].departmentId, "sales");
});
test("vendor reports retain department arrays and date restrictions", async () => {
  const { service, calls } = loadService();
  const dates = { $gte: "start", $lte: "end" };
  const departmentIds = ["cafe", "sales"];
  await service({ company: "company-one", departmentId: departmentIds, dateFilter: { onboardingDate: dates } });
  assert.equal(calls[0].company, "company-one");
  assert.equal(calls[0].departmentId.$in, departmentIds);
  assert.equal(calls[0].onboardingDate, dates);
});
test("missing company never produces an unscoped vendor query", async () => {
  const { service, calls } = loadService();
  const result = await service({ query: { departmentId: "cafe" } });
  assert.equal(result.length, 0);
  assert.equal(calls.length, 0);
});
test("vendor-list controller takes the URL department rather than an empty GET body", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../controllers/vendorControllers/vendorController.js"), "utf8");
  const handler = source.slice(source.indexOf("async function fetchVendors"), source.indexOf("// const fetchVendors"));
  assert.match(handler, /const departmentId = req.params.departmentId/);
  assert.match(handler, /mongoose.isValidObjectId\(departmentId\)/);
  assert.match(handler, /query: \{ \.\.\.req.query, departmentId \}/);
});

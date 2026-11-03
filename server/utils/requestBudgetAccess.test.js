const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { getRequestBudgetPermission, createRequestBudgetGuard } = require("./requestBudgetAccess");

const departments = [
  ["6798bab0e469e809084e249a", "finance"],
  ["6798bab9e469e809084e249e", "hr"],
  ["6798bacce469e809084e24a1", "sales"],
  ["6798bae6e469e809084e24a4", "admin"],
  ["6798bafbe469e809084e24a7", "maintenance"],
  ["6798baa8e469e809084e2497", "it"],
  ["6798ba9de469e809084e2494", "frontend"],
  ["aaaaaaaaaaaaaaaaaaaaaaaa", "cafe"],
  ["bbbbbbbbbbbbbbbbbbbbbbbb", "legal"],
];
const query = (value) => ({ select() { return this; }, lean() { return this; }, async exec() { return value; } });
async function invoke({ department = { _id: departments[0][0], name: "finance" },
  permissions = [], user = "user", company = "company", valid = true, failure = null } = {}) {
  const result = { next: false };
  const guard = createRequestBudgetGuard({
    Department: { findById() { if (failure) throw failure; return query(department); } },
    Permission: { findOne(filter) { assert.deepEqual(filter, { user }); return query(permissions === null ? null : { permissions }); } },
    isValidObjectId: () => valid,
  });
  const res = { status(code) { result.status = code; return this; }, json(body) { result.body = body; return this; } };
  await guard({ user, company, params: { departmentId: department?._id || "missing" } }, res,
    (error) => { result.next = true; result.error = error; });
  return result;
}

for (const [_id, prefix] of departments) {
  test(`${prefix}: only the matching assigned Request Budget permission permits the request`, async () => {
    const department = { _id, name: prefix.toUpperCase() };
    const permission = `${prefix}_request_budget_button`;
    assert.equal(getRequestBudgetPermission(department), permission);
    assert.equal((await invoke({ department, permissions: [permission] })).next, true);
    assert.equal((await invoke({ department, permissions: ["unrelated_request_budget_button"] })).status, 403);
  });
}

test("missing permission records and empty/malformed permissions fail closed", async () => {
  for (const permissions of [null, [], "finance_request_budget_button"]) {
    const result = await invoke({ permissions });
    assert.equal(result.status, 403);
    assert.equal(result.next, false);
  }
});
test("a different department's permission cannot authorize finance requests", async () => {
  assert.equal((await invoke({ permissions: ["hr_request_budget_button"] })).status, 403);
});
test("unmapped departments cannot bypass access checks", async () => {
  assert.equal(getRequestBudgetPermission(null), null);
  assert.equal((await invoke({ department: { _id: "cccccccccccccccccccccccc", name: "Unknown" }, permissions: ["finance_request_budget_button"] })).status, 403);
});
test("authentication and target department are required", async () => {
  assert.equal((await invoke({ user: null })).status, 401);
  assert.equal((await invoke({ company: null })).status, 401);
  assert.equal((await invoke({ valid: false })).status, 400);
  assert.equal((await invoke({ department: null })).status, 404);
});
test("database errors never authorize a request", async () => {
  const error = new Error("database unavailable");
  const result = await invoke({ failure: error });
  assert.equal(result.error, error);
  assert.equal(result.status, undefined);
});
test("the route checks permission before multipart upload handling", () => {
  const source = fs.readFileSync(path.join(__dirname, "../routes/budgetRoutes.js"), "utf8");
  assert.match(source, /"\/request-budget\/:departmentId",\s*checkRequestBudgetPermission,\s*upload\.fields/);
});
test("the active Budget page fails closed and guards form submission", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../client/src/components/Pages/BudgetPage.jsx"), "utf8");
  assert.match(source, /const canRequestBudget = requestBudgetPermission\s*\? hasPermission\(requestBudgetPermission\)\s*: false/);
  assert.match(source, /onRequestBudget=\{canRequestBudget \?/);
  assert.match(source, /const onSubmit = \(data\) => \{\s*if \(!canRequestBudget\)/);
});
test("server permission strings match the client permission constants", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../client/src/constants/permissions.js"), "utf8");
  for (const [, prefix] of departments) assert.ok(source.includes(`value: "${prefix}_request_budget_button"`));
});

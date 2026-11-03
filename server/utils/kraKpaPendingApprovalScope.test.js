const test = require("node:test");
const assert = require("node:assert/strict");
const { getPendingApprovalScope } = require("./kraKpaPendingApprovalScope");
const req = { company: "company-one", user: "approver", query: {} };
const baseAccess = { departmentIds: ["dept-a", "dept-b"], isHr: false, isTopManagement: false };
const deps = { isValidObjectId: (id) => ["dept-a", "dept-b", "dept-c", "employee-a"].includes(id),
  isDepartmentManager: async (_req, id, access) => access.departmentIds.includes(id) && id === "dept-a" };

for (const role of ["isHr", "isTopManagement"]) {
  test(`${role}: overview includes all members but only company-scoped pending undeleted KPAs`, async () => {
    const result = await getPendingApprovalScope(req, { ...baseAccess, [role]: true }, deps);
    assert.deepEqual(result.filter, { company: "company-one", approvalStatus: "Pending Approval", isDeleted: { $ne: true } });
  });
}
test("manager overview includes all members of managed departments only", async () => {
  const result = await getPendingApprovalScope(req, baseAccess, deps);
  assert.deepEqual(result.filter.department, { $in: ["dept-a"] });
  assert.equal(result.filter.employee, undefined);
});
test("legacy selected-member filtering remains supported", async () => {
  const result = await getPendingApprovalScope({ ...req, query: { department: "dept-a", employee: "employee-a" } }, baseAccess, deps);
  assert.equal(result.filter.department, "dept-a");
  assert.equal(result.filter.employee, "employee-a");
});
test("ordinary users and unmanaged departments are denied", async () => {
  assert.equal((await getPendingApprovalScope(req, { ...baseAccess, departmentIds: [] }, deps)).status, 403);
  assert.equal((await getPendingApprovalScope({ ...req, query: { department: "dept-c" } }, baseAccess, deps)).status, 403);
});
test("malformed explicit department/employee filters are rejected", async () => {
  for (const query of [{ department: "invalid" }, { employee: "invalid" }]) {
    assert.equal((await getPendingApprovalScope({ ...req, query }, { ...baseAccess, isHr: true }, deps)).status, 400);
  }
});

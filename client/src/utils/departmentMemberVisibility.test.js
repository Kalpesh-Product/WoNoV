import test from "node:test";
import assert from "node:assert/strict";
import { getVisibleDepartmentMembers, getVisibleDepartments } from "./departmentMemberVisibility.js";

const financeAdmin = { _id: "finance", firstName: "Finance", lastName: "Admin", role: [{ roleTitle: "Finance Admin" }] };
const techAdmin = { _id: "tech", firstName: "Tech", lastName: "Admin", role: [{ roleTitle: "Tech Admin" }] };
const employee = { _id: "employee", firstName: "Member", role: [{ roleTitle: "Employee" }] };
test("Administration hides Finance Admin while retaining other members", () => {
  assert.deepEqual(getVisibleDepartmentMembers({ name: "Administration", employees: [financeAdmin, techAdmin, employee] }), [techAdmin, employee]);
});
test("Top Management hides Tech Admin while retaining other members", () => {
  assert.deepEqual(getVisibleDepartmentMembers({ name: "Top Management", employees: [financeAdmin, techAdmin, employee] }), [financeAdmin, employee]);
});
test("admins remain visible in other departments and source membership is unchanged", () => {
  const employees = [financeAdmin, techAdmin, employee];
  const snapshot = structuredClone(employees);
  assert.deepEqual(getVisibleDepartmentMembers({ name: "Finance", employees }), employees);
  assert.deepEqual(getVisibleDepartmentMembers({ name: "Tech", employees }), employees);
  assert.deepEqual(employees, snapshot);
});
test("matching tolerates casing/spacing, singular roles and named admin accounts", () => {
  assert.deepEqual(getVisibleDepartmentMembers({ name: " Administration Department ", employees: [
    { role: { roleTitle: " FINANCE  ADMIN " } }, { role: "Finance Admin" },
    { firstName: "Finance", lastName: "Admin", role: [] }, employee,
  ] }), [employee]);
  assert.deepEqual(getVisibleDepartmentMembers({ name: " Top  Management ", employees: [{ role: "Tech Admin" }, employee] }), [employee]);
  assert.deepEqual(getVisibleDepartmentMembers({ name: "Administration" }), []);
});

test("inactive departments and members are excluded before counts are calculated", () => {
  const departments = [
    { name: "Inactive", isActive: false, employees: [employee] },
    { name: "Finance", isActive: true, employees: [
      { ...employee, isActive: true }, { _id: "inactive", isActive: false },
    ] },
  ];
  const snapshot = structuredClone(departments);
  const result = getVisibleDepartments(departments);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "Finance");
  assert.equal(result[0].employees.length, 1);
  assert.equal(result[0].employees[0].isActive, true);
  assert.deepEqual(departments, snapshot);
});

test("active departments remain visible when all their members are inactive", () => {
  assert.deepEqual(getVisibleDepartments([{ name: "Tech", isActive: true, employees: [{ isActive: false }] }]),
    [{ name: "Tech", isActive: true, employees: [] }]);
  assert.deepEqual(getVisibleDepartments(), []);
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "@babel/parser";

const read = (file) => {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  parse(source, { sourceType: "module", plugins: ["jsx"] });
  return source;
};
test("main KRA/KPA dashboard exposes Pending Approvals only outside the employee dashboard", () => {
  const source = read("pages/Performance/PerformanceHome.jsx");
  assert.match(source, /title: "PENDING APPROVALS",\s*route: `\$\{modulePath\}\/pending-approvals`/);
  assert.match(source, /hasPermission\(PERMISSIONS\.KRAKPA_PENDING_APPROVALS\)/);
  const routes = read("routes/Routes.jsx");
  assert.match(routes, /path: "pending-approvals",\s*element: \(\s*<PerformancePermissionRoute\s*permissions=\{\[PERMISSIONS\.KRAKPA_PENDING_APPROVALS\]\}/);
});
test("overview ignores stale selected-member state and shows all dates until a range is selected", () => {
  const source = read("pages/Performance/KraKpaPendingApprovals.jsx");
  assert.match(source, /const member = isOverview \? null/);
  assert.match(source, /isOverview \? undefined : location.state\?\.selectedDepartment/);
  assert.match(source, /enabled: isOverview \|\| Boolean\(departmentId && employeeId\)/);
  assert.match(source, /isOverview \? null : initialDateRange\(\)/);
  assert.match(source, /if \(!dateRange\) return true/);
  assert.ok(source.includes('headerName: "Member"'));
  assert.ok(source.includes('headerName: "Department"'));
});
test("member click opens the employee dashboard with the selected member and department", () => {
  const source = read("pages/Performance/KraKpaPendingApprovals.jsx");
  assert.ok(source.includes('navigate("/app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard"'));
  assert.match(source, /memberId: data.employee\?\._id/);
  assert.match(source, /selectedDepartment: data.department\?\._id/);
  const layout = read("pages/Performance/KraKpaMemberDashboardLayout.jsx");
  assert.ok(layout.includes("<Outlet />"));
  assert.ok(!layout.includes("TabLayout"));
  assert.ok(!layout.includes("Pending Approvals"));
});

test("main KRA/KPA and Performance dashboards share count-based card layout and icon styling", () => {
  const source = read("pages/Performance/PerformanceHome.jsx");
  assert.match(source, /const cardGridClass = performanceCards.length >= 5/);
  assert.ok(source.includes('"grid-cols-1 md:grid-cols-2 xl:grid-cols-4"'));
  assert.match(source, /icon=\{employeeDashboard \? card.icon \|\| <CgWebsite \/> : <CgWebsite \/>\}/);
  assert.ok(source.includes('title: "PENDING APPROVALS"'), "Keep existing dashboard destinations");
});

test("Department quick-access card stays in KRA/KPA and uses its module permission", () => {
  const source = read("pages/Performance/PerformanceHome.jsx");
  assert.match(source, /title: "DEPARTMENT",[\s\S]*?hasPermission\(PERMISSIONS\.KRAKPA_DEPARTMENTS\)/);
  for (const title of ["EMPLOYEE KRA/KPA", "DAILY SCORE", "DEPARTMENT KRA/KPA", "PENDING APPROVALS"]) {
    assert.ok(source.includes(`title: "${title}"`));
  }
});

test("KRA/KPA department route renders the shared page with an in-module member destination", () => {
  const routes = read("routes/Routes.jsx");
  assert.match(routes, /path: "departments",\s*element: \(\s*<PerformancePermissionRoute\s*permissions=\{\[PERMISSIONS.KRAKPA_DEPARTMENTS\]\}\s*element=\{<PerformanceAssignKraKpa\s*memberDestination="\/app\/kra-kpa\/department-KPA\/member-wise-KPA\/employee-dashboard"/);
  const page = read("pages/Performance/PerformanceAssignKraKpa.jsx");
  assert.match(page, /navigate\(memberDestination,/);
  assert.match(page, /selectedDepartment: department\?\._id/);
  assert.match(page, /memberDestination = "\/app\/performance\/assign-KRA-KPA\/team-Daily-KRA"/,
    "Performance module's existing member destination is unchanged");
});

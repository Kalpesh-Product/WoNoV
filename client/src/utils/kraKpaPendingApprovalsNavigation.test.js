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
  assert.match(source, /const cardGridClass =\s*performanceCards.length >= 5/);
  assert.ok(source.includes('"grid-cols-1 md:grid-cols-2 xl:grid-cols-4"'));
  assert.match(source, /icon=\{\s*showEmployeeDashboard \? card.icon \|\| <CgWebsite \/> : <CgWebsite \/>\s*\}/);
  assert.ok(source.includes('title: "PENDING APPROVALS"'), "Keep existing dashboard destinations");
});

test("employee-only KRA/KPA home shows self insights without using a selected teammate", () => {
  const source = read("pages/Performance/PerformanceHome.jsx");
  assert.match(source, /const selfDashboard = onlyFirstTwoCards && Boolean\(auth\?\.user\?\._id\) && !employeeDashboard/);
  assert.match(source, /const selectedMember = selfDashboard\s*\? null/);
  assert.match(source, /const selectedEmployeeId = selfDashboard\s*\? auth\?\.user\?\._id/);
  assert.match(source, /\{showEmployeeDashboard && \(\s*<KraKpaEmployeeInsights/);
  assert.match(source, /selfDashboard=\{selfDashboard\}/);
  const insights = read("pages/Performance/KraKpaEmployeeInsights.jsx");
  assert.match(insights, /const selfKpaPath = "\/app\/kra-kpa\/individual\/kra-kpa\/individual-Monthly-KPA"/);
  assert.match(insights, /path: selfDashboard \? kpaPath : approvalsPath, enabled: selfDashboard \? canViewKpa : canViewApprovals/);
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

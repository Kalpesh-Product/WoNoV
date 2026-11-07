import test from "node:test";
import assert from "node:assert/strict";
import {
  getDailyScoreRows,
  getDepartmentMonthlyScoreRows,
  getTeamMonthlyScoreRows,
  getPendingActions,
  getPerformanceTrend,
  getTodayProgress,
  getUpcomingDeadlines,
} from "./employeeDashboardInsightsData.js";

test("daily score shows current-month days and future scores as zero", () => {
  const rows = getDailyScoreRows([
    { date: "2026-11-04", status: "Done" },
    { date: "2026-11-04", status: "Due" },
    { date: "2026-11-08", status: "Due" },
  ], "2026-11-05");
  assert.equal(rows.length, 30);
  assert.deepEqual(
    { assigned: rows[3].assigned, closed: rows[3].closed, carriedForward: rows[3].carriedForward, score: rows[3].score },
    { assigned: 2, closed: 1, carriedForward: 1, score: 50 },
  );
  assert.equal(rows[7].assigned, 1);
  assert.equal(rows[7].score, 0);
  assert.equal(rows[7].carriedForward, 0);
});

test("team daily score summarizes the current month per member", () => {
  const rows = getTeamMonthlyScoreRows([
    { employee: { _id: "a" }, date: "2026-11-02", status: "Done" },
    { employee: { _id: "a" }, date: "2026-11-03", status: "Due" },
    { employee: { _id: "a" }, date: "2026-11-08", status: "Due" },
    { employee: { _id: "b" }, date: "2026-11-03", status: "Done" },
    { employee: { _id: "b" }, date: "2026-10-30", status: "Due" },
  ], [
    { id: "a", name: "Alex" },
    { id: "b", name: "Blair" },
  ], "2026-11-05");
  assert.deepEqual(rows, [
    { id: "a", name: "Alex", assigned: 2, closed: 1, carriedForward: 1, score: 50 },
    { id: "b", name: "Blair", assigned: 1, closed: 1, carriedForward: 0, score: 100 },
  ]);
});

test("all-department daily score summarizes the current month per department", () => {
  const rows = getDepartmentMonthlyScoreRows([
    { department: { _id: "tech" }, date: "2026-11-02", status: "Done" },
    { department: { _id: "tech" }, date: "2026-11-03", status: "Due" },
    { department: "tech", date: "2026-11-08", status: "Due" },
    { department: { _id: "hr" }, date: "2026-11-03", status: "Done" },
    { department: "hr", date: "2026-10-30", status: "Due" },
  ], [
    { id: "tech", name: "Tech" },
    { id: "hr", name: "HR" },
  ], "2026-11-05");
  assert.deepEqual(rows, [
    { id: "tech", name: "Tech", assigned: 2, closed: 1, carriedForward: 1, score: 50 },
    { id: "hr", name: "HR", assigned: 1, closed: 1, carriedForward: 0, score: 100 },
  ]);
});

test("today's progress counts only today's logs", () => {
  const progress = getTodayProgress([
    { date: "2026-11-05", type: "KRA", status: "Done" },
    { date: "2026-11-05", type: "KPA", status: "Due", isCarryForward: true },
    { date: "2026-11-04", type: "KRA", status: "Done" },
  ], "2026-11-05");
  assert.deepEqual(progress, {
    totalTasks: 2,
    completed: 1,
    pending: 1,
    carriedForward: 1,
    completion: 50,
  });
});

test("pending actions exclude inactive KPAs", () => {
  const actions = getPendingActions([
    { approvalStatus: "Pending Approval" },
    { approvalStatus: "Pending Approval", isActive: false },
    { status: "Completed", verification: "Pending" },
    { status: "Completed", verification: "Closed", kpaRating: null, hrRating: null },
    { verification: "Changes Required" },
  ]);
  assert.deepEqual(actions, {
    approvals: 1,
    reviews: 1,
    ratings: 1,
    changesRequired: 1,
  });
});

test("performance trend uses monthly KPA and daily-log results", () => {
  const trend = getPerformanceTrend([
    { month: "2026-11", status: "Completed", kpaRating: 1 },
    { month: "2026-11", status: "Pending", kpaRating: 0 },
  ], [
    { date: "2026-11-04", status: "Done" },
    { date: "2026-11-05", status: "Due" },
  ], "2026-11-05");
  assert.equal(trend.points.length, 12);
  assert.deepEqual(trend.points.map((point) => point.label), [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ]);
  assert.deepEqual(trend.points[7], {
    label: "Nov", completion: 50, rating: 50, dailyLogs: 50,
  });
  assert.deepEqual(trend.points[8], {
    label: "Dec", completion: 0, rating: 0, dailyLogs: 0,
  });
  assert.equal(trend.completion, 50);
  assert.equal(trend.rating, 50);
  assert.equal(trend.dailyLogs, 50);
});

test("performance trend starts in the previous April before the new fiscal year", () => {
  const trend = getPerformanceTrend([], [], "2027-02-05");
  assert.deepEqual(trend.points.map((point) => point.label), [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ]);
  assert.equal(trend.points.length, 12);
});

test("upcoming deadlines show overdue KPAs and exclude completed ones", () => {
  const deadlines = getUpcomingDeadlines([
    { _id: "a", target: "Late", status: "Pending", deadline: "2026-11-03" },
    { _id: "b", target: "Finished", status: "Completed", deadline: "2026-11-06" },
    { _id: "c", target: "Soon", status: "Pending", deadline: "2026-11-06" },
  ], "2026-11-05");
  assert.deepEqual(deadlines.map(({ id, status }) => ({ id, status })), [
    { id: "a", status: "Overdue" },
    { id: "c", status: "Due Soon" },
  ]);
});

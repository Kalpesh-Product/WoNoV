const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const runUpdate = async ({ user = "employee", status = "Open", deadline = "2026-10-29" } = {}) => {
  let saved = false;
  let query;
  const record = {
    _id: "task", employee: "employee", department: "department", createdBy: "creator",
    status, dueTaskName: "Task", identificationDate: new Date("2026-10-01"),
    deadline: new Date("2026-10-28"), parentKpa: "parent", taskIdentifier: "identifier",
    async populate() { return this; },
    async save() { saved = true; },
  };
  const mocks = {
    mongoose: { isValidObjectId: (value) => Boolean(value) },
    "../../models/Departments": { exists: async () => false },
    "../../models/hr/UserData": { exists: async () => true },
    "../../models/performances/KraKpaDueTask": {
      findOne: async (filter) => {
        query = filter;
        // Respect the employee scope enforced by the controller.
        return filter.employee && filter.employee !== record.employee ? null : record;
      },
    },
    "../../models/performances/KraKpaIndividualMonthlyKpa": {
      findOne: () => ({ select: async () => ({ _id: "parent", deadline: new Date("2026-10-31") }) }),
    },
    "../../models/performances/KraKpaDailyLog": { updateMany: async () => {} },
    "../../utils/kraKpaDepartmentManager": async () => false,
  };
  const context = {
    module: { exports: {} }, Date,
    require: (name) => mocks[name] || {},
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "kraKpaDueTaskController.js"), "utf8"), context);
  const req = {
    user, company: "company", roles: ["employee"], departments: ["department"],
    params: { id: "task" },
    body: { dueTaskName: "Task", identificationDate: "2026-10-01", deadline,
      parentKpa: "parent", taskIdentifier: "identifier", comments: "" },
  };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await context.module.exports.updateDueTask(req, res, (error) => { throw error; });
  return { res, saved, record, query };
};

test("assigned employee can update their Due Task deadline and history", async () => {
  const { res, saved, record } = await runUpdate();
  assert.equal(res.statusCode, 200);
  assert.equal(saved, true);
  assert.equal(record.deadline.toISOString().slice(0, 10), "2026-10-29");
  assert.equal(record.editHistory[0].editedBy, "employee");
  assert.ok(record.editHistory[0].changes.some((change) => change.field === "deadline"));
});

test("employees cannot edit another employee's Due Task", async () => {
  const { res, saved, query } = await runUpdate({ user: "other-employee" });
  assert.equal(query.company, "company");
  assert.equal(query.employee, "other-employee");
  assert.equal(res.statusCode, 404);
  assert.equal(saved, false);
});

test("closed task deadlines remain locked", async () => {
  const { res, saved } = await runUpdate({ status: "Closed" });
  assert.equal(res.statusCode, 409);
  assert.equal(saved, false);
});

test("employee deadlines cannot exceed the parent KPA deadline", async () => {
  const { res, saved } = await runUpdate({ deadline: "2026-11-01" });
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /cannot be after the KPA deadline/);
  assert.equal(saved, false);
});

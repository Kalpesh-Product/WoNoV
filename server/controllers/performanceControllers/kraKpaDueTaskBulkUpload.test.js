const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const runUpload = async (csv, extraParents = []) => {
  let inserted = null;
  const parentId = "507f1f77bcf86cd799439011";
  const managerId = "507f1f77bcf86cd799439012";
  const parent = {
    _id: parentId,
    target: "Target",
    deadline: new Date("2026-11-30T00:00:00.000Z"),
    createdAt: new Date("2026-11-02T00:00:00.000Z"),
  };
  const query = (value) => ({ select: () => ({ lean: async () => value }) });
  const mocks = {
    mongoose: { isValidObjectId: (value) => Boolean(value) },
    "csv-parser": require("csv-parser"),
    stream: require("stream"),
    "../../models/Departments": { exists: async () => false },
    "../../models/hr/Company": {
      findById: () => query({ selectedDepartments: [{ department: "department", admin: "manager-role" }] }),
    },
    "../../models/hr/UserData": {
      exists: async () => true,
      findOne: () => query({ _id: managerId }),
    },
    "../../models/performances/KraKpaIndividualMonthlyKpa": {
      find: () => query([parent, ...extraParents]),
    },
    "../../models/performances/KraKpaDueTask": {
      insertMany: async (records) => { inserted = records; },
    },
  };
  const context = {
    module: { exports: {} },
    Date,
    Buffer,
    require: (name) => mocks[name] || {},
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "kraKpaDueTaskController.js"), "utf8"),
    context,
  );
  const req = {
    user: "employee",
    company: "company",
    roles: ["employee"],
    departments: ["department"],
    body: {
      department: "department",
      employee: "employee",
      createdAtStart: "2026-11-01",
      createdAtEnd: "2026-11-30",
    },
    file: { originalname: "tasks.csv", buffer: Buffer.from(csv) },
  };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await context.module.exports.bulkUploadDueTasks(req, res, (error) => { throw error; });
  return { res, inserted, parentId, managerId };
};

test("bulk upload assigns the department manager as Task Identifier", async () => {
  const csv = [
    "Main KPA,KPA Task,Identification Date,Task Deadline",
    "Target,Prepare report,2026-11-04,2026-11-28",
  ].join("\n");
  const { res, inserted, parentId, managerId } = await runUpload(csv);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.count, 1);
  assert.equal(String(inserted[0].parentKpa), parentId);
  assert.equal(String(inserted[0].taskIdentifier), managerId);
});

test("bulk upload rejects all rows if one task is invalid", async () => {
  const csv = [
    "Main KPA,KPA Task,Identification Date,Task Deadline",
    "Target,Prepare report,2026-11-04,2026-11-28",
    "Target,,2026-11-04,2026-11-28",
  ].join("\n");
  const { res, inserted } = await runUpload(csv);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.errors[0].row, 3);
  assert.equal(inserted, null);
});

test("bulk upload rejects an ambiguous KPA name without importing", async () => {
  const csv = [
    "Main KPA,KPA Task,Identification Date,Task Deadline",
    "Target,Prepare report,2026-11-04,2026-11-28",
  ].join("\n");
  const { res, inserted } = await runUpload(csv, [{
    _id: "507f1f77bcf86cd799439013",
    target: "Target",
    deadline: new Date("2026-11-30T00:00:00.000Z"),
    createdAt: new Date("2026-11-03T00:00:00.000Z"),
  }]);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.errors[0].message, /More than one KPA/);
  assert.equal(inserted, null);
});

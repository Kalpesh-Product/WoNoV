const test = require("node:test");
const assert = require("node:assert/strict");
const axios = require("axios");
const SalesLog = require("../../models/sales/salesLog");
const {
  updateWebsitePartnership,
  updateWebsiteSubmission,
} = require("./partnershipControllers");

test("website partnership edit patches only changed fields and records their history", async () => {
  const id = "6ae85be06b9f7a5f95395425";
  const original = {
    id, kind: "partnership", name: "Original Name", email: "test@example.com",
    mobile: "9876543210", message: "Original message", status: "new",
  };
  const oldGet = axios.get;
  const oldPatch = axios.patch;
  const oldCreate = SalesLog.create;
  const oldReadKey = process.env.SUBMISSIONS_API_KEY;
  const oldWriteKey = process.env.SUBMISSIONS_WRITE_API_KEY;
  const oldUrl = process.env.PARTNERSHIP_SUBMISSIONS_URL;
  let patched;
  let recorded;
  try {
    process.env.SUBMISSIONS_API_KEY = "test-read-key";
    process.env.SUBMISSIONS_WRITE_API_KEY = "test-write-key";
    process.env.PARTNERSHIP_SUBMISSIONS_URL = "http://localhost:3011/api/submissions";
    axios.get = async (url, options) => {
      assert.equal(new URL(url).searchParams.get("kind"), "partnership");
      assert.equal(options.headers.Authorization, "Bearer test-read-key");
      return { data: { data: [original], pagination: { hasNextPage: false } } };
    };
    axios.patch = async (url, body, options) => {
      patched = { url, body, options };
      return { data: { id, ...original, ...body } };
    };
    SalesLog.create = async (entry) => { recorded = entry; return entry; };
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; },
    };
    await updateWebsitePartnership({
      params: { id },
      body: { name: "Updated Name", status: "Pending" },
      company: "company-id",
      user: "user-id",
    }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(patched.url, `http://localhost:3011/api/submissions/partner/${id}`);
    assert.deepEqual(patched.body, { name: "Updated Name" });
    assert.equal(patched.options.headers.Authorization, "Bearer test-write-key");
    assert.equal(patched.options.headers["Content-Type"], "application/json");
    assert.equal(recorded.websiteEnquiryId, id);
    assert.deepEqual(recorded.changes.fields, [{
      field: "name", label: "Name", oldValue: "Original Name", newValue: "Updated Name",
    }]);
  } finally {
    axios.get = oldGet;
    axios.patch = oldPatch;
    SalesLog.create = oldCreate;
    if (oldReadKey === undefined) delete process.env.SUBMISSIONS_API_KEY;
    else process.env.SUBMISSIONS_API_KEY = oldReadKey;
    if (oldWriteKey === undefined) delete process.env.SUBMISSIONS_WRITE_API_KEY;
    else process.env.SUBMISSIONS_WRITE_API_KEY = oldWriteKey;
    if (oldUrl === undefined) delete process.env.PARTNERSHIP_SUBMISSIONS_URL;
    else process.env.PARTNERSHIP_SUBMISSIONS_URL = oldUrl;
  }
});

const meWoTestEnvironment = () => {
  const state = {
    oldGet: axios.get,
    oldPatch: axios.patch,
    oldCreate: SalesLog.create,
    oldReadKey: process.env.MEWO_SUBMISSIONS_API_KEY,
    oldWriteKey: process.env.MEWO_SUBMISSIONS_WRITE_API_KEY,
    oldUrl: process.env.MEWO_SUBMISSIONS_URL,
  };
  process.env.MEWO_SUBMISSIONS_API_KEY = "test-mewo-read-key";
  process.env.MEWO_SUBMISSIONS_WRITE_API_KEY = "test-mewo-write-key";
  process.env.MEWO_SUBMISSIONS_URL = "http://localhost:3012/api/submissions";
  return state;
};

const restoreMeWoTestEnvironment = (state) => {
  axios.get = state.oldGet;
  axios.patch = state.oldPatch;
  SalesLog.create = state.oldCreate;
  if (state.oldReadKey === undefined) delete process.env.MEWO_SUBMISSIONS_API_KEY;
  else process.env.MEWO_SUBMISSIONS_API_KEY = state.oldReadKey;
  if (state.oldWriteKey === undefined) delete process.env.MEWO_SUBMISSIONS_WRITE_API_KEY;
  else process.env.MEWO_SUBMISSIONS_WRITE_API_KEY = state.oldWriteKey;
  if (state.oldUrl === undefined) delete process.env.MEWO_SUBMISSIONS_URL;
  else process.env.MEWO_SUBMISSIONS_URL = state.oldUrl;
};

const makeResponse = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("MeWo contact edit patches only changed fields using the row source", async () => {
  const id = "6ae85ae64e8dce4ad131516c";
  const original = {
    id, source: "contact", status: "new", name: "Allan Silveira",
    email: "allan@example.com", phone: "47848399028",
    subject: "Old subject", message: "Old message",
  };
  const state = meWoTestEnvironment();
  let patched;
  let recorded;
  try {
    axios.get = async (url, options) => {
      assert.equal(options.headers.Authorization, "Bearer test-mewo-read-key");
      return { data: { data: [original], pagination: { hasNextPage: false } } };
    };
    axios.patch = async (url, body, options) => {
      patched = { url, body, options };
      return { data: { id, ...original, ...body } };
    };
    SalesLog.create = async (entry) => { recorded = entry; return entry; };
    const res = makeResponse();
    await updateWebsiteSubmission({
      params: { kind: "contact", id },
      body: { subject: "Workspace inquiry", status: "in_progress" },
      company: "company-id",
      user: "user-id",
    }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(patched.url, `http://localhost:3012/api/submissions/contact/${id}`);
    assert.deepEqual(patched.body, { subject: "Workspace inquiry", status: "in_progress" });
    assert.equal(patched.options.headers.Authorization, "Bearer test-mewo-write-key");
    assert.equal(patched.options.headers["Content-Type"], "application/json");
    assert.equal(recorded.enquiryKind, "contact");
    assert.equal(recorded.websiteEnquiryId, id);
    assert.equal(recorded.changes.fields.length, 2);
  } finally {
    restoreMeWoTestEnvironment(state);
  }
});

test("MeWo subscription edit skips unchanged fields and validates the source", async () => {
  const id = "6ae85b3727d35a019df3e6de";
  const original = {
    id, source: "subscription", status: "subscribed", email: "allan@example.com",
  };
  const state = meWoTestEnvironment();
  let patchCalls = 0;
  try {
    axios.get = async () => ({ data: { data: [original], pagination: { hasNextPage: false } } });
    axios.patch = async () => { patchCalls += 1; return { data: { id } }; };
    SalesLog.create = async (entry) => entry;
    const noChangeRes = makeResponse();
    await updateWebsiteSubmission({
      params: { kind: "subscription", id },
      body: { email: "allan@example.com" },
      company: "company-id", user: "user-id",
    }, noChangeRes);
    assert.equal(noChangeRes.statusCode, 200);
    assert.equal(patchCalls, 0);

    const changedRes = makeResponse();
    await updateWebsiteSubmission({
      params: { kind: "subscription", id },
      body: { email: "allan@example.com", status: "unsubscribed" },
      company: "company-id", user: "user-id",
    }, changedRes);
    assert.equal(changedRes.statusCode, 200);
    assert.equal(patchCalls, 1);

    const mismatchRes = makeResponse();
    await updateWebsiteSubmission({
      params: { kind: "contact", id },
      body: { status: "in_progress" },
      company: "company-id", user: "user-id",
    }, mismatchRes);
    assert.equal(mismatchRes.statusCode, 400);
    assert.equal(patchCalls, 1);
  } finally {
    restoreMeWoTestEnvironment(state);
  }
});

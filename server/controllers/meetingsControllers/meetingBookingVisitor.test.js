const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const controllerSource = fs.readFileSync(
  path.join(__dirname, "meetingsControllers.js"),
  "utf8",
);
const addMeetingsSource = controllerSource.slice(
  controllerSource.indexOf("const addMeetings ="),
  controllerSource.indexOf("const getMeetings ="),
);

test("external meeting booking saves only the meeting and does not create a visit", () => {
  assert.match(addMeetingsSource, /const savedMeeting = await meeting\.save\(\)/);
  assert.doesNotMatch(addMeetingsSource, /bookExternalMeetingVisit/);
  assert.doesNotMatch(addMeetingsSource, /ExternalVisits\.(?:create|insertMany)/);
});

test("external meeting booking still validates the selected visitor by company", () => {
  assert.match(
    addMeetingsSource,
    /Visitor\.exists\(\{\s*_id: externalCompany,\s*company,\s*\}\)/,
  );
});

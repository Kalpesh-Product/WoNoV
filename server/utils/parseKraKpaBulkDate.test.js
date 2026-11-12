const test = require("node:test");
const assert = require("node:assert/strict");
const parseKraKpaBulkDate = require("./parseKraKpaBulkDate");

test("KPA and KRA bulk dates accept supported two- and four-digit formats", () => {
  for (const input of [
    "2026-11-01",
    "01-11-26",
    "01-11-2026",
    "01-Nov-26",
    "01-Nov-2026",
    "01-November-26",
    "01-November-2026",
  ]) {
    assert.equal(parseKraKpaBulkDate(input)?.toISOString().slice(0, 10), "2026-11-01", input);
  }
});

test("bulk dates reject impossible and ambiguous dates", () => {
  for (const input of ["31-11-26", "29-Feb-25", "01-Foo-26", "1-Nov-26", "01-1-26", "2026-13-01"]) {
    assert.equal(parseKraKpaBulkDate(input), null, input);
  }
});

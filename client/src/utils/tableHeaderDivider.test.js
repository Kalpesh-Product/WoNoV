import test from "node:test";
import assert from "node:assert/strict";
import { shouldHideTableHeaderDivider } from "../components/TableHeaderBorderContext.js";

test("a bordered section title replaces the redundant toolbar line", () => {
  assert.equal(shouldHideTableHeaderDivider(undefined, true, false), true);
});

test("plain titles retain their only divider, including Budget History and Reject Voucher", () => {
  assert.equal(shouldHideTableHeaderDivider(undefined, false, false), false);
  assert.equal(shouldHideTableHeaderDivider(undefined, false, true), false);
});

test("a table's own unbordered title still needs its divider inside a bordered section", () => {
  assert.equal(shouldHideTableHeaderDivider(undefined, true, true), false);
});

test("explicit divider settings take priority over section defaults", () => {
  assert.equal(shouldHideTableHeaderDivider(false, true, false), false);
  assert.equal(shouldHideTableHeaderDivider(true, false, true), true);
});

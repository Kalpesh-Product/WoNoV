import test from "node:test";
import assert from "node:assert/strict";
import { shouldStackTableToolbar } from "./tableToolbarSizing.js";
import fs from "node:fs";

test("Profile HR sidebar leaves enough space for search, dates and filter on one line", () => {
  assert.equal(shouldStackTableToolbar({ width: 1098, searchWidth: 280, dateWidth: 384, actionsWidth: 42 }), false);
  assert.equal(shouldStackTableToolbar({ width: 980, searchWidth: 280, dateWidth: 384, actionsWidth: 42 }), false);
  assert.equal(shouldStackTableToolbar({ width: 700, searchWidth: 280, dateWidth: 384, actionsWidth: 42 }), true);
});

test("toolbar uses container measurement, not a viewport breakpoint, for its single-row layout", () => {
  const source = fs.readFileSync(new URL("../components/AgTable.jsx", import.meta.url), "utf8");
  const css = fs.readFileSync(new URL("../index.css", import.meta.url), "utf8");
  assert.ok(!source.includes("xl:grid-cols-"));
  assert.ok(!source.includes("xl:col-start-"));
  assert.match(css, /\.table-toolbar:not\(\[data-stacked="true"\]\)\s*\{\s*grid-template-columns: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/);
  assert.match(css, /\.table-toolbar:not\(\[data-stacked="true"\]\) > \*\s*\{\s*grid-row: 1/);
  for (const [name, column] of [["search", 1], ["dates", 2], ["actions", 3]]) {
    assert.ok(css.replace(/\r\n/g, "\n").includes(`.table-toolbar-${name} {\n  grid-column: ${column};`));
  }
});

test("Meeting Revenue actions fit beside a centred date picker after moving the chip above", () => {
  assert.equal(shouldStackTableToolbar({ width: 1450, searchWidth: 280, dateWidth: 384, actionsWidth: 360 }), false);
});
test("crowded self-KRA actions use separate control rows instead of overlapping the date picker", () => {
  assert.equal(shouldStackTableToolbar({ width: 1450, searchWidth: 280, dateWidth: 343, actionsWidth: 650 }), true);
  assert.equal(shouldStackTableToolbar({ width: 1800, searchWidth: 280, dateWidth: 343, actionsWidth: 650 }), false);
});
test("narrow containers and long operation labels trigger the fallback even on a wide viewport", () => {
  assert.equal(shouldStackTableToolbar({ width: 900, searchWidth: 280, dateWidth: 384, actionsWidth: 360 }), true);
  assert.equal(shouldStackTableToolbar({ width: 1300, searchWidth: 280, dateWidth: 384, actionsWidth: 500 }), true);
});

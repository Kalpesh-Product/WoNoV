import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "@babel/parser";

const read = (file) => {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  return { source, ast: parse(source, { sourceType: "module", plugins: ["jsx"] }) };
};
const find = (node, predicate, matches = []) => {
  if (!node || typeof node !== "object" || !node.type) return matches;
  if (predicate(node)) matches.push(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((child) => find(child, predicate, matches));
    else if (value?.type) find(value, predicate, matches);
  }
  return matches;
};
const attribute = (node, name) => node.openingElement.attributes.find((entry) => entry.name?.name === name);

test("KPA and Daily Logs Rating tables have bordered title headers", () => {
  const { ast } = read("pages/Performance/KraKpaRating.jsx");
  for (const title of ["KPA Rating", "Daily Logs Rating"]) {
    const section = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "WidgetSection" && attribute(node, "title")?.value?.value === title)[0];
    assert.ok(section, title);
    assert.ok(attribute(section, "border"));
    const tables = find(section, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable");
    assert.equal(tables.length, 1);
    assert.ok(attribute(tables[0], "hideTitle"), "Avoid duplicate table titles");
    if (title === "KPA Rating") {
      assert.equal(find(attribute(section, "headerRightContent"), (node) => node.type === "JSXElement" && node.openingElement.name.name === "Chip").length, 2);
    }
  }
});

test("Agreements date wrapper has intrinsic width and no obsolete grid-row placement", () => {
  const { source, ast } = read("components/Tables/YearWiseTable.jsx");
  const dateControls = find(ast, (node) => node.type === "VariableDeclarator" && node.id?.name === "dateControls")[0];
  const slot = source.slice(dateControls.start, dateControls.end);
  assert.ok(!slot.includes("xl:row-start-"));
  assert.ok(!slot.includes("xl:col-start-"));
  assert.ok(slot.includes("w-max shrink-0"));
  const { ast: grid } = read("components/AgTable.jsx");
  for (const slotName of ["table-toolbar-dates", "table-toolbar-actions"]) {
    const group = find(grid, (node) => node.type === "JSXElement" && attribute(node, "className")?.value?.value?.includes(slotName))[0];
    assert.ok(attribute(group, "className").value.value.includes("w-max"));
  }
});

test("Profile My Assets enables a schema-backed date picker using assignment request creation", () => {
  const { ast } = read("pages/Profile/MyAssets.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  assert.equal(attribute(table, "dateColumn").value.value, "assignmentRequestedAt");
  assert.ok(attribute(table, "showDateControls"), "Date picker remains enabled with empty rows");
  const mapping = find(ast, (node) => node.type === "ObjectProperty" && node.key?.name === "assignmentRequestedAt")[0];
  assert.equal(mapping.value.object.name, "item");
  assert.equal(mapping.value.property.name, "createdAt");
  const column = find(ast, (node) => node.type === "ObjectExpression" && node.properties?.some((prop) => prop.key?.name === "field" && prop.value?.value === "assignmentRequestedAt"))[0];
  assert.ok(column);
  assert.equal(column.properties.find((prop) => prop.key?.name === "hide").value.value, true);
});

for (const [file, dateField] of [["HrCommonAgreements", "createdAt"], ["HrCommonPayslips", "month"]]) {
  test(`Profile HR ${file} uses Closed Tickets' shared toolbar with the requested export visibility`, () => {
    const { ast } = read(`pages/HR/${file}.jsx`);
    const tables = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "YearWiseTable");
    assert.equal(tables.length, 1);
    const table = tables[0];
    const date = attribute(table, "dateColumn").value;
    assert.equal(date.type === "StringLiteral" ? date.value : date.expression.value, dateField);
    assert.equal(attribute(table, "search").value.expression.value, true);
    if (file === "HrCommonAgreements") assert.ok(!attribute(table, "exportData"));
    else assert.ok(attribute(table, "exportData"));
    assert.equal(attribute(table, "hideFilter").value.expression.value, false);
    assert.ok(!attribute(table, "key"), "Row count changes must not remount/reset the selected range");
    assert.ok(find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PageFrame").length);
  });
}

for (const file of ["ManagePrintout", "ReportPrintout"]) {
  test(`${file} centers its single compact date picker in the table toolbar`, () => {
    const { ast } = read(`pages/Printout/${file}.jsx`);
    const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
    const slot = attribute(table, "toolbarDateControls");
    assert.ok(slot);
    const pickers = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "DateRangePicker");
    assert.equal(pickers.length, 1);
    assert.ok(find(slot, (node) => node === pickers[0]).length);
    assert.equal(attribute(pickers[0], "ranges").value.expression.name, "dateRange");
    if (file === "ReportPrintout") assert.equal(attribute(pickers[0], "onChange").value.expression.name, "handleDateRangeChange");
    else assert.ok(find(attribute(pickers[0], "onChange"), (node) => node.type === "CallExpression" && node.callee.name === "setDateRange").length);
    assert.equal(attribute(table, "showDateControls").value.expression.value, false);
    const boxes = find(slot, (node) => node.type === "StringLiteral" && node.value.includes("px-6 py-1"));
    assert.equal(boxes.length, 2);
    assert.ok(attribute(table, "search"));
  });
}

test("Reports module centers its existing date picker in the search/filter toolbar", () => {
  const { ast } = read("pages/Reports/DepartmentReportCommon.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  const slot = attribute(table, "toolbarDateControls");
  assert.ok(slot);
  const pickers = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "DateRangePicker");
  assert.equal(pickers.length, 1);
  assert.ok(find(slot, (node) => node === pickers[0]).length);
  assert.equal(attribute(pickers[0], "onChange").value.expression.name, "handleDateRangeChange");
  assert.equal(attribute(pickers[0], "ranges").value.expression.name, "dateRange");
  assert.equal(attribute(table, "showDateControls").value.expression.value, false);
  const dateBoxes = find(slot, (node) => node.type === "StringLiteral" && node.value.includes("px-6 py-1"));
  assert.equal(dateBoxes.length, 2);
});

test("Pending Approvals uses one compact centered date picker in the shared toolbar", () => {
  const { ast } = read("pages/Performance/KraKpaPendingApprovals.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  const slot = attribute(table, "toolbarDateControls");
  const pickers = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "TableDateFilter");
  assert.equal(pickers.length, 1);
  assert.ok(find(slot, (node) => node === pickers[0]).length);
  assert.equal(attribute(pickers[0], "onChange").value.expression.name, "setDateRange");
  assert.equal(attribute(pickers[0], "range").value.expression.name, "dateRange");
  assert.equal(attribute(table, "showDateControls").value.expression.value, false);
  const { source: shared } = read("components/TableDateFilter.jsx");
  const { source: closed } = read("components/Tables/YearWiseTable.jsx");
  for (const source of [shared, closed]) {
    assert.ok(source.includes("px-6 py-1"), "Date boxes match Closed Tickets' compact padding");
    assert.ok(!source.includes("min-w-40"), "Do not force wider date boxes");
  }
});

test("Daily Logs places all summary chips alongside the page title", () => {
  const { ast } = read("pages/Performance/KraKpaDailyLogs.jsx");
  const titleRow = find(ast, (node) => node.type === "JSXElement" && node.children?.some((child) => child.type === "JSXElement" && child.openingElement.name.name === "h1"))[0];
  assert.equal(find(titleRow, (node) => node.type === "JSXElement" && node.openingElement.name.name === "Chip").length, 3);
  const tables = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable");
  assert.ok(tables.every((table) => !attribute(table, "summaryContent")));
});

test("department Ticket Issues aligns the total chip with the title, not toolbar actions", () => {
  const { ast } = read("pages/Tickets/DepartmentTicketSettings.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  const titleContent = attribute(table, "titleRightContent");
  assert.ok(find(titleContent, (node) => node.type === "JSXText" && node.value.includes("Total Issues")).length);
  const actions = attribute(table, "headerActions");
  assert.equal(find(actions, (node) => node.type === "JSXText" && node.value.includes("Total Issues")).length, 0);
  assert.equal(find(actions, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PrimaryButton").length, 1);
  assert.ok(attribute(table, "exportData"));
});

test("all six asset-card lists enable the existing Export control without exposing Add Asset", () => {
  const { source, ast } = read("pages/Assets/AssetsCategory/ListOfAssets.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "YearWiseTable")[0];
  const expression = attribute(table, "exportData").value.expression;
  const enabled = new Function("isAssetCardView", "normalizedAssetCard", `return ${source.slice(expression.start, expression.end)};`);
  assert.equal(enabled(true, "total-assets"), true);
  assert.equal(enabled(false, undefined), true);
  assert.equal(enabled(true, "assets-owned"), true);
  assert.equal(enabled(true, "assets-rental"), true);
  assert.equal(enabled(true, "assets-under-maintenance"), true);
  assert.equal(enabled(true, "assets-damaged"), true);
  assert.equal(enabled(true, "assets-extra"), true);
  assert.equal(enabled(true, "unknown-card"), false);
  assert.equal(attribute(table, "buttonTitle").value.expression.test.name, "isAssetCardView");
});

test("Assets Value department table enables its shared toolbar Export", () => {
  const { ast } = read("pages/Assets/AssetsHome.jsx");
  const tables = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable");
  assert.equal(tables.length, 1);
  assert.ok(attribute(tables[0], "exportData"));
  assert.equal(attribute(tables[0], "exportData").value, null);
});

test("Request Budget and Export share default font sizing and toolbar padding", () => {
  const { ast } = read("components/Tables/AllocatedBudget.jsx");
  const buttons = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PrimaryButton");
  for (const title of ["Request Budget", "Export"]) {
    const button = buttons.find((node) => attribute(node, "title")?.value?.value === title);
    assert.ok(button);
    assert.ok(!attribute(button, "fontSize"), `${title} must use the shared font size and line height`);
    assert.ok(!attribute(button, "padding"), `${title} must use shared toolbar padding`);
  }
});

test("ST and DTC unit inventory tabs filter underlying entries before calculating totals", () => {
  const { ast, source } = read("pages/Dashboard/MaintainanceDashboard/Inventory.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable" && attribute(node, "data")?.value?.expression?.name === "unitListingRows")[0];
  const picker = find(attribute(table, "toolbarDateControls"), (node) => node.type === "JSXElement" && node.openingElement.name.name === "TableDateFilter")[0];
  assert.ok(picker);
  assert.equal(attribute(picker, "range").value.expression.name, "unitDateRange");
  assert.equal(attribute(table, "showDateControls").value.expression.value, false);
  assert.ok(source.includes('filterTableRows(inventoryTableData || [], { dateRange: unitDateRange, dateField: "date" })'));
  assert.ok(source.includes("const matchingInventories = unitRangeInventoryData.filter"));
  assert.ok(source.includes("[selectedBuildingTab]: range"), "Keep independent ranges for ST and DTC");
  assert.ok(attribute(table, "exportData"));
});

test("all eleven audited energy and KYC page variants enable the shared advanced filter", () => {
  // Shared history and yearly billing components cover both ST and DTC routes.
  const pages = [
    ["Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly", 1],
    ["Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly", 1],
    ["Dashboard/MaintainanceDashboard/MaintenanceMixBag/EnergyDailyReadingHistory", 2],
    ["Dashboard/MaintainanceDashboard/MaintenanceMixBag/EnergyMonthlyReadingHistory", 2],
    ["Dashboard/MaintainanceDashboard/MaintenanceMixBag/YearwiseEnergyBilling", 4],
    ["Dashboard/FinanceDashboard/MixBag/DirectorData", 1],
  ];
  assert.equal(pages.reduce((count, [, variants]) => count + variants, 0), 11);
  for (const [file] of pages) {
    const { ast } = read(`pages/${file}.jsx`);
    const tables = find(ast, (node) => node.type === "JSXElement" && ["AgTable", "YearWiseTable"].includes(node.openingElement.name.name));
    assert.ok(tables.length, file);
    for (const table of tables) {
      assert.equal(attribute(table, "hideFilter")?.value?.expression?.value, false, file);
      assert.ok(!attribute(table, "serverPagination"), "Client-side filters must have the complete record list");
    }
  }
});

test("ST and DTC overall energy widgets use smaller single-line summary chips", () => {
  const { ast } = read("pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/YearwiseEnergyBilling.jsx");
  const section = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "WidgetSection")[0];
  const headerClass = attribute(section, "headerContentClassName").value.expression;
  assert.ok(headerClass.consequent.value.includes("!flex-nowrap"));
  const content = attribute(section, "headerRightContent");
  const group = find(content, (node) => node.type === "JSXElement" && node.openingElement.name.name === "div")[0];
  assert.ok(attribute(group, "className").value.value.includes("flex-nowrap"));
  const chips = find(content, (node) => node.type === "JSXElement" && node.openingElement.name.name === "Chip");
  assert.equal(chips.length, 2);
  for (const chip of chips) {
    const sx = attribute(chip, "sx").value.expression;
    const font = sx.properties.find((entry) => entry.key.name === "fontSize").value;
    assert.equal(font.consequent.value, "0.625rem");
    assert.equal(font.alternate.value, "0.75rem");
    const label = sx.properties.find((entry) => entry.key.value === "& .MuiChip-label").value;
    assert.equal(label.properties.find((entry) => entry.key.name === "whiteSpace").value.value, "nowrap");
    assert.ok(!label.properties.some((entry) => entry.key.name === "overflowWrap"));
  }
});

test("ST and DTC overall energy headers keep both smaller total chips on one line", () => {
  const { ast, source } = read("pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/YearwiseEnergyBilling.jsx");
  const header = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "WidgetSection" && attribute(node, "headerRightContent"))[0];
  const headerClasses = attribute(header, "headerContentClassName");
  assert.ok(source.slice(headerClasses.start, headerClasses.end).includes("!flex-nowrap"));
  const slot = attribute(header, "headerRightContent");
  const chips = find(slot, (node) => node.type === "JSXElement" && node.openingElement.name.name === "Chip");
  assert.equal(chips.length, 2, "Both consumption and bill-amount chips need overflow protection");
  for (const chip of chips) {
    const sx = attribute(chip, "sx").value.expression;
    const prop = (object, key) => object.properties.find((entry) => (entry.key.name || entry.key.value) === key)?.value;
    assert.equal(prop(sx, "flexShrink").value, 0);
    assert.equal(prop(sx, "height").value, "auto");
    assert.ok(prop(sx, "minHeight"));
    const label = prop(sx, "& .MuiChip-label");
    assert.equal(prop(label, "whiteSpace").value, "nowrap");
    assert.ok(!prop(label, "overflowWrap"));
  }
  assert.ok(source.slice(slot.start, slot.end).includes("shrink-0 flex-nowrap"));
  const { source: widget } = read("components/WidgetSection.jsx");
  assert.ok(widget.includes('className="flex min-w-0 max-w-full flex-col items-end gap-2"'), "The outer summary group must also be able to shrink");
});

for (const building of ["St", "Dtc"]) {
test(`${building.toUpperCase()} Energy Daily Reading centres its existing day picker, aligns the total with the title and enables filtering`, () => {
  const { ast, source } = read(`pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/Maintainance${building}EnergyReadingDaily.jsx`);
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  assert.equal(attribute(table, "hideFilter").value.expression.value, false);
  assert.equal(attribute(table, "showDateControls").value.expression.value, false);
  const dateSlot = attribute(table, "toolbarDateControls");
  assert.equal(find(dateSlot, (node) => node.type === "JSXElement" && node.openingElement.name.name === "DatePicker").length, 1);
  assert.ok(source.slice(dateSlot.start, dateSlot.end).includes("handlePreviousDate"));
  assert.ok(source.slice(dateSlot.start, dateSlot.end).includes("handleNextDate"));
  const total = attribute(table, "titleRightContent");
  assert.ok(source.slice(total.start, total.end).includes("totalConsumption"));
  assert.ok(!source.slice(total.start, total.end).includes("order-first"), "The total must stay to the right of the title");
  assert.ok(!attribute(table, "summaryContent"));
  assert.ok(!attribute(table, "headerBottomContent"));
  assert.equal(attribute(table, "buttonTitle").value.value, "Add Reading");
  assert.ok(attribute(table, "exportData"));
});
}

test("HR Leaves moves its existing filters into the shared toolbar without changing the drawer", () => {
  const { ast, source } = read("pages/Dashboard/HrDashboard/HrEmployee/HrLeaves.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "MemoizedAgTable")[0];
  assert.equal(attribute(table, "showDateControls").value.expression.value, false);
  assert.ok(attribute(table, "hideFilter"), "Keep the generic drawer hidden");
  assert.ok(attribute(table, "exportData"));
  const slot = attribute(table, "toolbarDateControls");
  assert.equal(find(slot, (node) => node.type === "JSXElement" && node.openingElement.name.name === "TableDateFilter").length, 1);
  assert.equal(find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "TableDateFilter").length, 1);
  const action = attribute(table, "advancedFilterAction");
  assert.equal(find(action, (node) => node.type === "JSXElement" && attribute(node, "aria-label")?.value?.value === "Open advanced leave filters").length, 1);
  assert.equal(find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "HrLeavesAdvancedFilter").length, 1);
  assert.ok(source.includes("setDateRange([range])"));
  assert.ok(source.includes("value={appliedFilters}"));
  for (const option of ["leaveTypes", "batches", "departments", "employees"]) {
    const drawer = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "HrLeavesAdvancedFilter")[0];
    assert.ok(attribute(drawer, option), `Preserve ${option} options`);
  }
  assert.ok(!source.includes("setCalendarAnchor"), "Remove the old title-level calendar");
});

test("HR Employee Attendance uses one toolbar date-range picker instead of FY/month dropdowns", () => {
  const { ast, source } = read("pages/Dashboard/HrDashboard/HrEmployee/HrAttendance.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  const picker = find(attribute(table, "toolbarDateControls"), (node) => node.type === "JSXElement" && node.openingElement.name.name === "TableDateFilter")[0];
  assert.ok(picker);
  assert.equal(attribute(picker, "range").value.expression.name, "dateRange");
  assert.equal(attribute(table, "showDateControls").value.expression.value, false);
  assert.ok(attribute(table, "serverPagination"));
  assert.ok(source.includes("...getAttendanceRangeParams(dateRange)"));
  assert.ok(source.includes("dateRange.startDate,"));
  assert.ok(source.includes("dateRange.endDate,"));
  assert.ok(source.includes('field: `day${dateKey}`'));
  assert.ok(source.includes("setPagination((current) => ({ ...current, page: 1 }))"));
  assert.equal(find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "TextField" && attribute(node, "select")).length, 0);
  assert.ok(!source.includes("selectedFY"));
});

test("Unique Leads omits the redundant table date-range picker", () => {
  const { ast } = read("pages/Dashboard/SalesDashboard/UniqueLeads.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  assert.equal(attribute(table, "showDateControls").value.expression.value, false);
  assert.ok(!attribute(table, "toolbarDateControls"));
});

test("all inventory-card building links use the shared units title with its total aligned alongside", () => {
  const { ast, source } = read("pages/Dashboard/SalesDashboard/CoWorkingSeats/BuildingUnits.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  const total = attribute(table, "titleRightContent");
  assert.ok(total);
  assert.ok(source.slice(total.start, total.end).includes("totalDesksCount"));
  assert.ok(!attribute(table, "summaryContent"), "Do not repeat the total below the title");
  const { ast: sharedAst, source: sharedSource } = read("components/AgTable.jsx");
  const header = find(sharedAst, (node) => node.type === "JSXElement" && attribute(node, "className")?.value?.value === "flex flex-wrap items-center justify-between gap-3 pb-4")[0];
  const headerSource = sharedSource.slice(header.start, header.end);
  assert.ok(headerSource.includes("{tableTitle}"));
  assert.ok(headerSource.includes("{titleRightContent}"));
  const { ast: cards } = read("pages/Dashboard/SalesDashboard/CoWorkingSeats/CheckAvailability.jsx");
  const inventoryCards = find(cards, (node) => node.type === "VariableDeclarator" && node.id.name === "inventoryCards")[0];
  const links = find(inventoryCards, (node) => node.type === "ObjectProperty" && node.key.name === "route" && node.value.type === "StringLiteral" && node.value.value !== "#");
  assert.equal(links.length, 6);
  assert.ok(links.every((link) => /inventory\/(Sunteck%20Kanaka|Dempo%20Trade%20Centre)$/.test(link.value.value)));
});

test("shared dashboard Settings pages label their creation actions Upload SOP and Upload Policy", () => {
  for (const [name, document] of [["SopUpload", "SOP"], ["PolicyUpload", "Policy"]]) {
    const { ast } = read(`components/Pages/${name}.jsx`);
    const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "YearWiseTable")[0];
    assert.equal(attribute(table, "buttonTitle").value.expression.value, `Upload ${document}`);
    const modal = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "MuiModal" && attribute(node, "title")?.value?.expression?.type === "ConditionalExpression")[0];
    const title = attribute(modal, "title").value.expression;
    assert.equal(title.consequent.value, `Edit ${document}`);
    assert.equal(title.alternate.value, `Upload ${document}`);
    assert.ok(attribute(table, "handleSubmit"), "Keep the existing upload workflow");
  }
});

test("Sales Turnover uses equal column widths and enables advanced filtering", () => {
  const { ast } = read("pages/Dashboard/SalesDashboard/ActualBusiness/ActualBusinessRevenue.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  assert.equal(attribute(table, "hideFilter").value.expression.value, false);
  const columns = attribute(table, "columns").value.expression.elements;
  assert.equal(columns.length, 3);
  for (const column of columns) {
    const property = (name) => column.properties.find((entry) => entry.key?.name === name);
    assert.equal(property("flex").value.value, 1);
    assert.ok(!property("width"), "Fixed widths must not override equal flex sizing");
  }
  assert.ok(columns[1].properties.some((entry) => entry.key?.name === "cellRenderer"), "Keep vertical navigation links");
});

test("KYC, landlord and holiday add buttons use the table action slot exactly once", () => {
  for (const [file, title] of [
    ["Dashboard/FinanceDashboard/MixBag/DirectorsCompany", "Add New Director KYC"],
    ["Dashboard/FinanceDashboard/MixBag/LandlordAgreements", "Add New Landlord"],
    ["Dashboard/AdminDashboard/AdminHolidaysEvents", "Add Holiday - Event"],
  ]) {
    const { ast } = read(`pages/${file}.jsx`);
    const tables = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable");
    const table = tables.find((node) => attribute(node, "buttonTitle")?.value?.value === title);
    assert.ok(table, file);
    assert.ok(attribute(table, "handleClick"));
    const buttons = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PrimaryButton" && (attribute(node, "title")?.value?.value || attribute(node, "title")?.value?.expression?.value) === title);
    const modals = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "MuiModal");
    assert.ok(buttons.every((button) => modals.some((modal) => button.start > modal.start && button.end < modal.end)), "Only the modal's own submit button may remain outside the toolbar");
  }
});

test("department budget pages use AllocatedBudget's existing Request Budget toolbar callback", () => {
  for (const file of [
    "AdminDashboard/AdminFinance/AdminBudget", "FinanceDashboard/Finance/FinanceBudget",
    "FrontendDashboard/FrontendFinance/FrontendBudget", "HrDashboard/Finance/HrBudget",
    "ItDashboard/ItFinance/ItBudget", "MaintainanceDashboard/MaintenanceFinance/MaintenanceBudget",
    "SalesDashboard/SalesFinance/SalesBudget",
  ]) {
    const { ast } = read(`pages/Dashboard/${file}.jsx`);
    const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AllocatedBudget")[0];
    assert.ok(attribute(table, "onRequestBudget"), file);
    assert.equal(find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PrimaryButton" && attribute(node, "title")?.value?.expression?.value === "Request Budget").length, 0, file);
    if (file.startsWith("FinanceDashboard")) {
      assert.equal(attribute(table, "onRequestBudget").value.expression.test.argument.name, "isTop", "Keep the existing top-management restriction");
    }
  }
});

test("individual task pages retain date controls and place operations in their intended row", () => {
  for (const [name, dataField] of [["KraKpaDailyLogs", "dueRows"], ["KraKpaDueTask", "tableData"], ["KraKpaIndividualMonthlyKpa", "pendingTableData"]]) {
    const { ast } = read(`pages/Performance/${name}.jsx`);
    const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable" && attribute(node, "data")?.value?.expression?.name === dataField)[0];
    const actionSlot = "headerActions";
    if (name !== "KraKpaDueTask") assert.ok(attribute(table, actionSlot), name);
    assert.ok(attribute(table, "toolbarDateControls"), name);
    assert.notEqual(attribute(table, "showDateControls")?.value?.expression?.value, true, "The explicit toolbar picker must replace, not duplicate, automatic dates");
    const slot = attribute(table, actionSlot);
    const adds = find(slot, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PrimaryButton");
    assert.equal(adds.length, name === "KraKpaDueTask" ? 0 : 1);
    for (const button of adds) assert.ok(attribute(button, "handleSubmit"));
  }
});

test("Client Credits keeps its original server date range and one export in the shared toolbar", () => {
  const { ast } = read("pages/Meetings/Reviews.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable" && attribute(node, "data")?.value?.expression?.name === "clientCreditRows")[0];
  assert.ok(attribute(table, "serverPagination"));
  const picker = find(attribute(table, "toolbarDateControls"), (node) => node.type === "JSXElement" && node.openingElement.name.name === "DateRangePicker")[0];
  assert.equal(attribute(picker, "onChange").value.expression.name, "handleCreditDateRangeChange");
  const exports = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PrimaryButton" && attribute(node, "title")?.value?.value === "Export");
  assert.equal(exports.length, 1);
  assert.ok(find(attribute(table, "exportAction"), (node) => node === exports[0]).length);
});

test("selecting a date range does not add a cross icon in shared or settings pickers", () => {
  for (const file of ["components/TableDateFilter.jsx", "components/Tables/YearWiseTable.jsx"]) {
    const { ast } = read(file);
    assert.equal(find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "MdClose").length, 0, file);
    assert.equal(find(ast, (node) => node.type === "JSXAttribute" && node.name.name === "aria-label" && node.value?.value === "Clear date filter").length, 0, file);
    assert.ok(find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "DateRangePicker").length, "Keep date selection available");
  }
});

test("crowded Meeting Revenue toolbar separates its chip and keeps Manage Meeting before one export", () => {
  const { ast } = read("pages/Dashboard/SalesDashboard/MeetingRevenue.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "WidgetTable")[0];
  const summary = attribute(table, "summaryContent");
  const actions = attribute(table, "headerActions");
  assert.ok(summary);
  assert.equal(find(summary, (node) => node.type === "JSXElement" && node.openingElement.name.name === "Chip").length, 1);
  assert.equal(find(summary, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PrimaryButton").length, 0);
  const button = find(actions, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PrimaryButton")[0];
  assert.equal(attribute(button, "title").value.value, "Manage Meeting");
  assert.equal(find(actions, (node) => node.type === "JSXElement" && node.openingElement.name.name === "Chip").length, 0);
  assert.ok(attribute(table, "exportData"));
  const { source: widget, ast: wrapper } = read("components/Tables/WidgetTable.jsx");
  const inner = find(wrapper, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  assert.equal(attribute(inner, "summaryContent").value.expression.name, "summaryContent");
  assert.equal(attribute(inner, "toolbarActions").value.expression.name, "toolbarButtons");
  assert.ok(widget.includes("{headerActions}"));
  const { source: shared, ast: sharedAst } = read("components/AgTable.jsx");
  const toolbar = find(sharedAst, (node) => node.type === "JSXElement" && attribute(node, "className")?.value?.value?.includes("table-toolbar grid"))[0];
  assert.ok(shared.indexOf("{summaryContent}") < toolbar.start, "Summary must be above the entire search/date/action toolbar");
  const content = shared.slice(toolbar.start, toolbar.end);
  assert.ok(content.indexOf("{toolbarActions}") < content.indexOf("renderExportButton()"));
  assert.ok(content.indexOf("renderExportButton()") < content.indexOf('aria-label="Advanced filter"'));
  assert.ok(content.includes("flex-nowrap"), "Actions must stay in one row whenever the measured container fits");
  assert.ok(shared.includes("data-stacked={stackToolbar || undefined}"), "Measured container width must select the stacked fallback");
});

test("other crowded summary-chip lists keep chips out of operation slots", () => {
  for (const file of [
    "Dashboard/AdminDashboard/AdminClientMembers", "Dashboard/AdminDashboard/AdminClientsData/AdminClientsData",
    "Dashboard/AdminDashboard/BiometricAccess/BiometricAccessClients", "Dashboard/AdminDashboard/BiometricAccess/BiometricAccessMembers",
    "Dashboard/MaintainanceDashboard/Inventory",
    "Dashboard/SalesDashboard/ViewClients/ClientMembers",
  ]) {
    const { ast } = read(`pages/${file}.jsx`);
    assert.ok(find(ast, (node) => node.type === "JSXAttribute" && node.name.name === "summaryContent").length, file);
    for (const slot of find(ast, (node) => node.type === "JSXAttribute" && ["headerActions", "searchRowActions"].includes(node.name.name))) {
      assert.equal(find(slot, (node) => node.type === "JSXElement" && ["Chip", "StatusChip"].includes(node.openingElement.name.name)).length, 0, file);
    }
  }
  const { ast } = read("components/Tables/YearWiseTable.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  assert.equal(attribute(table, "summaryContent").value.expression.name, "summaryContent");
});

test("bordered section titles suppress redundant toolbar lines through shared wrappers", () => {
  const { source: section, ast } = read("components/WidgetSection.jsx");
  const provider = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.type === "JSXMemberExpression" && node.openingElement.name.object.name === "TableHeaderBorderContext")[0];
  assert.ok(provider, "Border information must reach tables through intervening layout elements");
  assert.equal(attribute(provider, "value").value.expression.name, "hasBorderedTitle");
  assert.ok(section.includes('borderBottomWidth: "0px"'), "Do not change existing title border styles");
  const { source: table } = read("components/AgTable.jsx");
  assert.ok(table.includes("useContext(TableHeaderBorderContext)"));
  assert.ok(table.includes('!hideToolbarDivider && <hr className="my-2" />'));
  const { ast: yearly } = read("components/Tables/YearWiseTable.jsx");
  const innerTable = find(yearly, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  const override = attribute(innerTable, "hideHeaderDivider").value.expression;
  assert.equal(override.test.name, "tableTitle");
  assert.equal(override.consequent.value, false, "Plain wrapper titles retain their sole divider");
});

test("detailed lists explicitly filter by meaningful dates from their view modals", () => {
  const pages = [
    ["pages/Tickets/Tables/RecievedTickets.jsx", "raisedDate"],
    ["pages/Tickets/Tables/AcceptedTickets.jsx", "acceptedAt"],
    ["pages/Tickets/Tables/AssignedTickets.jsx", "assignedAt"],
    ["pages/Tickets/Tables/SupportTickets.jsx", "supportRequestedAt"],
    ["pages/Tickets/Tables/EscalatedTickets.jsx", "escalatedAt"],
    ["pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KRA.jsx", "reviewDate"],
    ["pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KPI.jsx", "targetDate"],
    ["components/Pages/VendorTable.jsx", "onboardingDate"],
  ];
  for (const [file, field] of pages) {
    const { ast } = read(file);
    const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
    assert.equal(attribute(table, "dateColumn")?.value?.value, field, file);
    assert.notEqual(attribute(table, "showDateControls")?.value?.expression?.value, false, file);
    assert.ok(!attribute(table, "serverPagination"), "Client filtering must have all records");
  }
});

test("department summary tables omit search without changing detailed lists", () => {
  for (const file of [
    "Tickets/ManageTicketsHome", "Tasks/DepartmentTasks/DepartmentTasks",
    "Assets/AssetsHome", "Assets/ManageAssetsHome",
    "Performance/PerformanceDepartmentWiseKra", "Performance/PerformanceDepartmentWiseKraKpa",
    "Performance/PerformanceOverallKPA",
  ]) {
    const { ast } = read(`pages/${file}.jsx`);
    const tables = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable");
    assert.ok(tables.length, file);
    for (const table of tables) assert.equal(attribute(table, "search")?.value?.expression?.value, false, file);
  }
});

test("document search remains enabled for empty lists, not only ten or more rows", () => {
  for (const name of ["DirectorData", "ComplianceData"]) {
    const { ast } = read(`pages/Dashboard/FinanceDashboard/MixBag/${name}.jsx`);
    const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
    assert.ok(attribute(table, "search"));
    assert.equal(attribute(table, "search").value, null, "Search must not depend on row count");
  }
  const { source } = read("components/AgTable.jsx");
  assert.ok(source.includes("search: showTableControls && search && !serverSearch ? searchQuery"), "Hidden search must not keep filtering rows");
  assert.ok(source.includes("{showTableControls && search ? ("), "Search visibility must not depend on row count");
});

test("date and month table wrappers respect the search setting", () => {
  for (const name of ["YearWiseTable", "WidgetTable", "DateWiseTable", "MonthWiseTable", "MonthWiseAgTable"]) {
    const { ast } = read(`components/Tables/${name}.jsx`);
    const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
    assert.equal(attribute(table, "search")?.value?.expression?.name, "search", name);
  }
});

test("department ticket totals explicitly omit the date picker", () => {
  const { ast } = read("pages/Tickets/ManageTicketsHome.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  assert.equal(attribute(table, "showDateControls").value.expression.value, false);
});

test("dated wrappers retain date controls on empty lists without adding duplicate pickers", () => {
  const { source: yearly } = read("components/Tables/YearWiseTable.jsx");
  assert.match(yearly, /if \(!data.length\)\s*\{\s*setDateRange\(\[getCurrentMonthDateRange\(\)\]\)/);
  const { source: widget } = read("components/Tables/WidgetTable.jsx");
  assert.ok(widget.includes("showCalendarWhenEmpty = true"));
  const { source: budget } = read("components/Tables/AllocatedBudget.jsx");
  assert.ok(budget.includes("useState(() => [getCurrentMonthDateRange()])"));
  const { source: daily } = read("components/Tables/DateWiseTable.jsx");
  const { source: monthly } = read("components/Tables/MonthWiseTable.jsx");
  assert.ok(daily.includes('if (!dateSet.size && dateColumn) dateSet.add(dayjs().format("D-MMM-YYYY"))'));
  assert.ok(monthly.includes('if (!monthSet.size && dateColumn) monthSet.add(dayjs().format("MMM-YYYY"))'));
});

test("Historical P&L enables advanced filtering in the shared toolbar", () => {
  const { ast } = read("pages/Dashboard/FinanceDashboard/Cashflow/HistoricalPnl.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  assert.equal(attribute(table, "hideFilter").value.expression.value, false);
  assert.ok(attribute(table, "exportData"));
});

test("exports and neighbouring text actions match original Ticket Reports padding without resizing icons", () => {
  const { source: primary } = read("components/PrimaryButton.jsx");
  const { source: secondary } = read("components/SecondaryButton.jsx");
  const { source: table } = read("components/AgTable.jsx");
  const css = fs.readFileSync(new URL("../index.css", import.meta.url), "utf8");
  assert.ok(primary.includes('data-ui-action="text"'));
  assert.ok(primary.includes("data-export-action="));
  assert.ok(secondary.includes('data-ui-action="text"'));
  assert.ok(table.includes('className="table-toolbar-actions '));
  assert.match(css, /\.table-toolbar-actions \[data-ui-action="text"\],\s*button\[data-export-action="true"\]\s*\{\s*padding: 8px 16px !important;/);
  const { source: yearWise } = read("components/Tables/YearWiseTable.jsx");
  assert.ok(yearWise.includes('padding="px-4 py-2"'), "Keep the Ticket Reports reference size aligned with the toolbar rule");
  assert.ok(!table.slice(table.indexOf('aria-label="Advanced filter"'), table.indexOf('aria-label="Advanced filter"') + 300).includes('data-ui-action="text"'));
});

test("table wrappers respect pages that explicitly hide advanced filters", () => {
  for (const name of ["YearWiseTable", "WidgetTable", "DateWiseTable", "MonthWiseTable", "MonthWiseAgTable"]) {
    const { ast } = read(`components/Tables/${name}.jsx`);
    const tables = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable");
    assert.equal(tables.length, 1);
    assert.equal(attribute(tables[0], "hideFilter").value.expression.name, "hideFilter", name);
  }
});

test("detailed document and KRA/KPA lists enable advanced filters", () => {
  for (const file of [
    "Dashboard/FinanceDashboard/MixBag/ClientAgreementData",
    "Dashboard/FinanceDashboard/MixBag/LandlordAgreementData",
    "Dashboard/FinanceDashboard/MixBag/ComplianceData",
    "Performance/KraKpaDueTask", "Performance/KraKpaDailyLogs",
    "Performance/KraKpaIndividualMonthlyKpa", "Performance/KraKpaPendingApprovals",
    "Performance/PerformanceDepartmentKPA",
  ]) {
    const { ast } = read(`pages/${file}.jsx`);
    const tables = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable");
    assert.ok(tables.length, file);
    for (const table of tables) {
      assert.equal(attribute(table, "hideFilter")?.value?.expression?.value, false, file);
      assert.ok(!attribute(table, "serverPagination"), "Native filters require the full data set");
    }
  }
});

test("custom report and payslip filters use one shared advanced-filter slot after export", () => {
  for (const name of ["CurrentLeaveBalanceReport", "LeaveHistoryReport", "PaidUnpaidLeaveReport", "HrPayslips"]) {
    const { ast } = read(`pages/Dashboard/HrDashboard/Mixbag/${name}.jsx`);
    const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
    const slot = attribute(table, "advancedFilterAction");
    assert.ok(slot, name);
    assert.ok(attribute(table, "hideFilter"), "Do not duplicate the custom filter with a native drawer");
    assert.equal(find(ast, (node) => node.type === "JSXAttribute" && node.name.name === "advancedFilterAction").length, 1);
  }
  const { source } = read("components/AgTable.jsx");
  assert.ok(source.indexOf("{!exportButtonContainer && renderExportButton()}") < source.indexOf("{showTableControls && advancedFilterAction}"));
});

test("shared toolbar centers date controls and places export immediately before advanced filter", () => {
  const { source, ast } = read("components/AgTable.jsx");
  const toolbar = find(ast, (node) => node.type === "JSXElement" && attribute(node, "className")?.value?.value?.includes("table-toolbar grid"))[0];
  assert.ok(toolbar);
  const content = source.slice(toolbar.start, toolbar.end);
  assert.ok(content.includes('table-toolbar-search'));
  assert.ok(content.includes('table-toolbar-dates'));
  assert.ok(content.includes('table-toolbar-actions'));
  assert.ok(content.indexOf("{toolbarActions}") < content.indexOf("renderExportButton()"));
  assert.ok(content.indexOf("renderExportButton()") < content.indexOf('aria-label="Advanced filter"'));
  assert.ok(content.includes("toolbarDateControls !== undefined ? toolbarDateControls"));
});

for (const name of ["YearWiseTable", "WidgetTable", "AllocatedBudget", "DateWiseTable", "MonthWiseTable", "MonthWiseAgTable"]) {
  test(`${name} reuses its existing picker in the shared toolbar`, () => {
    const { ast } = read(`components/Tables/${name}.jsx`);
    const component = ast.program.body.find((node) => node.type === "VariableDeclaration" && node.declarations[0].id.name === name).declarations[0].init;
    const table = find(component, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
    const slot = attribute(table, "toolbarDateControls");
    assert.ok(slot, "Existing date/month/day controls must be passed to the toolbar");
    const controlName = slot.value.expression.name;
    assert.ok(component.body.body.some((node) => node.type === "VariableDeclaration" && node.declarations[0].id.name === controlName), "Picker declaration must be in component scope");
    if (name !== "MonthWiseAgTable") assert.ok(attribute(table, "exportAction"), "Existing export action must use the single shared export slot");
    if (["YearWiseTable", "WidgetTable", "AllocatedBudget", "MonthWiseAgTable"].includes(name)) {
      assert.equal(find(component, (node) => node.type === "ConditionalExpression" && node.consequent?.openingElement?.name?.name === "AgTable").length, 0, "Zero filtered rows must not remove the picker and search controls");
    }
  });
}

test("Monthly Attendance keeps exactly one month selector and no automatic range picker", () => {
  const { ast } = read("pages/Dashboard/HrDashboard/Mixbag/MonthlyAttendanceSummary.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  assert.equal(attribute(table, "showDateControls").value.expression.value, false);
  const slot = attribute(table, "toolbarDateControls");
  assert.ok(slot);
  assert.equal(find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "TextField" && attribute(node, "type")?.value?.value === "month").length, 1);
  assert.equal(find(slot, (node) => node.type === "JSXElement" && node.openingElement.name.name === "TextField" && attribute(node, "type")?.value?.value === "month").length, 1);
});

test("operation buttons precede the single export location, not the title row", () => {
  const { source, ast } = read("components/AgTable.jsx");
  const toolbar = find(ast, (node) => node.type === "JSXElement" && attribute(node, "className")?.value?.value?.includes("table-toolbar grid"))[0];
  const content = source.slice(toolbar.start, toolbar.end);
  assert.ok(content.indexOf("{buttonTitle &&") < content.indexOf("renderExportButton()"));
  assert.ok(content.indexOf("{headerActions}") < content.indexOf("renderExportButton()"));
  assert.equal((content.match(/renderExportButton\(\)/g) || []).length, 1);
  assert.ok(source.includes("exportAction !== undefined ? exportAction : exportData ?"));
});

test("Projections uses its custom export in the table toolbar and occupancy enables advanced filtering", () => {
  const { ast: projections } = read("pages/Dashboard/FinanceDashboard/Cashflow/Projections.jsx");
  const table = find(projections, (node) => node.type === "JSXElement" && node.openingElement.name.name === "YearWiseTable")[0];
  assert.equal(attribute(table, "customExportTitle").value.value, "Export");
  assert.equal(attribute(table, "handleCustomExport").value.expression.name, "handleExportMonthlyPnL");
  assert.equal(find(projections, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PrimaryButton" && attribute(node, "title")?.value?.value === "Export").length, 0);
  const { ast: occupancy } = read("pages/Dashboard/SalesDashboard/CoWorkingSeats/ViewAvailability.jsx");
  const tables = find(occupancy, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable");
  assert.ok(tables.some((node) => attribute(node, "hideFilter")?.value?.expression?.value === false));
});

for (const file of [
  "pages/Dashboard/FinanceDashboard/Finance/Collections.jsx",
  "pages/Dashboard/HrDashboard/Mixbag/CurrentLeaveBalanceReport.jsx",
  "pages/Dashboard/HrDashboard/Mixbag/LeaveHistoryReport.jsx",
  "pages/Dashboard/HrDashboard/Mixbag/PaidUnpaidLeaveReport.jsx",
  "pages/Printout/ReportPrintout.jsx",
]) {
  test(`${file} supplies its existing export to the shared toolbar only once`, () => {
    const { ast } = read(file);
    const tables = find(ast, (node) => node.type === "JSXElement" && ["AgTable", "WidgetTable"].includes(node.openingElement.name.name));
    const slot = tables.map((node) => attribute(node, "exportAction")).find(Boolean);
    assert.ok(slot);
    const isExportButton = (node) => node.type === "JSXElement" && node.openingElement.name.name === "PrimaryButton" && (attribute(node, "title")?.value?.value || attribute(node, "title")?.value?.expression?.value) === "Export";
    assert.equal(find(slot, isExportButton).length, 1);
    assert.equal(find(ast, isExportButton).length, 1);
  });
}

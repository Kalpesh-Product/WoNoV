const test = require("node:test");
const assert = require("node:assert/strict");
const { buildBulkPayroll: build, parseImportDate } = require("./bulkUserPayroll");
const base = { "Payroll Batch":"Full Time Batch", "Gross Annual":"216000", "Basic Pay":"10000", "HRA Type":"Metropolitan (50%)", "Special Allowance":"3000", "Include PF":"Yes", "Include ESI":"Yes" };
test("full-time compensation calculates HRA, PF and eligible ESI", () => {
 const p=build(base,"Full Time").payrollCompensation;
 assert.equal(p.grossPay,18000);assert.equal(p.totalDeductions,1335);assert.equal(p.netPay,16665);
});
test("consultant and intern compensation uses TDS without PF/ESI", () => {
 for(const type of ["Consultant","Intern"]) {
  const p=build({...base,"Payroll Batch":type+" Batch","HRA Type":"Custom","Special Allowance":"0"},type).payrollCompensation;
  assert.deepEqual(p.deductions,[{label:"TDS",amount:1000}]);assert.equal(p.netPay,9000);
 }
});
test("ESI excludes the exact 21000 threshold; PF is capped", () => {
 const p=build({...base,"Gross Annual":"252000","Basic Pay":"16000"},"Full Time").payrollCompensation;
 assert.deepEqual(p.deductions,[{label:"Provident Fund",amount:1800}]);
});
test("rejects inconsistent totals, invalid numbers, and incomplete payroll", () => {
 for(const row of [{...base,"Net Pay":"1"},{...base,"Basic Pay":"-1"},{...base,"Basic Pay":"abc"},{...base,"Basic Pay":""},{...base,"Payroll Batch":""},{...base,"Gross Annual":""},{...base,"Payment Method":"Bank Deposit"},{...base,"Effective Pay Period":"2026-13"}]) assert.throws(()=>build(row,"Full Time"));
});
test("legacy uploads need not include compensation", () => {
 const result=build({"Include In Payroll (Yes/No)":"Yes"},"Full Time");
 assert.equal(result.payrollInformation.includeInPayroll,true);assert.equal(result.payrollCompensation,undefined);
});
test("parses supplied date formats without ambiguous month conversion", () => {
 assert.equal(parseImportDate("01-06-2026","date").toISOString(),"2026-06-01T00:00:00.000Z");
 assert.equal(parseImportDate("2002-01-15","date").toISOString(),"2002-01-15T00:00:00.000Z");
 assert.throws(()=>parseImportDate("31-02-2026","date"));
});
test("invalid HTTP status does not mask the original error", () => {
 const handler=require("../middlewares/errorHandler");
 const res={status(code){assert.equal(code,500);return this;},json(body){assert.equal(body.message,"Original failure");}};
 handler({statusCode:"user",message:"Original failure"},{},res,()=>{});
});

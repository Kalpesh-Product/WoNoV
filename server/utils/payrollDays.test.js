const test = require("node:test");
const assert = require("node:assert/strict");
const { getPayrollDays } = require("./payrollDays");
test("paid days and LOP use working days, not calendar days",()=>{
 assert.deepEqual(getPayrollDays(25,2),{scheduledWorkingDays:25,lossOfPayDays:2,paidDays:23});
 assert.equal((30000/getPayrollDays(25,2).scheduledWorkingDays)*getPayrollDays(25,2).lossOfPayDays,2400);
});
test("supports fractional LOP, no LOP, and full-period LOP",()=>{
 assert.equal(getPayrollDays(25,1.5).paidDays,23.5);
 assert.equal(getPayrollDays(25,0).paidDays,25);
 assert.equal(getPayrollDays(25,25).paidDays,0);
 assert.equal(getPayrollDays(0,0).paidDays,0);
});
test("does not guess missing historical working days or accept invalid LOP",()=>{
 for(const days of [undefined,null,"",-1,NaN]) assert.throws(()=>getPayrollDays(days,0));
 for(const lop of [-1,26,NaN]) assert.throws(()=>getPayrollDays(25,lop));
});

const allowanceLabels = ["Special Allowance", "House Rent Allowance", "Conveyance Allowance", "Medical Allowance", "Children Education Allowance", "Dearness Allowance", "Other Allowance", "Arrears"];
const has = (row, key) => row[key] != null && String(row[key]).trim() !== "";
const amount = (row, key, fallback = 0) => {
  if (!has(row, key)) return fallback;
  const value = Number(String(row[key]).trim());
  if (!Number.isFinite(value) || value < 0) throw new Error(`${key} must be a non-negative number`);
  return value;
};
const bool = (row, key, fallback = false) => {
  if (!has(row, key)) return fallback;
  const value = String(row[key]).trim().toLowerCase();
  if (["yes", "true", "1"].includes(value)) return true;
  if (["no", "false", "0"].includes(value)) return false;
  throw new Error(`${key} must be Yes or No`);
};
const round = value => Math.round((value + Number.EPSILON) * 100) / 100;
const checkTotal = (row, key, expected) => {
  if (has(row, key) && Math.abs(amount(row, key) - expected) > 0.01)
    throw new Error(`${key} must equal ${expected}`);
};
const parseImportDate = (value, field) => {
  const text = String(value || "").trim();
  if (!text) return null;
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(text);
  const iso = match ? `${match[3]}-${match[2]}-${match[1]}` : text;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error(`${field} must use YYYY-MM-DD or DD-MM-YYYY`);
  const date = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0,10) !== iso) throw new Error(`Invalid ${field}`);
  return date;
};
const buildBulkPayroll = (row, employeeType) => {
  const info = {
    includeInPayroll: bool(row, "Include In Payroll (Yes/No)"),
    payrollBatch: String(row["Payroll Batch"] || "").trim(),
    professionTaxExemption: bool(row, "Profession Tax Exemption"),
    includePF: bool(row, "Include PF"),
    includeEsi: bool(row, "Include ESI"),
    pfContributionRate: String(row["PF Contribution Rate"] || row["Employer PF Contri"] || ""),
    employeePF: String(row["Employee PF"] || ""),
    employerPf: String(row["Employer PF"] || row["Employer PF Contri"] || ""),
    esiContribution: String(row["ESI Contribution"] || ""),
    hraType: String(row["HRA Type"] || "").trim(),
    hraPercentage: String(row["HRA Percentage"] || ""),
    tdsCalculationBasedOn: String(row["TDS Calculation Based On"] || ""),
    taxPercentage: String(row["Tax Percentage"] || ""),
    incomeTaxRegime: String(row["Income Tax Regime"] || ""),
  };
  if (info.payrollBatch && !["Full Time Batch", "Consultant Batch", "Intern Batch"].includes(info.payrollBatch)) throw new Error("Invalid Payroll Batch");
  const result = { payrollInformation: info };
  const salaryPresent = ["Gross Annual", "Salary Package Amount", "Pay Frequency", "Currency"].some(key => has(row,key));
  const annual = amount(row, "Gross Annual", amount(row, "Salary Package Amount"));
  if (salaryPresent) {
    const frequency = String(row["Pay Frequency"] || "annual").trim().toLowerCase();
    if (!["annual", "monthly", "weekly", "biweekly"].includes(frequency)) throw new Error("Invalid Pay Frequency");
    result.salaryPackage = { grossAnnual: annual, amount: amount(row,"Salary Package Amount",annual), currency: String(row.Currency || "INR").trim(), payFrequency: frequency };
  }
  const compFields = ["Basic Pay", "Gross Pay", "Net Pay", "Total Allowances", "Total Deductions", "Provident Fund", "ESI", "TDS", "Variable Pay", "Gratuity", "Effective Pay Period", "Payment Method", "Appraisal Date", ...allowanceLabels];
  if (!compFields.some(key => has(row,key))) return result;
  if (!has(row,"Basic Pay")) throw new Error("Basic Pay is required when importing compensation");
  if (!info.payrollBatch) throw new Error("Payroll Batch is required when importing compensation");
  if (!salaryPresent || annual <= 0) throw new Error("Positive Gross Annual or Salary Package Amount is required for compensation");
  const basicPay = amount(row,"Basic Pay");
  const calculatedHra = info.hraType && info.hraType.toLowerCase() !== "custom";
  const hra = calculatedHra ? round(basicPay * 0.5) : 0;
  checkTotal(row,"House Rent Allowance",hra);
  const allowances = allowanceLabels.map(label => ({label, amount: label === "House Rent Allowance" ? hra : amount(row,label)})).filter(item => item.amount > 0);
  const totalAllowances = round(allowances.reduce((sum,item)=>sum+item.amount,0));
  const grossPay = round(basicPay + totalAllowances);
  const usesTds = /intern|consultant/i.test(employeeType);
  const pf = !usesTds && info.includePF ? round(basicPay >= 15000 ? 1800 : basicPay * 0.12) : 0;
  const esi = !usesTds && info.includeEsi && annual / 12 < 21000 ? round(grossPay * 0.0075) : 0;
  const tds = usesTds ? round(basicPay * 0.1) : 0;
  for (const [key,value] of [["Provident Fund",pf],["ESI",esi],["TDS",tds]]) checkTotal(row,key,value);
  const deductions = [{label:"Provident Fund",amount:pf},{label:"ESI",amount:esi},{label:"TDS",amount:tds}].filter(item=>item.amount>0);
  const totalDeductions = round(pf+esi+tds);
  const netPay = round(Math.max(0,grossPay-totalDeductions));
  for(const [key,value] of [["Gross Pay",grossPay],["Total Allowances",totalAllowances],["Total Deductions",totalDeductions],["Net Pay",netPay]]) checkTotal(row,key,value);
  const paymentMethod = String(row["Payment Method"] || "").trim();
  if (!["","Cash Only","Bank Deposit"].includes(paymentMethod)) throw new Error("Invalid Payment Method");
  if(paymentMethod === "Bank Deposit" && (!has(row,"Bank Name") || !has(row,"Account Number"))) throw new Error("Bank Deposit requires Bank Name and Account Number");
  const effectivePayPeriod = String(row["Effective Pay Period"] || "").trim();
  if(effectivePayPeriod && !/^\d{4}-(0[1-9]|1[0-2])$/.test(effectivePayPeriod)) throw new Error("Effective Pay Period must use YYYY-MM");
  result.payrollCompensation = { basicPay,grossPay,allowances,deductions,totalAllowances,totalDeductions,netPay,variablePay:amount(row,"Variable Pay"),gratuity:amount(row,"Gratuity"),paymentMethod,effectivePayPeriod,appraisalDate:parseImportDate(row["Appraisal Date"],"Appraisal Date"),updatedAt:new Date() };
  return result;
};
module.exports = { buildBulkPayroll, parseImportDate };

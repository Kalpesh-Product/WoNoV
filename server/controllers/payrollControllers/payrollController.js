const { default: mongoose } = require("mongoose");
const fs = require("fs");
const path = require("path");
const Payroll = require("../../models/payrolls/Payroll");
const PayrollDraft = require("../../models/payrolls/PayrollDraft");
const User = require("../../models/hr/UserData");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const { PDFDocument, StandardFonts, degrees, rgb } = require("pdf-lib");
const { handleDocumentUpload } = require("../../config/s3Config");
const Payslip = require("../../models/Payslip");
const Company = require("../../models/hr/Company");
const { startOfMonth, isSameMonth } = require("date-fns");
const Leave = require("../../models/hr/Leaves");
const Attendance = require("../../models/hr/Attendance");
const AttendanceCorrection = require("../../models/hr/AttendanceCorrection");
const MonthlyAttendanceSummary = require("../../models/hr/MonthlyAttendanceSummary");
const mailer = require("../../config/nodemailerConfig");

const allowanceOptions = [
  "Special Allowance",
  "Conveyance Allowance",
  "Medical Allowance",
  "Children Education Allowance",
  "Dearness Allowance",
  "Other Allowance",
  "Arrears",
  "House Rent Allowance",
];
const additionalDeductionOptions = [
  "Adjustments",
  "Voluntary Provident Fund",
  "LWF",
  "Employer LWF",
  "Recovery",
];
const numberValue = (value) => Number(value) || 0;
const roundCurrency = (value) =>
  Math.round((numberValue(value) + Number.EPSILON) * 100) / 100;
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
const isEnabled = (value) =>
  value === true || ["true", "yes"].includes(String(value).toLowerCase());
const getEmployeePf = (basic) =>
  numberValue(basic) >= 15000 ? 1800 : numberValue(basic) * 0.12;
const getAnnualCtc = (employee) =>
  numberValue(employee?.salaryPackage?.grossAnnual) ||
  numberValue(employee?.salaryPackage?.amount);
const getEmployeeType = (employee) =>
  String(
    employee?.employeeType?.name ||
      employee?.employeeType?.employeeType ||
      employee?.employeeType ||
      "",
  ).toLowerCase();
const isTdsWorker = (employee) => {
  const type = getEmployeeType(employee);
  return type.includes("intern") || type.includes("consultant");
};
const getPayPeriodKey = (date) => {
  const value = new Date(date);
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}`;
};

const getPayslipEmailDetails = ({ draft, employeeName, companyName }) => {
  const payPeriod = new Date(draft.payPeriod);
  const periodStart = new Date(
    Date.UTC(payPeriod.getUTCFullYear(), payPeriod.getUTCMonth(), 1),
  );
  const periodEnd = new Date(
    Date.UTC(payPeriod.getUTCFullYear(), payPeriod.getUTCMonth() + 1, 0),
  );
  const formatDate = (date) => {
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = date.toLocaleDateString("en-GB", {
      month: "short",
      timeZone: "UTC",
    });
    return `${day} ${month}, ${date.getUTCFullYear()}`;
  };
  const formattedPeriod = `${formatDate(periodStart)} - ${formatDate(periodEnd)}`;
  const clientUrl = String(
    "http://localhost:3009" || process.env.CORS_FRONTEND_URL,
  ).replace(/\/$/, "");
  const payslipPageUrl = `${clientUrl}/app/profile/HR/payslips`;
  const safeEmployeeName = escapeHtml(employeeName || "Employee");
  const safeCompanyName = escapeHtml(companyName || "Payroll Team");
  const safePeriod = escapeHtml(formattedPeriod);
  const safePayslipPageUrl = escapeHtml(payslipPageUrl);

  return {
    subject: `Your payslip for pay period ${formattedPeriod} is available.`,
    text: `Hello ${employeeName || "Employee"},\n\nYour payslip for pay period ${formattedPeriod} is attached. You can also view it in WoNo: ${payslipPageUrl}\n\nRegards,\n${companyName || "Payroll Team"}`,
    html: `
      <div style="margin:0;padding:30px 16px;background:#f3f4f6;font-family:Arial,sans-serif;color:#24324a;">
        <div style="max-width:660px;margin:0 auto;">
          <div style="padding:24px 32px;background:#ffffff;text-align:center;border-radius:5px;">
            <img src="cid:wono-payroll-logo" alt="WoNo" style="display:inline-block;max-width:190px;height:auto;" />
          </div>
          <div style="margin-top:10px;padding:34px;background:#ffffff;border-radius:5px;font-size:16px;line-height:1.65;">
            <p style="margin:0 0 18px;">Hello ${safeEmployeeName},</p>
            <p style="margin:0 0 28px;">Please find the attached payslip for pay period <strong>${safePeriod}</strong>. You can also use the button below to view your payslips in WoNo.</p>
            <div style="margin:32px 0;text-align:center;">
              <a href="${safePayslipPageUrl}" target="_blank" style="display:inline-block;padding:13px 30px;background:#1e3d73;color:#ffffff;text-decoration:none;border-radius:4px;font-size:15px;font-weight:bold;">VIEW PAYSLIP</a>
            </div>
            <p style="margin:36px 0 0;">Regards,<br />${safeCompanyName}</p>
          </div>
        </div>
      </div>`,
    logoAttachment: {
      filename: "wono-logo.png",
      path: path.resolve(
        __dirname,
        "../../../client/src/assets/WONO_LOGO_Black_TP.png",
      ),
      cid: "wono-payroll-logo",
    },
  };
};

const getFriendlyPayslipEmailReason = (payslip) => {
  const status = String(payslip?.emailStatus || "Not Requested");
  const rawError = String(payslip?.emailError || "");

  if (status === "Sent") return "Sent successfully";
  if (status === "Not Requested") return "Email was not requested";
  if (status === "Skipped") {
    if (/missing/i.test(rawError)) return "Email address is missing";
    if (/invalid/i.test(rawError)) return "Email address is invalid";
    return "Employee email address is missing or invalid";
  }
  if (
    /535|badcredentials|invalid login|username and password not accepted/i.test(
      rawError,
    )
  ) {
    return "Payslip generated, but the email could not be sent because the sender email account is not configured correctly. Please contact the administrator and retry.";
  }
  return "Payslip generated, but the email could not be delivered. Please retry or contact the administrator.";
};

const getPayslipEmailStatusPayload = (payslips) => {
  const employees = payslips.map((payslip) => {
    const employee = payslip.employee || {};
    const status = String(payslip.emailStatus || "Not Requested");
    return {
      employeeId: employee._id,
      employeeCode: employee.empId || "",
      employeeName:
        [employee.firstName, employee.lastName].filter(Boolean).join(" ") ||
        employee.empId ||
        "Employee",
      email: employee.email || "",
      status:
        status === "Failed" || status === "Skipped"
          ? "Failed to send"
          : status,
      reason: getFriendlyPayslipEmailReason(payslip),
      emailSentAt: payslip.emailSentAt,
    };
  });
  const senderConfigurationError = employees.find((employee) =>
    employee.reason.includes("sender email account is not configured correctly"),
  )?.reason;

  return {
    summary: {
      generated: payslips.length,
      sent: payslips.filter((payslip) => payslip.emailStatus === "Sent").length,
      failedToSend: payslips.filter((payslip) =>
        ["Failed", "Skipped"].includes(payslip.emailStatus),
      ).length,
      notRequested: payslips.filter(
        (payslip) => payslip.emailStatus === "Not Requested",
      ).length,
    },
    systemError: senderConfigurationError || null,
    employees,
  };
};

const createPayslipPdf = async ({ draft, summary, employee, companyData }) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bizNestLogoPath = path.resolve(
    __dirname,
    "../../../client/src/assets/biznest/biznest_logo.jpg",
  );
  const bizNestLogo = await pdfDoc.embedJpg(
    await fs.promises.readFile(bizNestLogoPath),
  );
  const black = rgb(0.05, 0.05, 0.05);
  const muted = rgb(0.48, 0.5, 0.52);
  const light = rgb(0.88, 0.89, 0.9);
  const wonoBlue = rgb(30 / 255, 61 / 255, 115 / 255);
  const left = 25;
  const right = 570;
  const leftColumnWidth = 215;
  const rightColumnX = 270;
  const rightColumnWidth = right - rightColumnX;
  let y = 812;
  const drawText = (text, x, top, options = {}) => {
    const safeText = String(text ?? "").replace(/[^\x20-\x7E\xA9]/g, " ");
    page.drawText(safeText, {
      x,
      y: top,
      size: options.size || 7,
      font: options.bold ? bold : regular,
      color: options.color || black,
      rotate: options.rotate,
    });
  };
  const truncate = (value, maxLength) => {
    const text = String(value || "N/A");
    return text.length > maxLength
      ? `${text.slice(0, maxLength - 3)}...`
      : text;
  };
  const amount = (value) =>
    `INR ${numberValue(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const sectionTitle = (title, x, top, width, rightTitle = "") => {
    drawText(title.toUpperCase(), x, top, { size: 7, bold: true });
    if (rightTitle) {
      const labelWidth = bold.widthOfTextAtSize(rightTitle, 7);
      drawText(rightTitle, x + width - labelWidth, top, {
        size: 7,
        bold: true,
      });
    }
    page.drawLine({
      start: { x, y: top - 6 },
      end: { x: x + width, y: top - 6 },
      thickness: 0.45,
      color: light,
    });
  };
  const keyValueRow = (label, value, x, top, width, options = {}) => {
    drawText(label, x, top, { size: 7, bold: options.boldLabel });
    const display = String(value ?? "N/A");
    const valueWidth = (options.boldValue ? bold : regular).widthOfTextAtSize(
      display,
      7,
    );
    drawText(display, x + width - valueWidth, top, {
      size: 7,
      bold: options.boldValue,
    });
  };
  const mask = (value, visible = 4) => {
    const text = String(value || "");
    if (!text) return "N/A";
    return `${"*".repeat(Math.max(4, text.length - visible))}${text.slice(-visible)}`;
  };

  const payStart = new Date(draft.payPeriod);
  const payEnd = new Date(
    Date.UTC(payStart.getUTCFullYear(), payStart.getUTCMonth() + 1, 0),
  );
  const totalDaysInMonth = payEnd.getUTCDate();
  const dateLabel = (date) =>
    date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  const employeeName = [employee.firstName, employee.lastName]
    .filter(Boolean)
    .join(" ");
  const employeeAddress = [
    employee.homeAddress?.addressLine1,
    employee.homeAddress?.addressLine2,
    employee.homeAddress?.city,
    employee.homeAddress?.state,
    employee.homeAddress?.pinCode,
  ].filter(Boolean);

  drawText("PAYSLIP", left, y, { size: 10, bold: true });
  drawText(`${dateLabel(payStart)} - ${dateLabel(payEnd)}`, left, y - 13, {
    size: 7,
    bold: true,
  });
  const logoWidth = 70;
  const logoHeight = logoWidth / (bizNestLogo.width / bizNestLogo.height);
  page.drawImage(bizNestLogo, {
    x: right - logoWidth,
    y: y - 1,
    width: logoWidth,
    height: logoHeight,
  });
  y -= 34;
  page.drawLine({
    start: { x: left, y },
    end: { x: right, y },
    thickness: 0.5,
    color: light,
  });
  y -= 22;

  const companyDisplayName = String(
    companyData?.registeredCompanyName || companyData?.companyName || "WoNo",
  ).toUpperCase();
  drawText(companyDisplayName, left, y, {
    size: 7,
    bold: true,
    color: /wono/i.test(companyDisplayName) ? wonoBlue : black,
  });
  drawText(employeeName.toUpperCase(), rightColumnX, y, {
    size: 7,
    bold: true,
  });
  const registeredAddressLines = String(companyData?.fullAddress || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const companyLines = registeredAddressLines.length
    ? [
        ...registeredAddressLines,
        companyData?.phoneNumber
          ? `Phone No: ${companyData.phoneNumber}`
          : null,
      ].filter(Boolean)
    : [
        [companyData?.companyCity, companyData?.companyState]
          .filter(Boolean)
          .join(", "),
        companyData?.websiteURL,
        companyData?.phoneNumber
          ? `Phone No: ${companyData.phoneNumber}`
          : null,
      ].filter(Boolean);
  const employeeLines = [
    ...employeeAddress,
    employee.phone ? `Phone No: ${employee.phone}` : null,
  ].filter(Boolean);
  companyLines
    .slice(0, 4)
    .forEach((lineText, index) =>
      drawText(truncate(lineText, 48), left, y - 15 - index * 11),
    );
  employeeLines
    .slice(0, 4)
    .forEach((lineText, index) =>
      drawText(truncate(lineText, 48), rightColumnX, y - 15 - index * 11),
    );
  y -= 105;

  sectionTitle("Basic Information", left, y, leftColumnWidth);
  sectionTitle(
    "Earnings/Allowances",
    rightColumnX,
    y,
    rightColumnWidth,
    "Current Period",
  );
  y -= 23;
  const basicRows = [
    ["Emp ID", employee.empId || "N/A"],
    [
      "Date of Joining",
      employee.startDate ? dateLabel(new Date(employee.startDate)) : "N/A",
    ],
    ["Designation", truncate(employee.designation, 28)],
    ["Department", truncate(employee.departments?.[0]?.name, 28)],
    ["Bank Name", truncate(employee.bankInformation?.bankName, 28)],
    ["Bank IFSC", employee.bankInformation?.bankIFSC || "N/A"],
    ["Bank A/c", mask(employee.bankInformation?.accountNumber)],
    ["AADHAAR #", mask(employee.panAadhaarDetails?.aadhaarId)],
    ["PF A/c #", mask(employee.panAadhaarDetails?.pfAccountNumber)],
    ["PF UAN #", mask(employee.panAadhaarDetails?.pfUAN)],
    ["LOP Days", numberValue(summary.lossOfPayDays)],
    [
      "Paid Days",
      Math.max(0, totalDaysInMonth - numberValue(summary.lossOfPayDays)),
    ],
  ];
  const earningRows = [
    ["Basic", amount(summary.basic)],
    ...(summary.allowanceItems || []).map((item) => [
      item.label,
      amount(item.amount),
    ]),
  ];
  basicRows.forEach(([label, value], index) =>
    keyValueRow(label, value, left, y - index * 18, leftColumnWidth),
  );
  earningRows.forEach(([label, value], index) =>
    keyValueRow(label, value, rightColumnX, y - index * 18, rightColumnWidth),
  );
  let rightY = y - earningRows.length * 18 - 3;
  page.drawLine({
    start: { x: rightColumnX + 155, y: rightY + 10 },
    end: { x: right, y: rightY + 10 },
    thickness: 0.4,
    color: light,
  });
  keyValueRow(
    "TOTAL",
    amount(summary.actualGross),
    rightColumnX,
    rightY,
    rightColumnWidth,
    {
      boldLabel: true,
      boldValue: true,
    },
  );
  rightY -= 33;

  sectionTitle(
    "Deductions",
    rightColumnX,
    rightY,
    rightColumnWidth,
    "Current Period",
  );
  rightY -= 23;
  const deductionRows = summary.deductionItems || [];
  deductionRows.forEach((item, index) =>
    keyValueRow(
      item.label,
      amount(item.amount),
      rightColumnX,
      rightY - index * 18,
      rightColumnWidth,
    ),
  );
  rightY -= deductionRows.length * 18 + 3;
  page.drawLine({
    start: { x: rightColumnX + 155, y: rightY + 10 },
    end: { x: right, y: rightY + 10 },
    thickness: 0.4,
    color: light,
  });
  keyValueRow(
    "TOTAL",
    amount(summary.deductions),
    rightColumnX,
    rightY,
    rightColumnWidth,
    {
      boldLabel: true,
      boldValue: true,
    },
  );
  rightY -= 33;

  sectionTitle(
    "Loss of Pay",
    rightColumnX,
    rightY,
    rightColumnWidth,
    "Current Period",
  );
  rightY -= 23;
  keyValueRow(
    "Loss of Pay",
    amount(summary.lossOfPay),
    rightColumnX,
    rightY,
    rightColumnWidth,
  );
  rightY -= 36;
  sectionTitle("Taxes", rightColumnX, rightY, rightColumnWidth);
  rightY -= 23;
  const taxes =
    numberValue(summary.incomeTax) +
    numberValue(summary.surcharge) +
    numberValue(summary.cess);
  keyValueRow("TOTAL", amount(taxes), rightColumnX, rightY, rightColumnWidth, {
    boldLabel: true,
    boldValue: true,
  });
  rightY -= 36;
  page.drawLine({
    start: { x: rightColumnX + 155, y: rightY + 10 },
    end: { x: right, y: rightY + 10 },
    thickness: 0.4,
    color: light,
  });
  keyValueRow(
    "NET AMOUNT",
    amount(summary.netAmount),
    rightColumnX,
    rightY,
    rightColumnWidth,
    {
      boldLabel: true,
      boldValue: true,
    },
  );

  const employerY = y - basicRows.length * 18 - 10;
  sectionTitle("Employer Contribution", left, employerY, leftColumnWidth);
  keyValueRow(
    "PF",
    amount(companyData?.employerCosts?.employerPf),
    left,
    employerY - 23,
    leftColumnWidth,
  );
  if (numberValue(companyData?.employerCosts?.employerEsi) > 0) {
    keyValueRow(
      "ESI",
      amount(companyData.employerCosts.employerEsi),
      left,
      employerY - 41,
      leftColumnWidth,
    );
  }

  drawText("Payroll by WONOCO PRIVATE LIMITED", 583, 700, {
    size: 6,
    color: wonoBlue,
    rotate: degrees(-90),
  });
  drawText("Payroll by WONOCO PRIVATE LIMITED", 8, 110, {
    size: 6,
    color: wonoBlue,
    rotate: degrees(90),
  });
  page.drawLine({
    start: { x: left, y: 28 },
    end: { x: right, y: 28 },
    thickness: 0.5,
    color: light,
  });
  drawText(
    "This is electronically generated payslip, hence does not require signature",
    left,
    15,
    { size: 6, color: muted },
  );
  const copyrightText = "© 2026-27 WONOCO PRIVATE LIMITED";
  const copyrightWidth = regular.widthOfTextAtSize(copyrightText, 6);
  drawText(copyrightText, right - copyrightWidth, 15, {
    size: 6,
    color: wonoBlue,
  });

  pdfDoc.setTitle(`Payslip ${employeeName}`);
  return Buffer.from(await pdfDoc.save());
};
const undoableDraftFields = [
  "payrollType",
  "status",
  "directDepositStatus",
  "employeeCount",
  "grossAmount",
  "incomeTax",
  "surcharge",
  "cess",
  "netAmount",
  "lossOfPay",
  "employeePf",
  "employerPf",
  "voluntaryProvidentFund",
  "pfEmployeeCount",
  "employeeEsi",
  "employerEsi",
  "esiEmployeeCount",
  "employeeSummaries",
  "runDate",
  "submittedBy",
  "submittedAt",
];
const createDraftUndoSnapshot = (draft) => {
  const source =
    typeof draft.toObject === "function" ? draft.toObject() : draft;
  return undoableDraftFields.reduce((snapshot, field) => {
    snapshot[field] = source[field] ?? null;
    return snapshot;
  }, {});
};
const saveDraftUndoSnapshot = (draft) => {
  draft.undoSnapshot = createDraftUndoSnapshot(draft);
  draft.canUndo = true;
};
const saveEmployeeUndoSnapshot = (draft, summary) => {
  const employeeId = String(summary.employee);
  const snapshots = { ...(draft.employeeUndoSnapshots || {}) };
  snapshots[employeeId] =
    typeof summary.toObject === "function" ? summary.toObject() : summary;
  draft.employeeUndoSnapshots = snapshots;
  draft.markModified("employeeUndoSnapshots");
  if (
    !(draft.undoableEmployeeIds || []).some(
      (undoEmployeeId) => String(undoEmployeeId) === employeeId,
    )
  ) {
    draft.undoableEmployeeIds.push(summary.employee);
  }
};
const recalculateDraftTotals = async (draft) => {
  const rows = draft.employeeSummaries.filter((row) => !row.isExcluded);
  const employeeIds = rows.map((row) => row.employee).filter(Boolean);
  const [employees, companyData] = await Promise.all([
    User.find({ _id: { $in: employeeIds }, company: draft.company })
      .select("payrollInformation salaryPackage employeeType")
      .lean(),
    Company.findById(draft.company).select("employerCosts").lean(),
  ]);
  const employeeById = new Map(
    employees.map((employee) => [String(employee._id), employee]),
  );
  const employerCosts = companyData?.employerCosts || {};
  const totals = rows.reduce(
    (result, row) => {
      const employee = employeeById.get(String(row.employee));
      const pfEnabled = isEnabled(employee?.payrollInformation?.includePF);
      const annualCtc = getAnnualCtc(employee);
      const esiEnabled =
        isEnabled(employee?.payrollInformation?.includeEsi) &&
        annualCtc > 0 &&
        annualCtc / 12 < 21000;
      const deductionAmount = (label) =>
        (row.deductionItems || [])
          .filter(
            (item) =>
              String(item.label || "").toLowerCase() === label.toLowerCase(),
          )
          .reduce((sum, item) => sum + numberValue(item.amount), 0);

      result.grossAmount += numberValue(row.gross);
      result.incomeTax += numberValue(row.incomeTax);
      result.surcharge += numberValue(row.surcharge);
      result.cess += numberValue(row.cess);
      result.netAmount += numberValue(row.netAmount);
      result.lossOfPay += numberValue(row.lossOfPay);
      result.employeePf += pfEnabled ? deductionAmount("Provident Fund") : 0;
      result.voluntaryProvidentFund += deductionAmount(
        "Voluntary Provident Fund",
      );
      result.employeeEsi += esiEnabled ? deductionAmount("ESI") : 0;
      result.employerPf += pfEnabled
        ? numberValue(employerCosts.employerPf)
        : 0;
      result.employerEsi += esiEnabled
        ? numberValue(employerCosts.employerEsi)
        : 0;
      result.pfEmployeeCount += pfEnabled ? 1 : 0;
      result.esiEmployeeCount += esiEnabled ? 1 : 0;
      return result;
    },
    {
      employeeCount: rows.length,
      grossAmount: 0,
      incomeTax: 0,
      surcharge: 0,
      cess: 0,
      netAmount: 0,
      lossOfPay: 0,
      employeePf: 0,
      employerPf: 0,
      voluntaryProvidentFund: 0,
      pfEmployeeCount: 0,
      employeeEsi: 0,
      employerEsi: 0,
      esiEmployeeCount: 0,
    },
  );
  Object.assign(draft, totals);
  return draft;
};

const createPayrollDraft = async (req, res, next) => {
  try {
    const { company, user } = req;
    const batchName = String(req.body.batchName || "").trim();
    const payPeriod = new Date(`${req.body.payPeriod}-01T00:00:00.000Z`);

    if (
      !batchName ||
      !req.body.payPeriod ||
      Number.isNaN(payPeriod.getTime())
    ) {
      return res.status(400).json({
        message: "A valid payroll batch and pay period are required",
      });
    }

    const existingDraft = await PayrollDraft.findOne({
      company,
      batchName,
      payPeriod,
    }).select("+undoSnapshot");
    if (existingDraft?.status === "Processed") {
      return res.status(409).json({
        message: "Processed payroll cannot be recreated or edited",
      });
    }
    const employees = await User.find({
      company,
      isActive: true,
      "payrollInformation.payrollBatch": batchName,
    })
      .select(
        "firstName lastName empId employeeType payrollInformation payrollCompensation salaryPackage",
      )
      .lean();

    if (!employees.length) {
      return res.status(400).json({
        message: "No active employees were found in the selected payroll batch",
      });
    }

    const companyData = await Company.findById(company)
      .select("employerCosts")
      .lean();
    const employeeIds = employees.map((employee) => employee._id);
    const attendanceSummaries = await MonthlyAttendanceSummary.find({
      company,
      employee: { $in: employeeIds },
      month: req.body.payPeriod,
    }).lean();
    const attendanceByEmployee = new Map(
      attendanceSummaries.map((summary) => [String(summary.employee), summary]),
    );
    const employerCosts = companyData?.employerCosts || {};

    const employeeSummaries = [];
    const totals = employees.reduce(
      (summary, employee) => {
        const compensation = employee.payrollCompensation || {};
        const deductions = Array.isArray(compensation.deductions)
          ? compensation.deductions
          : [];
        const incomeTax = deductions.reduce((total, deduction) => {
          const label = String(deduction.label || "").toLowerCase();
          return label.includes("tax") || label === "tds"
            ? total + (Number(deduction.amount) || 0)
            : total;
        }, 0);
        const deductionAmount = (label) =>
          deductions
            .filter(
              (deduction) =>
                String(deduction.label || "").toLowerCase() ===
                label.toLowerCase(),
            )
            .reduce(
              (total, deduction) => total + (Number(deduction.amount) || 0),
              0,
            );
        const pfEnabled =
          employee.payrollInformation?.includePF === true ||
          ["true", "yes"].includes(
            String(employee.payrollInformation?.includePF).toLowerCase(),
          );
        const annualCtc =
          Number(employee.salaryPackage?.grossAnnual) ||
          Number(employee.salaryPackage?.amount) ||
          0;
        const esiEnabled =
          (employee.payrollInformation?.includeEsi === true ||
            ["true", "yes"].includes(
              String(employee.payrollInformation?.includeEsi).toLowerCase(),
            )) &&
          annualCtc > 0 &&
          annualCtc / 12 < 21000;
        const attendance = attendanceByEmployee.get(String(employee._id));
        const scheduledDays = Number(attendance?.scheduledWorkingDays) || 0;
        const lopDays = Number(attendance?.lop) || 0;
        const employeeLossOfPay = roundCurrency(
          scheduledDays > 0 ? (annualCtc / 12 / scheduledDays) * lopDays : 0,
        );
        const gross = Number(compensation.grossPay) || 0;
        const basic = Number(compensation.basicPay) || 0;
        const allowances = Number(compensation.totalAllowances) || 0;
        const totalDeductions = deductions.reduce(
          (total, deduction) => total + (Number(deduction.amount) || 0),
          0,
        );
        const netAmount = Math.max(
          0,
          (Number(compensation.netPay) || 0) - employeeLossOfPay,
        );

        employeeSummaries.push({
          employee: employee._id,
          employeeName:
            [employee.firstName, employee.lastName].filter(Boolean).join(" ") ||
            "N/A",
          employeeId: employee.empId || "N/A",
          gross: Math.max(0, gross - employeeLossOfPay),
          actualGross: gross,
          basic,
          allowances,
          deductions: totalDeductions,
          allowanceItems: (compensation.allowances || []).map((item) => ({
            label: item.label,
            amount: numberValue(item.amount),
          })),
          deductionItems: deductions.map((item) => ({
            label: item.label,
            amount: numberValue(item.amount),
          })),
          lossOfPayDays: lopDays,
          lossOfPay: employeeLossOfPay,
          payrollNotes: "",
          isExcluded: false,
          incomeTax,
          surcharge: 0,
          cess: 0,
          netAmount,
        });

        summary.grossAmount += Math.max(0, gross - employeeLossOfPay);
        summary.incomeTax += incomeTax;
        summary.netAmount += netAmount;
        summary.employeePf += pfEnabled ? deductionAmount("Provident Fund") : 0;
        summary.voluntaryProvidentFund += deductionAmount(
          "Voluntary Provident Fund",
        );
        summary.employeeEsi += esiEnabled ? deductionAmount("ESI") : 0;
        summary.employerPf += pfEnabled
          ? Number(employerCosts.employerPf) || 0
          : 0;
        summary.employerEsi += esiEnabled
          ? Number(employerCosts.employerEsi) || 0
          : 0;
        summary.pfEmployeeCount += pfEnabled ? 1 : 0;
        summary.esiEmployeeCount += esiEnabled ? 1 : 0;
        summary.lossOfPay += employeeLossOfPay;
        return summary;
      },
      {
        grossAmount: 0,
        incomeTax: 0,
        netAmount: 0,
        lossOfPay: 0,
        employeePf: 0,
        employerPf: 0,
        voluntaryProvidentFund: 0,
        pfEmployeeCount: 0,
        employeeEsi: 0,
        employerEsi: 0,
        esiEmployeeCount: 0,
      },
    );

    const undoState = existingDraft
      ? {
          undoSnapshot: createDraftUndoSnapshot(existingDraft),
          canUndo: true,
        }
      : { undoSnapshot: null, canUndo: false };
    const draft = await PayrollDraft.findOneAndUpdate(
      { company, payPeriod, batchName },
      {
        $set: {
          payrollType: "Monthly",
          status: "Draft",
          directDepositStatus: "-",
          employeeCount: employees.length,
          ...totals,
          employeeSummaries,
          surcharge: 0,
          cess: 0,
          createdBy: user,
          runDate: null,
          employeeUndoSnapshots: {},
          undoableEmployeeIds: [],
          ...undoState,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    res.status(201).json({ message: "Payroll draft saved", data: draft });
  } catch (error) {
    next(error);
  }
};

const fetchPayrollDrafts = async (req, res, next) => {
  try {
    const drafts = await PayrollDraft.find({ company: req.company })
      .sort({ payPeriod: -1, createdAt: -1 })
      .populate("createdBy", "firstName lastName")
      .lean();
    res.status(200).json(drafts);
  } catch (error) {
    next(error);
  }
};

const fetchPayrollDraft = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }
    const draft = await PayrollDraft.findOne({
      _id: req.params.draftId,
      company: req.company,
    })
      .populate("createdBy", "firstName lastName")
      .lean();
    if (!draft) {
      return res.status(404).json({ message: "Payroll draft not found" });
    }
    res.status(200).json(draft);
  } catch (error) {
    next(error);
  }
};

const fetchPayrollDraftExport = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }
    const draft = await PayrollDraft.findOne({
      _id: req.params.draftId,
      company: req.company,
    }).lean();
    if (!draft)
      return res.status(404).json({ message: "Payroll draft not found" });

    const summaries = (draft.employeeSummaries || []).filter(
      (summary) => !summary.isExcluded,
    );
    const employees = await User.find({
      _id: { $in: summaries.map((summary) => summary.employee) },
      company: req.company,
    })
      .select(
        "empId firstName middleName lastName email phone employeeType designation bankInformation panAadhaarDetails payrollInformation salaryPackage payrollCompensation",
      )
      .lean();
    const employeeById = new Map(
      employees.map((employee) => [String(employee._id), employee]),
    );
    const formatItems = (items) =>
      (items || [])
        .map((item) => `${item.label}: ${numberValue(item.amount)}`)
        .join("; ");
    const exportRows = summaries.map((summary) => {
      const employee = employeeById.get(String(summary.employee)) || {};
      const bank = employee.bankInformation || {};
      const kyc = employee.panAadhaarDetails || {};
      const payroll = employee.payrollInformation || {};
      const compensation = employee.payrollCompensation || {};
      return {
        employeeId: summary.employeeId || employee.empId || "",
        employeeName:
          summary.employeeName ||
          [employee.firstName, employee.middleName, employee.lastName]
            .filter(Boolean)
            .join(" "),
        email: employee.email || "",
        phone: employee.phone || "",
        designation: employee.designation || "",
        employeeType: employee.employeeType?.name || "",
        aadhaarNumber: kyc.aadhaarId || "",
        panNumber: kyc.pan || "",
        pfAccountNumber: kyc.pfAccountNumber || "",
        pfUan: kyc.pfUAN || "",
        esiAccountNumber: kyc.esiAccountNumber || "",
        bankName: bank.bankName || "",
        branchName: bank.branchName || "",
        nameOnAccount: bank.nameOnAccount || "",
        accountNumber: bank.accountNumber || "",
        bankIfsc: bank.bankIFSC || "",
        includeInPayroll: payroll.includeInPayroll ?? false,
        payrollBatch: payroll.payrollBatch || draft.batchName,
        professionTaxExemption: payroll.professionTaxExemption ?? false,
        includePf: payroll.includePF ?? false,
        pfContributionRate: payroll.pfContributionRate || "",
        employeePfRate: payroll.employeePF || "",
        employerPfRate: payroll.employerPf || "",
        includeEsi: payroll.includeEsi ?? false,
        esiContribution: payroll.esiContribution || "",
        hraType: payroll.hraType || "",
        hraPercentage: payroll.hraPercentage || "",
        tdsCalculationBasedOn: payroll.tdsCalculationBasedOn || "",
        taxPercentage: payroll.taxPercentage || "",
        incomeTaxRegime: payroll.incomeTaxRegime || "",
        paymentMethod: compensation.paymentMethod || "",
        annualCtc: getAnnualCtc(employee),
        payPeriod: getPayPeriodKey(draft.payPeriod),
        payrollStatus: draft.status,
        basicPay: numberValue(summary.basic),
        actualGross: numberValue(summary.actualGross),
        grossAfterLop: numberValue(summary.gross),
        allowances: numberValue(summary.allowances),
        allowanceDetails: formatItems(summary.allowanceItems),
        deductions: numberValue(summary.deductions),
        deductionDetails: formatItems(summary.deductionItems),
        lossOfPayDays: numberValue(summary.lossOfPayDays),
        lossOfPayAmount: numberValue(summary.lossOfPay),
        incomeTax: numberValue(summary.incomeTax),
        surcharge: numberValue(summary.surcharge),
        cess: numberValue(summary.cess),
        netAmount: numberValue(summary.netAmount),
        payrollNotes: summary.payrollNotes || "",
      };
    });
    res.status(200).json(exportRows);
  } catch (error) {
    next(error);
  }
};

const updatePayrollDraftEmployee = async (req, res, next) => {
  try {
    const { draftId, employeeId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(draftId) ||
      !mongoose.Types.ObjectId.isValid(employeeId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid payroll draft or employee ID" });
    }

    const draft = await PayrollDraft.findOne({
      _id: draftId,
      company: req.company,
    }).select("+employeeUndoSnapshots");
    if (!draft)
      return res.status(404).json({ message: "Payroll draft not found" });
    if (draft.status !== "Draft") {
      return res
        .status(409)
        .json({ message: "Only draft payroll can be edited" });
    }

    const summary = draft.employeeSummaries.find(
      (row) => String(row.employee) === employeeId && !row.isExcluded,
    );
    if (!summary) {
      return res
        .status(404)
        .json({ message: "Employee is not part of this payroll draft" });
    }
    const employee = await User.findOne({
      _id: employeeId,
      company: req.company,
    })
      .select("employeeType payrollInformation salaryPackage")
      .lean();
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const rawAllowances = Array.isArray(req.body.allowanceItems)
      ? req.body.allowanceItems
      : summary.allowanceItems;
    const rawDeductions = Array.isArray(req.body.deductionItems)
      ? req.body.deductionItems
      : summary.deductionItems;
    const hraType = String(employee.payrollInformation?.hraType || "")
      .trim()
      .toLowerCase();
    const canUseHra = Boolean(hraType) && hraType !== "custom";
    const validAllowanceOptions = canUseHra
      ? allowanceOptions
      : allowanceOptions.filter((label) => label !== "House Rent Allowance");
    const tdsWorker = isTdsWorker(employee);
    const validDeductionOptions = [
      ...(tdsWorker ? ["TDS"] : ["Provident Fund", "ESI"]),
      ...additionalDeductionOptions,
    ];
    const validateItems = (items, options, section) => {
      const normalized = items.map((item) => ({
        label: String(item.label || "").trim(),
        amount: numberValue(item.amount),
      }));
      if (
        normalized.some(
          (item) => !options.includes(item.label) || item.amount < 0,
        ) ||
        new Set(normalized.map((item) => item.label)).size !== normalized.length
      ) {
        throw new Error(`Invalid or duplicate ${section} entries`);
      }
      return normalized;
    };

    let allowanceItems;
    let deductionItems;
    try {
      allowanceItems = validateItems(
        rawAllowances,
        validAllowanceOptions,
        "allowance",
      );
      deductionItems = validateItems(
        rawDeductions,
        validDeductionOptions,
        "deduction",
      );
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    if (canUseHra) {
      const hraAmount = numberValue(summary.basic) * 0.5;
      const hra = allowanceItems.find(
        (item) => item.label === "House Rent Allowance",
      );
      if (hra) hra.amount = hraAmount;
      else
        allowanceItems.push({
          label: "House Rent Allowance",
          amount: hraAmount,
        });
    }
    const allowanceTotal = allowanceItems.reduce(
      (total, item) => total + numberValue(item.amount),
      0,
    );
    const actualGross = numberValue(summary.basic) + allowanceTotal;
    const annualCtc = getAnnualCtc(employee);
    const pfEnabled = isEnabled(employee.payrollInformation?.includePF);
    const esiEnabled =
      isEnabled(employee.payrollInformation?.includeEsi) &&
      annualCtc > 0 &&
      annualCtc / 12 < 21000;
    deductionItems = deductionItems.map((item) => ({
      ...item,
      amount:
        item.label === "Provident Fund"
          ? pfEnabled
            ? getEmployeePf(summary.basic)
            : 0
          : item.label === "ESI"
            ? esiEnabled
              ? actualGross * 0.0075
              : 0
            : item.label === "TDS"
              ? numberValue(summary.basic) * 0.1
              : item.amount,
    }));

    const lossOfPayDays = Math.max(0, numberValue(req.body.lossOfPayDays));
    const attendance = await MonthlyAttendanceSummary.findOne({
      company: req.company,
      employee: employeeId,
      month: getPayPeriodKey(draft.payPeriod),
    })
      .select("scheduledWorkingDays")
      .lean();
    const scheduledDays = numberValue(attendance?.scheduledWorkingDays);
    const lossOfPay = roundCurrency(
      scheduledDays > 0 && annualCtc > 0
        ? (annualCtc / 12 / scheduledDays) * lossOfPayDays
        : numberValue(req.body.lossOfPay ?? summary.lossOfPay),
    );
    const deductionTotal = deductionItems.reduce(
      (total, item) => total + numberValue(item.amount),
      0,
    );
    const incomeTax = deductionItems
      .filter((item) => {
        const label = item.label.toLowerCase();
        return label.includes("tax") || label === "tds";
      })
      .reduce((total, item) => total + numberValue(item.amount), 0);
    const gross = Math.max(0, actualGross - lossOfPay);

    saveDraftUndoSnapshot(draft);
    saveEmployeeUndoSnapshot(draft, summary);
    Object.assign(summary, {
      allowanceItems,
      deductionItems,
      allowances: allowanceTotal,
      deductions: deductionTotal,
      actualGross,
      gross,
      lossOfPayDays,
      lossOfPay,
      payrollNotes: String(req.body.payrollNotes || "")
        .trim()
        .slice(0, 2000),
      incomeTax,
      netAmount: Math.max(0, gross - deductionTotal),
      updatedBy: req.user,
      updatedAt: new Date(),
    });
    await recalculateDraftTotals(draft);
    await draft.save();
    res.status(200).json({ message: "Employee payroll updated", data: draft });
  } catch (error) {
    next(error);
  }
};

const excludePayrollDraftEmployees = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }
    const employeeIds = Array.isArray(req.body.employeeIds)
      ? [...new Set(req.body.employeeIds.map(String))]
      : [];
    if (
      !employeeIds.length ||
      employeeIds.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
      return res
        .status(400)
        .json({ message: "Select valid employees to delete" });
    }
    const draft = await PayrollDraft.findOne({
      _id: req.params.draftId,
      company: req.company,
    }).select("+employeeUndoSnapshots");
    if (!draft)
      return res.status(404).json({ message: "Payroll draft not found" });
    if (draft.status !== "Draft") {
      return res
        .status(409)
        .json({ message: "Only draft payroll can be edited" });
    }
    saveDraftUndoSnapshot(draft);
    let excludedCount = 0;
    draft.employeeSummaries.forEach((summary) => {
      if (
        employeeIds.includes(String(summary.employee)) &&
        !summary.isExcluded
      ) {
        saveEmployeeUndoSnapshot(draft, summary);
        summary.isExcluded = true;
        summary.updatedBy = req.user;
        summary.updatedAt = new Date();
        excludedCount += 1;
      }
    });
    if (!excludedCount) {
      return res
        .status(404)
        .json({ message: "Selected employees were not found in the draft" });
    }
    await recalculateDraftTotals(draft);
    await draft.save();
    res.status(200).json({
      message: `${excludedCount} employee${excludedCount === 1 ? "" : "s"} deleted from payroll draft`,
      data: draft,
    });
  } catch (error) {
    next(error);
  }
};

const undoPayrollDraftChange = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }
    const draft = await PayrollDraft.findOne({
      _id: req.params.draftId,
      company: req.company,
    }).select("+undoSnapshot");
    if (!draft)
      return res.status(404).json({ message: "Payroll draft not found" });
    if (draft.status !== "Draft") {
      return res
        .status(409)
        .json({ message: "Processed payroll cannot be changed" });
    }
    if (!draft.canUndo || !draft.undoSnapshot) {
      return res
        .status(409)
        .json({ message: "There are no draft changes to undo" });
    }

    undoableDraftFields.forEach((field) => {
      draft[field] = draft.undoSnapshot[field] ?? null;
    });
    draft.undoSnapshot = null;
    draft.canUndo = false;
    draft.employeeUndoSnapshots = {};
    draft.undoableEmployeeIds = [];
    await draft.save();
    res
      .status(200)
      .json({ message: "Last payroll draft change undone", data: draft });
  } catch (error) {
    next(error);
  }
};

const undoPayrollDraftEmployeeChange = async (req, res, next) => {
  try {
    const { draftId, employeeId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(draftId) ||
      !mongoose.Types.ObjectId.isValid(employeeId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid payroll draft or employee ID" });
    }
    const draft = await PayrollDraft.findOne({
      _id: draftId,
      company: req.company,
    }).select("+employeeUndoSnapshots");
    if (!draft)
      return res.status(404).json({ message: "Payroll draft not found" });
    if (draft.status !== "Draft") {
      return res
        .status(409)
        .json({ message: "Processed payroll cannot be changed" });
    }
    const snapshot = draft.employeeUndoSnapshots?.[employeeId];
    if (!snapshot) {
      return res
        .status(409)
        .json({ message: "This employee has no saved change to undo" });
    }
    const summaryIndex = draft.employeeSummaries.findIndex(
      (summary) => String(summary.employee) === employeeId,
    );
    if (summaryIndex === -1) {
      return res
        .status(404)
        .json({ message: "Employee is not part of this payroll draft" });
    }

    draft.employeeSummaries.splice(summaryIndex, 1, snapshot);
    const nextSnapshots = { ...(draft.employeeUndoSnapshots || {}) };
    delete nextSnapshots[employeeId];
    draft.employeeUndoSnapshots = nextSnapshots;
    draft.markModified("employeeUndoSnapshots");
    draft.undoableEmployeeIds = (draft.undoableEmployeeIds || []).filter(
      (undoEmployeeId) => String(undoEmployeeId) !== employeeId,
    );
    draft.undoSnapshot = null;
    draft.canUndo = false;
    await recalculateDraftTotals(draft);
    await draft.save();
    res.status(200).json({
      message: "Employee payroll change undone",
      data: draft,
    });
  } catch (error) {
    next(error);
  }
};

const submitPayrollDraft = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }
    const draft = await PayrollDraft.findOne({
      _id: req.params.draftId,
      company: req.company,
    });
    if (!draft)
      return res.status(404).json({ message: "Payroll draft not found" });
    if (draft.status !== "Draft") {
      return res
        .status(409)
        .json({ message: "Payroll has already been processed" });
    }
    if (!draft.employeeSummaries.some((summary) => !summary.isExcluded)) {
      return res
        .status(400)
        .json({ message: "Payroll must contain at least one employee" });
    }
    await recalculateDraftTotals(draft);
    draft.status = "Processed";
    draft.submittedBy = req.user;
    draft.submittedAt = new Date();
    draft.runDate = draft.submittedAt;
    await draft.save();
    res
      .status(200)
      .json({ message: "Payroll processed successfully", data: draft });
  } catch (error) {
    next(error);
  }
};

const releasePayrollDraftPayslips = async (req, res, next) => {
  try {
    const { draftId } = req.params;
    const sendEmails = req.body?.sendEmails === true;
    if (!mongoose.Types.ObjectId.isValid(draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }

    const draft = await PayrollDraft.findOne({
      _id: draftId,
      company: req.company,
    });
    if (!draft)
      return res.status(404).json({ message: "Payroll draft not found" });
    if (draft.status !== "Processed") {
      return res
        .status(409)
        .json({ message: "Process payroll before releasing payslips" });
    }
    if (draft.payslipsReleasedAt) {
      return res.status(409).json({
        message:
          "Payslips have already been generated. Retry pending emails instead.",
      });
    }

    const summaries = draft.employeeSummaries.filter(
      (summary) => !summary.isExcluded && summary.employee,
    );
    const employeeIds = summaries.map((summary) => summary.employee);
    const [employees, companyData] = await Promise.all([
      User.find({ _id: { $in: employeeIds }, company: req.company })
        .select(
          "firstName lastName empId email phone startDate designation departments homeAddress bankInformation panAadhaarDetails",
        )
        .populate("departments", "name")
        .lean(),
      Company.findById(req.company)
        .select(
          "companyName registeredCompanyName fullAddress phoneNumber companyCity companyState websiteURL employerCosts",
        )
        .lean(),
    ]);
    const employeeById = new Map(
      employees.map((employee) => [String(employee._id), employee]),
    );
    const releasedPayslips = [];

    for (const summary of summaries) {
      const employee = employeeById.get(String(summary.employee));
      if (!employee) continue;

      const pdfBuffer = await createPayslipPdf({
        draft,
        summary,
        employee,
        companyData,
      });
      const employeeName =
        [employee.firstName, employee.lastName].filter(Boolean).join("") ||
        employee.empId;
      const period = getPayPeriodKey(draft.payPeriod);
      const filename = `Payslip_${employeeName}_${period}.pdf`;
      const upload = await handleDocumentUpload(
        pdfBuffer,
        `${companyData?.companyName || "Company"}/payrolls/${employee.empId || employeeName}`,
        filename,
      );

      const allowanceAmount = (label) =>
        (summary.allowanceItems || [])
          .filter(
            (item) => String(item.label).toLowerCase() === label.toLowerCase(),
          )
          .reduce((total, item) => total + numberValue(item.amount), 0);
      const deductionAmount = (label) =>
        (summary.deductionItems || [])
          .filter(
            (item) => String(item.label).toLowerCase() === label.toLowerCase(),
          )
          .reduce((total, item) => total + numberValue(item.amount), 0);

      const payslip = await Payslip.findOneAndUpdate(
        {
          employee: employee._id,
          company: req.company,
          month: draft.payPeriod,
        },
        {
          $set: {
            payrollDraft: draft._id,
            basicPay: summary.basic,
            basic: summary.basic,
            actualGross: summary.actualGross,
            gross: summary.gross,
            netPay: summary.netAmount,
            netAmount: summary.netAmount,
            specialAllowance: allowanceAmount("Special Allowance"),
            hra: allowanceAmount("House Rent Allowance"),
            medicalAllowance: allowanceAmount("Medical Allowance"),
            conveyanceAllowance: allowanceAmount("Conveyance Allowance"),
            employeePf: deductionAmount("Provident Fund"),
            employeesStateInsurance: deductionAmount("ESI"),
            professionTax: deductionAmount("Profession Tax"),
            reduceIncomeTax: summary.incomeTax,
            incomeTax: summary.incomeTax,
            surcharge: summary.surcharge,
            cess: summary.cess,
            lopDays: summary.lossOfPayDays,
            lopAmount: summary.lossOfPay,
            allowanceItems: summary.allowanceItems,
            deductionItems: summary.deductionItems,
            payslipName: filename,
            payslipLink: upload.secure_url,
            payslipId: upload.public_id,
            releaseStatus: "Released",
            emailStatus: sendEmails ? "Pending" : "Not Requested",
            emailSentAt: null,
            emailError: "",
            ifscCode: employee.bankInformation?.bankIFSC || "",
            accountNumber: employee.bankInformation?.accountNumber || "",
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );

      await Payroll.findOneAndUpdate(
        {
          employee: employee._id,
          company: req.company,
          month: draft.payPeriod,
        },
        {
          $set: {
            totalSalary: summary.netAmount,
            payslip: payslip._id,
            status: "Completed",
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );
      releasedPayslips.push({ payslip, employee, pdfBuffer, filename });
    }

    const emailResults = sendEmails
      ? await Promise.all(
          releasedPayslips.map(async (released) => {
            const { payslip, employee, pdfBuffer, filename } = released;
            const email = String(employee.email || "").trim();

            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
              payslip.emailStatus = "Skipped";
              payslip.emailError = email
                ? "Employee email address is invalid"
                : "Employee email address is missing";
              await payslip.save();
              return "skipped";
            }

            try {
              const employeeName = [employee.firstName, employee.lastName]
                .filter(Boolean)
                .join(" ");
              const companyName =
                companyData?.registeredCompanyName ||
                companyData?.companyName ||
                "Payroll Team";
              const emailDetails = getPayslipEmailDetails({
                draft,
                employeeName,
                companyName,
              });

              await mailer.sendMail({
                from: `WoNo <${process.env.SENDER_EMAIL}>`,
                to: email,
                subject: emailDetails.subject,
                text: emailDetails.text,
                html: emailDetails.html,
                attachments: [
                  emailDetails.logoAttachment,
                  {
                    filename,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                  },
                ],
              });

              payslip.emailStatus = "Sent";
              payslip.emailSentAt = new Date();
              payslip.emailError = "";
              await payslip.save();
              return "sent";
            } catch (error) {
              payslip.emailStatus = "Failed";
              payslip.emailError = String(
                error.message || "Email delivery failed",
              ).slice(0, 500);
              await payslip.save();
              return "failed";
            }
          }),
        )
      : [];

    const releaseSummary = {
      generated: releasedPayslips.length,
      sent: emailResults.filter((result) => result === "sent").length,
      failed: emailResults.filter((result) => result === "failed").length,
      skipped: emailResults.filter((result) => result === "skipped").length,
      sendEmails,
    };

    draft.payslipsReleasedAt = new Date();
    draft.payslipsReleasedBy = req.user;
    draft.payslipReleaseSummary = releaseSummary;
    await draft.save();

    return res.status(200).json({
      message: sendEmails
        ? `${releaseSummary.generated} payslip${releaseSummary.generated === 1 ? "" : "s"} generated. ${releaseSummary.sent} email${releaseSummary.sent === 1 ? "" : "s"} sent; ${releaseSummary.failed + releaseSummary.skipped} could not be sent.`
        : `${releaseSummary.generated} payslip${releaseSummary.generated === 1 ? "" : "s"} generated successfully`,
      data: releasedPayslips.map(({ payslip }) => payslip),
      summary: releaseSummary,
    });
  } catch (error) {
    next(error);
  }
};

const fetchPayrollDraftPayslipEmailStatus = async (req, res, next) => {
  try {
    const { draftId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }

    const draft = await PayrollDraft.findOne({
      _id: draftId,
      company: req.company,
    }).select("_id");
    if (!draft) {
      return res.status(404).json({ message: "Payroll draft not found" });
    }

    const payslips = await Payslip.find({
      payrollDraft: draft._id,
      company: req.company,
    })
      .select("employee emailStatus emailSentAt emailError")
      .populate("employee", "firstName lastName empId email")
      .lean();

    return res.status(200).json(getPayslipEmailStatusPayload(payslips));
  } catch (error) {
    next(error);
  }
};

const retryPayrollDraftPayslipEmails = async (req, res, next) => {
  try {
    const { draftId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }

    const draft = await PayrollDraft.findOne({
      _id: draftId,
      company: req.company,
      status: "Processed",
    });
    if (!draft) {
      return res.status(404).json({ message: "Processed payroll not found" });
    }

    const payslips = await Payslip.find({
      payrollDraft: draft._id,
      company: req.company,
      emailStatus: { $in: ["Not Requested", "Failed", "Skipped"] },
    }).populate("employee", "firstName lastName email");

    if (!payslips.length) {
      return res
        .status(409)
        .json({ message: "There are no pending payslip emails to send" });
    }

    const companyData = await Company.findById(req.company)
      .select("companyName registeredCompanyName")
      .lean();
    const retryResults = await Promise.all(
      payslips.map(async (payslip) => {
        const employee = payslip.employee;
        const email = String(employee?.email || "").trim();
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
          payslip.emailStatus = "Skipped";
          payslip.emailError = email
            ? "Employee email address is invalid"
            : "Employee email address is missing";
          await payslip.save();
          return "skipped";
        }

        try {
          const employeeName = [employee.firstName, employee.lastName]
            .filter(Boolean)
            .join(" ");
          const emailDetails = getPayslipEmailDetails({
            draft,
            employeeName,
            companyName:
              companyData?.registeredCompanyName ||
              companyData?.companyName ||
              "Payroll Team",
          });
          await mailer.sendMail({
            from: `WoNo <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: emailDetails.subject,
            text: emailDetails.text,
            html: emailDetails.html,
            attachments: [
              emailDetails.logoAttachment,
              {
                filename: payslip.payslipName || "Payslip.pdf",
                path: payslip.payslipLink,
                contentType: "application/pdf",
              },
            ],
          });
          payslip.emailStatus = "Sent";
          payslip.emailSentAt = new Date();
          payslip.emailError = "";
          await payslip.save();
          return "sent";
        } catch (error) {
          payslip.emailStatus = "Failed";
          payslip.emailError = String(
            error.message || "Email delivery failed",
          ).slice(0, 500);
          await payslip.save();
          return "failed";
        }
      }),
    );

    const previousSummary =
      draft.payslipReleaseSummary?.toObject?.() ||
      draft.payslipReleaseSummary ||
      {};
    const generated = await Payslip.countDocuments({
      payrollDraft: draft._id,
      company: req.company,
    });
    const sent = retryResults.filter((result) => result === "sent").length;
    const failed = retryResults.filter((result) => result === "failed").length;
    const skipped = retryResults.filter(
      (result) => result === "skipped",
    ).length;
    draft.payslipReleaseSummary = {
      generated,
      sent: Math.min(generated, numberValue(previousSummary.sent) + sent),
      failed,
      skipped,
      sendEmails: true,
    };
    await draft.save();

    return res.status(200).json({
      message: `${sent} payslip email${sent === 1 ? "" : "s"} sent; ${failed + skipped} could not be sent`,
      summary: draft.payslipReleaseSummary,
    });
  } catch (error) {
    next(error);
  }
};

const voidPayrollDraft = async (req, res, next) => {
  try {
    const { draftId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }

    const draft = await PayrollDraft.findOne({
      _id: draftId,
      company: req.company,
    });

    if (!draft) {
      return res.status(404).json({ message: "Payroll draft not found" });
    }

    if (draft.status !== "Draft") {
      return res.status(409).json({
        message: "Only a draft payroll can be voided",
      });
    }

    await draft.deleteOne();

    return res.status(200).json({
      message: "Payroll draft voided successfully",
    });
  } catch (error) {
    next(error);
  }
};

const generatePayroll = async (req, res, next) => {
  const logPath = "payrolls/PayrollLog";
  const logAction = "Bulk Payroll Generation";
  const logSourceKey = "payroll";
  const { user, ip, company } = req;

  //payrolls = [{userId,totalSalary,month,reimbursement}]

  //earnings
  // basic: Number,
  //  hra: Number,
  // specialAllowance: Number,
  // bonus: Number,
  // otherAllowance: Number,

  //deductions
  // employeePf: Number,
  // employeesStateInsurance: Number,
  // professionTax: Number,
  // otherDeduction: Number,
  // reduceIncomeTax: Number,

  try {
    const payrolls = JSON.parse(req.body.payrolls);
    const files = req.files || [];

    if (!payrolls || !Array.isArray(payrolls)) {
      throw new CustomError(
        "Payrolls array required",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (payrolls.length > 4) {
      throw new CustomError(
        "Maximum 4 payrolls can be processed at once",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const savedPayrolls = [];

    for (let i = 0; i < payrolls.length; i++) {
      const {
        userId,
        month,
        reimbursment = 0,
        //earnings
        basicPay = 0,
        hra = 0,
        netPay = 0,
        specialAllowance = 0,
        otherAllowance = 0,
        bonus = 0,
        //deductions
        employeePf = 0,
        employeesStateInsurance = 0,
        professionTax = 0,
        otherDeduction = 0,
        reduceIncomeTax = 0,
      } = payrolls[i];

      const file = files[i];

      if (!userId || !month || isNaN(netPay)) {
        throw new CustomError(
          `Missing required fields in payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey,
        );
      }

      if (!file) {
        throw new CustomError(
          `Missing payslip file for payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey,
        );
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new CustomError(
          `Invalid user ID in payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey,
        );
      }

      const existing = await Payroll.findOne({
        employee: userId,
        month: new Date(month),
      }).populate("employee", "firstName lastName");
      if (existing) {
        throw new CustomError(
          `Payroll already exists for user ${existing.employee.firstName} ${existing.employee.lastName} in ${month}`,
          logPath,
          logAction,
          logSourceKey,
          409,
        );
      }

      const foundUser = await User.findById(userId).lean();
      const foundCompany = await Company.findById(company).lean();

      if (!foundUser)
        throw new CustomError(
          `User not found in payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey,
        );
      if (!foundCompany)
        throw new CustomError(
          "Company not found",
          logPath,
          logAction,
          logSourceKey,
        );

      // Upload File
      const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new CustomError(
          `Invalid file type in payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey,
        );
      }

      let processedBuffer = file.buffer;
      const originalFilename = file.originalname;

      if (file.mimetype === "application/pdf") {
        const pdfDoc = await PDFDocument.load(file.buffer);
        pdfDoc.setTitle(originalFilename.split(".")[0] || "Untitled");
        processedBuffer = await pdfDoc.save();
      }

      const uploadResponse = await handleDocumentUpload(
        processedBuffer,
        `${foundCompany.companyName}/payrolls/${foundUser.firstName} ${foundUser.lastName}`,
        originalFilename,
      );

      if (!uploadResponse?.public_id) {
        throw new CustomError(
          `Failed to upload payslip in payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey,
        );
      }

      // Save Payslip
      const payslip = new Payslip({
        employee: userId,
        month: new Date(month),
        basicPay,
        hra,
        netPay,
        specialAllowance,
        otherAllowance,
        bonus,
        employeePf,
        employeesStateInsurance,
        professionTax,
        otherDeduction,
        reduceIncomeTax,
        reimbursment,
        payslipName: originalFilename,
        payslipLink: uploadResponse.secure_url,
        payslipId: uploadResponse.public_id,
        company,
      });

      const savedPayslip = await payslip.save();

      // Save Payroll
      const payroll = new Payroll({
        employee: userId,
        month: new Date(month),
        totalSalary: netPay,
        payslip: savedPayslip._id,
        status: "Completed",
        company,
      });

      const savedPayroll = await payroll.save();
      savedPayrolls.push(savedPayroll);

      // Log
      await createLog({
        path: logPath,
        action: logAction,
        remarks: `Payroll ${i + 1} generated successfully`,
        status: "Success",
        user,
        ip,
        company,
        sourceKey: logSourceKey,
        sourceId: savedPayroll._id,
        changes: payroll,
      });
    }

    return res.status(200).json({
      message: `${savedPayrolls.length} payroll(s) generated successfully`,
      data: savedPayrolls,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

const fetchPayrolls = async (req, res, next) => {
  const { company } = req;

  try {
    const currentMonthStart = startOfMonth(new Date()).toISOString();

    // Fetch all users
    const allUsers = await User.find({ company, isActive: true })
      .populate("departments")
      .populate("role")
      .select(
        "firstName lastName empId email departments role payrollInformation payrollCompensation salaryPackage",
      )
      .lean();

    // Fetch all payrolls
    const allPayrolls = await Payroll.find({}).populate("payslip").lean();

    // Group payrolls by employee
    const payrollMap = {};
    for (const payroll of allPayrolls) {
      const empId = payroll.employee.toString();
      if (!payrollMap[empId]) payrollMap[empId] = [];

      payrollMap[empId].push({
        month: payroll.month,
        totalSalary: payroll.salary,
        reimbursment: payroll.reimbursment,
        deductions: payroll.deductions,
        status: payroll.status || "Completed",
        payslip: payroll.payslip
          ? {
              payslipName: payroll.payslip.payslipName,
              payslipLink: payroll.payslip.payslipLink,
              earnings: payroll.payslip.earnings,
              createdAt: payroll.payslip.createdAt,
            }
          : null,
      });
    }

    // Final flattened list
    const flattenedResponse = [];

    for (const user of allUsers) {
      const userId = user._id.toString();
      const userPayrolls = payrollMap[userId] || [];

      // const hasCurrentMonth = userPayrolls.some((entry) =>

      //   isSameMonth(
      //     startOfMonth(new Date(entry.month)).toISOString(),
      //     currentMonthStart
      //   )
      // );

      const hasCurrentMonth = userPayrolls.some((entry) => {
        const payrollMonthStart = startOfMonth(
          new Date(entry.month),
        ).toISOString();
        return payrollMonthStart === currentMonthStart;
      });

      if (!hasCurrentMonth) {
        userPayrolls.push({
          month: currentMonthStart,
          totalSalary: 0,
          reimbursment: 0,
          deductions: [],
          status: "Pending",
          payslip: null,
        });
      }

      // Now push individual objects per month
      for (const payroll of userPayrolls) {
        flattenedResponse.push({
          employeeId: userId,
          empId: user.empId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          departments: user.departments,
          role: user.role,
          payrollBatch: user.payrollInformation?.payrollBatch || "",
          payrollCompensation: user.payrollCompensation || {},
          annualCtc:
            user.salaryPackage?.grossAnnual ?? user.salaryPackage?.amount ?? 0,
          month: payroll.month,
          totalSalary: payroll.totalSalary,
          reimbursment: payroll.reimbursment,
          deductions: payroll.deductions,
          status: payroll.status,
          payslip: payroll.payslip,
        });
      }
    }

    res.status(200).json(flattenedResponse);
  } catch (error) {
    next(error);
  }
};

const fetchUserPayroll = async (req, res, next) => {
  const { company } = req;
  const { userId } = req.params;
  const { month } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID provided" });
    }

    if (!month) {
      return res.status(400).json({ message: "Month query is required" });
    }

    const monthStart = new Date(month);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const attendances = await Attendance.find({
      user: userId,
      inTime: { $gte: monthStart, $lt: monthEnd },
    }).populate({
      path: "user",
      select: "firstName lastName empId email departments role",
      populate: [{ path: "departments" }, { path: "role" }],
    });

    const attendancesRequests = await AttendanceCorrection.find({
      user: userId,
      company,
      status: "Pending",
    }).lean();

    let transformedAttendances = attendances.map((attendance) => ({
      ...attendance._doc,
      correctionId: null,
    }));

    if (attendancesRequests?.length > 0) {
      transformedAttendances = attendances.map((attendance) => {
        const matchingRequest = attendancesRequests.find((request) => {
          const isPending = attendance.status === "Pending";
          const matchedAttendance =
            new Date(attendance.inTime).toString() ===
              new Date(request.originalInTime).toString() ||
            new Date(attendance.outTime).toString() ===
              new Date(request.originalOutTime).toString();
          return matchedAttendance && isPending;
        });

        return {
          ...attendance._doc,
          correctionId: matchingRequest ? matchingRequest._id : null,
        };
      });
    }

    const leaves = await Leave.find({
      takenBy: userId,
      fromDate: { $gte: monthStart, $lt: monthEnd },
    }).populate({
      path: "takenBy",
      select: "firstName lastName empId email departments role",
      populate: [{ path: "departments" }, { path: "role" }],
    });

    const payslip = await Payslip.findOne({
      employee: userId,
      month: { $gte: monthStart, $lt: monthEnd },
    });

    const earnings = {
      basicPay: payslip?.basicPay || 0,
      hra: payslip?.hra || 0,
      netPay: payslip?.netPay || 0,
      specialAllowance: payslip?.specialAllowance || 0,
      otherAllowance: payslip?.otherAllowance || 0,
      bonus: payslip?.bonus || 0,
    };
    const deductions = {
      employeePf: payslip?.employeePf || 0,
      employeesStateInsurance: payslip?.employeesStateInsurance || 0,
      professionTax: payslip?.professionTax || 0,
      reduceIncomeTax: payslip?.reduceIncomeTax || 0,
      otherDeduction: payslip?.otherDeduction || 0,
      adjustments: payslip?.adjustments || 0,
      additionalIncomeTax: payslip?.additionalIncomeTax || 0,
      voluntaryProvidentFund: payslip?.voluntaryProvidentFund || 0,
      lwf: payslip?.lwf || 0,
      recovery: payslip?.recovery || 0,
    };

    res.status(200).json({
      attendances: transformedAttendances,
      leaves,
      earnings,
      deductions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePayroll,
  fetchPayrolls,
  fetchUserPayroll,
  createPayrollDraft,
  fetchPayrollDrafts,
  fetchPayrollDraft,
  fetchPayrollDraftExport,
  updatePayrollDraftEmployee,
  excludePayrollDraftEmployees,
  undoPayrollDraftChange,
  undoPayrollDraftEmployeeChange,
  submitPayrollDraft,
  releasePayrollDraftPayslips,
  fetchPayrollDraftPayslipEmailStatus,
  retryPayrollDraftPayslipEmails,
  voidPayrollDraft,
};

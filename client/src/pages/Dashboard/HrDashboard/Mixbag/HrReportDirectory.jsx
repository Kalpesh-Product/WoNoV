import { HiOutlineDocumentText } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const reportSections = [
  {
    title: "Payroll",
    reports: [
      "TDS (Tax Deducted at Source) Report",
      "PF (Provident Fund) Report",
      "ECR (Electronic Challan-Cum-Return) File",
      "ESI (Employees' State Insurance) Report",
      "MC (Monthly Contribution) File",
      "PT (Profession Tax) Report",
      "Allowances Report",
      "Deductions Report",
    ],
  },
  {
    title: "Employees",
    reports: [
      "Bank Details Report",
      "Attendance Day Wise Report",
      "Employees Onboarding & Offboarding Report",
      "Compensation/Salary Report",
      "IT Declarations Report",
      "Payroll Detailed Report",
      "Tax Computation Report",
    ],
  },
  {
    title: "Leave Management",
    reports: [
      "Paid & Unpaid Leave Report",
      "Current Leave Balance Report",
      "Leaves History Report",
    ],
  },
];

const HrReportDirectory = () => {
  const navigate = useNavigate();

  const openReport = (report) => {
    if (report === "Paid & Unpaid Leave Report") {
      navigate("/app/dashboard/HR-dashboard/mix-bag/reports/paid-unpaid-leaves");
      return;
    }
    if (report === "Current Leave Balance Report") {
      navigate("/app/dashboard/HR-dashboard/mix-bag/reports/current-leave-balance");
      return;
    }
    if (report === "Leaves History Report") {
      navigate("/app/dashboard/HR-dashboard/mix-bag/reports/leave-history");
    }
  };

  return (
    <div className="p-4" style={{ fontFamily: "Poppins-Regular" }}>
      <h1
        className="mb-6 text-2xl text-primary"
        style={{ fontFamily: "Poppins-SemiBold" }}
      >
        REPORTS
      </h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {reportSections.map((section) => (
          <section
            key={section.title}
            className="min-h-[22rem] rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <h2
              className="border-b border-gray-200 px-5 py-4 text-lg text-gray-800"
              style={{ fontFamily: "Poppins-SemiBold" }}
            >
              {section.title}
            </h2>

            <div className="flex flex-col gap-2 px-5 py-4">
              {section.reports.map((report) => (
                <button
                  type="button"
                  key={report}
                  onClick={() => openReport(report)}
                  disabled={
                    report !== "Paid & Unpaid Leave Report" &&
                    report !== "Current Leave Balance Report" &&
                    report !== "Leaves History Report"
                  }
                  className="flex items-center gap-2 text-left text-sm text-sky-600 disabled:cursor-default"
                >
                  <HiOutlineDocumentText
                    aria-hidden="true"
                    className="shrink-0 text-base"
                  />
                  <span>{report}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default HrReportDirectory;

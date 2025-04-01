import React from "react";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";

const ViewPayroll = () => {
  const payrollColumns = [
    { field: "date", headerName: "Date", flex: 1 },
    { field: "inTime", headerName: "In Time", flex: 1 },
    { field: "outTime", headerName: "Out Time", flex: 1 },
    { field: "workHours", headerName: "Work Hours", flex: 1 },
    { field: "breakHours", headerName: "Break Hours", flex: 1 },
    { field: "totalHours", headerName: "Total Hours", flex: 1 },
    { field: "entryType", headerName: "Entry Type", flex: 1 },
    { field: "paydeduction", headerName: "Pay Deduction", flex: 1 },
  ];
  const leavesRecord = [
    { field: "fromDate", headerName: "From Date", width: 150 },
    { field: "toDate", headerName: "To Date" },
    { field: "leaveType", headerName: "Leave Type" },
    { field: "leavePeriod", headerName: "Leave Period" },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "paydeduction", headerName: "Pay Deduction", width: 100 },
  ];

  const leavesData = [
    {
      fromDate: "2025-01-20",
      toDate: "2025-01-20",
      leaveType: "Casual Leave",
      leavePeriod: "8 Hours",
      description: "Attended a family function",
      paydeduction: "No",
    },
    {
      fromDate: "2025-01-21",
      toDate: "2025-01-21",
      leaveType: "Sick Leave",
      leavePeriod: "6 Hours",
      description: "Recovered from fever and cold",
      paydeduction: "Yes",
    },
    {
      fromDate: "2025-01-22",
      toDate: "2025-01-22",
      leaveType: "Annual Leave",
      leavePeriod: "7.5 Hours",
      description: "Took a personal day for errands",
      paydeduction: "No",
    },
    {
      fromDate: "2025-01-23",
      toDate: "2025-01-23",
      leaveType: "Maternity Leave",
      leavePeriod: "5 Hours",
      description: "Caring for newborn child",
      paydeduction: "Yes",
    },
    {
      fromDate: "2025-01-24",
      toDate: "2025-01-24",
      leaveType: "Paternity Leave",
      leavePeriod: "9 Hours",
      description: "Supporting spouse and newborn",
      paydeduction: "No",
    },
  ];

  const rows = [
    {
      id: 1,
      date: "2025-01-01",
      inTime: "09:00 AM",
      outTime: "06:00 PM",
      workHours: "8",
      breakHours: "1",
      totalHours: "9",
      entryType: "Regular",
      paydeduction: "0",
    },
    {
      id: 2,
      date: "2025-02-01",
      inTime: "09:30 AM",
      outTime: "06:30 PM",
      workHours: "8",
      breakHours: "1",
      totalHours: "9",
      entryType: "Regular",
      paydeduction: "0",
    },
    {
      id: 3,
      date: "2025-03-01",
      inTime: "10:00 AM",
      outTime: "07:00 PM",
      workHours: "7",
      breakHours: "1",
      totalHours: "8",
      entryType: "Late",
      paydeduction: "100",
    },
    {
      id: 4,
      date: "2025-04-01",
      inTime: "09:15 AM",
      outTime: "06:15 PM",
      workHours: "7.5",
      breakHours: "1",
      totalHours: "8.5",
      entryType: "Regular",
      paydeduction: "0",
    },
    {
      id: 5,
      date: "2025-05-01",
      inTime: "08:45 AM",
      outTime: "05:45 PM",
      workHours: "8",
      breakHours: "1",
      totalHours: "9",
      entryType: "Early",
      paydeduction: "0",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection titleFont layout={1} border title={"Attendance List"} button={true} buttonTitle={"Edit"}>
        <AgTable
          key={rows.length}
          search={true}
          searchColumn={"kra"}
          data={rows}
          columns={payrollColumns}
        />
      </WidgetSection>
      <WidgetSection titleFont layout={1} border title={"Leaves List"} button={true} buttonTitle={"Edit"}>
        <AgTable
          key={leavesData.length}
          search={true}
          searchColumn={"Leave Type"}
          data={leavesData}
          columns={leavesRecord}
        />
      </WidgetSection>

      <WidgetSection
        border
        button
        buttonTitle={"Edit"}
        layout={1}
        title={"Payslip Generator"}
        titleFont
      >
        <div className="flex flex-col gap-4 justify-center items-center">
          <div className="border-default border-borderGray p-6 rounded-xl">
            <span className="text-center text-title font-pmedium mb-4">
              Pay Slip
            </span>
            <div className="border-t border-b py-4">
              <div className="flex gap-4 py-4 text-sm">
                <div className="flex flex-col w-full">
                  <span className="text-content">Employee Name:</span>{" "}
                  <span className="text-content text-gray-600">
                    {" "}
                    Abrar Shaikh
                  </span>
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-content">Employee ID:</span>{" "}
                  <span className="text-content text-gray-600">E0001</span>
                </div>
              </div>
              <div className="flex gap-4 py-4 text-sm">
                <div className="flex flex-col w-full">
                  <span className="text-content">Designation:</span>{" "}
                  <span className="text-content text-gray-600">
                    Master-Admin
                  </span>
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-content">Department</span>{" "}
                  <span className="text-content text-gray-600">
                    Top Management
                  </span>
                </div>
              </div>
              <div className="flex flex-col w-full">
                <span className="text-content">Month</span>{" "}
                <span className="text-content text-gray-600">
                  December 2024
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="p-2 bg-gray-200 ">
                <span className="text-content font-pmedium text-gray-700">
                  Earnings
                </span>
              </div>
              <div className="flex flex-col text-content py-4 gap-4">
                <div className="flex justify-between py-1 border-b-[1px] border-borderGray">
                  <span>Basic Pay</span>
                  <span>₹70,000</span>
                </div>
                <div className="flex justify-between py-1 border-b-[1px] border-borderGray">
                  <span>House Rent Allowance (HRA)</span>
                  <span>₹15,000</span>
                </div>
                <div className="flex justify-between py-1 border-b-[1px] border-borderGray">
                  <span>Other Allowances</span>
                  <span>₹10,000</span>
                </div>
                <div className="flex justify-between py-1 font-semibold">
                  <span>Total Earnings</span>
                  <span>₹95,000</span>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="p-2 bg-gray-200 ">
                <span className="text-content font-pmedium text-gray-700">
                  Deductions
                </span>
              </div>
              <div className="flex flex-col text-content py-4 gap-4">
                <div className="flex justify-between py-1 border-b-[1px] border-borderGray">
                  <span>Tax and Other Deductions</span>
                  <span>₹5000</span>
                </div>
                <div className="flex justify-between py-1 font-semibold">
                  <span>Total Deductions</span>
                  <span>₹5000</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-right font-semibold text-gray-800">
              <span>Net Pay : </span> <span className="text-lg">₹90,000</span>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              *This is a computer-generated document and does not require a
              signature.
            </p>

            <div className="mt-6 text-center">
              <PrimaryButton title={"Save"} />
            </div>
          </div>

          <div className="flex items-center gap-[8.5rem]">
            <PrimaryButton title={"Generate Payslip"} />
            <PrimaryButton title={"Download Payslip"} />
          </div>
        </div>
      </WidgetSection>
    </div>
  );
};

export default ViewPayroll;

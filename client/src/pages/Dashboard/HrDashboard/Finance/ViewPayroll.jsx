import React from "react";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import humanTime from "../../../../utils/humanTime";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import humanDate from "../../../../utils/humanDateForamt";
import { inrFormat } from "../../../../utils/currencyFormat";
import PageFrame from "../../../../components/Pages/PageFrame";

const ViewPayroll = () => {
  const payrollColumns = [
    { field: "srNo", headerName: "SrNo", flex: 1 },
    { field: "empId", headerName: "Employee ID", flex: 1 },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      cellRenderer: (params) => params.value,
    },
    {
      field: "inTime",
      headerName: "In Time",
      flex: 1,
      cellRenderer: (params) => humanTime(params.value),
    },
    {
      field: "outTime",
      headerName: "Out Time",
      flex: 1,
      cellRenderer: (params) => humanTime(params.value),
    },
    // { field: "workHours", headerName: "Work Hours", flex: 1 },
    { field: "breakDuration", headerName: "Break Hours", flex: 1 },
    // { field: "totalHours", headerName: "Total Hours", flex: 1 },
    { field: "entryType", headerName: "Entry Type", flex: 1 },
    // { field: "paydeduction", headerName: "Pay Deduction", flex: 1 },
  ];
  const leavesRecord = [
    { field: "srNo", headerName: "SrNo", flex: 1 },
    { field: "fromDate", headerName: "From Date", width: 150 },
    { field: "toDate", headerName: "To Date" },
    { field: "leaveType", headerName: "Leave Type" },
    { field: "leavePeriod", headerName: "Leave Period" },
    { field: "description", headerName: "Description", flex: 1 },
    // { field: "paydeduction", headerName: "Pay Deduction", width: 100 },
  ];
  const location = useLocation();
  const { empId } = location.state;
  const axios = useAxiosPrivate();

  const { data: userPayrollData = [], isLoading } = useQuery({
    queryKey: ["userPayroll"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/payroll/get-user-payrolls/${empId}`
        );

        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch employees"
        );
      }
    },
  });

  const attendanceData = isLoading
    ? []
    : userPayrollData.attendances.map((item) => {
        return {
          ...item,
          id: item._id,
          date: item.inTime,
          inTime: item.inTime,
          outTime: item.outTime,
          status: item.status,
          empId: item.user?.empId,
          name: `${item.user?.firstName} ${item.user?.lastName}`,
          email: item.user?.email,
        };
      });
  const leavesData = isLoading
    ? []
    : userPayrollData.leaves.map((item) => {
        return {
          ...item,
          name: `${item.takenBy?.firstName} ${item.takenBy?.lastName}`,
          email: item.takenBy?.email,
          empId: item.takenBy?.empId,
        };
      });

  const userData = {
    name: [...new Set(attendanceData.map((item) => item.name))],
    empId: [...new Set(attendanceData.map((item) => item.empId))],

    department: [
      ...new Set(
        attendanceData.flatMap(
          (item) => item.user?.departments?.map((d) => d.name) || []
        )
      ),
    ],

    role: [
      ...new Set(
        attendanceData.flatMap(
          (item) => item.user?.role?.map((r) => r.roleTitle) || []
        )
      ),
    ],
  };

  const paymentBreakup = isLoading ? [] : userPayrollData.paymentBreakup;

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        <YearWiseTable
          key={attendanceData.map((item) => item.id)}
          search={true}
          dateColumn={"inTime"}
          tableTitle={"Attendance"}
          formatTime
          data={attendanceData}
          columns={payrollColumns}
        />
      </PageFrame>

      <WidgetSection
        layout={1}
        border
        title={"Leaves List"}
        button={true}
        buttonTitle={"Edit"}
      >
        <YearWiseTable
          key={leavesData.length}
          dateColumn={"fromDate"}
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
                    {userData.name}{" "}
                  </span>
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-content">Employee ID:</span>{" "}
                  <span className="text-content text-gray-600">
                    {userData.empId}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 py-4 text-sm">
                <div className="flex flex-col w-full">
                  <span className="text-content">Designation:</span>{" "}
                  <span className="text-content text-gray-600">
                    {userData.role}
                  </span>
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-content">Department</span>{" "}
                  <span className="text-content text-gray-600">
                    {userData.department}
                  </span>
                </div>
              </div>
              <div className="flex gap-4  items-center w-full">
                <div className="flex flex-col w-full">
                  <span className="text-content">Start Date</span>
                  <span className="text-content text-gray-600">
                    {new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1
                    ).toLocaleDateString("default", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-content">End Date</span>
                  <span className="text-content text-gray-600">
                    {new Date(
                      new Date().getFullYear(),
                      new Date().getMonth() + 1,
                      0
                    ).toLocaleDateString("default", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
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
                  <span>{inrFormat(paymentBreakup.basicPay) || 0}</span>
                </div>
                {/* <div className="flex justify-between py-1 border-b-[1px] border-borderGray">
                  <span>House Rent Allowance (HRA)</span>
                  <span>INR 15,000</span>
                </div>
                <div className="flex justify-between py-1 border-b-[1px] border-borderGray">
                  <span>Other Allowances</span>
                  <span>INR 10,000</span>
                </div>
                <div className="flex justify-between py-1 font-semibold">
                  <span>Total Earnings</span>
                  <span>INR 95,000</span>
                </div> */}
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
                  <span>PF</span>
                  <span>{inrFormat(paymentBreakup.pf) || 0}</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-right font-semibold text-gray-800">
              <span>Net Pay : </span>{" "}
              <span className="text-lg">
                {inrFormat(paymentBreakup.basicPay - paymentBreakup.pf)}
              </span>
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

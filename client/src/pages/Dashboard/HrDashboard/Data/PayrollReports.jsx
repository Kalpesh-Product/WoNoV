import React from "react";
import MonthWiseTable from "../../../../components/Tables/MonthWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useQuery } from "@tanstack/react-query";
import humanDate from "../../../../utils/humanDateForamt";
import { useState } from "react";
import { CircularProgress } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { inrFormat } from "../../../../utils/currencyFormat";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import dayjs from "dayjs";

const PayrollReports = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState({});

  const { data: payrollData, isLoading } = useQuery({
    queryKey: ["payrollReports"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/payroll/get-payrolls");

      const res = [...response.data, {
        "employeeId": "67b83885daad0f7bab2f189a",
        "empId": "B00077",
        "name": "Aiwinraj KS",
        "email": "aiwinraj.wono@gmail.com",
        "departments": [
            {
                "_id": "6798ba9de469e809084e2494",
                "departmentId": "D-0001",
                "name": "Tech",
                "__v": 0,
                "templates": [
                    {
                        "name": "Assets",
                        "documentLink": "https://res.cloudinary.com/dua5bpiab/raw/upload/v1751005481/BizNest/departments/Tech/templates/Tech%20Assets.xlsx",
                        "documentId": "BizNest/departments/Tech/templates/Tech Assets.xlsx",
                        "isActive": true,
                        "createdAt": "2025-06-27T06:24:42.645Z",
                        "updatedAt": null,
                        "_id": "685e392a0334e479f71db057"
                    },
                    {
                        "name": "Expense And Budget",
                        "documentLink": "https://res.cloudinary.com/dua5bpiab/raw/upload/v1751005497/BizNest/departments/Tech/templates/Tech%20Budget%20And%20Expense.xlsx",
                        "documentId": "BizNest/departments/Tech/templates/Tech Budget And Expense.xlsx",
                        "isActive": true,
                        "createdAt": "2025-06-27T06:24:58.714Z",
                        "updatedAt": null,
                        "_id": "685e393a0334e479f71db05c"
                    },
                    {
                        "name": "Vendors",
                        "documentLink": "https://res.cloudinary.com/dua5bpiab/raw/upload/v1751522858/BizNest/departments/Tech/templates/Tech%20Vendor%20Template.xlsx",
                        "documentId": "BizNest/departments/Tech/templates/Tech Vendor Template.xlsx",
                        "isActive": true,
                        "createdAt": "2025-07-03T06:07:38.921Z",
                        "updatedAt": null,
                        "_id": "68661e2a8368244f35e94669"
                    }
                ]
            }
        ],
        "role": [
            {
                "_id": "6798c001e469e809084e2500",
                "roleTitle": "Tech Employee",
                "roleID": "ROLE_TECH_EMPLOYEE",
                "__v": 0
            }
        ],
        "month": "2025-05-31T00:00:00.000Z",
        "totalSalary": 0,
        "reimbursment": 0,
        "deductions": [],
        "status": "Pending",
        "payslip": null
    },]

      const uniquePayrollMap = new Map();

      res.forEach((payroll) => {
        const monthKey = dayjs(payroll.month).format("MM-YYYY");

        // Only keep the first encountered entry for that monthKey
        if (!uniquePayrollMap.has(`${payroll.employeeId}-${monthKey}`)) {
          uniquePayrollMap.set(`${payroll.employeeId}-${monthKey}`, payroll);
        }
      });

      const filteredData = Array.from(uniquePayrollMap.values());

      
        return filteredData
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch employees"
        );
      }
    },
  });

  const payrollColumns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "empId", headerName: "Employee ID", width: 200 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          className="text-primary underline cursor-pointer"
          onClick={() => handleViewApplicationDetails(params.data)}
        >
          {params.value}
        </span>
      ),
    },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "totalSalary", headerName: "Total Salary (INR)" },
  ];

  const transformedData = isLoading
    ? []
    : payrollData
        .map((item) => {
          return {
            ...item,
            empId: item.empId,
            employeeName: item.name,
            status: item?.status,
            totalSalary: item?.totalSalary ? inrFormat(item?.totalSalary) : 0,
            departmentName: item.departments?.map(
              (item) => item.name || "null"
            ),
            date: item?.month,
            payslip: item?.payslip?.payslipLink,
          };
        })
        .sort((a, b) =>
          a.employeeName?.localeCompare(b.employeeName, undefined, {
            sensitivity: "base",
          })
        );

  const handleViewApplicationDetails = (row) => {
    setSelectedEmployee(row);
    setOpenModal(true);
  };

  return (
    <div>
      <PageFrame>
        <YearWiseTable
          data={isLoading ? [] : transformedData}
          columns={payrollColumns}
          exportData={true}
          tableTitle={"Payroll Reports"}
          hideTitle
          dateColumn={"date"}
        />
      </PageFrame>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Payroll Details"}
      >
        {!isLoading && selectedEmployee ? (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <DetalisFormatted title="Name" detail={selectedEmployee?.name} />
            <DetalisFormatted
              title="Employee ID"
              detail={selectedEmployee?.empId}
            />
            <DetalisFormatted title="Email" detail={selectedEmployee?.email} />
            <DetalisFormatted
              title="Department"
              detail={selectedEmployee?.departmentName || "N/A"}
            />
            <DetalisFormatted title="Date" detail={selectedEmployee?.date} />
            <DetalisFormatted
              title="Total Salary"
              detail={`INR ${inrFormat(selectedEmployee?.totalSalary)}`}
            />
            <DetalisFormatted
              title="Status"
              detail={selectedEmployee?.status || "N/A"}
            />
            <DetalisFormatted
              title="Payslip"
              detail={
                selectedEmployee?.payslip ? (
                  <a
                    className="text-primary underline cursor-pointer"
                    href={selectedEmployee.payslip}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Payslip
                  </a>
                ) : (
                  "Not Available"
                )
              }
            />
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default PayrollReports;

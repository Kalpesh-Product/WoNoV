import React from "react";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import {
  setSelectedEmployee,
  setSelectedEmployeeMongoId,
} from "../../../../redux/slices/hrSlice";
import PageFrame from "../../../../components/Pages/PageFrame";

const ViewEmployees = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();

  const formatDateValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().split("T")[0];
  };

  const normalizeTextValue = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.name || item?.roleTitle || item?.title || ""
        )
        .filter(Boolean)
        .join(", ");
    }

    if (value && typeof value === "object") {
      return value?.name || value?.roleTitle || value?.title || "";
    }

    return value || "";
  };

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        const filteredData = response.data.filter(
          (employee) => employee.isActive
        );

        const employeesWithDetails = await Promise.all(
          filteredData.map(async (employee) => {
            try {
              const detailResponse = await axios.get(
                `/api/users/fetch-single-user/${employee.empId}`
              );
              return {
                ...detailResponse.data,
                _id: employee._id,
                empId: employee.empId,
                isActive: employee.isActive,
              };
            } catch (detailError) {
              return employee;
            }
          })
        );

        return employeesWithDetails;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch employees"
        );
      }
    },
  });

  const viewEmployeeColumns = [
    { field: "srno", headerName: "SR No", width: 100 },
    { field: "employmentID", headerName: "Employment ID" },
    {
      field: "employeeName",
      headerName: "Employee Name",
      cellRenderer: (params) => (
        <span
          style={{
            color: "#1E3D73",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => {
            localStorage.setItem("employeeName", params.data.employeeName);

            navigate(
               `/app/dashboard/HR-dashboard/employee/employee-list/edit-details`
             // `/app/dashboard/HR-dashboard/employee/employee-list/${params.data.employeeName}/edit-details`
            );
            dispatch(setSelectedEmployee(params.data.employmentID));
            dispatch(setSelectedEmployeeMongoId(params.data.id));
          }}
        >
          {params.value}
        </span>
      ),
    },
    { field: "department", headerName: "Department", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      sort: "desc",
      cellRenderer: (params) => {
        const statusText =
          typeof params.value === "string"
            ? params.value
            : params.value
            ? "Active"
            : "Inactive";
        const normalizedStatus =
          statusText.toLowerCase() === "active" ? "Active" : "Inactive";
        const statusColorMap = {
          Active: { backgroundColor: "#90EE90", color: "#006400" },
          Inactive: { backgroundColor: "#D3D3D3", color: "#696969" },
        };

        const { backgroundColor, color } = statusColorMap[normalizedStatus] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <Chip
            label={normalizedStatus}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
    { field: "gender", headerName: "Gender", hide: true },
    { field: "dob", headerName: "DOB", hide: true },
    { field: "mobilePhone", headerName: "Mobile Phone", hide: true },
    { field: "startDate", headerName: "Start Date", hide: true },
    { field: "workLocation", headerName: "Work Location", hide: true },
    { field: "employeeType", headerName: "Employee Type", hide: true },
    { field: "reportsTo", headerName: "Reports To", hide: true },
    { field: "jobTitle", headerName: "Job Title", hide: true },
    { field: "shift", headerName: "Shift", hide: true },
    {
      field: "workSchedulePolicy",
      headerName: "Work Schedule Policy",
      hide: true,
    },
    { field: "attendanceSource", headerName: "Attendance Source", hide: true },
    { field: "leavePolicy", headerName: "Leave Policy", hide: true },
    { field: "holidayPolicy", headerName: "Holiday Policy", hide: true },
    { field: "aadharID", headerName: "Aadhar ID", hide: true },
    { field: "pan", headerName: "PAN", hide: true },
    { field: "pfAcNo", headerName: "PF Ac No", hide: true },
    { field: "addressLine1", headerName: "Address Line 1", hide: true },
    { field: "addressLine2", headerName: "Address Line 2", hide: true },
    { field: "state", headerName: "State", hide: true },
    { field: "city", headerName: "City", hide: true },
    { field: "pinCode", headerName: "Pincode", hide: true },
    { field: "includeInPayroll", headerName: "Include In Payroll", hide: true },
    { field: "payrollBatch", headerName: "Payroll Batch", hide: true },
    {
      field: "professionalTaxExemption",
      headerName: "Professional Tax Exemption",
      hide: true,
    },
    { field: "includePF", headerName: "Include PF", hide: true },
    {
      field: "pfContributionRate",
      headerName: "PF Contribution Rate",
      hide: true,
    },
    { field: "employeePF", headerName: "Employee PF", hide: true },
    { field: "password", headerName: "Password", hide: true },
  ];

  return (
    <div>
      <PageFrame>
        <div className="w-full">
          <AgTable
            search={true}
            tableTitle={"Employees List"}
            data={
              isLoading
                ? []
                : [
                    ...employees.map((employee, index) => ({
                      id: employee._id,
                      srno: index + 1,
                      employeeName: `${employee.firstName ? employee.firstName : ""
                        } ${employee.lastName ? employee.lastName : ""}`,
                      employmentID: employee.employeeID || employee.empId,
                      email: employee.email,
                      department: normalizeTextValue(employee.departments),
                      role: normalizeTextValue(employee.role),
                      status:
                        typeof employee.status === "string"
                          ? employee.status
                          : employee.isActive,
                      gender: employee.gender || "",
                      dob: formatDateValue(employee.dob || employee.dateOfBirth),
                      mobilePhone: employee.mobilePhone || employee.phone || "",
                      startDate: formatDateValue(employee.startDate),
                      workLocation: employee.workLocation || "",
                      employeeType: normalizeTextValue(employee.employeeType),
                      reportsTo: normalizeTextValue(employee.reportsTo),
                      jobTitle: employee.jobTitle || employee.designation || "",
                      shift: employee.shift || "",
                      workSchedulePolicy:
                        employee.workSchedulePolicy || employee.shift || "",
                      attendanceSource: employee.attendanceSource || "",
                      leavePolicy: employee.leavePolicy || "",
                      holidayPolicy: employee.holidayPolicy || "",
                      aadharID: employee.aadharID || employee.aadhaarID || "",
                      pan: employee.pan || "",
                      pfAcNo: employee.pfAcNo || employee.pfAccountNumber || "",
                      addressLine1: employee.addressLine1 || "",
                      addressLine2: employee.addressLine2 || "",
                      state: employee.state || "",
                      city: employee.city || "",
                      pinCode: employee.pinCode || employee.pincode || "",
                      includeInPayroll: employee.includeInPayroll ?? "",
                      payrollBatch: employee.payrollBatch || "",
                      professionalTaxExemption:
                        employee.professionalTaxExemption ?? "",
                      includePF: employee.includePF ?? "",
                      pfContributionRate:
                        employee.pfContributionRate ||
                        employee.pFContributionRate ||
                        "",
                      employeePF: employee.employeePF || "",
                      password: employee.password || employee.plainPassword || "",
                    })),
                ]
            }
            columns={viewEmployeeColumns}
            exportData
          />
        </div>
      </PageFrame>
    </div>
  );
};

export default ViewEmployees;

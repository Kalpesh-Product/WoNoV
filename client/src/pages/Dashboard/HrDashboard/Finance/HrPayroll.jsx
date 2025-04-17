import React from "react";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// import AgTable from "../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useQuery } from "@tanstack/react-query";
// import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
// import humanTime from "../../utils/humanTime";
// import DetalisFormatted from "../../../../components/DetalisFormatted";
// import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import MuiModal from "../../../../components/MuiModal";

const HrPayroll = () => {
  const navigate = useNavigate();

  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const { data: visitorsData = [], isPending: isVisitorsData } = useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/visitors/fetch-visitors");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { handleSubmit, reset, control } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      purposeOfVisit: "",
      toMeet: "",
      checkIn: "",
    },
  });

  const handleEditToggle = () => {
    if (!isEditing && selectedVisitor) {
      reset({
        firstName: selectedVisitor.firstName || "Aiwinraj",
        lastName: selectedVisitor.lastName || "KS",
        address: selectedVisitor.address || "Associate Software Engineer",
        email: selectedVisitor.email || "aiwinraj.wono@gmail.com",
        phoneNumber: selectedVisitor.phoneNumber || " 40,000",
        purposeOfVisit: selectedVisitor.purposeOfVisit || "EMP007",
        toMeet: selectedVisitor.toMeet || "36 Months",
        checkIn: selectedVisitor.checkIn ? selectedVisitor.checkIn : "",
      });
    }
    setIsEditing(!isEditing);
  };

  const payrollColumn = [
    { field: "id", headerName: "Sr No" },
    { field: "payrollId", headerName: "Employee ID" },
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
          onClick={() =>
            navigate(
              `/app/dashboard/HR-dashboard/finance/payroll/view-payroll/${params.data.payrollId}`
            )
          }>
          {params.value}
        </span>
      ),
    },
    { field: "email", headerName: "Employee Email" },
    { field: "department", headerName: "Department" },
    // { field: "date", headerName: "Date" },
    // { field: "role", headerName: "Role" },
    // { field: "time", headerName: "Time" },
    { field: "totalSalary", headerName: "Total Salary (INR)" },
    // { field: "reimbursment", headerName: "Total Salary" },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Completed: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   cellRenderer: (params) => (
    //     <>
    //       <div className="p-2 mb-2 flex gap-2">
    //         <span className="text-primary hover:underline text-content cursor-pointer">
    //           View Details
    //         </span>
    //       </div>
    //     </>
    //   ),
    // },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2">
          <PrimaryButton
            title={"View"}
            handleSubmit={() => handleDetailsClick(params.data)}
          />
        </div>
      ),
    },
  ];
  const handleDetailsClick = (asset) => {
    setSelectedVisitor(asset);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAddAsset = () => {
    setModalMode("add");
    setSelectedVisitor(null);
    setIsModalOpen(true);
  };

  const handleSumit = async (assetData) => {
    if (modalMode === "add") {
      try {
      } catch (error) {
        console.error("Error adding asset:", error);
      }
    } else if (modalMode === "edit") {
      try {
      } catch (error) {
        console.error("Error updating asset:", error);
      }
    }
  };

  const rows = [
    {
      id: 1,
      payrollId: "PAY001",
      employeeName: "Aiwinraj KS",
      role: "Software Engineer",
      date: "2025-01-01",
      time: "10:00 AM",
      totalSalary: " 45,000",
      reimbursment: 5000,
      status: "Completed",
      email: "aiwinraj.wono@gmail.com",
      department: "Tech",
    },
    {
      id: 2,
      payrollId: "PAY002",
      employeeName: "Kalpesh Naik",
      role: "Project Manager",
      date: "2025-01-15",
      time: "11:00 AM",
      totalSalary: " 95,000",
      reimbursment: 8000,
      status: "Pending",
      email: "kalpesh@biznest.co.in",
      department: "Tech",
    },
    {
      id: 3,
      payrollId: "PAY003",
      employeeName: "Sankalp Kalangutkar",
      role: "HR Manager",
      date: "2025-02-01",
      time: "09:30 AM",
      totalSalary: " 45,000",
      reimbursment: 7000,
      status: "Completed",
      email: "sankalp.wono@gmail.com",
      department: "Tech",
    },
    {
      id: 4,
      payrollId: "PAY004",
      employeeName: "Allan Silveira",
      role: "QA Analyst",
      date: "2025-02-15",
      time: "02:00 PM",
      totalSalary: " 45,000",
      reimbursment: 4500,
      status: "Pending",
      email: "allan.wono@gmail.com",
      department: "Tech",
    },
    // {
    //   id: 5,
    //   payrollId: "PAY005",
    //   employeeName: "Anushri",
    //   role: "Business Analyst",
    //   date: "2025-03-01",
    //   time: "01:30 PM",
    //   totalSalary: 95000,
    //   reimbursment: 6000,
    //   status: "Completed",
    // },
    {
      id: 5,
      payrollId: "PAY007",
      employeeName: "Muskan Dodmani",
      role: "Business Analyst",
      date: "2025-03-01",
      time: "01:30 PM",
      totalSalary: " 45,000",
      reimbursment: 6000,
      status: "Completed",
      email: "muskan.wono@gmail.com",
      department: "Tech",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          searchColumn={"Employee Name"}
          tableTitle={""}
          data={rows}
          columns={payrollColumn}
        />
        <MuiModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={"Employee Details"}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <PrimaryButton handleSubmit={handleEditToggle} title={"Edit"} />
            </div>
            <form>
              {!isVisitorsData ? (
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* First Name */}
                  {isEditing ? (
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="First Name"
                          fullWidth
                        />
                      )}
                    />
                  ) : (
                    <DetalisFormatted
                      title="First Name"
                      // detail={selectedVisitor.firstName}
                      detail="Aiwinraj"
                    />
                  )}

                  {/* Last Name */}
                  {isEditing ? (
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="Last Name"
                          fullWidth
                        />
                      )}
                    />
                  ) : (
                    <DetalisFormatted
                      title="Last Name"
                      // detail={selectedVisitor.lastName}
                      detail="KS"
                    />
                  )}

                  {/* Address */}
                  {isEditing ? (
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="Role"
                          fullWidth
                        />
                      )}
                    />
                  ) : (
                    <DetalisFormatted
                      title="Role"
                      // detail={selectedVisitor.address}
                      detail="Associate Software Engineer"
                    />
                  )}

                  {/* Phone Number */}
                  {isEditing ? (
                    <Controller
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="Total Salary (INR)"
                          type="tel"
                          fullWidth
                        />
                      )}
                    />
                  ) : (
                    <DetalisFormatted
                      title="Total Salary (INR)"
                      // detail={selectedVisitor.phoneNumber}
                      detail=" 40,000"
                    />
                  )}

                  {/* Email */}
                  {isEditing ? (
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="Email"
                          type="email"
                          fullWidth
                        />
                      )}
                    />
                  ) : (
                    <DetalisFormatted
                      title="Email"
                      // detail={selectedVisitor.email}
                      detail="aiwinraj.wono@gmail.com"
                    />
                  )}

                  {/* Purpose of Visit */}
                  {isEditing ? (
                    <Controller
                      name="purposeOfVisit"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="Employee ID"
                          fullWidth
                        />
                      )}
                    />
                  ) : (
                    <DetalisFormatted
                      title="Employee ID"
                      // detail={selectedVisitor.purposeOfVisit}
                      detail="EMP007"
                    />
                  )}

                  {/* To Meet */}
                  {isEditing ? (
                    <Controller
                      name="toMeet"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="Tenure"
                          fullWidth
                        />
                      )}
                    />
                  ) : (
                    <DetalisFormatted
                      title="Tenure"
                      // detail={selectedVisitor?.toMeet}
                      detail="36 Months"
                    />
                  )}

                  {/* Check In */}
                  {/* {isEditing ? (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                      name="checkIn"
                      control={control}
                      render={({ field }) => (
                        <TimePicker
                          {...field}
                          size="small"
                          label="Check In"
                          slotProps={{
                            textField: { fullWidth: true, size: "small" },
                          }}
                          render={(params) => <TextField {...params} />}
                        />
                      )}
                    />
                  </LocalizationProvider>
                ) : (
                  <DetalisFormatted
                    title="Check In"
                    detail={selectedVisitor.checkIn}
                  />
                )} */}
                </div>
              ) : (
                []
              )}
            </form>
          </div>
        </MuiModal>
      </div>
    </div>
  );
};

export default HrPayroll;

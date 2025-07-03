import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import humanTime from "../../../../utils/humanTime";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import humanDate from "../../../../utils/humanDateForamt";
import { inrFormat } from "../../../../utils/currencyFormat";
import PageFrame from "../../../../components/Pages/PageFrame";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import { CircularProgress } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { queryClient } from "../../../../main";
import { toast } from "sonner";
import StatusChip from "../../../../components/StatusChip";

const ViewPayroll = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openModal, setOpenModal] = useState(false);
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
    {
      field: "breakDuration",
      headerName: "Break Hours",
      cellRenderer: (params) => params.value.toFixed(),
    },
    // { field: "totalHours", headerName: "Total Hours", flex: 1 },
    { field: "entryType", headerName: "Entry Type", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => {
        const { status, _id, id } = params.data;
        const menuItems = [
          {
            label: "View",
            onClick: () => handleViewUser(params.data),
            isLoading: isLoading,
          },
        ];

        if (status !== "Approved" && status !== "Rejected") {
          menuItems.unshift(
            {
              label: "Approve",
              onClick: () => approveRequest(params.data.correctionId),
              isLoading: isLoading,
            },
            {
              label: "Reject",
              onClick: () => rejectRequest(params.data.correctionId),
              isLoading: isLoading,
            }
          );
        }
        return (
          <div className="flex items-center gap-4 py-2">
            <ThreeDotMenu rowId={id} menuItems={menuItems} />
          </div>
        );
      },
    },
  ];
  const leavesRecord = [
    { field: "srNo", headerName: "SrNo", flex: 1 },
    { field: "fromDate", headerName: "From Date", width: 150 },
    { field: "toDate", headerName: "To Date" },
    { field: "leaveType", headerName: "Leave Type" },
    { field: "leavePeriod", headerName: "Leave Period" },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "status", headerName: "Status", cellRenderer : (params)=> (
      <StatusChip status={params.value} />
    ) },
     {
      field: "action",
      headerName: "Action",
      cellRenderer: (params) => (
        <div>
          {params.data.status === "Pending" ? (

            <ThreeDotMenu
              rowId={params.data.id}
              menuItems={[
                { label: "Accept", onClick: () => approveLeave(params.data.id) },
                { label: "Reject", onClick: () => rejectLeave(params.data.id) },
              ]}
            />
          ) : (
            ""
          )}
        </div>
      ),
    },
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
//Attendance correction
  const { mutate: approveRequest, isPending: approveRequestPending } =
    useMutation({
      mutationFn: async (id) => {
        const response = await axios.patch(
          `/api/attendance/approve-correct-attendance/${id}`
        );
        return response.data;
      },
      onSuccess: function (data) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["userPayroll"] });
        setSelectedRequest(null);
        setOpenModal(false);
      },
      onError: function (error) {
        toast.error(error.response.data.message);
      },
    });

  const { mutate: rejectRequest, isPending: rejectRequestPending } =
    useMutation({
      mutationFn: async (id) => {
        const response = await axios.patch(
          `/api/attendance/reject-correct-attendance/${id}`
        );
        return response.data;
      },
      onSuccess: function (data) {
        toast.success(data.message);
        queryClient.invalidateQueries(["userPayroll"]);
        setSelectedRequest(null);
        setOpenModal(false);
      },
      onError: function (error) {
        toast.error(error.response.data.message);
      },
    });

  const handleViewUser = (data) => {
    setSelectedRequest(data);
    setOpenModal(true);
  };


//Leaves correction

  const { mutate: approveLeave, isPending: isApproving } = useMutation({
    mutationFn: async (leaveId) => {
      const res = await axios.patch(`/api/leaves/approve-leave/${leaveId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Leave Approved");
      queryClient.invalidateQueries({ queryKey: ["userPayrolls"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Approval failed");
    },
  });

  const { mutate: rejectLeave, isPending: isRejecting } = useMutation({
    mutationFn: async (leaveId) => {
      const res = await axios.patch(`/api/leaves/reject-leave/${leaveId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Leave Rejected");
      queryClient.invalidateQueries({ queryKey: ["userPayroll"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Rejection failed");
    },
  });

  const attendanceData = isLoading
    ? []
    : userPayrollData.attendances.map((item) => {
        return {
          ...item,
          id: item._id,
          correctionId : item.correctionId,
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
          id : item._id,
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
          key={attendanceData.length}
          search={true}
          dateColumn={"date"}
          tableTitle={"Attendance"}
          formatTime
          data={attendanceData}
          columns={payrollColumns}
        />
      </PageFrame>

      <PageFrame>
        <YearWiseTable
          key={leavesData.length}
          dateColumn={"fromDate"}
          search={true}
          searchColumn={"Leave Type"}
          tableTitle={"Leaves List"}
          data={leavesData}
          columns={leavesRecord}
        />
      </PageFrame>

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
                <div className="flex flex-col text-content py-4 gap-4">
                  <div className="flex justify-between py-1 border-b border-borderGray">
                    <span>Basic Pay</span>
                    <span>{inrFormat(paymentBreakup.basic) || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-borderGray">
                    <span>HRA</span>
                    <span>{inrFormat(paymentBreakup.hra) || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-borderGray">
                    <span>Special Allowance</span>
                    <span>
                      {inrFormat(paymentBreakup.specialAllowance) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-borderGray">
                    <span>Bonus</span>
                    <span>{inrFormat(paymentBreakup.bonus) || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-borderGray">
                    <span>Other Allowance</span>
                    <span>{inrFormat(paymentBreakup.otherAllowance) || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold">
                    <span>Total Earnings</span>
                    <span>
                      {inrFormat(
                        (paymentBreakup.basic || 0) +
                          (paymentBreakup.hra || 0) +
                          (paymentBreakup.specialAllowance || 0) +
                          (paymentBreakup.bonus || 0) +
                          (paymentBreakup.otherAllowance || 0)
                      )}
                    </span>
                  </div>
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
                <div className="flex justify-between py-1 border-b border-borderGray">
                  <span>PF</span>
                  <span>{inrFormat(paymentBreakup.employeePf) || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderGray">
                  <span>ESI</span>
                  <span>
                    {inrFormat(paymentBreakup.employeesStateInsurance) || 0}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderGray">
                  <span>Professional Tax</span>
                  <span>{inrFormat(paymentBreakup.professionTax) || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderGray">
                  <span>Income Tax</span>
                  <span>{inrFormat(paymentBreakup.incomeTax) || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderGray">
                  <span>Other Deductions</span>
                  <span>{inrFormat(paymentBreakup.recovery) || 0}</span>
                </div>
                <div className="flex justify-between py-1 font-semibold">
                  <span>Total Deductions</span>
                  <span>
                    {inrFormat(
                      (paymentBreakup.employeePf || 0) +
                        (paymentBreakup.employeesStateInsurance || 0) +
                        (paymentBreakup.professionTax || 0) +
                        (paymentBreakup.incomeTax || 0) +
                        (paymentBreakup.recovery || 0)
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-right font-semibold text-gray-800">
              <span>Net Pay : </span>{" "}
              <span className="text-lg">
                {inrFormat(paymentBreakup.netAmount || 0)}
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
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Attendance Request Details"}
      >
        {selectedRequest ? (
          <div className="flex flex-col gap-4">
            {/* 🧑‍💼 Employee Details */}
            <div className=" pb-2">
              <div className="mb-4">
                <span className="text-subtitle font-pmedium text-black ">
                  Employee Details
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <DetalisFormatted
                  title="Employee ID"
                  detail={selectedRequest?.empId}
                />
                <DetalisFormatted title="Name" detail={selectedRequest?.name} />
                <DetalisFormatted
                  title="Reason"
                  detail={selectedRequest?.reason}
                />
              </div>
            </div>

            {/* 📅 Request Information */}
            <div className=" pb-2">
              <div className="mb-4">
                <span className="text-subtitle font-pmedium text-black mb-4">
                  Request Information
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <DetalisFormatted
                  title="Raised Date"
                  detail={humanDate(selectedRequest?.createdAt)}
                />
                <DetalisFormatted
                  title="Attendance Date"
                  detail={selectedRequest?.requestDay}
                />
                <DetalisFormatted
                  title="Status"
                  detail={selectedRequest?.status}
                />
              </div>
            </div>

            {/* ⏰ Attendance Timing */}
            <div>
              <div className="mb-4">
                <span className="text-subtitle font-pmedium text-black mb-4">
                  Attendance Timing
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <DetalisFormatted
                  title="Start Time"
                  detail={humanTime(selectedRequest?.inTime)}
                />
                <DetalisFormatted
                  title="End Time"
                  detail={humanTime(selectedRequest?.outTime)}
                />
                <DetalisFormatted
                  title="Original Start Time"
                  detail={selectedRequest?.originalInTime}
                />
                <DetalisFormatted
                  title="Original End Time"
                  detail={selectedRequest?.originalOutTime}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-6">
            <CircularProgress />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default ViewPayroll;

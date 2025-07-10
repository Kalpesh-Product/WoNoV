import { useState, useRef } from "react";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import { useLocation, useNavigate } from "react-router-dom";
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
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";

const ViewPayroll = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const payslipRef = useRef();
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
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "action",
      headerName: "Action",
      cellRenderer: (params) => (
        <div>
          {params.data.status === "Pending" ? (
            <ThreeDotMenu
              rowId={params.data.id}
              menuItems={[
                {
                  label: "Accept",
                  onClick: () => approveLeave(params.data.id),
                },
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
  const navigate = useNavigate();
  const { empId, month, status, employeeName, departmentName, employeeId, designation } = location.state;

  console.log("status : ", status);
  const axios = useAxiosPrivate();

  const { data: userPayrollData = [], isLoading } = useQuery({
    queryKey: ["userPayroll"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/payroll/get-user-payrolls/${empId}?month=${month}`
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

  const { mutate: payrollMutate, isPending: isPayrollPending } = useMutation({
    mutationKey: ["batchPayrollMutate"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/payroll/generate-payroll", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payrollData"] });
      navigate("/app/dashboard/HR-dashboard/finance/payroll");
      toast.success(data.message || "BATCH SENT");
    },
    onError: (error) => {
      toast.error(error.message || "BATCH FAILED");
    },
  });

  const handleGeneratePayslip = async () => {
    const element = payslipRef.current;

    const opt = {
      margin: 0.3,
      filename: `${userData.empId}-${dayjs(month).format("MMMM-YYYY")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: "a4", // Set to A4
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }, // Prevent abrupt breaks
    };

    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf("blob");

    const formData = new FormData();
    formData.append("payslips", pdfBlob, opt.filename);

    const payload = {
      name: userData.name[0],
      userId: empId,
      email: attendanceData[0]?.email || "",
      month: month,
      totalSalary: netPay,
      departmentName: userData.department[0],
      empId: userData.empId[0],
      // Flatten earnings and deductions
      ...earnings[0],
      ...deductions[0],
    };

    formData.append("payrolls", JSON.stringify([payload]));

    payrollMutate(formData);
  };

  const handleDownloadPayslip = async () => {
  const element = payslipRef.current;

  const opt = {
    margin: 0.3,
    filename: `${userData.empId}-${dayjs(month).format("MMMM-YYYY")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  await html2pdf().set(opt).from(element).save(); // Directly triggers download
};


  const attendanceData = isLoading
    ? []
    : userPayrollData.attendances.map((item) => {
        return {
          ...item,
          id: item._id,
          correctionId: item.correctionId,
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
          id: item._id,
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

  const earnings = isLoading ? [] : [userPayrollData.earnings];
  const deductions = isLoading ? [] : [userPayrollData.deductions];

  const formatKeyLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1") // Convert camelCase to space-separated
      .replace(/_/g, " ") // Convert snake_case to space-separated
      .replace(/\s+/g, " ") // Replace multiple spaces with one
      .trim() // Trim leading/trailing spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  };

  console.log("payment breakup : ", deductions);

  const netPay = (() => {
    const totalEarnings = earnings.reduce(
      (sum, item) =>
        sum +
        Object.values(item || {}).reduce(
          (acc, val) => acc + (Number(val) || 0),
          0
        ),
      0
    );
    const totalDeductions = deductions.reduce(
      (sum, item) =>
        sum +
        Object.values(item || {}).reduce(
          (acc, val) => acc + (Number(val) || 0),
          0
        ),
      0
    );
    return totalEarnings - totalDeductions;
  })();

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        <AgTable
          key={attendanceData.length}
          search={true}
          tableTitle={`Attendance ${dayjs(month).format("MMMM-YYYY")}`}
          data={attendanceData}
          columns={payrollColumns}
        />
      </PageFrame>

      <PageFrame>
        <AgTable
          key={leavesData.length}
          search={true}
          tableTitle={`Leaves List ${dayjs(month).format("MMMM-YYYY")}`}
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
          <div
            ref={payslipRef}
            className="border-default border-borderGray p-6 rounded-xl"
          >
            <span className="text-center text-title font-pmedium mb-4">
              Pay Slip
            </span>
            <div className="border-t border-b py-4">
              <div className="flex gap-4 py-4 text-sm">
                <div className="flex flex-col w-full">
                  <span className="text-content">Employee Name:</span>{" "}
                  <span className="text-content text-gray-600">
                    {" "}
                    {employeeName || ""}{" "}
                  </span>
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-content">Employee ID:</span>{" "}
                  <span className="text-content text-gray-600">
                    {employeeId}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 py-4 text-sm">
                <div className="flex flex-col w-full">
                  <span className="text-content">Designation:</span>{" "}
                  <span className="text-content text-gray-600">
                    {designation || ""}
                  </span>
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-content">Department</span>{" "}
                  <span className="text-content text-gray-600">
                    {departmentName || ""}
                  </span>
                </div>
              </div>
              <div className="flex gap-4  items-center w-full">
                <div className="flex flex-col w-full">
                  <span className="text-content">Start Date</span>
                  <span className="text-content text-gray-600">
                    {dayjs(month).format("MMM DD, YYYY")}
                  </span>
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-content">End Date</span>
                  <span className="text-content text-gray-600">
                    {dayjs(month).endOf("month").format("MMM DD, YYYY")}
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
                  {earnings.map((item, index) =>
                    Object.entries(item).map(([key, value]) => (
                      <div
                        key={`${index}-${key}`}
                        className="flex justify-between py-1 border-b border-borderGray"
                      >
                        <span>{formatKeyLabel(key)}</span>
                        <span>{inrFormat(value) || 0}</span>
                      </div>
                    ))
                  )}
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
                <div className="flex flex-col text-content py-4 gap-4">
                  {deductions.map((item, index) =>
                    Object.entries(item).map(([key, value]) => (
                      <div
                        key={`${index}-${key}`}
                        className="flex justify-between py-1 border-b border-borderGray"
                      >
                        <span>{formatKeyLabel(key)}</span>
                        <span>{inrFormat(value) || 0}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="text-sm text-right font-semibold text-gray-800">
              <span>Net Pay : </span>{" "}
              <span className="text-lg">{inrFormat(netPay || 0)}</span>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              *This is a computer-generated document and does not require a
              signature.
            </p>
          </div>

          <div className="flex items-center gap-[8.5rem]">
            {status !== "Completed" && (
              <PrimaryButton
                title={"Generate Payslip"}
                handleSubmit={handleGeneratePayslip}
                disabled={isPayrollPending}
                isLoading={isPayrollPending}
              />
            )}

            <PrimaryButton title={"Download Payslip"} handleSubmit={handleDownloadPayslip}  />
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

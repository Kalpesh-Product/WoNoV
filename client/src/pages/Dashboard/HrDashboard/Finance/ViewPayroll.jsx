import { useEffect, useState, useRef } from "react";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import humanTime from "../../../../utils/humanTime";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import humanDate from "../../../../utils/humanDateForamt";
import { inrFormat } from "../../../../utils/currencyFormat";
import PageFrame from "../../../../components/Pages/PageFrame";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { queryClient } from "../../../../main";
import { toast } from "sonner";
import StatusChip from "../../../../components/StatusChip";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";

const formatPayrollAmount = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const CompensationRow = ({ label, value, period }) => (
  <div className="flex items-start justify-between gap-6 py-2 text-sm">
    <span className="text-gray-600">{label}</span>
    <span className="text-right font-pmedium text-gray-800">
      {value}
      {period ? <span className="font-pregular text-gray-500"> / {period}</span> : null}
    </span>
  </div>
);

const PayrollSection = ({ title, total, period = "Month", children }) => (
  <section className="rounded-xl border border-borderGray bg-white p-5">
    <div className="mb-3 flex items-center justify-between gap-4 border-b border-borderGray pb-3">
      <h3 className="text-subtitle font-pmedium text-primary">{title}</h3>
      {total !== undefined ? (
        <span className="text-sm font-pmedium text-gray-800">
          {formatPayrollAmount(total)}
          <span className="font-pregular text-gray-500"> / {period}</span>
        </span>
      ) : null}
    </div>
    <div>{children}</div>
  </section>
);

const baseAllowanceOptions = [
  "Special Allowance",
  "Conveyance Allowance",
  "Medical Allowance",
  "Children Education Allowance",
  "Dearness Allowance",
  "Other Allowance",
  "Arrears",
];

const getEmployeePf = (basicPay) => {
  const basic = Number(basicPay) || 0;
  return basic >= 15000 ? 1800 : basic * 0.12;
};

const getEmployeeEsi = (grossPay) => (Number(grossPay) || 0) * 0.0075;

const isEsiApplicable = (employee) => {
  const annualCtc = Number(employee?.annualCtc) || 0;
  return annualCtc > 0 && annualCtc / 12 < 21000;
};

const createInitialCompensationDetails = (
  earnings = {},
  deductions = {},
  month,
  employee = {}
) => {
  const basicPay = Number(earnings.basicPay) || 0;
  const hraType = String(employee?.hraType || "").trim().toLowerCase();
  const shouldAddHra = Boolean(hraType) && hraType !== "custom";
  const hraAmount = shouldAddHra
    ? basicPay * 0.5
    : Number(earnings.hra) || 0;
  const grossPay = [
    basicPay,
    hraAmount,
    earnings.specialAllowance,
    earnings.otherAllowance,
    earnings.bonus,
  ].reduce((total, value) => total + (Number(value) || 0), 0);
  const allowanceRows = [
    {
      label: "Special Allowance",
      value: earnings.specialAllowance,
    },
    ...(shouldAddHra
      ? [{ label: "House Rent Allowance", value: hraAmount }]
      : []),
  ];
  const esiApplicable = isEsiApplicable(employee);
  const deductionRows = [
    {
      label: "Provident Fund",
      value: Number(deductions.employeePf) || getEmployeePf(basicPay),
    },
    {
      label: "ESI",
      value: esiApplicable
        ? Number(deductions.employeesStateInsurance) || getEmployeeEsi(grossPay)
        : 0,
    },
  ];

  return {
    compensation: {
      grossPay,
      basicPay,
      variablePay: Number(earnings.bonus) || 0,
      gratuity: Number(earnings.gratuity) || 0,
      ctc: Number(employee?.annualCtc) || Number(earnings.ctc) || 0,
      appraisalDate: "",
      effectivePayPeriod: dayjs(month).format("MMMM YYYY"),
      paymentMethod:
        employee?.bankName && employee?.accountNumber ? "Bank Deposit" : "",
      bankName: employee?.bankName || "",
      accountNumber: employee?.accountNumber || "",
    },
    allowances: allowanceRows.map((row, index) => ({
      id: `allowance-${index}-${row.label}`,
      label: row.label,
      value: Number(row.value) || 0,
    })),
    deductions: deductionRows.map((row, index) => ({
      id: `deduction-${index}-${row.label}`,
      label: row.label,
      value: Number(row.value) || 0,
    })),
  };
};

const EditableAmountRow = ({
  row,
  options,
  usedLabels,
  placeholder,
  onChange,
  onRemove,
  amountReadOnly = false,
}) => (
  <div className="grid grid-cols-1 gap-3 border-b border-borderGray py-3 md:grid-cols-[minmax(0,1fr)_minmax(180px,0.7fr)_auto] md:items-center">
    <TextField
      select
      size="small"
      label="Type"
      value={row.label}
      onChange={(event) => onChange({ ...row, label: event.target.value })}
    >
      <MenuItem value="" disabled>
        {placeholder}
      </MenuItem>
      {options
        .filter(
          (option) => option === row.label || !usedLabels.includes(option)
        )
        .map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
    </TextField>
    <TextField
      size="small"
      type="number"
      label="Amount"
      value={row.value}
      disabled={amountReadOnly}
      onChange={(event) => onChange({ ...row, value: event.target.value })}
      InputProps={{ startAdornment: <span className="mr-2 text-gray-500">₹</span> }}
    />
    <button
      type="button"
      onClick={onRemove}
      className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
    >
      Remove
    </button>
  </div>
);

const ViewPayroll = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const payslipRef = useRef();
  const [openModal, setOpenModal] = useState(false);
  const [isEditingCompensation, setIsEditingCompensation] = useState(false);
  const [compensationDetails, setCompensationDetails] = useState(null);
  const [compensationDraft, setCompensationDraft] = useState(null);
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

  const { data: employeeRecord = {}, isLoading: isEmployeeLoading } = useQuery({
    queryKey: ["payrollEmployee", employeeId],
    enabled: Boolean(employeeId),
    queryFn: async () => {
      const response = await axios.get(
        `/api/users/fetch-single-user/${employeeId}`
      );
      return response.data;
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

  const earningDetails = userPayrollData?.earnings || {};
  const deductionDetails = userPayrollData?.deductions || {};
  const employerCostRows = [
    ["Employer ESI", deductionDetails.employerEsi],
    ["Employer PF", deductionDetails.employerPf],
    ["Employer EPF", deductionDetails.employerEpf],
    ["Employer EPS", deductionDetails.employerEps],
    ["Employer EDLI", deductionDetails.employerEdli],
    ["EPF (Admin Charges)", deductionDetails.epfAdminCharges],
    ["EDLI (Admin Charges)", deductionDetails.edliAdminCharges],
  ];

  const initialCompensationDetails = createInitialCompensationDetails(
    earningDetails,
    deductionDetails,
    month,
    employeeRecord
  );

  const deductionOptions = ["Provident Fund", "ESI"];
  const employeeHraType = String(employeeRecord?.hraType || "")
    .trim()
    .toLowerCase();
  const canAddCalculatedHra =
    Boolean(employeeHraType) && employeeHraType !== "custom";
  const availableAllowanceOptions = canAddCalculatedHra
    ? [...baseAllowanceOptions, "House Rent Allowance"]
    : baseAllowanceOptions;

  useEffect(() => {
    if (isLoading || isEmployeeLoading) return;
    const nextDetails = createInitialCompensationDetails(
      userPayrollData?.earnings,
      userPayrollData?.deductions,
      month,
      employeeRecord
    );
    setCompensationDetails(nextDetails);
    setCompensationDraft(nextDetails);
  }, [
    employeeRecord,
    isEmployeeLoading,
    isLoading,
    month,
    userPayrollData?.deductions,
    userPayrollData?.earnings,
  ]);

  const visibleCompensation =
    (isEditingCompensation ? compensationDraft : compensationDetails) ||
    initialCompensationDetails;
  const allowanceTotal = visibleCompensation.allowances.reduce(
    (total, row) => total + (Number(row.value) || 0),
    0
  );
  const deductionTotal = visibleCompensation.deductions.reduce(
    (total, row) => total + (Number(row.value) || 0),
    0
  );
  const employerCostTotal = employerCostRows.reduce(
    (total, [, value]) => total + (Number(value) || 0),
    0
  );
  const netPay = Math.max(
    0,
    Number(visibleCompensation.compensation.grossPay || 0) - deductionTotal
  );

  const cloneCompensation = (details) => JSON.parse(JSON.stringify(details));
  const handleEditCompensation = () => {
    setCompensationDraft(cloneCompensation(visibleCompensation));
    setIsEditingCompensation(true);
  };
  const handleAddBankDetails = () => {
    const nextDetails = cloneCompensation(visibleCompensation);
    nextDetails.compensation.paymentMethod = "Bank Deposit";
    setCompensationDraft(nextDetails);
    setIsEditingCompensation(true);
  };
  const handleCancelCompensation = () => {
    setCompensationDraft(cloneCompensation(compensationDetails));
    setIsEditingCompensation(false);
  };
  const handleSaveCompensation = () => {
    const hasIncompleteRow = [
      ...compensationDraft.allowances,
      ...compensationDraft.deductions,
    ].some((row) => !row.label || row.value === "");
    if (hasIncompleteRow) {
      toast.error("Select a type and enter an amount before saving");
      return;
    }
    setCompensationDetails(cloneCompensation(compensationDraft));
    setIsEditingCompensation(false);
    toast.success("Compensation changes saved on this screen only");
  };
  const updateCompensationField = (field, value) => {
    setCompensationDraft((current) => {
      const next = {
        ...current,
        compensation: { ...current.compensation, [field]: value },
      };

      if (field === "basicPay") {
        next.allowances = current.allowances.map((row) =>
          row.label === "House Rent Allowance"
            ? { ...row, value: (Number(value) || 0) * 0.5 }
            : row
        );
        next.deductions = current.deductions.map((row) =>
          row.label === "Provident Fund"
            ? { ...row, value: getEmployeePf(value) }
            : row
        );
      }

      if (field === "grossPay") {
        next.deductions = next.deductions.map((row) =>
          row.label === "ESI"
            ? {
                ...row,
                value: isEsiApplicable(employeeRecord)
                  ? getEmployeeEsi(value)
                  : 0,
              }
            : row
        );
      }

      return next;
    });
  };
  const updateDynamicRow = (section, rowId, updatedRow) => {
    setCompensationDraft((current) => ({
      ...current,
      [section]: current[section].map((row) =>
        row.id === rowId ? updatedRow : row
      ),
    }));
  };
  const removeDynamicRow = (section, rowId) => {
    setCompensationDraft((current) => ({
      ...current,
      [section]: current[section].filter((row) => row.id !== rowId),
    }));
  };
  const addDynamicRow = (section, options) => {
    const usedLabels = compensationDraft[section].map((row) => row.label);
    const hasAvailableOption = options.some(
      (option) => !usedLabels.includes(option)
    );
    if (!hasAvailableOption) {
      toast.info(`All ${section} have already been added`);
      return;
    }
    if (usedLabels.includes("")) {
      toast.info(`Select the pending ${section.slice(0, -1)} first`);
      return;
    }
    setCompensationDraft((current) => ({
      ...current,
      [section]: [
        ...current[section],
        { id: `${section}-${Date.now()}`, label: "", value: "" },
      ],
    }));
  };

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
        layout={1}
        title={"Payslip Generator"}
        headerRightContent={
          isEditingCompensation ? (
            <div className="flex items-center gap-2">
              <PrimaryButton
                title="Save"
                handleSubmit={handleSaveCompensation}
              />
              <button
                type="button"
                onClick={handleCancelCompensation}
                className="rounded-md border border-borderGray px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <PrimaryButton
              title="Edit"
              handleSubmit={handleEditCompensation}
            />
          )
        }
      >
        <div className="flex flex-col gap-5">
          <div
            ref={payslipRef}
            className="rounded-xl bg-[#f7f9fc] p-4 sm:p-6"
          >
            <div className="mb-5 rounded-xl border border-borderGray bg-white p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Employee
                  </p>
                  <h2 className="mt-1 text-title font-pmedium text-primary">
                    {employeeName || "N/A"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {employeeId || "N/A"}
                    {designation ? ` • ${designation}` : ""}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Effective pay period
                  </p>
                  <p className="mt-1 font-pmedium text-gray-800">
                    {dayjs(month).format("MMMM YYYY")}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {departmentName || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <PayrollSection title="Compensation Information">
                {isEditingCompensation ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      ["grossPay", "Gross Pay"],
                      ["basicPay", "Basic Pay"],
                      ["variablePay", "Variable Pay"],
                      ["gratuity", "Gratuity"],
                      ["ctc", "CTC"],
                    ].map(([field, label]) => (
                      <TextField
                        key={field}
                        size="small"
                        type="number"
                        label={label}
                        value={visibleCompensation.compensation[field]}
                        onChange={(event) =>
                          updateCompensationField(field, event.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <span className="mr-2 text-gray-500">₹</span>
                          ),
                        }}
                      />
                    ))}
                    <TextField
                      size="small"
                      type="date"
                      label="Appraisal/Offered Date"
                      value={visibleCompensation.compensation.appraisalDate}
                      onChange={(event) =>
                        updateCompensationField(
                          "appraisalDate",
                          event.target.value
                        )
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      size="small"
                      label="Effective Pay Period"
                      value={
                        visibleCompensation.compensation.effectivePayPeriod
                      }
                      onChange={(event) =>
                        updateCompensationField(
                          "effectivePayPeriod",
                          event.target.value
                        )
                      }
                    />
                    <TextField
                      select
                      size="small"
                      label="Payment Method"
                      value={visibleCompensation.compensation.paymentMethod}
                      onChange={(event) =>
                        updateCompensationField(
                          "paymentMethod",
                          event.target.value
                        )
                      }
                    >
                      <MenuItem value="Cash Only">Cash Only</MenuItem>
                      <MenuItem value="Bank Deposit">Bank Deposit</MenuItem>
                    </TextField>
                    {visibleCompensation.compensation.paymentMethod ===
                      "Bank Deposit" && (
                      <>
                        <TextField
                          size="small"
                          label="Bank Name"
                          value={visibleCompensation.compensation.bankName}
                          onChange={(event) =>
                            updateCompensationField(
                              "bankName",
                              event.target.value
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="Account Number"
                          value={visibleCompensation.compensation.accountNumber}
                          onChange={(event) =>
                            updateCompensationField(
                              "accountNumber",
                              event.target.value
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <CompensationRow
                      label="Gross Pay"
                      value={formatPayrollAmount(
                        visibleCompensation.compensation.grossPay
                      )}
                      period="Month"
                    />
                    <CompensationRow
                      label="Basic Pay"
                      value={formatPayrollAmount(
                        visibleCompensation.compensation.basicPay
                      )}
                      period="Month"
                    />
                    <CompensationRow
                      label="Variable Pay"
                      value={formatPayrollAmount(
                        visibleCompensation.compensation.variablePay
                      )}
                      period="Year"
                    />
                    <CompensationRow
                      label="Gratuity"
                      value={formatPayrollAmount(
                        visibleCompensation.compensation.gratuity
                      )}
                      period="Year"
                    />
                    <CompensationRow
                      label="CTC"
                      value={formatPayrollAmount(
                        visibleCompensation.compensation.ctc
                      )}
                      period="Year"
                    />
                    <CompensationRow
                      label="Appraisal/Offered Date"
                      value={
                        visibleCompensation.compensation.appraisalDate || "N/A"
                      }
                    />
                    <CompensationRow
                      label="Effective Pay Period"
                      value={
                        visibleCompensation.compensation.effectivePayPeriod ||
                        "N/A"
                      }
                    />
                    <CompensationRow
                      label="Payment Method"
                      value={
                        visibleCompensation.compensation.paymentMethod || "N/A"
                      }
                    />
                    {visibleCompensation.compensation.paymentMethod ===
                      "Bank Deposit" && (
                      <>
                        <CompensationRow
                          label="Bank Name"
                          value={
                            visibleCompensation.compensation.bankName || "N/A"
                          }
                        />
                        <CompensationRow
                          label="Account Number"
                          value={
                            visibleCompensation.compensation.accountNumber ||
                            "N/A"
                          }
                        />
                        {!visibleCompensation.compensation.bankName &&
                          !visibleCompensation.compensation.accountNumber && (
                            <button
                              type="button"
                              onClick={handleAddBankDetails}
                              className="mt-3 text-sm font-pmedium text-primary hover:underline"
                            >
                              + Add Bank Details
                            </button>
                          )}
                      </>
                    )}
                    {visibleCompensation.compensation.paymentMethod !==
                      "Bank Deposit" &&
                      !visibleCompensation.compensation.bankName &&
                      !visibleCompensation.compensation.accountNumber && (
                        <button
                          type="button"
                          onClick={handleAddBankDetails}
                          className="mt-3 text-sm font-pmedium text-primary hover:underline"
                        >
                          + Add Bank Details
                        </button>
                      )}
                  </>
                )}
              </PayrollSection>

              <PayrollSection title="Allowances" total={allowanceTotal}>
                {isEditingCompensation ? (
                  <div className="flex flex-col gap-3">
                    {visibleCompensation.allowances.map((row) =>
                      row.fixed ? (
                      <div
                        key={row.id}
                        className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(180px,0.7fr)] md:items-center"
                      >
                        <span className="text-sm text-gray-600">
                          {row.label}
                        </span>
                        <TextField
                          size="small"
                          type="number"
                          label="Amount"
                          value={row.value}
                          disabled={row.label === "House Rent Allowance"}
                          onChange={(event) =>
                            updateDynamicRow("allowances", row.id, {
                              ...row,
                              value: event.target.value,
                            })
                          }
                          InputProps={{
                            startAdornment: (
                              <span className="mr-2 text-gray-500">₹</span>
                            ),
                          }}
                        />
                      </div>
                      ) : (
                        <EditableAmountRow
                          key={row.id}
                          row={row}
                          options={availableAllowanceOptions}
                          placeholder="Select Allowance"
                          usedLabels={visibleCompensation.allowances.map(
                            (item) => item.label
                          )}
                          onChange={(updatedRow) =>
                            updateDynamicRow("allowances", row.id, {
                              ...updatedRow,
                              value:
                                updatedRow.label === "House Rent Allowance"
                                  ? Number(
                                      visibleCompensation.compensation.basicPay
                                    ) * 0.5
                                  : updatedRow.value,
                            })
                          }
                          onRemove={() =>
                            removeDynamicRow("allowances", row.id)
                          }
                          amountReadOnly={
                            row.label === "House Rent Allowance"
                          }
                        />
                      )
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        addDynamicRow(
                          "allowances",
                          availableAllowanceOptions
                        )
                      }
                      className="mt-4 text-sm font-pmedium text-primary hover:underline"
                    >
                      + Add New
                    </button>
                  </div>
                ) : (
                  visibleCompensation.allowances.map((row) => (
                    <CompensationRow
                      key={row.id}
                      label={row.label}
                      value={formatPayrollAmount(row.value)}
                    />
                  ))
                )}
              </PayrollSection>

              <PayrollSection title="Deductions" total={deductionTotal}>
                {isEditingCompensation ? (
                  <>
                    {visibleCompensation.deductions.map((row) => (
                      <EditableAmountRow
                        key={row.id}
                        row={row}
                        options={deductionOptions}
                        placeholder="Select Deduction"
                        usedLabels={visibleCompensation.deductions.map(
                          (item) => item.label
                        )}
                        onChange={(updatedRow) =>
                          updateDynamicRow("deductions", row.id, {
                            ...updatedRow,
                            value:
                              updatedRow.label === "Provident Fund"
                                ? getEmployeePf(
                                    visibleCompensation.compensation.basicPay
                                  )
                                : isEsiApplicable(employeeRecord)
                                  ? getEmployeeEsi(
                                      visibleCompensation.compensation.grossPay
                                    )
                                  : 0,
                          })
                        }
                        onRemove={() =>
                          removeDynamicRow("deductions", row.id)
                        }
                        amountReadOnly
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        addDynamicRow("deductions", deductionOptions)
                      }
                      className="mt-4 text-sm font-pmedium text-primary hover:underline"
                    >
                      + Add New
                    </button>
                    {!isEsiApplicable(employeeRecord) && (
                      <p className="mt-3 text-xs text-gray-500">
                        {Number(employeeRecord?.annualCtc) > 0
                          ? "This employee is not eligible for ESI, so its amount is kept at ₹0."
                          : "Employee CTC is unavailable, so the ESI amount is kept at ₹0."}
                      </p>
                    )}
                  </>
                ) : visibleCompensation.deductions.length ? (
                  visibleCompensation.deductions.map((row) => (
                    <CompensationRow
                      key={row.id}
                      label={row.label}
                      value={formatPayrollAmount(row.value)}
                    />
                  ))
                ) : (
                  <p className="py-5 text-center text-sm text-gray-500">
                    No deductions configured.
                  </p>
                )}
              </PayrollSection>

              <PayrollSection title="Employer Costs" total={employerCostTotal}>
                {employerCostRows.map(([label, value]) => (
                  <CompensationRow
                    key={label}
                    label={label}
                    value={formatPayrollAmount(value)}
                  />
                ))}
              </PayrollSection>

              <PayrollSection title="IT Declarations" total={0} period="Year">
                <div className="flex min-h-28 items-center justify-center text-center text-sm text-gray-500">
                  No IT declarations found for the employee.
                </div>
              </PayrollSection>

              <PayrollSection title="Pay Summary">
                <CompensationRow
                  label="Gross Earnings"
                  value={formatPayrollAmount(
                    visibleCompensation.compensation.grossPay
                  )}
                />
                <CompensationRow
                  label="Total Deductions"
                  value={formatPayrollAmount(deductionTotal)}
                />
                <div className="mt-2 border-t border-borderGray pt-2">
                  <CompensationRow
                    label="Net Pay"
                    value={formatPayrollAmount(netPay)}
                  />
                </div>
              </PayrollSection>
            </div>

            <p className="mt-5 text-center text-xs text-gray-500">
              Compensation edits are currently saved on this screen only and
              are not sent to the backend.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {status !== "Completed" && (
              <PrimaryButton
                title={"Generate Payslip"}
                handleSubmit={handleGeneratePayslip}
                disabled={isPayrollPending}
                isLoading={isPayrollPending}
              />
            )}

            <PrimaryButton
              title={"Download Payslip"}
              handleSubmit={handleDownloadPayslip}
            />
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

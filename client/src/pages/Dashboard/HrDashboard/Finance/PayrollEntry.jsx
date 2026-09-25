import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MenuItem, TextField } from "@mui/material";
import {
  MdDeleteOutline,
  MdCheckCircle,
  MdEdit,
  MdRadioButtonUnchecked,
  MdUndo,
  MdWarning,
} from "react-icons/md";
import PageFrame from "../../../../components/Pages/PageFrame";
import AgTable from "../../../../components/AgTable";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormatExact as inrFormat } from "../../../../utils/currencyFormat";
import { downloadCsv } from "../../../../utils/downloadCsv";
import { toast } from "sonner";
import { queryClient } from "../../../../main";

const SummarySection = ({ title, rows }) => (
  <section>
    <h2 className="border-b pb-3 font-pmedium text-subtitle font-semibold text-primary">
      {title}
    </h2>
    <div className="mx-auto mt-4 grid max-w-sm grid-cols-[1fr_auto] gap-x-5 gap-y-3 text-content">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <span className="text-right text-gray-500">{label}</span>
          <span className="font-medium">{value}</span>
        </div>
      ))}
    </div>
  </section>
);

const ChecklistItem = ({ icon, title, children, onClick, disabled = false }) => {
  const content = (
    <>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <span className="min-w-0">
        <span className="block text-left font-medium text-sky-600">{title}</span>
        {children && (
          <span className="mt-1 block text-left text-sm text-gray-500">
            {children}
          </span>
        )}
      </span>
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-start gap-3 rounded px-2 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
    >
      {content}
    </button>
  ) : (
    <div className="flex items-start gap-3 px-2 py-2">{content}</div>
  );
};

const numberValue = (value) => Number(value) || 0;
const baseAllowanceOptions = [
  "Special Allowance",
  "Conveyance Allowance",
  "Medical Allowance",
  "Children Education Allowance",
  "Dearness Allowance",
  "Other Allowance",
  "Arrears",
];
const additionalDeductionOptions = [
  "Adjustments",
  "Voluntary Provident Fund",
  "LWF",
  "Employer LWF",
  "Recovery",
];
const isEnabled = (value) =>
  value === true || ["true", "yes"].includes(String(value).toLowerCase());
const getPf = (basic) => (numberValue(basic) >= 15000 ? 1800 : numberValue(basic) * 0.12);

const EditablePayrollRow = ({ row, options, usedLabels, onChange, onRemove, readOnly }) => (
  <div className="grid grid-cols-1 gap-3 border-b py-3 sm:grid-cols-[minmax(0,1fr)_minmax(160px,0.7fr)_auto]">
    <TextField
      select
      size="small"
      label="Type"
      value={row.label}
      onChange={(event) => onChange({ ...row, label: event.target.value })}
    >
      <MenuItem value="" disabled>Select Type</MenuItem>
      {options
        .filter((option) => option === row.label || !usedLabels.includes(option))
        .map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </TextField>
    <TextField
      size="small"
      type="number"
      label="Amount"
      value={row.amount}
      disabled={readOnly}
      onChange={(event) => onChange({ ...row, amount: event.target.value })}
      InputProps={{ startAdornment: <span className="mr-2 text-gray-500">INR</span> }}
    />
    <button type="button" onClick={onRemove} className="rounded border border-red-200 px-3 text-sm text-red-600">
      Remove
    </button>
  </div>
);
const dummyEmployees = [
  {
    id: "dummy-payroll-employee-1",
    employee: "dummy-payroll-employee-1",
    employeeName: "Muskan Dodmani",
    employeeId: "B00081",
    gross: 21825,
    actualGross: 22598,
    basic: 15886,
    allowances: 6482,
    deductions: 1800,
    lossOfPayDays: 1.06,
    lossOfPay: 773,
    incomeTax: 0,
    surcharge: 0,
    cess: 0,
    netAmount: 20025,
    payrollNotes: "",
    includePF: true,
    includeEsi: false,
    annualCtc: 294576,
    hraType: "Custom",
    employeeType: "Full Time",
    allowanceItems: [
      { label: "Conveyance Allowance", amount: 1545 },
      { label: "Medical Allowance", amount: 1207 },
      { label: "Special Allowance", amount: 3730 },
    ],
    deductionItems: [
      { label: "Provident Fund", amount: 1800 },
      { label: "Profession Tax (Goa)", amount: 0 },
    ],
  },
  {
    id: "dummy-payroll-employee-2",
    employee: "dummy-payroll-employee-2",
    employeeName: "Mikasa Ackerman",
    employeeId: "B000193",
    gross: 22500,
    actualGross: 22500,
    basic: 13500,
    allowances: 9000,
    deductions: 1800,
    lossOfPayDays: 0,
    lossOfPay: 0,
    incomeTax: 0,
    surcharge: 0,
    cess: 0,
    netAmount: 20700,
    payrollNotes: "",
    includePF: true,
    includeEsi: false,
    annualCtc: 270000,
    hraType: "Custom",
    employeeType: "Full Time",
    allowanceItems: [{ label: "Special Allowance", amount: 9000 }],
    deductionItems: [{ label: "Provident Fund", amount: 1800 }],
  },
  {
    id: "dummy-payroll-employee-3",
    employee: "dummy-payroll-employee-3",
    employeeName: "Sheryl Vales",
    employeeId: "B000194",
    gross: 14166.67,
    actualGross: 14166.67,
    basic: 8500,
    allowances: 5666.67,
    deductions: 1020,
    lossOfPayDays: 0.5,
    lossOfPay: 272.44,
    incomeTax: 0,
    surcharge: 0,
    cess: 0,
    netAmount: 12874.23,
    payrollNotes: "",
    includePF: true,
    includeEsi: true,
    annualCtc: 170000,
    hraType: "Standard",
    employeeType: "Full Time",
    allowanceItems: [{ label: "Special Allowance", amount: 5666.67 }],
    deductionItems: [{ label: "Provident Fund", amount: 1020 }],
  },
];

const buildEmployeeRows = (draft) => {
  const savedRows = Array.isArray(draft?.employeeSummaries)
    ? draft.employeeSummaries.filter((employee) => !employee.isExcluded)
    : [];
  const hasSavedSummaries = Array.isArray(draft?.employeeSummaries) &&
    draft.employeeSummaries.length > 0;
  const initialRows = hasSavedSummaries ? savedRows : dummyEmployees;
  return initialRows.map((employee, index) => ({
    ...employee,
    id: employee.employee || employee.id || `${employee.employeeId}-${index}`,
    srNo: index + 1,
  }));
};

const PayrollEntry = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const { draftId } = useParams();
  const [employeeRows, setEmployeeRows] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showUndoConfirmation, setShowUndoConfirmation] = useState(false);
  const [employeeToUndo, setEmployeeToUndo] = useState(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showVoidConfirmation, setShowVoidConfirmation] = useState(false);
  const [showReleasePayslips, setShowReleasePayslips] = useState(false);
  const [sendPayslipEmails, setSendPayslipEmails] = useState("yes");
  const [isPayrollSubmitted, setIsPayrollSubmitted] = useState(false);
  const { data: draft, isLoading, refetch: refetchDraft } = useQuery({
    queryKey: ["payrollDraft", draftId],
    queryFn: async () => {
      const response = await axios.get(`/api/payroll/drafts/${draftId}`);
      return response.data;
    },
  });
  const { mutateAsync: updateDraftEmployee, isPending: isSavingEmployee } =
    useMutation({
      mutationFn: async ({ employeeId, payload }) => {
        const response = await axios.patch(
          `/api/payroll/drafts/${draftId}/employees/${employeeId}`,
          payload
        );
        return response.data;
      },
    });
  const { mutateAsync: excludeDraftEmployees, isPending: isDeletingEmployees } =
    useMutation({
      mutationFn: async (employeeIds) => {
        const response = await axios.patch(
          `/api/payroll/drafts/${draftId}/employees`,
          { employeeIds }
        );
        return response.data;
      },
    });
  const { mutateAsync: submitDraft, isPending: isSubmittingPayroll } =
    useMutation({
      mutationFn: async () => {
        const response = await axios.post(`/api/payroll/drafts/${draftId}/submit`);
        return response.data;
      },
    });
  const { mutateAsync: voidDraft, isPending: isVoidingPayroll } = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`/api/payroll/drafts/${draftId}`);
      return response.data;
    },
  });
  const { mutateAsync: releasePayslips, isPending: isReleasingPayslips } =
    useMutation({
      mutationFn: async (sendEmails) => {
        const response = await axios.post(
          `/api/payroll/drafts/${draftId}/release-payslips`,
          { sendEmails }
        );
        return response.data;
      },
    });
  const { mutateAsync: retryPayslipEmails, isPending: isRetryingPayslipEmails } =
    useMutation({
      mutationFn: async () => {
        const response = await axios.post(
          `/api/payroll/drafts/${draftId}/retry-payslip-emails`
        );
        return response.data;
      },
    });
  const {
    data: payslipEmailStatus,
    refetch: refetchPayslipEmailStatus,
    isFetching: isFetchingPayslipEmailStatus,
  } = useQuery({
    queryKey: ["payrollPayslipEmailStatus", draftId],
    enabled: Boolean(showReleasePayslips && draft?.payslipsReleasedAt),
    queryFn: async () => {
      const response = await axios.get(
        `/api/payroll/drafts/${draftId}/payslip-email-status`
      );
      return response.data;
    },
  });
  const { mutateAsync: undoDraftChange, isPending: isUndoingDraft } =
    useMutation({
      mutationFn: async () => {
        const response = await axios.post(`/api/payroll/drafts/${draftId}/undo`);
        return response.data;
      },
    });
  const {
    mutateAsync: undoEmployeeChange,
    isPending: isUndoingEmployee,
  } = useMutation({
    mutationFn: async (employeeId) => {
      const response = await axios.post(
        `/api/payroll/drafts/${draftId}/employees/${employeeId}/undo`
      );
      return response.data;
    },
  });
  const { mutateAsync: fetchPayrollExport, isPending: isExportingPayroll } =
    useMutation({
      mutationFn: async () => {
        const response = await axios.get(
          `/api/payroll/drafts/${draftId}/export`
        );
        return response.data;
      },
    });
  const { data: fetchedEmployee = {} } = useQuery({
    queryKey: ["payrollEntryEmployee", editingEmployee?.employeeId],
    enabled: Boolean(
      editingEmployee?.employeeId &&
        !String(editingEmployee?.employee || "").startsWith("dummy-")
    ),
    queryFn: async () => {
      const response = await axios.get(
        `/api/users/fetch-single-user/${editingEmployee.employeeId}`
      );
      return response.data;
    },
  });

  useEffect(() => {
    if (!editingEmployee || !Object.keys(fetchedEmployee).length) return;
    const employeePayroll = fetchedEmployee.payrollInformation || fetchedEmployee;
    const employeeHraType = String(
      employeePayroll.hraType || fetchedEmployee.hraType || ""
    ).toLowerCase();
    if (!employeeHraType || employeeHraType === "custom") return;
    setEditingEmployee((employee) => {
      if (
        !employee ||
        (employee.allowanceItems || []).some(
          (row) => row.label === "House Rent Allowance"
        )
      ) {
        return employee;
      }
      const hra = numberValue(employee.basic) * 0.5;
      const allowanceItems = [
        ...(employee.allowanceItems || []),
        {
          id: `allowance-hra-${employee.id}`,
          label: "House Rent Allowance",
          amount: hra,
        },
      ];
      const allowances = allowanceItems.reduce(
        (total, row) => total + numberValue(row.amount),
        0
      );
      const actualGross = numberValue(employee.basic) + allowances;
      const gross = Math.max(0, actualGross - numberValue(employee.lossOfPay));
      return {
        ...employee,
        allowanceItems,
        allowances,
        actualGross,
        gross,
        netAmount: Math.max(0, gross - numberValue(employee.deductions)),
      };
    });
  }, [editingEmployee, fetchedEmployee]);

  useEffect(() => {
    if (!draft) return;
    setEmployeeRows(buildEmployeeRows(draft));
    setSelectedEmployees([]);
    setIsPayrollSubmitted(draft.status === "Processed");
  }, [draft]);

  if (isLoading) {
    return <PageFrame>Loading payroll entry...</PageFrame>;
  }

  if (!draft) {
    return <PageFrame>Payroll entry not found.</PageFrame>;
  }

  const workflowSteps = [
    "Compensation",
    "Time & Attendance",
    "IT Declarations",
    "Leave Encashment",
    "Review",
  ];
  const createdBy = [draft.createdBy?.firstName, draft.createdBy?.lastName]
    .filter(Boolean)
    .join(" ") || "N/A";
  const isProcessed = draft.status === "Processed";
  const processedDate = dayjs(draft.submittedAt || draft.runDate || draft.updatedAt);
  const complianceDueMonth = dayjs(draft.payPeriod).add(1, "month");
  const totalTds =
    numberValue(draft.incomeTax) +
    numberValue(draft.surcharge) +
    numberValue(draft.cess);
  const totalPf =
    numberValue(draft.employeePf) +
    numberValue(draft.employerPf) +
    numberValue(draft.voluntaryProvidentFund);
  const totalEsi = numberValue(draft.employeeEsi) + numberValue(draft.employerEsi);
  const releaseSummary = draft.payslipReleaseSummary || {};
  const generatedPayslipCount = numberValue(releaseSummary.generated);
  const sentPayslipCount = numberValue(releaseSummary.sent);
  const failedPayslipEmailCount =
    numberValue(releaseSummary.failed) + numberValue(releaseSummary.skipped);
  const payslipsGenerated =
    generatedPayslipCount > 0 || Boolean(draft.payslipsReleasedAt);
  const allPayslipEmailsSent =
    generatedPayslipCount > 0 && sentPayslipCount >= generatedPayslipCount;
  const isReleasingOrRetrying =
    isReleasingPayslips || isRetryingPayslipEmails;

  const handleReleasePayslips = async () => {
    try {
      const shouldSendEmails = sendPayslipEmails === "yes";
      const response =
        payslipsGenerated && shouldSendEmails
          ? await retryPayslipEmails()
          : await releasePayslips(shouldSendEmails);
      await refetchDraft();
      await queryClient.invalidateQueries({ queryKey: ["employeePayslips"] });
      await queryClient.invalidateQueries({ queryKey: ["payslips"] });
      await queryClient.invalidateQueries({
        queryKey: ["payrollPayslipEmailStatus", draftId],
      });
      const failedToSend =
        numberValue(response.summary?.failed) +
        numberValue(response.summary?.skipped);
      if (shouldSendEmails && failedToSend > 0) {
        setShowReleasePayslips(true);
        await refetchPayslipEmailStatus();
        toast.warning(
          `${numberValue(response.summary?.sent)} email(s) sent; ${failedToSend} could not be sent. Review the reasons and retry.`
        );
      } else {
        setShowReleasePayslips(false);
        toast.success(response.message || "Payslips generated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate payslips");
    }
  };
  const confirmVoidPayroll = async () => {
    try {
      const response = await voidDraft();
      await queryClient.invalidateQueries({ queryKey: ["payrollDrafts"] });
      setShowVoidConfirmation(false);
      toast.success(response.message || "Payroll draft voided successfully");
      navigate("/app/dashboard/HR-dashboard/mix-bag/payroll-summary", {
        replace: true,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to void payroll draft");
    }
  };
  const saveEmployeeEdit = async () => {
    const allowanceItems = (editingEmployee.allowanceItems || []).map((row) => ({
      ...row,
      amount: normalizeRuleAmount(row.label, row.amount),
    }));
    const deductionItems = (editingEmployee.deductionItems || []).map((row) => ({
      ...row,
      amount: normalizeRuleAmount(row.label, row.amount),
    }));
    const savedEmployee = recalculateEmployee(
      editingEmployee,
      allowanceItems,
      deductionItems
    );
    const isDummy = String(editingEmployee.employee || "").startsWith("dummy-");
    if (isDummy) {
      setEmployeeRows((currentRows) =>
        currentRows.map((row) =>
          row.id === editingEmployee.id ? savedEmployee : row
        )
      );
      setEditingEmployee(null);
      return;
    }
    try {
      const response = await updateDraftEmployee({
        employeeId: editingEmployee.employee,
        payload: {
          allowanceItems,
          deductionItems,
          lossOfPayDays: savedEmployee.lossOfPayDays,
          lossOfPay: savedEmployee.lossOfPay,
          payrollNotes: savedEmployee.payrollNotes,
        },
      });
      setEmployeeRows(buildEmployeeRows(response.data));
      setEditingEmployee(null);
      await refetchDraft();
      await queryClient.invalidateQueries({ queryKey: ["payrollDrafts"] });
      toast.success(response.message || "Employee payroll updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update employee payroll");
    }
  };
  const employeeRules = Object.keys(fetchedEmployee).length
    ? fetchedEmployee
    : editingEmployee || {};
  const payrollInfo = employeeRules.payrollInformation || employeeRules;
  const pfEnabled = isEnabled(payrollInfo.includePF);
  const monthlyCtc =
    numberValue(employeeRules.annualCtc || employeeRules.salaryPackage?.grossAnnual) / 12;
  const esiEnabled = isEnabled(payrollInfo.includeEsi) && monthlyCtc > 0 && monthlyCtc < 21000;
  const employeeType = String(
    employeeRules.employeeType?.name || employeeRules.employeeType || ""
  ).toLowerCase();
  const isTdsWorker = employeeType.includes("intern") || employeeType.includes("consultant");
  const hraType = String(payrollInfo.hraType || employeeRules.hraType || "").toLowerCase();
  const canUseHra = Boolean(hraType) && hraType !== "custom";
  const allowanceOptions = canUseHra
    ? [...baseAllowanceOptions, "House Rent Allowance"]
    : baseAllowanceOptions;
  const deductionOptions = [
    ...(isTdsWorker ? ["TDS"] : ["Provident Fund", "ESI"]),
    ...additionalDeductionOptions,
  ];

  const recalculateEmployee = (employee, nextAllowances, nextDeductions) => {
    const allowances = nextAllowances.reduce(
      (total, row) => total + numberValue(row.amount), 0
    );
    const actualGross = numberValue(employee.basic) + allowances;
    const deductions = nextDeductions.reduce(
      (total, row) => total + numberValue(row.amount), 0
    );
    const gross = Math.max(0, actualGross - numberValue(employee.lossOfPay));
    return {
      ...employee,
      allowanceItems: nextAllowances,
      deductionItems: nextDeductions,
      allowances,
      deductions,
      actualGross,
      gross,
      netAmount: Math.max(0, gross - deductions),
    };
  };

  const normalizeRuleAmount = (label, currentAmount = 0) => {
    if (label === "House Rent Allowance") return numberValue(editingEmployee?.basic) * 0.5;
    if (label === "Provident Fund") return pfEnabled ? getPf(editingEmployee?.basic) : 0;
    if (label === "ESI") return esiEnabled ? numberValue(editingEmployee?.actualGross) * 0.0075 : 0;
    if (label === "TDS") return numberValue(editingEmployee?.basic) * 0.1;
    return currentAmount;
  };

  const updatePayrollRows = (section, rowId, updatedRow) => {
    setEditingEmployee((employee) => {
      const allowanceRows = employee.allowanceItems || [];
      const deductionRows = employee.deductionItems || [];
      const normalizedRow = {
        ...updatedRow,
        amount: normalizeRuleAmount(updatedRow.label, updatedRow.amount),
      };
      const nextAllowances = section === "allowanceItems"
        ? allowanceRows.map((row) => row.id === rowId ? normalizedRow : row)
        : allowanceRows;
      const nextDeductions = section === "deductionItems"
        ? deductionRows.map((row) => row.id === rowId ? normalizedRow : row)
        : deductionRows;
      return recalculateEmployee(employee, nextAllowances, nextDeductions);
    });
  };

  const addPayrollRow = (section, options) => {
    setEditingEmployee((employee) => {
      const currentRows = employee[section] || [];
      const available = options.find(
        (option) => !currentRows.some((row) => row.label === option)
      );
      if (!available) return employee;
      const nextRows = [
        ...currentRows,
        { id: `${section}-${Date.now()}`, label: available, amount: normalizeRuleAmount(available, 0) },
      ];
      return recalculateEmployee(
        employee,
        section === "allowanceItems" ? nextRows : employee.allowanceItems || [],
        section === "deductionItems" ? nextRows : employee.deductionItems || []
      );
    });
  };

  const removePayrollRow = (section, rowId) => {
    setEditingEmployee((employee) => {
      const nextRows = (employee[section] || []).filter((row) => row.id !== rowId);
      return recalculateEmployee(
        employee,
        section === "allowanceItems" ? nextRows : employee.allowanceItems || [],
        section === "deductionItems" ? nextRows : employee.deductionItems || []
      );
    });
  };

  const openEmployeeEdit = (employee) => {
    let allowanceItems = (employee.allowanceItems?.length
      ? employee.allowanceItems
      : [{ label: "Special Allowance", amount: employee.allowances }]
    ).map((row, index) => ({ ...row, id: row.id || `allowance-${index}` }));
    const employeeHraType = String(
      employee.payrollInformation?.hraType || employee.hraType || ""
    ).toLowerCase();
    if (
      employeeHraType &&
      employeeHraType !== "custom" &&
      !allowanceItems.some((row) => row.label === "House Rent Allowance")
    ) {
      allowanceItems = [
        ...allowanceItems,
        {
          id: `allowance-hra-${employee.id}`,
          label: "House Rent Allowance",
          amount: numberValue(employee.basic) * 0.5,
        },
      ];
    }
    const deductionItems = (employee.deductionItems?.length
      ? employee.deductionItems
      : [{ label: "Provident Fund", amount: employee.deductions }]
    ).map((row, index) => ({ ...row, id: row.id || `deduction-${index}` }));
    setEditingEmployee({
      ...employee,
      lossOfPay: numberValue(employee.lossOfPay).toFixed(2),
      allowanceItems,
      deductionItems,
    });
  };
  const confirmEmployeeDelete = async () => {
    const selectedIds = new Set(selectedEmployees.map((employee) => employee.id));
    const persistedEmployees = selectedEmployees.filter(
      (employee) => !String(employee.employee || "").startsWith("dummy-")
    );
    try {
      if (persistedEmployees.length) {
        const response = await excludeDraftEmployees(
          persistedEmployees.map((employee) => employee.employee)
        );
        setEmployeeRows(buildEmployeeRows(response.data));
        await refetchDraft();
        await queryClient.invalidateQueries({ queryKey: ["payrollDrafts"] });
        toast.success(response.message);
      } else {
        setEmployeeRows((currentRows) =>
          currentRows
            .filter((row) => !selectedIds.has(row.id))
            .map((row, index) => ({ ...row, srNo: index + 1 }))
        );
      }
      setSelectedEmployees([]);
      setShowDeleteConfirmation(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete employees");
    }
  };
  const toggleEmployeeForDelete = (employee) => {
    setSelectedEmployees((currentEmployees) =>
      currentEmployees.some((item) => item.id === employee.id)
        ? currentEmployees.filter((item) => item.id !== employee.id)
        : [...currentEmployees, employee]
    );
  };
  const handleUndo = () => {
    if (selectedEmployees.length > 0) {
      setSelectedEmployees([]);
      toast.success("Delete selection cleared");
      return;
    }
    setShowUndoConfirmation(true);
  };
  const confirmDraftUndo = async () => {
    try {
      const response = await undoDraftChange();
      setEmployeeRows(buildEmployeeRows(response.data));
      setSelectedEmployees([]);
      setShowUndoConfirmation(false);
      await refetchDraft();
      await queryClient.invalidateQueries({ queryKey: ["payrollDrafts"] });
      toast.success(response.message || "Last payroll draft change undone");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to undo payroll draft change");
    }
  };
  const confirmEmployeeUndo = async () => {
    if (!employeeToUndo?.employee) return;
    try {
      const response = await undoEmployeeChange(employeeToUndo.employee);
      setEmployeeRows(buildEmployeeRows(response.data));
      setSelectedEmployees((currentEmployees) =>
        currentEmployees.filter((item) => item.id !== employeeToUndo.id)
      );
      setEmployeeToUndo(null);
      await refetchDraft();
      await queryClient.invalidateQueries({ queryKey: ["payrollDrafts"] });
      toast.success(response.message || "Employee payroll change undone");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to undo employee payroll change");
    }
  };
  const confirmPayrollSubmit = async () => {
    try {
      const response = await submitDraft();
      setIsPayrollSubmitted(true);
      setShowSubmitConfirmation(false);
      await refetchDraft();
      await queryClient.invalidateQueries({ queryKey: ["payrollDrafts"] });
      toast.success(response.message || "Payroll processed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process payroll");
    }
  };
  const exportPayrollDetails = async () => {
    try {
      const rows = await fetchPayrollExport();
      if (!Array.isArray(rows) || rows.length === 0) {
        toast.error("No payroll employees are available to export");
        return;
      }
      downloadCsv({
        data: rows,
        fileName: `payroll-detailed-${draft?.batchName || "batch"}-${dayjs(
          draft?.payPeriod
        ).format("YYYY-MM")}`,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to export payroll details"
      );
    }
  };
  const employeeColumns = [
    { field: "srNo", headerName: "Sr No", width: 80 },
    { field: "employeeName", headerName: "Employee Name", minWidth: 180, flex: 1 },
    { field: "employeeId", headerName: "Employee ID", minWidth: 130 },
    { field: "gross", headerName: "Gross (INR)", minWidth: 130, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "actualGross", headerName: "Actual Gross (INR)", minWidth: 165, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "basic", headerName: "Basic (INR)", minWidth: 125, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "allowances", headerName: "Allowances (INR)", minWidth: 155, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "deductions", headerName: "Deductions (INR)", minWidth: 155, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "lossOfPay", headerName: "Loss of Pay (INR)", minWidth: 160, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "incomeTax", headerName: "Income Tax (INR)", minWidth: 150, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "surcharge", headerName: "Surcharge (INR)", minWidth: 145, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "cess", headerName: "Cess (INR)", minWidth: 120, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    { field: "netAmount", headerName: "Net Amount (INR)", minWidth: 155, valueFormatter: ({ value }) => inrFormat(numberValue(value)) },
    {
      field: "action",
      headerName: "Action",
      width: 140,
      pinned: "right",
      lockPinned: true,
      sortable: false,
      filter: false,
      suppressCsvExport: true,
      cellRenderer: ({ data: employee }) => {
        const isMarkedForDelete = selectedEmployees.some(
          (item) => item.id === employee.id
        );
        const canUndoEmployee = (draft.undoableEmployeeIds || []).some(
          (employeeId) => String(employeeId) === String(employee.employee)
        );
        return (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              title={
                isProcessed
                  ? "Processed payroll cannot be changed"
                  : isMarkedForDelete || canUndoEmployee
                    ? "Undo changes for this employee"
                    : "No changes to undo"
              }
              aria-label={`Undo changes for ${employee.employeeName}`}
              onClick={() => {
                if (isMarkedForDelete) {
                  toggleEmployeeForDelete(employee);
                  return;
                }
                setEmployeeToUndo(employee);
              }}
              disabled={
                isProcessed ||
                (!isMarkedForDelete && !canUndoEmployee) ||
                isUndoingEmployee
              }
              className="rounded p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              <MdUndo size={20} />
            </button>
            <button
              type="button"
              title="Edit payroll entry"
              aria-label={`Edit ${employee.employeeName}`}
              onClick={() => openEmployeeEdit(employee)}
              disabled={isProcessed}
              className="rounded p-2 text-primary hover:bg-blue-50"
            >
              <MdEdit size={20} />
            </button>
            <button
              type="button"
              title={isMarkedForDelete ? "Remove from deletion" : "Mark for deletion"}
              aria-label={`${isMarkedForDelete ? "Unmark" : "Mark"} ${employee.employeeName} for deletion`}
              onClick={() => toggleEmployeeForDelete(employee)}
              disabled={isProcessed}
              className={`rounded p-2 hover:bg-red-50 ${
                isMarkedForDelete ? "bg-red-100 text-red-700" : "text-red-500"
              }`}
            >
              <MdDeleteOutline size={20} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <PageFrame>
      <div className="flex flex-col gap-8 p-2">
        <h1 className="text-title font-semibold text-primary">Payroll Entry</h1>

        <div className="grid overflow-hidden rounded-md border md:grid-cols-6">
          {workflowSteps.map((step) => (
            <div
              key={step}
              className="flex min-h-20 items-center gap-3 border-b-2 border-b-green-500 bg-green-50 p-3 md:border-r"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 font-semibold text-white">
                ✓
              </span>
              <span className="font-semibold text-green-700">{step}</span>
            </div>
          ))}
          <div className="flex min-h-20 items-center gap-3 border-b-2 border-b-primary bg-blue-50 p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white">
              6
            </span>
            <span>
              <span className="block font-semibold text-primary">Submit</span>
              <span className="block text-xs text-gray-500">Process payroll</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b pb-4 text-content">
          <span>
            Pay Period: {dayjs(draft.payPeriod).startOf("month").format("DD MMM, YYYY")} - {dayjs(draft.payPeriod).endOf("month").format("DD MMM, YYYY")}
          </span>
          <span className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-600">
            {draft.status}
          </span>
          <div className="ml-auto flex items-center gap-3">
            {!isProcessed && (
              <SecondaryButton
                title="Void Payroll"
                handleSubmit={() => setShowVoidConfirmation(true)}
                disabled={isVoidingPayroll}
              />
            )}
            <PrimaryButton
              title={isPayrollSubmitted ? "Processed" : "Submit Payroll"}
              handleSubmit={() => setShowSubmitConfirmation(true)}
              disabled={isPayrollSubmitted || isSubmittingPayroll}
              isLoading={isSubmittingPayroll}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
          <SummarySection
            title="Payroll Summary"
            rows={[
              ["Payroll Type", draft.payrollType],
              ["Employee Count", draft.employeeCount],
              ["Gross", inrFormat(numberValue(draft.grossAmount))],
              ["Net Amount", inrFormat(numberValue(draft.netAmount))],
              ["Loss Of Pay", inrFormat(numberValue(draft.lossOfPay))],
            ]}
          />
          <SummarySection
            title="TDS Summary"
            rows={[
              ["Income Tax", inrFormat(numberValue(draft.incomeTax))],
              ["Surcharge", inrFormat(numberValue(draft.surcharge))],
              ["CESS", inrFormat(numberValue(draft.cess))],
              ["Total TDS", inrFormat(numberValue(draft.incomeTax) + numberValue(draft.surcharge) + numberValue(draft.cess))],
              ["Total TDS Rounded", inrFormat(Math.round(numberValue(draft.incomeTax) + numberValue(draft.surcharge) + numberValue(draft.cess)))],
            ]}
          />
          <SummarySection
            title="PF Summary"
            rows={[
              ["Employee Contribution (EE)", inrFormat(numberValue(draft.employeePf))],
              ["Employer Contribution (ER)", inrFormat(numberValue(draft.employerPf))],
              ["Voluntary Provident Fund", inrFormat(numberValue(draft.voluntaryProvidentFund))],
              ["Total PF", inrFormat(numberValue(draft.employeePf) + numberValue(draft.employerPf) + numberValue(draft.voluntaryProvidentFund))],
              ["Employees (count)", numberValue(draft.pfEmployeeCount)],
            ]}
          />
          <SummarySection
            title="ESI/Prof. Tax Summary"
            rows={[
              ["ESI Employee Contribution", inrFormat(numberValue(draft.employeeEsi))],
              ["ESI Employer Contribution", inrFormat(numberValue(draft.employerEsi))],
              ["Total ESI", inrFormat(numberValue(draft.employeeEsi) + numberValue(draft.employerEsi))],
              ["ESI Employees (count)", numberValue(draft.esiEmployeeCount)],
            ]}
          />
          {isProcessed && (
            <section className="lg:col-span-2">
              <h2 className="border-b pb-3 font-pmedium text-subtitle font-semibold text-primary">
                Post Payroll Checklist
              </h2>
              <div className="mt-3 space-y-1">
                <ChecklistItem
                  icon={
                    allPayslipEmailsSent ? (
                      <MdCheckCircle size={18} className="text-green-600" />
                    ) : payslipsGenerated && failedPayslipEmailCount > 0 ? (
                      <MdWarning size={18} className="text-amber-500" />
                    ) : payslipsGenerated ? (
                      <MdCheckCircle size={18} className="text-sky-500" />
                    ) : (
                      <MdRadioButtonUnchecked
                        size={18}
                        className="text-gray-400"
                      />
                    )
                  }
                  title="Release Payslips"
                  onClick={() => {
                    if (!allPayslipEmailsSent) {
                      if (payslipsGenerated) setSendPayslipEmails("yes");
                      setShowReleasePayslips(true);
                    }
                  }}
                  disabled={allPayslipEmailsSent}
                />
                <ChecklistItem
                  icon={
                    <MdRadioButtonUnchecked
                      size={18}
                      className="text-gray-400"
                    />
                  }
                  title="Pay Date & Payment Method"
                >
                  <span className="block">
                    Pay Date: {processedDate.isValid() ? processedDate.format("DD MMM, YYYY") : "N/A"}
                  </span>
                  <span className="block">
                    Bank Deposit: {numberValue(draft.employeeCount)}, Cash: 0,
                    Cheque: 0
                  </span>
                </ChecklistItem>
                <ChecklistItem
                  icon={<MdWarning size={18} className="text-amber-500" />}
                  title="TDS Payment Tracking"
                >
                  <span className="flex flex-wrap justify-between gap-x-8">
                    <span>Amount: {inrFormat(totalTds)}</span>
                    <span>Due Date: {complianceDueMonth.date(7).format("DD MMM, YYYY")}</span>
                  </span>
                </ChecklistItem>
                <ChecklistItem
                  icon={<MdWarning size={18} className="text-amber-500" />}
                  title="EPF Transfer & Filing Check"
                >
                  <span className="flex flex-wrap justify-between gap-x-8">
                    <span>Amount: {inrFormat(totalPf)}</span>
                    <span>Due Date: {complianceDueMonth.date(15).format("DD MMM, YYYY")}</span>
                  </span>
                </ChecklistItem>
                <ChecklistItem
                  icon={<MdWarning size={18} className="text-amber-500" />}
                  title="ESI Transfer & Filing Check"
                >
                  <span className="flex flex-wrap justify-between gap-x-8">
                    <span>Amount: {inrFormat(totalEsi)}</span>
                    <span>Due Date: {complianceDueMonth.date(15).format("DD MMM, YYYY")}</span>
                  </span>
                </ChecklistItem>
              </div>
            </section>
          )}
          <SummarySection
            title="Activity"
            rows={[
              ["Started On", dayjs(draft.createdAt).format("DD MMM, YYYY [at] hh:mm A")],
              ["Started By", createdBy],
            ]}
          />
        </div>

        <div className="border-t pt-6">
          <AgTable
            data={employeeRows}
            columns={employeeColumns}
            search
            searchBottomContent={
              <div className="flex flex-wrap items-center gap-3">
                <span
                  title={
                    isProcessed
                      ? "Processed payroll cannot be changed"
                      : selectedEmployees.length === 0 && !draft.canUndo
                        ? "No changes to undo"
                        : "Undo the latest payroll draft change"
                  }
                  className={
                    isProcessed ||
                    (selectedEmployees.length === 0 && !draft.canUndo)
                      ? "cursor-not-allowed"
                      : ""
                  }
                >
                  <SecondaryButton
                    title="Undo"
                    handleSubmit={handleUndo}
                    externalStyles="disabled:!cursor-not-allowed"
                    disabled={
                      isProcessed ||
                      (selectedEmployees.length === 0 && !draft.canUndo) ||
                      isUndoingDraft
                    }
                    isLoading={isUndoingDraft}
                  />
                </span>
                <PrimaryButton
                  title="Payroll Detailed Export"
                  handleSubmit={exportPayrollDetails}
                  disabled={isExportingPayroll}
                  isLoading={isExportingPayroll}
                />
                {selectedEmployees.length > 0 && (
                  <PrimaryButton
                    title={`Delete (${selectedEmployees.length})`}
                    handleSubmit={() => setShowDeleteConfirmation(true)}
                    externalStyles="!bg-red-600"
                  />
                )}
              </div>
            }
            getRowStyle={({ data: employee }) =>
              selectedEmployees.some((item) => item.id === employee.id)
                ? { backgroundColor: "#fef2f2" }
                : undefined
            }
            tableTitle="Employee Summary"
            tableHeight={420}
          />
        </div>
      </div>

      <MuiModal
        open={showReleasePayslips}
        onClose={() => setShowReleasePayslips(false)}
        title="Release Payslips"
        widthClass="w-[90%] max-w-4xl"
      >
        <div className="flex min-h-72 flex-col">
          <p className="text-content text-gray-700">
            Please confirm whether employees should be notified about their
            payslips for this pay period. Only employees with an email address
            in their contact information will receive the payslip email.
          </p>

          <fieldset className="mt-7 flex flex-wrap items-center gap-4 text-content">
            <legend className="float-left mr-2">
              Do you want to send emails to your employees?
            </legend>
            {["yes", "no"].map((option) => (
              <label
                key={option}
                className={`flex items-center gap-2 ${
                  option === "no" && payslipsGenerated
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="radio"
                  name="sendPayslipEmails"
                  value={option}
                  checked={sendPayslipEmails === option}
                  disabled={option === "no" && payslipsGenerated}
                  onChange={(event) => setSendPayslipEmails(event.target.value)}
                />
                <span className="capitalize">{option}</span>
              </label>
            ))}
          </fieldset>

          {payslipsGenerated && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>
                  Generated: {numberValue(payslipEmailStatus?.summary?.generated)}
                </span>
                <span className="text-green-700">
                  Sent: {numberValue(payslipEmailStatus?.summary?.sent)}
                </span>
                <span className="text-red-600">
                  Failed to send:{" "}
                  {numberValue(payslipEmailStatus?.summary?.failedToSend)}
                </span>
              </div>

              {payslipEmailStatus?.systemError && (
                <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {payslipEmailStatus.systemError}
                </div>
              )}

              <div className="mt-3 max-h-56 overflow-auto rounded border">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-3 py-2 font-medium">Employee</th>
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(payslipEmailStatus?.employees || []).map((employee) => (
                      <tr key={employee.employeeId} className="border-t">
                        <td className="px-3 py-2">{employee.employeeName}</td>
                        <td className="px-3 py-2">{employee.email || "N/A"}</td>
                        <td
                          className={`px-3 py-2 font-medium ${
                            employee.status === "Sent"
                              ? "text-green-700"
                              : employee.status === "Failed to send"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {employee.status}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {employee.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {isFetchingPayslipEmailStatus && (
                  <p className="p-3 text-sm text-gray-500">
                    Loading email status...
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-auto flex justify-end gap-3 pt-10">
            <SecondaryButton
              title="Cancel"
              handleSubmit={() => setShowReleasePayslips(false)}
            />
            <PrimaryButton
              title={payslipsGenerated ? "Retry Emails" : "Release"}
              handleSubmit={handleReleasePayslips}
              externalStyles="!bg-green-600"
              disabled={isReleasingOrRetrying || allPayslipEmailsSent}
              isLoading={isReleasingOrRetrying}
            />
          </div>
        </div>
      </MuiModal>

      <MuiModal
        open={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        title="Edit Employee Payroll"
        widthClass="w-[95%] max-w-7xl"
      >
        {editingEmployee && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-3 border-b pb-6 sm:grid-cols-3 lg:grid-cols-5">
              {[
                ["Basic", editingEmployee.basic],
                ["Gross", editingEmployee.gross],
                ["Net Amount", editingEmployee.netAmount],
                ["Income Tax", editingEmployee.incomeTax],
                [
                  "TDS (Income Tax + Cess + Surcharge)",
                  numberValue(editingEmployee.incomeTax) +
                    numberValue(editingEmployee.cess) +
                    numberValue(editingEmployee.surcharge),
                ],
              ].map(([label, value]) => (
                <div key={label} className="border-l-2 border-green-500 px-4 py-2">
                  <p className="text-subtitle font-semibold text-green-600">
                    {inrFormat(numberValue(value))}
                  </p>
                  <p className="mt-1 text-xs text-green-700">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-2">
              <section>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-primary">Allowances</h3>
                  <span className="font-semibold">
                    {inrFormat(numberValue(editingEmployee.allowances))}
                  </span>
                </div>
                <div className="mt-2">
                  {(editingEmployee.allowanceItems || []).map((row) => (
                    <EditablePayrollRow
                      key={row.id}
                      row={{
                        ...row,
                        amount: normalizeRuleAmount(row.label, row.amount),
                      }}
                      options={allowanceOptions}
                      usedLabels={(editingEmployee.allowanceItems || []).map((item) => item.label)}
                      onChange={(updatedRow) => updatePayrollRows("allowanceItems", row.id, updatedRow)}
                      onRemove={() => removePayrollRow("allowanceItems", row.id)}
                      readOnly={row.label === "House Rent Allowance"}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => addPayrollRow("allowanceItems", allowanceOptions)}
                    className="mt-4 text-sm font-semibold text-primary hover:underline"
                  >
                    + Add New
                  </button>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-primary">Deductions</h3>
                  <span className="font-semibold">
                    {inrFormat(numberValue(editingEmployee.deductions))}
                  </span>
                </div>
                <div className="mt-2">
                  {(editingEmployee.deductionItems || []).map((row) => (
                    <EditablePayrollRow
                      key={row.id}
                      row={{
                        ...row,
                        amount: normalizeRuleAmount(row.label, row.amount),
                      }}
                      options={deductionOptions}
                      usedLabels={(editingEmployee.deductionItems || []).map((item) => item.label)}
                      onChange={(updatedRow) => updatePayrollRows("deductionItems", row.id, updatedRow)}
                      onRemove={() => removePayrollRow("deductionItems", row.id)}
                      readOnly={["Provident Fund", "ESI", "TDS"].includes(row.label)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => addPayrollRow("deductionItems", deductionOptions)}
                    className="mt-4 text-sm font-semibold text-primary hover:underline"
                  >
                    + Add New
                  </button>
                  {!isTdsWorker && !esiEnabled && (
                    <p className="mt-3 text-xs text-gray-500">
                      ESI is not applicable for this employee, so its amount remains INR 0.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-primary">IT Declarations</h3>
                  <span className="font-semibold">{inrFormat(0)}</span>
                </div>
                <p className="mt-4 text-content text-gray-500">
                  No IT declarations available for this employee.
                </p>
              </section>

              <section>
                <h3 className="mb-4 border-b pb-2 font-semibold text-primary">
                  <span className="flex items-center justify-between">
                    <span>Loss of Pay</span>
                    <span>{inrFormat(numberValue(editingEmployee.lossOfPay))}</span>
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    ["lossOfPayDays", "Loss of Pay Days"],
                    ["lossOfPay", "Loss of Pay Amount (INR)"],
                  ].map(([field, label]) => (
                    <label key={field} className="flex flex-col gap-1 text-content">
                      <span className="text-gray-600">{label}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingEmployee[field] ?? 0}
                        onChange={(event) =>
                          setEditingEmployee((employee) => ({
                            ...employee,
                            [field]:
                              field === "lossOfPay"
                                ? event.target.value
                                : Number(event.target.value),
                          }))
                        }
                        onBlur={() => {
                          if (field !== "lossOfPay") return;
                          setEditingEmployee((employee) => ({
                            ...employee,
                            lossOfPay: numberValue(employee.lossOfPay).toFixed(2),
                          }));
                        }}
                        className="rounded border border-gray-300 px-3 py-2 outline-none focus:border-primary"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-4 border-b pb-2 font-semibold text-primary">
                  Payroll Notes
                </h3>
                <textarea
                  rows={4}
                  value={editingEmployee.payrollNotes || ""}
                  onChange={(event) =>
                    setEditingEmployee((employee) => ({
                      ...employee,
                      payrollNotes: event.target.value,
                    }))
                  }
                  placeholder="Add payroll notes"
                  className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-primary"
                />
              </section>

              <aside className="text-sm text-gray-600">
                <p className="mb-4 border-b pb-2 font-semibold text-primary">
                  Note
                </p>
                <p className="text-red-600">
                  * Allowances will vary if there is loss of pay for the employee.
                </p>
                <p>
                  * IT declarations and PF/PT amounts will not be considered for
                  income-tax calculations if the employee opted for the new tax
                  regime.
                </p>
              </aside>
            </div>

            <div className="flex justify-end gap-3">
              <PrimaryButton
                title="Cancel"
                handleSubmit={() => setEditingEmployee(null)}
                externalStyles="!bg-gray-500"
              />
              <PrimaryButton
                title="Save"
                handleSubmit={saveEmployeeEdit}
                disabled={isSavingEmployee}
                isLoading={isSavingEmployee}
              />
            </div>
          </div>
        )}
      </MuiModal>

      <ConfirmationModal
        open={showUndoConfirmation}
        onClose={() => setShowUndoConfirmation(false)}
        onConfirm={confirmDraftUndo}
        title="Undo Payroll Draft Change"
        message="Undo the most recent saved change made to this payroll draft?"
        confirmText="Undo"
        cancelText="Cancel"
        isLoading={isUndoingDraft}
      />

      <ConfirmationModal
        open={Boolean(employeeToUndo)}
        onClose={() => setEmployeeToUndo(null)}
        onConfirm={confirmEmployeeUndo}
        title="Undo Employee Payroll Change"
        message={`Undo the latest saved payroll change for ${employeeToUndo?.employeeName || "this employee"}?`}
        confirmText="Undo"
        cancelText="Cancel"
        isLoading={isUndoingEmployee}
      />

      <ConfirmationModal
        open={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmEmployeeDelete}
        title="Delete Selected Payroll Entries"
        message={`Are you sure you want to delete ${selectedEmployees.length} selected employee${selectedEmployees.length === 1 ? "" : "s"} from this payroll draft?`}
        confirmText={`Delete (${selectedEmployees.length})`}
        cancelText="Cancel"
        isLoading={isDeletingEmployees}
      />

      <ConfirmationModal
        open={showVoidConfirmation}
        onClose={() => setShowVoidConfirmation(false)}
        onConfirm={confirmVoidPayroll}
        title="Void Payroll"
        message="Are you sure you want to void this payroll draft? This will permanently delete the draft and its saved changes."
        confirmText="Void Payroll"
        cancelText="Cancel"
        isLoading={isVoidingPayroll}
      />

      <ConfirmationModal
        open={showSubmitConfirmation}
        onClose={() => setShowSubmitConfirmation(false)}
        onConfirm={confirmPayrollSubmit}
        title="Submit Payroll"
        message="Are you sure you want to submit this payroll?"
        confirmText="Submit"
        cancelText="Cancel"
        isLoading={isSubmittingPayroll}
      />
    </PageFrame>
  );
};

export default PayrollEntry;

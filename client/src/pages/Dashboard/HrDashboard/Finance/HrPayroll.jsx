import React from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, CircularProgress, MenuItem } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// import AgTable from "../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import PageFrame from "../../../../components/Pages/PageFrame";
import { inrFormat } from "../../../../utils/currencyFormat";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import WidgetSection from "../../../../components/WidgetSection";
import { toast } from "sonner";
import PayslipTemplate from "../../../../components/HrTemplate/PayslipTemplate";
import html2pdf from "html2pdf.js";
import ReactDOMServer from "react-dom/server";
import { queryClient } from "../../../../main";
import MonthlyAttendanceSummary from "../Mixbag/MonthlyAttendanceSummary";

const HrPayroll = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMixBagPayroll = location.pathname.includes("/mix-bag/payroll");

  const axios = useAxiosPrivate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("Full Time Batch");
  const [selectedPayPeriod, setSelectedPayPeriod] = useState(() => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
  });
  const [payrollStarted, setPayrollStarted] = useState(false);
  const [activePayrollStep, setActivePayrollStep] = useState(0);
  const [completedPayrollSteps, setCompletedPayrollSteps] = useState([]);

  const { mutate: savePayrollDraft, isPending: isSavingPayrollDraft } =
    useMutation({
      mutationFn: async () => {
        const response = await axios.post("/api/payroll/drafts", {
          batchName: selectedBatch,
          payPeriod: selectedPayPeriod,
        });
        return response.data;
      },
      onSuccess: (response) => {
        queryClient.invalidateQueries({ queryKey: ["payrollDrafts"] });
        toast.success(response.message || "Payroll draft saved");
        navigate("/app/dashboard/HR-dashboard/mix-bag/payroll-summary");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to save payroll draft"
        );
      },
    });

  const { data: payrollData, isLoading } = useQuery({
    queryKey: ["payrollData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/payroll/get-payrolls");

        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch employees"
        );
      }
    },
  });

  const payrollColumn = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "empId", headerName: "Employee ID" },
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
              isMixBagPayroll
                ? `/app/dashboard/HR-dashboard/mix-bag/payroll/${params.value}`
                : `/app/dashboard/HR-dashboard/finance/payroll/${params.value}`,
              {
                state: {
                  empId: params.data.id,
                  month: params.data.month,
                  status: params.data.status,
                  employeeName: params.data.employeeName,
                  departmentName: params.data.departmentName,
                  employeeId: params.data.empId,
                  designation: params.data.designation,
                },
              }
            )
          }
        >
          {params.value}
        </span>
      ),
    },
    { field: "email", headerName: "Employee Email" },
    { field: "departmentName", headerName: "Department" },
    // { field: "designation", headerName: "Desig" },
    // { field: "month", headerName: "Date" },
    // { field: "role", headerName: "Role" },
    // { field: "time", headerName: "Time" },
    {
      field: "totalSalary",
      headerName: "Total Salary (INR)",
      cellRenderer: (params) => inrFormat(params.value),
    },
    // { field: "reimbursment", headerName: "Total Salary" },
    {
      field: "status",
      headerName: "Status",
      pinned: "right",
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
    // {
    //   field: "actions",
    //   headerName: "Actions",

    //   cellRenderer: (params) => (
    //     <div className="p-2">
    //       <PrimaryButton
    //         title={"View"}
    //         handleSubmit={() => handleDetailsClick(params.data)}
    //       />
    //     </div>
    //   ),
    // },
  ];

const tableData = isLoading
  ? []
  : payrollData
      .map((item) => ({
        ...item,
        id: item.employeeId,
        employeeName: item.name,
        status: item.status,
        totalSalary: item.totalSalary,
        departmentName: item.departments?.map((item) => item.name).join(", ") || "N/A",
        monthDate: item.month,
        designation: item.role?.map((item) => item.roleTitle).join(", ") || "N/A",
        payrollBatch: item.payrollBatch || "",
        grossPay: item.payrollCompensation?.grossPay || 0,
        basicPay: item.payrollCompensation?.basicPay || 0,
        variablePay: item.payrollCompensation?.variablePay || 0,
        gratuity: item.payrollCompensation?.gratuity || 0,
        allowances: item.payrollCompensation?.totalAllowances || 0,
        annualCtc: item.annualCtc || 0,
      }))
      .sort((a, b) =>
        a.employeeName?.localeCompare(b.employeeName, undefined, {
          sensitivity: "base",
        })
      );

  const payPeriodOptions = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - index);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
      label: date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    };
  });

  const selectedBatchData = tableData.filter((employee) => {
    const payrollMonth = new Date(employee.monthDate);
    const monthKey = `${payrollMonth.getFullYear()}-${String(
      payrollMonth.getMonth() + 1
    ).padStart(2, "0")}`;

    return (
      employee.payrollBatch === selectedBatch && monthKey === selectedPayPeriod
    );
  });

  const processedEmployees = selectedBatchData.filter(
    (employee) => employee.status === "Completed"
  ).length;
  const selectedPeriodDate = new Date(`${selectedPayPeriod}-01T00:00:00`);
  const totalDays = new Date(
    selectedPeriodDate.getFullYear(),
    selectedPeriodDate.getMonth() + 1,
    0
  ).getDate();

  const processSteps = [
    ["Compensation", "Review employees' compensation information"],
    ["Time & Attendance", "Review attendance, missing days and overtime"],
    ["IT Declarations", "Review employees' IT declaration information"],
    ["Leave Encashment", "Review and manage leaves for the pay period"],
    ["Review", "Review employees' payroll information"],
  ];

  const payrollSteps = [
    {
      title: "Compensation",
      description: "Review employee compensation information",
    },
    {
      title: "Time & Attendance",
      description: "Review attendance, missing days and overtime",
    },
    {
      title: "IT Declarations",
      description: "Review employee IT declarations",
    },
    {
      title: "Leave Encashment",
      description: "Review and manage employee leave encashment",
    },
    {
      title: "Review",
      description: "Review employee information",
    },
  ];

  const compensationColumns = [
    { field: "srNo", headerName: "Sr No", width: 90 },
    { field: "empId", headerName: "Employee ID", width: 140 },
    { field: "employeeName", headerName: "Employee Name", flex: 1 },
    {
      field: "grossPay",
      headerName: "Gross Pay (Monthly)",
      valueFormatter: (params) => inrFormat(params.value),
    },
    {
      field: "basicPay",
      headerName: "Basic Pay (Monthly)",
      valueFormatter: (params) => inrFormat(params.value),
    },
    {
      field: "allowances",
      headerName: "Allowances (Monthly)",
      valueFormatter: (params) => inrFormat(params.value),
    },
    {
      field: "variablePay",
      headerName: "Variable Pay (Yearly)",
      valueFormatter: (params) => inrFormat(params.value),
    },
    {
      field: "gratuity",
      headerName: "Gratuity (Yearly)",
      valueFormatter: (params) => inrFormat(params.value),
    },
    {
      field: "annualCtc",
      headerName: "CTC (Yearly)",
      valueFormatter: (params) => inrFormat(params.value),
    },
  ];


  console.log("des : ", tableData)

  const { mutate: payrollMutate, isPending: isPayrollPending } = useMutation({
    mutationKey: ["batchPayrollMutate"],
    mutationFn: async (data) => {
      setIsModalOpen(true);
      const response = await axios.post("/api/payroll/generate-payroll", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payrollData"] });
      toast.success(data.message || "BATCH SENT");
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "BATCH FAILED");
      setIsModalOpen(false);
    },
  });
  const handleBatchAction = async (selectedRows) => {
    const preparedData = await Promise.all(
      selectedRows.map(async (item) => {
        const payload = {
          name: item.employeeName,
          userId: item.employeeId,
          email: item.email,
          month: item.month,
          totalSalary: item.totalSalary,
          deductions: item.deductions,
          departmentName: item.departmentName?.[0],
          empId: item.empId,
        };

        const html = ReactDOMServer.renderToStaticMarkup(
          <PayslipTemplate data={payload} />
        );

        const pdfBlob = await html2pdf()
          .set({
            margin: 10, // small margin is enough
            filename: `Payslip_${payload.userId}_${payload.month}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 }, // higher quality
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .from(html)
          .output("blob");

        return {
          ...payload,
          payslipPdf: new File(
            [pdfBlob],
            `Payslip_${payload.userId}_${payload.month}.pdf`,
            { type: "application/pdf" }
          ),
        };
      })
    );

    // ✅ Prepare FormData
    const formData = new FormData();

    const metadataArray = preparedData.map((entry) => {
      return {
        name: entry.name,
        userId: entry.userId,
        email: entry.email,
        month: entry.month,
        totalSalary: entry.totalSalary,
        deductions: entry.deductions || 0,
        departmentName: entry.departmentName,
        empId: entry.empId,
      };
    });

    // ✅ Append metadata as JSON stringified array
    formData.append("payrolls", JSON.stringify(metadataArray));

    // ✅ Append files in the same order
    preparedData.forEach((entry) => {
      formData.append("payslips", entry.payslipPdf);
    });

    // ✅ (Optional) Log to confirm
    for (let [key, value] of formData.entries()) {
      if (key === "metadata") {
      } else {
      }
    }

    // ✅ Trigger mutation
    payrollMutate(formData);
  };

  return (
    <div className="flex flex-col gap-8">
      {isMixBagPayroll && !payrollStarted ? (
        <PageFrame>
          <div className="flex flex-col gap-8 p-2">
            <div className="border-b pb-4">
              <h2 className="text-subtitle font-semibold text-primary">
                Payroll - Batch & Period
              </h2>
            </div>

            <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                select
                required
                label="Select Batch"
                value={selectedBatch}
                onChange={(event) => setSelectedBatch(event.target.value)}
                fullWidth
              >
                {["Full Time Batch", "Intern Batch", "Consultant Batch"].map(
                  (batch) => (
                    <MenuItem key={batch} value={batch}>
                      {batch}
                    </MenuItem>
                  )
                )}
              </TextField>
              <TextField
                select
                required
                label="Pay Period"
                value={selectedPayPeriod}
                onChange={(event) => setSelectedPayPeriod(event.target.value)}
                fullWidth
              >
                {payPeriodOptions.map((period) => (
                  <MenuItem key={period.value} value={period.value}>
                    {period.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <section>
                <h3 className="border-b pb-3 text-subtitle font-semibold text-primary">
                  Payroll Information
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-content">
                  <span className="text-gray-500">Payroll Type</span>
                  <span className="text-right">Monthly</span>
                  <span className="text-gray-500">Employees in Batch</span>
                  <span className="text-right">{selectedBatchData.length}</span>
                  <span className="text-gray-500">Processed Employees</span>
                  <span className="text-right">{processedEmployees}</span>
                  <span className="text-gray-500">Remaining Employees</span>
                  <span className="text-right">
                    {selectedBatchData.length - processedEmployees}
                  </span>
                  <span className="text-gray-500">Total Days</span>
                  <span className="text-right">{totalDays}</span>
                </div>
              </section>

              <section>
                <h3 className="border-b pb-3 text-subtitle font-semibold text-primary">
                  Process Flow
                </h3>
                <div className="mt-4 flex flex-col gap-3">
                  {processSteps.map(([title, description], index) => (
                    <div key={title} className="flex items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-green-500 font-semibold text-green-600">
                        {index + 1}
                      </span>
                      <div className="w-full rounded-md border border-r-4 border-r-green-500 p-3 shadow-sm">
                        <p className="font-medium text-gray-700">{title}</p>
                        <p className="text-small text-gray-500">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex justify-end">
              <PrimaryButton
                title="Start Payroll"
                disabled={isLoading || !selectedBatch || !selectedPayPeriod}
                handleSubmit={() => {
                  setActivePayrollStep(0);
                  setCompletedPayrollSteps([]);
                  setPayrollStarted(true);
                }}
              />
            </div>
          </div>
        </PageFrame>
      ) : (
      <PageFrame>
        {isMixBagPayroll && (
          <div className="mb-6 flex flex-col gap-5">
            <div className="flex items-center">
              <p className="text-content font-semibold text-primary">
                {selectedBatch} - {payPeriodOptions.find((period) => period.value === selectedPayPeriod)?.label}
              </p>
            </div>

            <div className="grid grid-cols-1 overflow-hidden rounded-md border md:grid-cols-5">
              {payrollSteps.map((step, index) => {
                const isActive = activePayrollStep === index;
                const isCompleted = completedPayrollSteps.includes(index);

                return (
                  <button
                    type="button"
                    key={step.title}
                    disabled
                    aria-current={isActive ? "step" : undefined}
                    className={`flex min-h-20 items-center gap-3 border-b-2 p-3 text-left transition-colors md:border-r ${
                      isActive
                        ? "border-b-primary bg-blue-50"
                        : isCompleted
                          ? "border-b-green-500 bg-green-50"
                          : "border-b-gray-200 bg-white"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-white ${
                        isCompleted ? "bg-green-500" : "bg-primary"
                      }`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </span>
                    <span>
                      <span className="block font-semibold text-primary">
                        {step.title}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {step.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isMixBagPayroll && activePayrollStep === 0 ? (
          <AgTable
            data={selectedBatchData.map((employee, index) => ({
              ...employee,
              srNo: index + 1,
            }))}
            columns={compensationColumns}
            search
            tableTitle="Employee Compensation"
            tableHeight={450}
          />
        ) : isMixBagPayroll && activePayrollStep === 1 ? (
          <MonthlyAttendanceSummary
            embedded
            payrollView
            fixedMonth={selectedPayPeriod}
            payrollBatch={selectedBatch}
          />
        ) : isMixBagPayroll ? (
          <div className="flex min-h-64 items-center justify-center rounded-md border bg-gray-50 text-content text-gray-500">
            {payrollSteps[activePayrollStep].title} details will be added in this step.
          </div>
        ) : (
        <YearWiseTable
          search={true}
          dateColumn={"monthDate"}
          checkAll={true}
          checkbox
          isRowSelectable={(rowNode) => {
            const status = Array.isArray(rowNode.data.status)
              ? rowNode.data.status[0]
              : rowNode.data.status;
            return status !== "Completed";
          }}
          searchColumn={"Employee Name"}
          tableTitle={"Employee payroll"}
          handleBatchAction={handleBatchAction}
          batchButton={"Generate"}
          data={isMixBagPayroll ? selectedBatchData : tableData}
          columns={payrollColumn}
          exportData={true}
        />
        )}

        {isMixBagPayroll && (
          <div className="mt-6 flex justify-end">
            <PrimaryButton
              title={
                activePayrollStep === payrollSteps.length - 1
                  ? "Submit"
                  : "Next"
              }
              disabled={isSavingPayrollDraft}
              handleSubmit={() => {
                if (activePayrollStep === payrollSteps.length - 1) {
                  savePayrollDraft();
                  return;
                }
                setCompletedPayrollSteps((completedSteps) =>
                  completedSteps.includes(activePayrollStep)
                    ? completedSteps
                    : [...completedSteps, activePayrollStep]
                );
                setActivePayrollStep((currentStep) =>
                  Math.min(currentStep + 1, payrollSteps.length - 1)
                );
              }}
            />
          </div>
        )}
      </PageFrame>
      )}
      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={"Payslip Generation"}
      >
        <div className="h-36 flex justify-center items-center">
          <div className="flex flex-col gap-2 justify-center items-center">
            <CircularProgress />
            <span className="text-content">Generating Payslips....</span>
          </div>
        </div>
      </MuiModal>
    </div>
  );
};

export default HrPayroll;

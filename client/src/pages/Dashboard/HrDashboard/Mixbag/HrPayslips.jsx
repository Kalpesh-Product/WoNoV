import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  Autocomplete,
  CircularProgress,
  MenuItem,
  TextField,
} from "@mui/material";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormatExact as inrFormat } from "../../../../utils/currencyFormat";
import { MdDownload } from "react-icons/md";
import { toast } from "sonner";

const HrPayslips = () => {
  const axios = useAxiosPrivate();
  const [financialYear, setFinancialYear] = useState("All");
  const [employeeStatus, setEmployeeStatus] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState({
    _id: "all",
    firstName: "All",
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["payslipEmployees"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
      return response.data || [];
    },
  });

  const { data: payslips = [], isLoading: isPayslipLoading } = useQuery({
    queryKey: ["employeePayslips", selectedEmployee?._id || "all"],
    enabled: Boolean(selectedEmployee?._id),
    queryFn: async () => {
      const endpoint =
        selectedEmployee._id === "all"
          ? "/api/payslip/get-payslips"
          : `/api/payslip/get-payslips/${selectedEmployee._id}`;
      const response = await axios.get(endpoint);
      return response.data || [];
    },
  });

  const financialYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      "All",
      ...Array.from({ length: 5 }, (_, index) => {
        const startYear = currentYear - index;
        return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
      }),
    ];
  }, []);

  const employeeOptions = useMemo(() => {
    const allOption = { _id: "all", firstName: "All" };
    if (employeeStatus === "All") return [allOption, ...employees];
    const active = employeeStatus === "Active";
    return [
      allOption,
      ...employees.filter(
        (employee) => Boolean(employee.isActive) === active
      ),
    ];
  }, [employeeStatus, employees]);

  const filteredPayslips = useMemo(() => {
    return payslips.filter((payslip) => {
      if (employeeStatus !== "All") {
        const shouldBeActive = employeeStatus === "Active";
        if (Boolean(payslip.employee?.isActive) !== shouldBeActive) {
          return false;
        }
      }
      if (financialYear === "All") return true;
      const startYear = Number(financialYear.match(/FY (\d{4})/)?.[1]);
      if (!startYear) return true;
      const month = dayjs(payslip.month);
      const financialYearStart = dayjs(`${startYear}-04-01`);
      const financialYearEnd = financialYearStart.add(1, "year");
      return (
        !month.isBefore(financialYearStart) && month.isBefore(financialYearEnd)
      );
    });
  }, [employeeStatus, financialYear, payslips]);

  const handleDownloadPayslip = async (payslip) => {
    try {
      const response = await axios.get(
        `/api/payslip/download-payslip/${payslip._id}`,
        { responseType: "blob" }
      );
      const objectUrl = URL.createObjectURL(response.data);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = payslip.payslipName || "Payslip.pdf";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to download the payslip"
      );
    }
  };

  const columns = [
    {
      field: "employeeName",
      headerName: "Employee Name",
      minWidth: 190,
    },
    {
      field: "period",
      headerName: "Period",
      minWidth: 220,
      cellRenderer: ({ value, data }) =>
        data?.payslipLink ? (
          <a
            href={data.payslipLink}
            target="_blank"
            rel="noreferrer"
            className="text-sky-600 hover:underline"
          >
            {value}
          </a>
        ) : (
          value
        ),
    },
    { field: "gross", headerName: "Gross (INR)", minWidth: 130, valueFormatter: ({ value }) => inrFormat(value) },
    { field: "basic", headerName: "Basic (INR)", minWidth: 130, valueFormatter: ({ value }) => inrFormat(value) },
    { field: "allowances", headerName: "Allowances (INR)", minWidth: 160, valueFormatter: ({ value }) => inrFormat(value) },
    { field: "deductions", headerName: "Deductions (INR)", minWidth: 160, valueFormatter: ({ value }) => inrFormat(value) },
    { field: "incomeTax", headerName: "Income Tax (INR)", minWidth: 160, valueFormatter: ({ value }) => inrFormat(value) },
    { field: "surcharge", headerName: "Surcharge (INR)", minWidth: 150, valueFormatter: ({ value }) => inrFormat(value) },
    { field: "cess", headerName: "Cess (INR)", minWidth: 120, valueFormatter: ({ value }) => inrFormat(value) },
    { field: "netAmount", headerName: "Net Amount (INR)", minWidth: 160, valueFormatter: ({ value }) => inrFormat(value) },
    {
      field: "payslipPdfLink",
      headerName: "Payslip PDF Link",
      hide: true,
      suppressColumnsToolPanel: true,
    },
    {
      field: "incomeTaxSheet",
      headerName: "Income Tax Sheet",
      minWidth: 170,
      pinned: "right",
      suppressCsvExport: true,
      valueFormatter: () => "-",
    },
    {
      field: "action",
      headerName: "Action",
      minWidth: 110,
      pinned: "right",
      suppressCsvExport: true,
      cellRenderer: ({ data }) =>
        data?.payslipLink ? (
          <button
            type="button"
            onClick={() => handleDownloadPayslip(data)}
            title="Download payslip"
            className="inline-flex h-full items-center text-primary"
          >
            <MdDownload size={20} />
          </button>
        ) : (
          "-"
        ),
    },
  ];

  const rows = filteredPayslips.map((payslip) => ({
    ...payslip,
    id: payslip._id,
    employeeName:
      [payslip.employee?.firstName, payslip.employee?.lastName]
        .filter(Boolean)
        .join(" ") || payslip.employee?.empId || "N/A",
    period: `${dayjs(payslip.month).startOf("month").format("DD MMM, YYYY")} to ${dayjs(
      payslip.month
    )
      .endOf("month")
      .format("DD MMM, YYYY")}`,
    gross: payslip.actualGross ?? payslip.gross ?? 0,
    basic: payslip.basicPay ?? payslip.basic ?? 0,
    allowances: (payslip.allowanceItems || []).reduce(
      (total, item) => total + (Number(item.amount) || 0),
      0
    ),
    deductions: (payslip.deductionItems || []).reduce(
      (total, item) => total + (Number(item.amount) || 0),
      0
    ),
    netAmount: payslip.netAmount ?? payslip.netPay ?? 0,
    payslipPdfLink: payslip.payslipLink || "",
  }));

  return (
    <PageFrame>
      <div className="mx-auto mb-6 flex w-full max-w-xl flex-col gap-4">
        <TextField
          select
          label="Financial Year"
          value={financialYear}
          onChange={(event) => setFinancialYear(event.target.value)}
          size="small"
        >
          {financialYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Employee Status"
          value={employeeStatus}
          onChange={(event) => {
            setEmployeeStatus(event.target.value);
            setSelectedEmployee({ _id: "all", firstName: "All" });
          }}
          size="small"
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>

        <Autocomplete
          options={employeeOptions}
          value={selectedEmployee}
          loading={isLoading}
          onChange={(_, employee) => setSelectedEmployee(employee)}
          getOptionLabel={(employee) =>
            employee?._id === "all"
              ? "All"
              : `${employee.firstName || ""} ${employee.lastName || ""} (${employee.empId || "N/A"})`.trim()
          }
          isOptionEqualToValue={(option, value) => option._id === value._id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Employee"
              placeholder="Search employee"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </div>

      <AgTable
        data={rows}
        columns={columns}
        search
        exportData
        tableTitle="Payslips"
        tableHeight={420}
      />
      {isPayslipLoading && (
        <p className="p-4 text-content">Loading payslips...</p>
      )}
    </PageFrame>
  );
};

export default HrPayslips;

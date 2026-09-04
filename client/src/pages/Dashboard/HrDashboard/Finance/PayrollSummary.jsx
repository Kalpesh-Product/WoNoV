import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";

const PayrollSummary = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery({
    queryKey: ["payrollDrafts"],
    queryFn: async () => {
      const response = await axios.get("/api/payroll/drafts");
      return response.data;
    },
  });

  const columns = [
    {
      field: "payrollType",
      headerName: "Payroll Type",
      minWidth: 160,
      cellRenderer: ({ value, data: row }) => (
        <button
          type="button"
          className="text-primary underline"
          onClick={() =>
            navigate(
              `/app/dashboard/HR-dashboard/mix-bag/payroll-summary/${row._id}`
            )
          }
        >
          {value}
        </button>
      ),
    },
    { field: "runDate", headerName: "Run Date", minWidth: 120 },
    { field: "status", headerName: "Status", minWidth: 110 },
    {
      field: "directDepositStatus",
      headerName: "Direct Deposit Status",
      minWidth: 180,
    },
    { field: "payPeriod", headerName: "Pay Period", minWidth: 230 },
    { field: "batchName", headerName: "Batch Name", minWidth: 160 },
    { field: "employeeCount", headerName: "# Emp", width: 100 },
    {
      field: "grossAmount",
      headerName: "Gross (INR)",
      minWidth: 140,
      valueFormatter: ({ value }) => inrFormat(value),
    },
    {
      field: "incomeTax",
      headerName: "Income Tax (INR)",
      minWidth: 160,
      valueFormatter: ({ value }) => inrFormat(value),
    },
    {
      field: "surcharge",
      headerName: "Surcharge (INR)",
      minWidth: 150,
      valueFormatter: ({ value }) => inrFormat(value),
    },
    {
      field: "cess",
      headerName: "Cess (INR)",
      minWidth: 130,
      valueFormatter: ({ value }) => inrFormat(value),
    },
    {
      field: "netAmount",
      headerName: "Net Amount (INR)",
      minWidth: 160,
      valueFormatter: ({ value }) => inrFormat(value),
    },
  ];

  const rows = data.map((draft) => {
    const start = dayjs(draft.payPeriod).startOf("month");
    const end = start.endOf("month");
    return {
      ...draft,
      payrollType: `${start.format("MMM YYYY")} (${draft.payrollType})`,
      runDate: draft.runDate ? dayjs(draft.runDate).format("DD-MM-YYYY") : "-",
      payPeriod: `${start.format("DD MMM, YYYY")} to ${end.format("DD MMM, YYYY")}`,
    };
  });

  return (
    <PageFrame>
      <AgTable
        data={rows}
        columns={columns}
        search
        exportData
        tableTitle="Payroll Summary"
        tableHeight={450}
      />
      {isLoading && <p className="p-4 text-content">Loading payroll drafts...</p>}
    </PageFrame>
  );
};

export default PayrollSummary;

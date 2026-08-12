import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { Chip } from "@mui/material";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { toast } from "sonner";

import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import WidgetSection from "../../../../components/WidgetSection";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const FINANCIAL_YEAR = {
  label: "FY 2026-27",
  start: dayjs("2026-04-01"),
};

const BUILDING_CONFIG = {
  st: {
    name: "Sunteck Building",
    endpoint: "/api/maintenance/get-st-energy-monthly",
  },
  dtc: {
    name: "Dempo Trade Centre",
    endpoint: "/api/maintenance/get-dtc-energy-monthly",
  },
};

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");
const SHOW_PAGE_HEADER = false;
const Y_AXIS_STEP = 200;

const getFinancialYearLabel = (startYear) =>
  `FY ${startYear}-${String(startYear + 1).slice(-2)}`;

const createFinancialYearMonths = (startYear) =>
  Array.from({ length: 12 }, (_, index) => {
    const month = dayjs(`${startYear}-04-01`).add(index, "month");

    return {
      id: month.format("YYYY-MM"),
      srNo: index + 1,
      month: month.format("MMMM YYYY"),
      shortMonth: month.format("MMM-YY"),
      requestDate: month.endOf("month").format("YYYY-MM-DD"),
      totalConsumption: 0,
      totalBillAmount: 0,
    };
  });

const YearwiseEnergyBilling = ({ building = "st" }) => {
  const { unitNo = "" } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const config = BUILDING_CONFIG[building] || BUILDING_CONFIG.st;
  const selectedUnit = decodeURIComponent(unitNo);
  const [selectedFYStartYear, setSelectedFYStartYear] = useState(
    FINANCIAL_YEAR.start.year(),
  );
  const [monthlyData, setMonthlyData] = useState([]);

  const financialYearMonths = useMemo(
    () => createFinancialYearMonths(selectedFYStartYear),
    [selectedFYStartYear],
  );

  useEffect(() => {
    let active = true;
    setMonthlyData([]);

    Promise.all(
      financialYearMonths.map((month) =>
        axiosPrivate.get(config.endpoint, { params: { date: month.requestDate } }),
      ),
    )
      .then((responses) => {
        if (!active) return;

        setMonthlyData(
          financialYearMonths.map((month, index) => {
            const unitRecord = (responses[index].data?.data || []).find(
              (record) =>
                String(record.unitNo || "").trim().toLowerCase() ===
                selectedUnit.trim().toLowerCase(),
            );

            return {
              ...month,
              totalConsumption: Number(unitRecord?.totalConsumption || 0),
              totalBillAmount: Number(unitRecord?.totalBillAmount || 0),
            };
          }),
        );
      })
      .catch((error) => {
        if (active) {
          toast.error(
            error.response?.data?.message || "Unable to load unit-wise energy bills",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [axiosPrivate, config.endpoint, financialYearMonths, selectedUnit]);

  const rows = monthlyData.length ? monthlyData : financialYearMonths;
  const selectedFYLabel = getFinancialYearLabel(selectedFYStartYear);
  const totalConsumption = rows.reduce(
    (sum, row) => sum + Number(row.totalConsumption || 0),
    0,
  );
  const totalBillAmount = rows.reduce(
    (sum, row) => sum + Number(row.totalBillAmount || 0),
    0,
  );
  const chartMaxValue = Math.max(
    0,
    ...rows.flatMap((row) => [
      Number(row.totalConsumption || 0),
      Number(row.totalBillAmount || 0),
    ]),
  );
  const yAxisMax = Math.max(
    Y_AXIS_STEP,
    Math.ceil(chartMaxValue / Y_AXIS_STEP) * Y_AXIS_STEP + Y_AXIS_STEP,
  );

  const series = [
    {
      name: "Consumption",
      data: rows.map((row) =>
        Number(row.totalConsumption || 0) > 0 ? Number(row.totalConsumption || 0) : null,
      ),
    },
    {
      name: "Bill Amount",
      data: rows.map((row) =>
        Number(row.totalBillAmount || 0) > 0 ? Number(row.totalBillAmount || 0) : null,
      ),
    },
  ];

  const chartOptions = {
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#355ae8", "#ef233c"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "58%",
        borderRadius: 3,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -22,
      formatter: (value) => (value === null || Number(value) === 0 ? "" : formatNumber(value)),
      style: { fontSize: "11px", fontWeight: 700, colors: ["#1f2937"] },
    },
    legend: { position: "top", horizontalAlign: "center" },
    grid: { borderColor: "#e5e7eb", padding: { top: 24 } },
    xaxis: {
      categories: rows.map((row) => row.shortMonth),
      title: { text: "" },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: yAxisMax,
      tickAmount: yAxisMax / Y_AXIS_STEP,
      title: { text: "Consumption & Bill Amount" },
      labels: { formatter: formatNumber },
    },
    tooltip: { y: { formatter: formatNumber } },
  };

  const columns = [
    { field: "srNo", headerName: "Sr. No.", flex: 0.5, minWidth: 90 },
    { field: "month", headerName: "Month", flex: 1, minWidth: 150 },
    {
      field: "totalConsumption",
      headerName: "Total Consumption(KWH)",
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => formatNumber(params.value),
    },
    {
      field: "totalBillAmount",
      headerName: "Total Bill Amount",
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => formatNumber(params.value),
    },
  ];

  return (
    <div className="p-4">
      {SHOW_PAGE_HEADER ? (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {FINANCIAL_YEAR.label}
          </p>
          <h1 className="mt-1 text-xl font-bold text-[#1f3f7a]">
            Unit-wise Energy Consumption &amp; Billing - {selectedUnit}
          </h1>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <WidgetSection
          title={`${config.name.toUpperCase()} - OVERALL ENERGY CONSUMPTION & BILLING - ${selectedUnit}`}
          border
          headerRightContent={
            <>
              <Chip
                label={`CONSUMPTION : ${formatNumber(totalConsumption)}`}
                sx={{
                  backgroundColor: "#dfe8ff",
                  color: "#1f3f7a",
                  border: "1px solid #b8cbff",
                  fontWeight: 800,
                  fontSize: "0.84rem",
                  height: "36px",
                  borderRadius: "8px",
                  px: 1.15,
                  "& .MuiChip-label": {
                    px: 0.9,
                    fontWeight: 800,
                  },
                }}
              />

              <Chip
                label={`BILL AMOUNT : ${formatNumber(totalBillAmount)}`}
                sx={{
                  backgroundColor: "#eef7ef",
                  color: "#17693a",
                  border: "1px solid #c7e6d0",
                  fontWeight: 800,
                  fontSize: "0.84rem",
                  height: "36px",
                  borderRadius: "8px",
                  px: 1.15,
                  "& .MuiChip-label": {
                    px: 0.9,
                    fontWeight: 800,
                  },
                }}
              />
            </>
          }
        >
          <Chart options={chartOptions} series={series} type="bar" height={450} />

          <div className="flex items-center justify-center gap-2 pb-1">
            <button
              type="button"
              onClick={() => setSelectedFYStartYear((current) => current - 1)}
              className="flex h-8 w-[78px] items-center justify-center rounded-[6px] bg-[#d1d5db] text-[1rem] leading-none text-[#1f2937] transition-colors hover:bg-[#c7cdd8]"
              aria-label="previous-financial-year"
            >
              <MdNavigateBefore />
            </button>

            <span className="min-w-[90px] text-center text-[14px] font-semibold text-[#1f3f7a]">
              {selectedFYLabel}
            </span>

            <button
              type="button"
              onClick={() => setSelectedFYStartYear((current) => current + 1)}
              className="flex h-8 w-[78px] items-center justify-center rounded-[6px] bg-[#d1d5db] text-[1rem] leading-none text-[#1f2937] transition-colors hover:bg-[#c7cdd8]"
              aria-label="next-financial-year"
            >
              <MdNavigateNext />
            </button>
          </div>
        </WidgetSection>

        <PageFrame>
          <YearWiseTable
            data={rows}
            columns={columns}
            tableTitle={`${config.name.toUpperCase()} - OVERALL ENERGY CONSUMPTION & BILLING - ${selectedUnit} - ${selectedFYLabel}`}
            tableHeight={500}
            hideFilter
            exportData
          />
        </PageFrame>
      </div>
    </div>
  );
};

export default YearwiseEnergyBilling;

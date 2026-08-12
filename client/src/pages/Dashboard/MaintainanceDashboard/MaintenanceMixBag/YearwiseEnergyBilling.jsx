
import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import WidgetSection from "../../../../components/WidgetSection";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const FINANCIAL_YEAR = {
  label: "FY 2026–27",
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

const YearwiseEnergyBilling = ({ building = "st" }) => {
  const { unitNo = "" } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const config = BUILDING_CONFIG[building] || BUILDING_CONFIG.st;
  const selectedUnit = decodeURIComponent(unitNo);
  const [monthlyData, setMonthlyData] = useState([]);

  const financialYearMonths = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const month = FINANCIAL_YEAR.start.add(index, "month");
        return {
          id: month.format("YYYY-MM"),
          srNo: index + 1,
          month: month.format("MMMM YYYY"),
          shortMonth: month.format("MMM"),
          requestDate: month.endOf("month").format("YYYY-MM-DD"),
          totalConsumption: 0,
          totalBillAmount: 0,
        };
      }),
    [],
  );

  useEffect(() => {
    let active = true;

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
  const series = [
    { name: "Consumption", data: rows.map((row) => row.totalConsumption) },
    { name: "Bill Amount", data: rows.map((row) => row.totalBillAmount) },
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
      formatter: (value) => formatNumber(value),
      style: { fontSize: "11px", fontWeight: 700, colors: ["#1f2937"] },
    },
    legend: { position: "top", horizontalAlign: "center" },
    grid: { borderColor: "#e5e7eb", padding: { top: 24 } },
    xaxis: {
      categories: rows.map((row) => row.shortMonth),
      title: { text: "Month" },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      title: { text: "Consumption / Bill Amount" },
      labels: { formatter: formatNumber },
    },
    tooltip: { y: { formatter: formatNumber } },
  };

  const columns = [
    { field: "srNo", headerName: "Sr. No.", flex: 0.5, minWidth: 90 },
    { field: "month", headerName: "Month", flex: 1, minWidth: 150 },
    {
      field: "totalConsumption",
      headerName: "Total Consumption",
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
      <div className="mb-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {FINANCIAL_YEAR.label}
        </p>
        <h1 className="mt-1 text-xl font-bold text-[#1f3f7a]">
          Unit-wise Energy Consumption &amp; Billing — {selectedUnit}
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        <WidgetSection
          title={`${config.name.toUpperCase()} – UNIT WISE ENERGY CONSUMPTION & BILLING – ${selectedUnit}`}
          border
        >
          <Chart options={chartOptions} series={series} type="bar" height={450} />
        </WidgetSection>

        <PageFrame>
          <YearWiseTable
            data={rows}
            columns={columns}
            tableTitle={`${config.name} - Energy Consumption Bill - ${selectedUnit} (${FINANCIAL_YEAR.label})`}
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
import WidgetSection from "../../../../components/WidgetSection";
import BarGraph from "../../../../components/graphs/BarGraph";
import FilterUnits from "./FilterUnits";
import { useEffect, useMemo, useState } from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { inrFormat } from "../../../../utils/currencyFormat";
import SecondaryButton from "../../../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

dayjs.extend(customParseFormat);

const fiscalMonths = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

const getFiscalYearStart = (date = dayjs()) => {
  const parsedDate = dayjs(date);
  return parsedDate.month() >= 3 ? parsedDate.year() : parsedDate.year() - 1;
};

const formatFiscalYear = (startYear) =>
  `FY ${startYear}-${String(startYear + 1).slice(-2)}`;

const getFiscalYearMonths = (startYear) =>
  fiscalMonths.map((month, index) => {
    const year = index < 9 ? startYear : startYear + 1;
    return `${month}-${String(year).slice(-2)}`;
  });

const getFiscalYearStartFromMonth = (monthLabel) => {
  const parsedMonth = dayjs(`01-${monthLabel}`, "DD-MMM-YY", true);

  if (!parsedMonth.isValid()) return null;

  return parsedMonth.month() >= 3 ? parsedMonth.year() : parsedMonth.year() - 1;
};

const excludedMonths = ["Jan-24", "Feb-24", "Mar-24"];

const LandlordPayments = () => {
  const axios = useAxiosPrivate();
  const [selectedFiscalYearStart, setSelectedFiscalYearStart] = useState(() =>
    getFiscalYearStart()
  );

  const { data: hrFinance = [], isPending: isHrLoading, isError } = useQuery({
    queryKey: ["allBudgets"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798bab0e469e809084e249a`
        );
        const budgets = response.data?.allBudgets;
        return Array.isArray(budgets) ? budgets : [];
      } catch (error) {
        console.error("Error fetching budget:", error);
        return [];
      }
    },
  });

  const landLordData = useMemo(() => {
    if (!Array.isArray(hrFinance)) return [];
    return hrFinance.filter((item) => item.expanseType === "Monthly Rent");
  }, [hrFinance]);

  // const monthlyRentMap = useMemo(() => {
  //   const rentMap = {};

  //   landLordData.forEach((item) => {
  //     if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

  //     const monthKey = dayjs(item.dueDate).format("MMM-YY");
  //     if (excludedMonths.includes(monthKey)) return;

  //     rentMap[monthKey] =
  //       (rentMap[monthKey] || 0) + (item.actualAmount || 0);
  //   });

  //   return rentMap;
  // }, [landLordData]);
  const monthlyRentMap = useMemo(() => {
  const rentMap = {};

  landLordData.forEach((item) => {
    if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

    const paymentStatus = String(item.isPaid || "")
      .trim()
      .toLowerCase();

    // Only paid records should be counted in graph
    if (paymentStatus !== "paid") return;

    const monthKey = dayjs(item.dueDate).format("MMM-YY");
    if (excludedMonths.includes(monthKey)) return;

    rentMap[monthKey] =
      (rentMap[monthKey] || 0) + (Number(item.actualAmount) || 0);
  });

  return rentMap;
}, [landLordData]);

const monthlyUnpaidMap = useMemo(() => {
  const unpaidMap = {};

  landLordData.forEach((item) => {
    if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

    const paymentStatus = String(item.isPaid || "")
      .trim()
      .toLowerCase();

    // Only unpaid records for tooltip
    if (paymentStatus !== "unpaid") return;

    const monthKey = dayjs(item.dueDate).format("MMM-YY");
    if (excludedMonths.includes(monthKey)) return;

    const unitNo = item.unit?.unitNo || "Unknown Unit";
    const amount = Number(item.actualAmount) || 0;

    if (!unpaidMap[monthKey]) {
      unpaidMap[monthKey] = [];
    }

    unpaidMap[monthKey].push({
      unitNo,
      amount,
    });
  });

  return unpaidMap;
}, [landLordData]);

const monthlyPaidUnitMap = useMemo(() => {
  const paidMap = {};

  landLordData.forEach((item) => {
    if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

    const paymentStatus = String(item.isPaid || "")
      .trim()
      .toLowerCase();

    // Only paid records for tooltip unit list
    if (paymentStatus !== "paid") return;

    const monthKey = dayjs(item.dueDate).format("MMM-YY");
    if (excludedMonths.includes(monthKey)) return;

    const unitNo = item.unit?.unitNo || "Unknown Unit";

    if (!paidMap[monthKey]) {
      paidMap[monthKey] = [];
    }

    paidMap[monthKey].push(unitNo);
  });

  return paidMap;
}, [landLordData]);

  const latestDataFiscalYearStart = useMemo(() => {
    const fiscalYearStarts = Object.keys(monthlyRentMap)
      .map((month) => getFiscalYearStartFromMonth(month))
      .filter((yearStart) => yearStart !== null);

    return fiscalYearStarts.length ? Math.max(...fiscalYearStarts) : null;
  }, [monthlyRentMap]);

  useEffect(() => {
    if (latestDataFiscalYearStart !== null) {
      setSelectedFiscalYearStart(latestDataFiscalYearStart);
    }
  }, [latestDataFiscalYearStart]);

  const selectedFiscalYear = formatFiscalYear(selectedFiscalYearStart);
  const selectedFiscalYearMonths = useMemo(
    () => getFiscalYearMonths(selectedFiscalYearStart),
    [selectedFiscalYearStart]
  );

  const selectedFiscalYearRentData = useMemo(
    () => selectedFiscalYearMonths.map((month) => monthlyRentMap[month] || 0),
    [monthlyRentMap, selectedFiscalYearMonths]
  );

  const selectedFiscalYearUnpaidData = useMemo(
  () =>
    selectedFiscalYearMonths.map((month) => ({
      month,
      unpaid: monthlyUnpaidMap[month] || [],
    })),
  [monthlyUnpaidMap, selectedFiscalYearMonths]
);

const selectedFiscalYearPaidUnitsData = useMemo(
  () =>
    selectedFiscalYearMonths.map((month) => ({
      month,
      paidUnits: monthlyPaidUnitMap[month] || [],
    })),
  [monthlyPaidUnitMap, selectedFiscalYearMonths]
);

  const graphData = useMemo(
    () => [
      {
        name: "Monthly Rent",
        data: selectedFiscalYearRentData,
      },
    ],
    [selectedFiscalYearRentData]
  );

  const totalRent = useMemo(
    () => selectedFiscalYearRentData.reduce((sum, amount) => sum + amount, 0),
    [selectedFiscalYearRentData]
  );

  const barGraphOptions = {
    chart: {
      id: "landlord-rent-bar",
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "40%",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => inrFormat(val),
      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
      offsetY: -24,
    },
    xaxis: {
      categories: selectedFiscalYearMonths,
    },
    yaxis: {
      max: 2000000,
      labels: {
        formatter: (val) => `${Math.round(val / 100000)}`,
      },
      title: {
        text: "Amount in INR (Lakhs)",
      },
    },
    legend: {
      position: "top",
    },
    // tooltip: {
    //   y: {
    //     formatter: (val) => `INR ${val.toLocaleString("en-IN")}`,
    //   },
    // },
//     tooltip: {
//   custom: ({ series, seriesIndex, dataPointIndex }) => {
//     const month = selectedFiscalYearMonths[dataPointIndex];
//     const paidAmount = series?.[seriesIndex]?.[dataPointIndex] || 0;

//     const unpaidItems =
//       selectedFiscalYearUnpaidData[dataPointIndex]?.unpaid || [];

//     const unpaidText =
//       unpaidItems.length > 0
//         ? unpaidItems
//             .map(
//               (item) =>
//                 `${item.unitNo} - INR ${item.amount.toLocaleString("en-IN")}`
//             )
//             .join(", ")
//         : "No unpaid amount";

//     return `
//       <div style="padding: 10px 12px; font-family: Poppins-Regular; font-size: 12px; max-width: 360px;">
//         <div style="font-weight: 600; margin-bottom: 6px;">${month}</div>
//         <div>Paid: INR ${paidAmount.toLocaleString("en-IN")}</div>
//         <div style="margin-top: 4px; white-space: normal;">
//           Unpaid: ${unpaidText}
//         </div>
//       </div>
//     `;
//   },
// },

tooltip: {
  custom: ({ series, seriesIndex, dataPointIndex, w }) => {
    const month = selectedFiscalYearMonths[dataPointIndex];
    const paidAmount = series?.[seriesIndex]?.[dataPointIndex] || 0;

    const unpaidItems =
      selectedFiscalYearUnpaidData[dataPointIndex]?.unpaid || [];

    const paidUnits =
  selectedFiscalYearPaidUnitsData[dataPointIndex]?.paidUnits || [];

const paidUnitRows =
  paidUnits.length > 0
    ? paidUnits.reduce((rows, unitNo, index) => {
        const rowIndex = Math.floor(index / 3);

        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }

        rows[rowIndex].push(unitNo);

        return rows;
      }, [])
    : [];

const paidUnitText =
  paidUnitRows.length > 0
    ? paidUnitRows
        .map((row, rowIndex) => {
          const rowText = row.join(", ");
          const shouldAddComma = rowIndex < paidUnitRows.length - 1;

          return `${rowText}${shouldAddComma ? "," : ""}`;
        })
        .join("<br />")
    : "No paid units";

    const unpaidTotal = unpaidItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    const unpaidRows =
  unpaidItems.length > 0
    ? unpaidItems.reduce((rows, item, index) => {
        const rowIndex = Math.floor(index / 3);

        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }

        rows[rowIndex].push(
          `${item.unitNo} - INR ${item.amount.toLocaleString("en-IN")}`
        );

        return rows;
      }, [])
    : [];

const unpaidText =
  unpaidRows.length > 0
    ? unpaidRows
        .map((row, rowIndex) => {
          const rowText = row.join(", ");
          const shouldAddComma = rowIndex < unpaidRows.length - 1;

          return `${rowText}${shouldAddComma ? "," : ""}`;
        })
        .join("<br />")
    : "No unpaid amount";

    return `
      <div class="apexcharts-tooltip-title" style="
        font-family: Poppins-Regular;
        font-size: 12px;
        padding: 6px 10px;
        margin-bottom: 0;
      ">
        ${month}
      </div>

      <div style="
        padding: 8px 10px;
        font-family: Poppins-Regular;
        font-size: 12px;
        background: #fff;
        min-width: 260px;
        max-width: 460px;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
          white-space: nowrap;
        ">
          <span style="
            width: 12px;
            height: 12px;
            min-width: 12px;
            border-radius: 50%;
            background: ${w.globals.colors[seriesIndex]};
            display: inline-block;
          "></span>

          <span>Monthly Rent Paid:</span>

          <span style="font-weight: 600;">
            INR ${paidAmount.toLocaleString("en-IN")}
          </span>
        </div>

        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
          white-space: nowrap;
        ">
          <span style="
            width: 12px;
            height: 12px;
            min-width: 12px;
            border-radius: 50%;
            background: #EF4444;
            display: inline-block;
          "></span>

          <span>Monthly Rent Due:</span>

          <span style="font-weight: 600;">
            INR ${unpaidTotal.toLocaleString("en-IN")}
          </span>
        </div>

      <div style="
  border-top: 1px solid #e5e7eb;
  margin-top: 6px;
  padding-top: 6px;
  line-height: 1.5;
  white-space: normal;
">
  <div>
    <span>Paid: </span>
    <span style="font-weight: 600;">
      ${paidUnitText}
    </span>
  </div>

  <div style="margin-top: 4px;">
    <span>Unpaid: </span>
    <span style="font-weight: 600;">
      ${unpaidText}
    </span>
  </div>
</div>
      </div>
    `;
  },
},
    colors: ["#54C4A7"],
    noData: {
      text: "No data available",
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#888",
        fontSize: "14px",
        fontFamily: "Poppins-Regular",
      },
    },
  };

  return (
    <div className="flex flex-col gap-4">
      {isError ? (
        <div className="text-red-500 text-center">Failed to load landlord payments.</div>
      ) : isHrLoading ? (
        <div className="text-center text-gray-500">Loading landlord payments...</div>
      ) : landLordData.length === 0 ? (
        <WidgetSection title="LANDLORD MONTHLY RENT" border>
          <div className="text-center text-gray-500 py-8">
            No rent payment data available.
          </div>
        </WidgetSection>
      ) : (
        <WidgetSection
          title="LANDLORD MONTHLY RENT"
          titleLabel={selectedFiscalYear}
          TitleAmount={`INR ${inrFormat(totalRent)}`}
          border
        >
          <BarGraph
            chartId="landlord-rent-bar"
            data={graphData}
            options={barGraphOptions}
          />

          <div className="flex justify-center items-center mt-4">
            <div className="flex items-center gap-4">
              <SecondaryButton
                title={<MdNavigateBefore />}
                handleSubmit={() =>
                  setSelectedFiscalYearStart((prev) => prev - 1)
                }
              />
              <div className="text-primary text-content font-semibold">
                {selectedFiscalYear}
              </div>
              <SecondaryButton
                title={<MdNavigateNext />}
                handleSubmit={() =>
                  setSelectedFiscalYearStart((prev) => prev + 1)
                }
              />
            </div>
          </div>
        </WidgetSection>
      )}

      <FilterUnits />
    </div>
  );
};

export default LandlordPayments;









// import WidgetSection from "../../../../components/WidgetSection";
// import YearlyGraph2 from "../../../../components/graphs/YearlyGraph2";
// import FilterUnits from "./FilterUnits";
// import { useState } from "react";
// import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
// import { useQuery } from "@tanstack/react-query";
// import dayjs from "dayjs";
// import { inrFormat } from "../../../../utils/currencyFormat";

// const LandlordPayments = () => {
//   const axios = useAxiosPrivate();

//   const { data: hrFinance = [], isPending: isHrLoading, isError } = useQuery({
//     queryKey: ["allBudgets"],
//     queryFn: async () => {
//       try {
//         const response = await axios.get(
//           `/api/budget/company-budget?departmentId=6798bab0e469e809084e249a`
//         );
//         const budgets = response.data?.allBudgets;
//         return Array.isArray(budgets) ? budgets : [];
//       } catch (error) {
//         console.error("Error fetching budget:", error);
//         return [];
//       }
//     },
//   });

//   const excludedMonths = ["Jan-24", "Feb-24", "Mar-24"];
//   const yearCategories = {
//     "FY 2024-25": [
//       "Apr-24", "May-24", "Jun-24", "Jul-24", "Aug-24", "Sep-24",
//       "Oct-24", "Nov-24", "Dec-24", "Jan-25", "Feb-25", "Mar-25",
//     ],
//     "FY 2025-26": [
//       "Apr-25", "May-25", "Jun-25", "Jul-25", "Aug-25", "Sep-25",
//       "Oct-25", "Nov-25", "Dec-25", "Jan-26", "Feb-26", "Mar-26",
//     ],
//   };

//   // Default values to avoid rendering issues
//   let graphData = [];
//   let totalRent = 0;

//   if (Array.isArray(hrFinance) && hrFinance.length > 0) {
//     const landLordData = hrFinance.filter(
//       (item) => item.expanseType === "Monthly Rent"
//     );

//     // Group by month
//     const monthlyRentMap = {};
//     landLordData.forEach((item) => {
//       if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

//       const monthKey = dayjs(item.dueDate).format("MMM-YY");
//       if (excludedMonths.includes(monthKey)) return;

//       monthlyRentMap[monthKey] =
//         (monthlyRentMap[monthKey] || 0) + (item.actualAmount || 0);
//     });

//     // Build graph data per fiscal year
//     graphData = Object.entries(yearCategories).map(
//       ([fiscalYear, months]) => ({
//         name: "Monthly Rent",
//         group: fiscalYear,
//         data: months.map((month) => monthlyRentMap[month] || 0),
//       })
//     );

//     totalRent = landLordData.reduce(
//       (sum, item) => sum + (item.actualAmount || 0),
//       0
//     );
//   }

//   const barGraphOptions = {
//     chart: {
//       id: "landlord-rent-bar",
//       type: "bar",
//       toolbar: { show: false },
//       fontFamily: "Poppins-Regular",
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         borderRadius: 4,
//         columnWidth: "40%",
//         dataLabels: {
//           position: "top",
//         },
//       },
//     },
//     dataLabels: {
//       enabled: true,
//       formatter: (val) => inrFormat(val),
//       style: {
//         fontSize: "12px",
//         colors: ["#000"],
//       },
//       offsetY: -24,
//     },
//     xaxis: {
//       categories: [], // Injected via YearlyGraph
//     },
//     yaxis: {
//       max : 2000000,
//       labels: {
//         formatter: (val) => `${Math.round(val / 100000)}`,
//       },
//       title: {
//         text: "Amount in INR (Lakhs)",
//       },
//     },
//     legend: {
//       position: "top",
//     },
//     tooltip: {
//       y: {
//         formatter: (val) => `INR ${val.toLocaleString("en-IN")}`,
//       },
//     },
//     colors: ["#54C4A7"],
//     noData: {
//       text: "No data available",
//       align: "center",
//       verticalAlign: "middle",
//       style: {
//         color: "#888",
//         fontSize: "14px",
//         fontFamily: "Poppins-Regular",
//       },
//     },
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       {isError ? (
//         <div className="text-red-500 text-center">Failed to load landlord payments.</div>
//       ) : isHrLoading ? (
//         <div className="text-center text-gray-500">Loading landlord payments...</div>
//       ) : graphData.length === 0 || graphData.every((g) => g.data.every((val) => val === 0)) ? (
//         <WidgetSection title="LANDLORD MONTHLY RENT" border>
//           <div className="text-center text-gray-500 py-8">
//             No rent payment data available.
//           </div>
//         </WidgetSection>
//       ) : (
//         <YearlyGraph2
//           title="LANDLORD MONTHLY RENT"
//           chartId="landlord-rent-bar"
//           data={graphData}
//           options={barGraphOptions}
//           titleAmount={`INR ${inrFormat(totalRent)}`}
//         />
//       )}

//       <FilterUnits />
//     </div>
//   );
// };

// export default LandlordPayments;

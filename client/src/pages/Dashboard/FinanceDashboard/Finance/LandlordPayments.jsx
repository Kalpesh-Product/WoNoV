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

  const monthlyRentMap = useMemo(() => {
    const rentMap = {};

    landLordData.forEach((item) => {
      if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

      const monthKey = dayjs(item.dueDate).format("MMM-YY");
      if (excludedMonths.includes(monthKey)) return;

      rentMap[monthKey] =
        (rentMap[monthKey] || 0) + (item.actualAmount || 0);
    });

    return rentMap;
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
    tooltip: {
      y: {
        formatter: (val) => `INR ${val.toLocaleString("en-IN")}`,
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

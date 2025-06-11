import WidgetSection from "../../../../components/WidgetSection";
import YearlyGraph from "../../../../components/graphs/YearlyGraph";
import FilterUnits from "./FilterUnits";
import { useState } from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

const LandlordPayments = () => {
  const axios = useAxiosPrivate();

  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["allBudgets"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798bab0e469e809084e249a`
        );
        const budgets = response.data.allBudgets;
        return Array.isArray(budgets) ? budgets : [];
      } catch (error) {
        console.error("Error fetching budget:", error);
        return [];
      }
    },
  });

  const excludedMonths = ["Jan-24", "Feb-24", "Mar-24"];
  const yearCategories = {
    "FY 2024-25": [
      "Apr-24", "May-24", "Jun-24", "Jul-24", "Aug-24", "Sep-24",
      "Oct-24", "Nov-24", "Dec-24", "Jan-25", "Feb-25", "Mar-25",
    ],
    "FY 2025-26": [
      "Apr-25", "May-25", "Jun-25", "Jul-25", "Aug-25", "Sep-25",
      "Oct-25", "Nov-25", "Dec-25", "Jan-26", "Feb-26", "Mar-26",
    ],
  };

  // Filter for Monthly Rent
  const landLordData = hrFinance.filter(
    (item) => item.expanseType === "Monthly Rent"
  );

  // Group by month
  const monthlyRentMap = {};
  landLordData.forEach((item) => {
    if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

    const monthKey = dayjs(item.dueDate).format("MMM-YY");
    if (excludedMonths.includes(monthKey)) return;

    monthlyRentMap[monthKey] = (monthlyRentMap[monthKey] || 0) + (item.actualAmount || 0);
  });

  // Structure for YearlyGraph
  const graphData = Object.entries(yearCategories).map(([fiscalYear, months]) => ({
    name: "Monthly Rent",
    group: fiscalYear,
    data: months.map((month) => monthlyRentMap[month] || 0),
  }));

  const totalRent = landLordData.reduce(
    (sum, item) => sum + (item.actualAmount || 0),
    0
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
        columnWidth: "60%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [], // Will be injected by YearlyGraph
    },
    yaxis: {
      labels: {
        formatter: (val) => `${Math.round(val / 100000)}L`,
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
    colors: ["#4E6AF3"], // Blue for rent
  };

  return (
    <div className="flex flex-col gap-8">
      <WidgetSection
        titleLabel={"FY 2024-25"}
        title={"Landlord Payments".toUpperCase()}
        border
      >
        <YearlyGraph
          title="Landlord Monthly Rent"
          chartId="landlord-rent-bar"
          data={graphData}
          options={barGraphOptions}
          TitleAmountGreen={`Total INR ${totalRent.toLocaleString("en-IN")}`}
        />
      </WidgetSection>

      <FilterUnits />
    </div>
  );
};

export default LandlordPayments;

import React, { useEffect, useMemo, useState } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import WidgetSection from "../../../../components/WidgetSection";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import FinanceCard from "../../../../components/FinanceCard";
import dayjs from "dayjs";

const MONTHLY_GRAPH_START = dayjs("2026-04-01");
const MONTHLY_GRAPH_BUILDINGS = [
  "sunteck kanaka",
  "dempo trade centre",
  "dempo trade center",
];
const PROJECTED_MONTH_OVERRIDES = {
  "Oct-26": { occupied: 713 },
  "Nov-26": { occupied: 727 },
  "Dec-26": { occupied: 719 },
  "Jan-27": { occupied: 738 },
  "Feb-27": { total: 800, occupied: 746 },
  "Mar-27": { total: 900, occupied: 812 },
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const isMonthlyGraphBuilding = (buildingName) => {
  const normalized = normalizeText(buildingName);

  return MONTHLY_GRAPH_BUILDINGS.some((building) =>
    normalized.includes(building),
  );
};

const CheckAvailability = ({
  cardsFirst = false,
  disableCardLinks = false,
  hideCheckInventory = false,
  graphHeight = 400,
  cardsBorder = false,
  cardsTitle = "",
  graphTitle = "TOTAL v/s OCCUPIED",
  monthlyView = false,
  hideInventoryLastDivider = false,
  noOuterPadding = false,
  investorGraphStyle = false,
  middleContent = null,
  hideSummaryCards = false,
}) => {
  const navigate = useNavigate();
  const address = useLocation();
  const axios = useAxiosPrivate();
  const [currentMonth, setCurrentMonth] = useState(() => dayjs());

  const {
    data: workLocations = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["workLocations"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");

      return response.data;
    },
  });

  const activeUnits = useMemo(
    () =>
      (workLocations || []).filter(
        (unit) => unit?.isActive && !unit?.isOnlyBudget && unit?.building?.buildingName,
      ),
    [workLocations],
  );

  const occupancyQueryKey = useMemo(
    () => [
      "co-working-occupancy-by-unit",
      activeUnits.map((unit) => unit._id).sort().join("|"),
    ],
    [activeUnits],
  );

  const { data: occupancyData = [] } = useQuery({
    queryKey: occupancyQueryKey,
    queryFn: async () => {
      const results = await Promise.allSettled(
        activeUnits.map(async (unit) => {
          const response = await axios.get("/api/sales/co-working-members", {
            params: { unitId: unit._id, active: true },
          });

          return {
            unitId: unit._id,
            occupiedDesks: Number(response.data?.totalOccupiedDesks) || 0,
          };
        }),
      );

      return results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
    },
    enabled: activeUnits.length > 0,
  });

  const occupiedByUnit = useMemo(
    () =>
      occupancyData.reduce((acc, item) => {
        if (!item?.unitId) return acc;
        acc[item.unitId] = Number(item.occupiedDesks) || 0;
        return acc;
      }, {}),
    [occupancyData],
  );

  const chartData = useMemo(() => {
    const groupedByBuilding = new Map();

    activeUnits.forEach((unit) => {
      const buildingName = unit?.building?.buildingName;
      if (!buildingName) return;

      const totalSeats = (Number(unit?.openDesks) || 0) + (Number(unit?.cabinDesks) || 0);
      const occupiedSeats = Number(occupiedByUnit[unit._id]) || 0;
      const current = groupedByBuilding.get(buildingName) || { total: 0, occupied: 0 };

      groupedByBuilding.set(buildingName, {
        total: current.total + totalSeats,
        occupied: current.occupied + occupiedSeats,
      });
    });

    return Array.from(groupedByBuilding.entries()).map(([buildingName, data]) => {
      const remainingSeats = Math.max(data.total - data.occupied, 0);

      return {
        name: buildingName,
        occupied: data.occupied,
        remaining: remainingSeats,
      };
    });
  }, [activeUnits, occupiedByUnit]);

  const { data: monthlyClients = [], refetch: refetchMonthlyClients } = useQuery({
    queryKey: ["co-working-monthly-occupancy", monthlyView],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");

      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: monthlyView,
  });

  useEffect(() => {
    if (!monthlyView) return undefined;

    const now = dayjs();
    const nextMonth = now.add(1, "month").startOf("month");
    const timer = window.setTimeout(() => {
      setCurrentMonth(dayjs());
      void refetchMonthlyClients();
    }, nextMonth.diff(now) + 1000);

    return () => window.clearTimeout(timer);
  }, [currentMonth, monthlyView, refetchMonthlyClients]);

  const monthlyChartData = useMemo(() => {
    if (!monthlyView) return [];

    const months = Array.from({ length: 12 }, (_, index) => {
      const monthStart = MONTHLY_GRAPH_START.add(index, "month");

      return {
        label: monthStart.format("MMM-YY"),
        start: monthStart.startOf("month"),
        end: monthStart.endOf("month"),
      };
    });

    const totalInventory = activeUnits.reduce((sum, unit) => {
      const buildingName = unit?.building?.buildingName;
      if (!isMonthlyGraphBuilding(buildingName)) return sum;

      return (
        sum +
        (Number(unit?.openDesks) || 0) +
        (Number(unit?.cabinDesks) || 0)
      );
    }, 0);

    const getActualOccupancy = (month) => {
      const occupied = monthlyClients.reduce((sum, client) => {
        const buildingName = client?.unit?.building?.buildingName;
        if (!isMonthlyGraphBuilding(buildingName)) return sum;

        const startDate = dayjs(client?.startDate);
        if (!startDate.isValid()) return sum;

        const endDate = client?.endDate ? dayjs(client.endDate) : null;
        const effectiveEndDate = endDate?.isValid() ? endDate : dayjs();
        const overlapsMonth =
          startDate.isBefore(month.end.add(1, "day")) &&
          effectiveEndDate.isAfter(month.start.subtract(1, "day"));

        if (!overlapsMonth) return sum;

        return (
          sum +
          (Number(client?.openDesks) || 0) +
          (Number(client?.cabinDesks) || 0)
        );
      }, 0);

      const occupiedSeats = Math.min(occupied, totalInventory);

      return {
        occupied: occupiedSeats,
        remaining: Math.max(totalInventory - occupiedSeats, 0),
      };
    };

    const completedInvestorMonths = investorGraphStyle
      ? months.filter((month) => month.start.isBefore(currentMonth, "month"))
      : [];
    const investorProjection = completedInvestorMonths.reduce(
      (projection, month) => {
        const actual = getActualOccupancy(month);

        return {
          occupied: projection.occupied + actual.occupied,
          remaining: projection.remaining + actual.remaining,
        };
      },
      { occupied: 0, remaining: 0 },
    );
    const completedMonthCount = completedInvestorMonths.length;
    const projectedOccupied = completedMonthCount
      ? Math.round(investorProjection.occupied / completedMonthCount)
      : 0;
    const projectedRemaining = completedMonthCount
      ? Math.round(investorProjection.remaining / completedMonthCount)
      : 0;

    return months.map((month) => {
      const isUpcoming = investorGraphStyle
        ? !month.start.isBefore(currentMonth, "month")
        : month.start.isAfter(currentMonth, "month");

      if (isUpcoming) {
        if (!investorGraphStyle) {
          return {
            name: month.label,
            occupied: 0,
            remaining: 0,
            upcoming: totalInventory,
            total: totalInventory,
            isUpcoming: true,
          };
        }

        const projectedOverride = PROJECTED_MONTH_OVERRIDES[month.label] || {};
        const projectedTotalInventory =
          Number(projectedOverride.total) || totalInventory;
        return {
          name: month.label,
          occupied: projectedOccupied,
          remaining: projectedRemaining,
          upcoming: 0,
          total: projectedTotalInventory,
          isUpcoming: true,
        };
      }

      const actual = getActualOccupancy(month);

      return {
        name: month.label,
        occupied: actual.occupied,
        remaining: actual.remaining,
        upcoming: 0,
        total: totalInventory,
        isUpcoming: false,
      };
    });
  }, [activeUnits, currentMonth, investorGraphStyle, monthlyClients, monthlyView]);

  const inventoryGraphData = monthlyView ? monthlyChartData : chartData;

  const totalInventoryCount = useMemo(() => {
    if (monthlyView) {
      return Number(monthlyChartData[0]?.total || 0);
    }

    return chartData.reduce(
      (sum, item) =>
        sum + (Number(item?.occupied) || 0) + (Number(item?.remaining) || 0),
      0,
    );
  }, [chartData, monthlyChartData, monthlyView]);
  const averageOccupancyPercent = useMemo(() => {
    const completedMonths = inventoryGraphData.filter(
      (item) => !item?.isUpcoming && Number(item?.total) > 0,
    );

    if (completedMonths.length === 0) return 0;

    const average =
      completedMonths.reduce((sum, item) => {
        const total = Number(item.total) || 0;
        const occupied = Number(item.occupied) || 0;

        return sum + (total ? (occupied / total) * 100 : 0);
      }, 0) / completedMonths.length;

    return Math.round(average);
  }, [inventoryGraphData]);
  // //-------------  Remove Duplicates----------------------//
  // // STEP 2: Build unique units map by unitNo (to ensure uniqueness)
  // const unitMap = new Map();

  // clientsData.forEach((item) => {
  //   const unit = item.unit;
  //   if (unit && unit.unitNo && !unitMap.has(unit.unitNo)) {
  //     unitMap.set(unit.unitNo, unit);
  //   }
  // });

  // const uniqueUnits = Array.from(unitMap.values());

  // // STEP 3: Group units by building name
  // const groupedByBuilding = new Map();

  // uniqueUnits.forEach((unit) => {
  //   const buildingName = unit.building?.buildingName || "Unknown";
  //   if (!groupedByBuilding.has(buildingName)) {
  //     groupedByBuilding.set(buildingName, []);
  //   }
  //   groupedByBuilding.get(buildingName).push(unit);
  // });

  // const chartData = Array.from(groupedByBuilding.entries()).map(
  //   ([buildingName, units]) => {
  //     const totalSeats = units.reduce(
  //       (sum, unit) => sum + (unit.openDesks || 0) + (unit.cabinDesks || 0),
  //       0
  //     );

  //     const occupiedSeats = clientsData
  //       .filter(
  //         (client) => client.unit?.building?.buildingName === buildingName
  //       )
  //       .reduce(
  //         (sum, client) =>
  //           sum + (client.openDesks || 0) + (client.cabinDesks || 0),
  //         0
  //       );

      // const remainingSeats = Math.max(totalSeats - occupiedSeats, 0);

      // return {
      //   name: buildingName,
      //   occupied: occupiedSeats,
      //   remaining: remainingSeats,
      // };
  //   }
  // );

  const barGraphSeries = useMemo(
    () => [
    {
      name: "Occupied",
      data: inventoryGraphData.map((item) => item.occupied),
    },
    {
      name: investorGraphStyle ? "Unoccupied" : "Remaining",
      data: inventoryGraphData.map((item) => item.remaining),
    },
    ...(monthlyView && !investorGraphStyle
      ? [
          {
            name: "Upcoming",
            data: inventoryGraphData.map((item) => item.upcoming || 0),
          },
        ]
      : []),
    ],
    [inventoryGraphData, investorGraphStyle, monthlyView],
  );

  
  const _barGraphOptionsLegacy = {
    chart: {
      type: "bar",
      fontFamily: "Poppins-Regular",
      stacked: true, // ✅ Stack bars
      stackType: "100%", // ✅ Normalize to 100%
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const buildingName = chartData[config.dataPointIndex]?.name;
          const encodedName = encodeURIComponent(buildingName);
          navigate(
            `/app/dashboard/sales-dashboard/mix-bag/inventory/${encodedName}`,
            { state: buildingName }
          );
        },
      },
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: chartData.map((item) => item.name),
      title: {
        text: "Building Name",
      },
    },
    yaxis: {
      title: {
        text: "Percentage",
      },
      labels: {
        formatter: (val) => `${val}%`,
      },
      max: 100,
    },
    legend: {
      position: "top",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "10%",
        borderRadius: 2,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
    },
    colors: ["#36BA98", "#E83F25"],
    tooltip: {
      custom: function ({ dataPointIndex, w }) {
        const buildingName = w.globals.labels[dataPointIndex];
        const selectedBuilding = chartData[dataPointIndex] || {};
        const occupied = Number(selectedBuilding.occupied) || 0;
        const remaining = Number(selectedBuilding.remaining) || 0;
        const total = occupied + remaining;

        return `
          <div style="padding:8px; width : 200px">
            <strong>${buildingName}</strong><br/>
            <hr />
            <div style="display:flex; justify-content:space-between; margin-top : 5px; font-size : 12px">
              <div style="width : 100%">
                Total
              </div>
              <div style="width : 100%">
              ${total} desks
              </div>
            </div>

            <div style="display:flex; justify-content:space-between;font-size : 12px">
              <div style="width : 100%">
                Occupied
              </div>
              <div style="width : 100%">
              ${occupied} desks
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; font-size : 12px">
              <div style="width : 100%">
                ${investorGraphStyle ? "Unoccupied" : "Remaining"}
              </div>
              <div style="width : 100%">
              ${remaining} desks
              </div>
            </div>
          </div>
        `;
      },
    },
  };

  const barGraphOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        fontFamily: "Poppins-Regular",
        stacked: true,
        stackType: "100%",
        toolbar: {
          show: false,
        },
        events: monthlyView
          ? {}
          : {
              dataPointSelection: (event, chartContext, config) => {
                const buildingName =
                  inventoryGraphData[config.dataPointIndex]?.name;
                const encodedName = encodeURIComponent(buildingName);
                navigate(
                  `/app/dashboard/sales-dashboard/mix-bag/inventory/${encodedName}`,
                  { state: buildingName },
                );
              },
          },
      },
      states: {
        hover: { filter: { type: "none" } },
        active: { filter: { type: "none" } },
      },
      xaxis: {
        categories: inventoryGraphData.map((item) => item.name),
        title: {
          text: investorGraphStyle && monthlyView
            ? ""
            : monthlyView
              ? "Month"
              : "Building Name",
          ...(investorGraphStyle
            ? {
              style: {
                color: "#1E3D73",
              },
            }
            : {}),
        },
        ...(investorGraphStyle
          ? {
            labels: {
              style: {
                colors: "#1E3D73",
              },
            },
          }
          : {}),
      },
      yaxis: {
        title: {
          text: investorGraphStyle && monthlyView ? "Inventory" : "Percentage",
          ...(investorGraphStyle
            ? {
              style: {
                color: "#1E3D73",
              },
            }
            : {}),
        },
        labels: {
          ...(investorGraphStyle
            ? {
              style: {
                colors: "#1E3D73",
              },
            }
            : {}),
          formatter: (val) => `${Math.round(val)}%`,
        },
        max: 100,
      },
      legend: {
        position: "top",
        ...(investorGraphStyle
          ? {
            labels: {
              colors: "#1E3D73",
            },
          }
          : {}),
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: monthlyView ? "45%" : "10%",
          borderRadius: 2,
          ...(investorGraphStyle
            ? {
              dataLabels: {
                total: {
                  enabled: true,
                  formatter: (_value, opts) => {
                    const item = inventoryGraphData[opts.dataPointIndex] || {};
                    return Number(item.total) || "";
                  },
                  style: {
                    color: "#1E3D73",
                    fontSize: "12px",
                    fontWeight: 700,
                  },
                },
              },
            }
            : {}),
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val, { dataPointIndex, seriesIndex }) => {
          const item = inventoryGraphData[dataPointIndex] || {};

          if (investorGraphStyle && monthlyView) {
            const values = [
              Number(item.occupied) || 0,
              Number(item.remaining) || 0,
            ];
            const deskCount = values[seriesIndex] || 0;

            return deskCount ? `${deskCount}` : "";
          }

          if (monthlyView && item.isUpcoming) {
            return "";
          }

          return `${Math.round(val)}%`;
        },
        ...(investorGraphStyle
          ? {
            style: {
              colors: ["#ffffff"],
              fontSize: "12px",
              fontWeight: 700,
            },
          }
          : {}),
      },
      colors: investorGraphStyle
        ? [
          ({ dataPointIndex }) =>
            inventoryGraphData[dataPointIndex]?.isUpcoming
              ? "#b4b4b4"
              : "#3cb37180",
          ({ dataPointIndex }) =>
            inventoryGraphData[dataPointIndex]?.isUpcoming
              ? "#616161"
              : "#ff000080",
        ]
        : ["#36BA98", "#E83F25", "#C4C4C4"],
      tooltip: {
        custom: function ({ dataPointIndex, w }) {
          const label = w.globals.labels[dataPointIndex];
          const [month, year] = String(label).split("-");
          const tooltipLabel = monthlyView
            ? dayjs(`${month} 1, 20${year}`).format("MMMM - YY")
            : label;
          const selectedItem = inventoryGraphData[dataPointIndex] || {};
          const occupied = Number(selectedItem.occupied) || 0;
          const remaining = Number(selectedItem.remaining) || 0;
          const total = Number(selectedItem.total) || occupied + remaining;

          if (investorGraphStyle && monthlyView) {
            const occupiedColor = selectedItem.isUpcoming
              ? "#b4b4b4"
              : "#3cb37180";
            const unoccupiedColor = selectedItem.isUpcoming
              ? "#616161"
              : "#ff000080";
            const projectedPrefix = selectedItem.isUpcoming ? "Projected " : "";

            return `
              <div style="min-width: 155px; font-family: Poppins-Regular, sans-serif; font-size: 12px; line-height: 1.4;">
                <div class="apexcharts-tooltip-title" style="margin-bottom: 8px; font-size: 12px; font-weight: 400;">${label}</div>
                <div style="padding: 0 10px 10px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 7px;">
                    <span style="width: 10px; height: 10px; flex: 0 0 10px; border-radius: 50%; background: ${occupiedColor};"></span>
                    <div style="white-space: nowrap;">
                      <span>${projectedPrefix}Occupied:</span>&nbsp;
                      <strong>${occupied.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 10px; height: 10px; flex: 0 0 10px; border-radius: 50%; background: ${unoccupiedColor};"></span>
                    <div style="white-space: nowrap;">
                      <span>${projectedPrefix}Unoccupied:</span>&nbsp;
                      <strong>${remaining.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                  <hr style="margin: 7px 0 0; border: 0; border-top: 1px solid #e5e7eb;" />
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 7px;">
                    <span style="width: 10px; height: 10px; flex: 0 0 10px; border-radius: 50%; background: #1E3D73;"></span>
                    <div style="white-space: nowrap;">
                      <span>${projectedPrefix}Total:</span>&nbsp;
                      <strong>${total.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }

          return `
            <div style="padding:8px; width : 220px">
              <div style="display:flex; justify-content:flex-start; gap:8px; font-weight:600">
                <span>${
                  monthlyView
                    ? `<span style="color:#292929;">BI</span><span style="color:#e33434;">Z</span><span style="color:#292929;">&nbsp;Nest</span>`
                    : label
                }</span>
                ${monthlyView ? `<span>${tooltipLabel}</span>` : ""}
              </div>
              <hr />
              <div style="display:flex; justify-content:space-between; margin-top : 5px; font-size : 12px">
                <div style="width : 100%">
                  Total
                </div>
                <div style="width : 100%">
                ${total} desks
                </div>
              </div>

              <div style="display:flex; justify-content:space-between;font-size : 12px">
                <div style="width : 100%">Occupied</div>
                <div style="width : 100%">${occupied} desks</div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size : 12px">
                <div style="width : 100%">${investorGraphStyle ? "Unoccupied" : "Remaining"}</div>
                <div style="width : 100%">${remaining} desks</div>
              </div>
            </div>
          `;
        },
      },
    }),
    [inventoryGraphData, investorGraphStyle, monthlyView, navigate],
  );

  //-------------  Remove Duplicates----------------------//

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      location: "",
      floor: "",
    },
  });

  const selectedLocation = watch("location");
  const selectedUnit = watch("floor");

  useEffect(() => {
    setValue("floor", "");
  }, [selectedLocation, setValue]);

  // const {
  //   data: workLocations = [],
  //   isLoading: locationsLoading,
  //   error: locationsError,
  // } = useQuery({
  //   queryKey: ["workLocations"],
  //   queryFn: async () => {
  //     const response = await axios.get("/api/company/fetch-units");

  //     return response.data;
  //   },
  // });

  const selectedUnitId = locationsLoading
    ? []
    : workLocations
      .filter(
        (item) =>
          item.unitNo === selectedUnit &&
          item.building?.buildingName === selectedLocation
      )
      .map((item) => item._id);

  // const uniqueBuildings = Array.from(
  //   new Map(
  //     workLocations.length > 0
  //       ? workLocations.map((loc) => [
  //           loc.building._id, // use building._id as unique key
  //           loc.building.buildingName,
  //         ])
  //       : []
  //   ).entries()
  // );

  const uniqueBuildings = Array.from(
    new Map(
      workLocations.length > 0
        ? workLocations
          .filter(
            (loc) =>
              loc.building && loc.building._id && loc.building.buildingName
          ) // ✅ safeguard
          .map((loc) => [loc.building._id, loc.building.buildingName])
        : []
    ).entries()
  );

  const formatUnitDisplay = (buildingName, unitNo) => {
    if (typeof unitNo !== "string")
      return `${unitNo || "Unknown"} ${buildingName}`;

    // Match format like "501A", "302", "302(A)", or "ST 501 A"
    const match = unitNo.match(/(\d+)[\s-]?([A-Za-z]*)$/); // extract trailing number + optional letter

    if (!match) return `${unitNo} ${buildingName}`;
    const [_, number, letter] = match;
    return ` ${buildingName} - ${number}${letter ? ` - ${letter}` : ""}`;
  };

  // Sorting function
  const sortByUnitNo = (a, b) => {
    const matchA =
      typeof a.unitNo === "string"
        ? a.unitNo.match(/(\d+)[\s-]?([A-Za-z]*)$/)
        : null;
    const matchB =
      typeof b.unitNo === "string"
        ? b.unitNo.match(/(\d+)[\s-]?([A-Za-z]*)$/)
        : null;

    if (!matchA || !matchB) return 0;

    const numberA = parseInt(matchA[1], 10);
    const numberB = parseInt(matchB[1], 10);
    const letterA = matchA[2] || "";
    const letterB = matchB[2] || "";

    if (numberA !== numberB) return numberA - numberB;
    return letterA.localeCompare(letterB);
  };

  const onSubmit = (data) => {
    const { location, floor } = data;

    if (!location || !floor) return;

    navigate(
      `/app/dashboard/sales-dashboard/mix-bag/inventory/${encodeURIComponent(
        location,
      )}/${encodeURIComponent(floor)}`,
      {
        state: {
          unitId: selectedUnitId[0],
          unitNo: floor,
          building: location,
        },
      },
    );

    if (!location || !floor) return;

    navigate(
      `/app/dashboard/sales-dashboard/mix-bag/inventory/${encodeURIComponent(
        location,
      )}/${encodeURIComponent(floor)}`,
      {
        state: {
          unitId: selectedUnitId[0],
          unitNo: floor,
          building: location,
        },
      },
    );
  };

  const inventoryStats = {
    ST: { total: 0, occupied: 0 },
    DTC: { total: 0, occupied: 0 },
  };

  activeUnits.forEach((unit) => {
    const buildingName = unit?.building?.buildingName || "";
    const totalSeats = (Number(unit?.openDesks) || 0) + (Number(unit?.cabinDesks) || 0);
    const occupiedSeats = Number(occupiedByUnit[unit._id]) || 0;

    if (buildingName.includes("Sunteck Kanaka")) {
      inventoryStats.ST.total += totalSeats;
      inventoryStats.ST.occupied += occupiedSeats;
    } else if (
      buildingName.includes("Dempo Trade Centre") ||
      buildingName.includes("Dempo Trade Center")
    ) {
      inventoryStats.DTC.total += totalSeats;
      inventoryStats.DTC.occupied += occupiedSeats;
    }
  });

  const inventoryCards = {
    inventory: [
      {
        title: "ST Inventory",
        value: String(Number(inventoryStats.ST?.total) || 0),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Sunteck%20Kanaka",
        stateData: "Sunteck Kanaka",
      },
      {
        title: "DTC Inventory",
        value: String(Number(inventoryStats.DTC?.total) || 0),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Dempo%20Trade%20Centre",
        stateData: "Dempo Trade Centre",
      },
      {
        title: "Total Inventory",
        value: String(
          (Number(inventoryStats.ST?.total) || 0) +
          (Number(inventoryStats.DTC?.total) || 0)
        ),
        route: "#",
      },
    ],
    occupancy: [
      {
        title: "ST Occupancy",
        value: String(Number(inventoryStats.ST?.occupied) || 0),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Sunteck%20Kanaka",
        stateData: "Sunteck Kanaka",
      },
      {
        title: "DTC Occupancy",
        value: String(Number(inventoryStats.DTC?.occupied) || 0),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Dempo%20Trade%20Centre",
        stateData: "Dempo Trade Centre",
      },
      {
        title: "Total Occupancy",
        value: String(
          (Number(inventoryStats.ST?.occupied) || 0) +
          (Number(inventoryStats.DTC?.occupied) || 0)
        ),
        route: "#",
      },
    ],
    freeInventory: [
      {
        title: "ST Free Inventory",
        value: String(
          Math.max(
          (Number(inventoryStats.ST?.total) || 0) -
            (Number(inventoryStats.ST?.occupied) || 0),
          0
        )
        ),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Sunteck%20Kanaka",
        stateData: "Sunteck Kanaka",
      },
      {
        title: "DTC Free Inventory",
        value: String(
          Math.max(
          (Number(inventoryStats.DTC?.total) || 0) -
            (Number(inventoryStats.DTC?.occupied) || 0),
          0
        )
        ),
        route:
          "/app/dashboard/sales-dashboard/mix-bag/inventory/Dempo%20Trade%20Centre",
        stateData: "Dempo Trade Centre",
      },
      {
        title: "Total Free Inventory",
        value: String(
          Math.max(
          (Number(inventoryStats.ST?.total) || 0) -
            (Number(inventoryStats.ST?.occupied) || 0),
          0
        ) +
          Math.max(
          (Number(inventoryStats.DTC?.total) || 0) -
            (Number(inventoryStats.DTC?.occupied) || 0),
          0
        )
        ),
        route: "#",
      },
    ],
  };

  // return (
  //   <div className="flex flex-col gap-4 p-4">
  //     <WidgetSection
  //       layout={1}
  //       border
  //       normalCase={true} 
  //       title={"TOTAL v/s OCCUPIED"}
  //       //titleLabel={`Total Inventory : ${totalInventoryCount}`}
  //        TitleAmount={`TOTAL INVENTORY : ${totalInventoryCount}`}
  //     >
  //       {chartData.length > 0 ? (
  //         <NormalBarGraph
  //           data={barGraphSeries}
  //           options={barGraphOptions}
  //           height={400}
  //         />
  //       ) : (
  //         <div className="text-center text-gray-500 text-sm py-10">
  //           No data available to display chart.
  //         </div>
  //       )}
  //     </WidgetSection>
  //     <WidgetSection layout={3} padding>
  //       <FinanceCard
  //         cardTitle="Inventory"
  //         titleCenter
  //         highlightNegativePositive
  //         disableColorChange
  //         descriptionData={inventoryCards.inventory}
  //       />

  //       <FinanceCard
  //         cardTitle="Occupancy"
  //         titleCenter
  //         highlightNegativePositive
  //         disableColorChange
  //         descriptionData={inventoryCards.occupancy}
  //       />

  //       <FinanceCard
  //         cardTitle="Free Inventory"
  //         titleCenter
  //         highlightNegativePositive
  //         disableColorChange
  //         descriptionData={inventoryCards.freeInventory}
  //       />
  //     </WidgetSection>

  const inventoryGraph = (
    <WidgetSection
      layout={1}
      border
      borderColor={investorGraphStyle ? "#1E3D73" : undefined}
      bodyBorderColor={investorGraphStyle ? "#9FB2CF" : undefined}
      normalCase
      title={graphTitle}
      TitleAmount={
        investorGraphStyle && monthlyView
          ? ""
          : `TOTAL INVENTORY : ${totalInventoryCount}`
      }
      headerRightContent={
        investorGraphStyle && monthlyView ? (
          <span className="rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-body font-pmedium uppercase text-[#274784]">
            AVERAGE OCCUPANCY - {averageOccupancyPercent}%
          </span>
        ) : null
      }
    >
      {inventoryGraphData.length > 0 ? (
        <div className="w-full min-w-0 overflow-hidden">
          <NormalBarGraph
            data={barGraphSeries}
            options={barGraphOptions}
            height={graphHeight}
          />
        </div>
      ) : (
        <div className="text-center text-gray-500 text-sm py-10">
          No data available to display chart.
        </div>
      )}
    </WidgetSection>
  );

  const inventorySummaryCards = (
    <div className={cardsBorder ? "mt-2" : ""}>
      <WidgetSection
        layout={3}
        padding={!cardsBorder}
        border={cardsBorder}
        title={cardsTitle}
      >
        <FinanceCard
          cardTitle="Inventory"
          titleCenter
          highlightNegativePositive
          disableColorChange
          disableLinks={disableCardLinks}
          hideLastDivider={hideInventoryLastDivider}
          descriptionData={inventoryCards.inventory}
        />

        <FinanceCard
          cardTitle="Occupancy"
          titleCenter
          highlightNegativePositive
          disableColorChange
          disableLinks={disableCardLinks}
          hideLastDivider={hideInventoryLastDivider}
          descriptionData={inventoryCards.occupancy}
        />

        <FinanceCard
          cardTitle="Free Inventory"
          titleCenter
          highlightNegativePositive
          disableColorChange
          disableLinks={disableCardLinks}
          hideLastDivider={hideInventoryLastDivider}
          descriptionData={inventoryCards.freeInventory}
        />
      </WidgetSection>
    </div>
  );

  return (
    
    <div className={`flex flex-col gap-4 ${noOuterPadding ? "" : "p-4"}`}>
      {cardsFirst
        ? !hideSummaryCards && inventorySummaryCards
        : inventoryGraph}
      {!cardsFirst && middleContent}
      {cardsFirst
        ? inventoryGraph
        : !hideSummaryCards && inventorySummaryCards}


      {!hideCheckInventory && (
        <div className="border-default border-borderGray p-4 rounded-md text-center">
        <h2 className="font-pregular text-title text-primary mt-20 mb-10 uppercase">
          Check Inventory
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center"
        >
          <div className="flex justify-center gap-4 mb-10 px-20 w-full">
            {/* Location Dropdown */}
            <FormControl className="w-1/2">
              <InputLabel>Select Location</InputLabel>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Select Location">
                    <MenuItem value="" disabled>
                      Select Location
                    </MenuItem>
                    {uniqueBuildings.length > 0 ? (
                      uniqueBuildings.map(([id, name]) => (
                        <MenuItem key={id} value={name}>
                          {name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No locations available</MenuItem>
                    )}
                  </Select>
                )}
              />
            </FormControl>

            {/* Meeting Room Dropdown */}
            <FormControl className="w-1/2">
              <InputLabel>Select Floor</InputLabel>
              <Controller
                name="floor"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Select Floor"
                    disabled={!selectedLocation}
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    <MenuItem value="">Select Floor</MenuItem>
                    {workLocations.length > 0 ? (
                      workLocations
                        .filter(
                          (unit) =>
                            unit.building &&
                            unit.building.buildingName === selectedLocation
                        )
                        .sort(sortByUnitNo)
                        .map((unit) => (
                          <MenuItem key={unit._id} value={unit.unitNo}>
                            {formatUnitDisplay(
                              unit.building.buildingName,
                              unit.unitNo
                            )}
                          </MenuItem>
                        ))
                    ) : (
                      <MenuItem disabled>No floors found</MenuItem>
                    )}
                  </Select>
                )}
              />
            </FormControl>
          </div>

          <PrimaryButton
            title="Check Availability"
            type="submit"
            fontSize="text-content"
            externalStyles="w-48 mb-20"
          />
        </form>
        </div>
      )}
    </div>
  );
};

export default CheckAvailability;

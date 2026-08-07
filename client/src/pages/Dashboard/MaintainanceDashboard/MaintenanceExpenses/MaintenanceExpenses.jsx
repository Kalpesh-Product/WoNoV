import React, { useEffect, useMemo, useState } from "react";
import BarGraph from "../../../../components/graphs/BarGraph";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import useAuth from "../../../../hooks/useAuth";
import usePageDepartment from "../../../../hooks/usePageDepartment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import YearlyGraph from "../../../../components/graphs/YearlyGraph";
import PrimaryButton from "../../../../components/PrimaryButton";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import MuiModal from "../../../../components/MuiModal";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { transformBudgetData } from "../../../../utils/transformBudgetData";
import { inrFormat } from "../../../../utils/currencyFormat";
import { toast } from "sonner";

const getFiscalYearStart = (date = dayjs()) => {
  const parsedDate = dayjs(date);
  return parsedDate.month() >= 3 ? parsedDate.year() : parsedDate.year() - 1;
};

const formatFiscalYear = (startYear) =>
  `FY ${startYear}-${String(startYear + 1).slice(-2)}`;

const getFiscalMonthIndex = (date) => {
  const parsedDate = dayjs(date);
  const month = parsedDate.month();
  return month >= 3 ? month - 3 : month + 9;
};

const getAmount = (value) => {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const MaintenanceExpenses = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const department = usePageDepartment();
  const MAINTENANCE_DEPARTMENT_ID = "6798bafbe469e809084e24a7";
  const activeDepartmentId = location.pathname.includes(
    "/maintenance-dashboard/"
  )
    ? MAINTENANCE_DEPARTMENT_ID
    : department?._id;
  const queryClient = useQueryClient();
  const currentFiscalYear = formatFiscalYear(getFiscalYearStart());
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(currentFiscalYear);
  const [
  hiddenMaintenanceExpenseSeries,
  setHiddenMaintenanceExpenseSeries,
] = useState({
  actual: false,
  projected: false,
});
  const currentFiscalMonthIndexForCard =
    dayjs().month() >= 3 ? dayjs().month() - 3 : dayjs().month() + 9;
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
  const departmentAccess = [
    "67b2cf85b9b6ed5cedeb9a2e",
    "6798bab9e469e809084e249e",
  ];

  const isTop = auth.user.departments.some((item) => {
    return departmentAccess.includes(item._id.toString());
  });

  const [openModal, setOpenModal] = useState(false);
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      expanseName: "",
      expanseType: "",
      paymentType: "",
      building: "",
      unitId: "",
      projectedAmount: null,
      dueDate: "",
      typeOfBudget: "Direct Budget",
    },
  });

  const selectedBuilding = watch("building");

  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["departmentBudget", activeDepartmentId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/budget/company-budget?departmentId=${activeDepartmentId}`
      );
      const budgets = response.data.allBudgets;
      return Array.isArray(budgets) ? budgets : [];
    },
    enabled: !!activeDepartmentId, // <- ✅ prevents firing until department is ready
  });

  const {
    data: units = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");

      return response.data;
    },
  });

  // const uniqueBuildings = Array.from(
  //   new Map(
  //     units.length > 0
  //       ? units.map((loc) => [
  //           loc.building._id, // use building._id as unique key
  //           loc.building.buildingName,
  //         ])
  //       : []
  //   ).entries()
  // );
  const uniqueBuildings = Array.from(
    new Map(
      units.length > 0
        ? units
          .filter((loc) => loc.building && loc.building._id)
          .map((loc) => [loc.building._id, loc.building.buildingName])
        : []
    ).entries()
  );

  const { mutate: requestBudget, isPending: requestBudgetPending } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.post(
          `/api/budget/request-budget/${activeDepartmentId}`,
          {
            ...data,
          }
        );
        return response.data;
      },
      onSuccess: function (data) {
        setOpenModal(false);
        toast.success(data.message);
        reset();

        queryClient.invalidateQueries(["departmentBudget"]);
      },
      onError: function (error) {
        toast.error(error.response.data.message);
      },
    });

  // Transform data into the required format
  const groupedData = hrFinance.reduce((acc, item) => {
    const month = dayjs(item.dueDate).format("MMMM YYYY"); // Extracting month and year

    if (!acc[month]) {
      acc[month] = {
        month,
        latestDueDate: item.dueDate, // Store latest due date for sorting
        projectedAmount: 0,
        amount: 0,
        tableData: {
          rows: [],
          columns: [
            { field: "expanseName", headerName: "Expense Name", flex: 1 },
            { field: "expanseType", headerName: "Expense Type", flex: 1 },
            {
              field: "projectedAmount",
              headerName: "Projected Amount (INR)",
              flex: 1,
            },
            {
              field: "actualAmount",
              headerName: "Actual Amount (INR)",
              flex: 1,
            },
            { field: "dueDate", headerName: "Due Date", flex: 1 },
            { field: "status", headerName: "Status", flex: 1 },
          ],
        },
      };
    }

    acc[month].projectedAmount += item.projectedAmount; // Summing the total projected amount per month
    acc[month].amount += item?.actualAmount; // Summing the total amount per month
    acc[month].tableData.rows.push({
      id: item._id,
      expanseName: item.expanseName,
      department: item.department,
      expanseType: item.expanseType,
      projectedAmount: item?.projectedAmount?.toFixed(2),
      actualAmount: inrFormat(item?.actualAmount || 0),
      dueDate: dayjs(item.dueDate).format("DD-MM-YYYY"),
      status: item.status,
      invoiceAttached: item.invoiceAttached,
    });

    return acc;
  }, {});

  // Data array for rendering the Accordion
  const financialData = Object.values(groupedData)
    .map((data, index) => {
      const transoformedRows = data.tableData.rows.map((row, index) => ({
        ...row,
        srNo: index + 1,
        projectedAmount: Number(
          row.projectedAmount?.toLocaleString("en-IN").replace(/,/g, "")
        ).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      }));
      const transformedCols = [
        { field: "srNo", headerName: "Sr No", width: 100 },
        ...data.tableData.columns,
      ];

      return {
        ...data,
        projectedAmount: data.projectedAmount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
        amount: data.amount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
        tableData: {
          ...data.tableData,
          rows: transoformedRows,
          columns: transformedCols,
        },
      };
    })
    .sort((a, b) => dayjs(b.latestDueDate).diff(dayjs(a.latestDueDate))); // Sort descending

  const onSubmit = (data) => {
    requestBudget(data);
    setOpenModal(false);
    reset();
  };

  // BUDGET NEW START

  const [isReady, setIsReady] = useState(false);

  // const [openModal, setOpenModal] = useState(false);

  const budgetBar = useMemo(() => {
    if (isHrLoading || !Array.isArray(hrFinance)) return null;
    return transformBudgetData(hrFinance);
  }, [isHrLoading, hrFinance]);

  useEffect(() => {
    if (!isHrLoading) {
      const timer = setTimeout(() => setIsReady(true), 1000);
      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [isHrLoading]);

  const expenseRawSeries = useMemo(() => {
    // Initialize monthly buckets
    const months = Array.from({ length: 12 }, (_, index) =>
      dayjs(`2024-04-01`).add(index, "month").format("MMM")
    );

    const fyData = {
      "FY 2024-25": Array(12).fill(0),
      "FY 2025-26": Array(12).fill(0),
    };

    hrFinance.forEach((item) => {
      const date = dayjs(item.dueDate);
      const year = date.year();
      const monthIndex = date.month(); // 0 = Jan, 11 = Dec

      if (year === 2024 && monthIndex >= 3) {
        // Apr 2024 to Dec 2024 (month 3 to 11)
        fyData["FY 2024-25"][monthIndex - 3] += item.actualAmount || 0;
      } else if (year === 2025) {
        if (monthIndex <= 2) {
          // Jan to Mar 2025 (months 0–2)
          fyData["FY 2024-25"][monthIndex + 9] += item.actualAmount || 0;
        } else if (monthIndex >= 3) {
          // Apr 2025 to Dec 2025 (months 3–11)
          fyData["FY 2025-26"][monthIndex - 3] += item.actualAmount || 0;
        }
      } else if (year === 2026 && monthIndex <= 2) {
        // Jan to Mar 2026
        fyData["FY 2025-26"][monthIndex + 9] += item.actualAmount || 0;
      }
    });

    return [
      {
        name: "total",
        group: "FY 2024-25",
        data: fyData["FY 2024-25"],
      },
      {
        name: "total",
        group: "FY 2025-26",
        data: fyData["FY 2025-26"],
      },
    ];
  }, [hrFinance]);

  const maxExpenseValue = Math.max(
    ...expenseRawSeries.flatMap((series) => series.data)
  );
  const roundedMax = Math.ceil((maxExpenseValue + 100000) / 100000) * 100000;

  const expenseOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },

      stacked: false,
      fontFamily: "Poppins-Regular, Arial, sans-serif",
    },
    colors: ["#54C4A7", "#EB5C45"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
        borderRadiusApplication: "none",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => {
        return inrFormat(val);
      },

      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
      offsetY: -22,
    },

    yaxis: {
      max: roundedMax,
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => `${val / 100000}`,
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      show: true,
      position: "top",
    },

    tooltip: {
      enabled: false,
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const rawData = expenseRawSeries[seriesIndex]?.data[dataPointIndex];
        // return `<div style="padding: 8px; font-family: Poppins, sans-serif;">
        //       HR Expense: INR ${rawData.toLocaleString("en-IN")}
        //     </div>`;
        return `
               <div style="padding: 8px; font-size: 13px; font-family: Poppins, sans-serif">
           
                 <div style="display: flex; align-items: center; justify-content: space-between; background-color: #d7fff4; color: #00936c; padding: 6px 8px; border-radius: 4px; margin-bottom: 4px;">
                   <div><strong>Finance Expense:</strong></div>
                   <div style="width: 10px;"></div>
                <div style="text-align: left;">INR ${Math.round(
          rawData
        ).toLocaleString("en-IN")}</div>
   
                 </div>
        
               </div>
             `;
      },
    },
  };

  const totalUtilised =
    budgetBar?.[selectedFiscalYear]?.utilisedBudget?.reduce(
      (acc, val) => acc + val,
      0
    ) || 0;

  const maintenanceExpenseByFiscalYear = useMemo(() => {
  const fyData = {};

  (hrFinance || []).forEach((item) => {
    if (
      !item?.dueDate ||
      !dayjs(item.dueDate).isValid()
    ) {
      return;
    }

    const fiscalYearStart =
      getFiscalYearStart(item.dueDate);

    const fiscalYearLabel =
      formatFiscalYear(fiscalYearStart);

    const monthIndex =
      getFiscalMonthIndex(item.dueDate);

    if (!fyData[fiscalYearLabel]) {
      fyData[fiscalYearLabel] = {
        actual: Array(12).fill(0),
        projected: Array(12).fill(0),
      };
    }

    fyData[fiscalYearLabel].actual[monthIndex] +=
      getAmount(item?.actualAmount);

    fyData[fiscalYearLabel].projected[monthIndex] +=
      getAmount(item?.projectedAmount);
  });

  if (!fyData[currentFiscalYear]) {
    fyData[currentFiscalYear] = {
      actual: Array(12).fill(0),
      projected: Array(12).fill(0),
    };
  }

  return fyData;
}, [hrFinance, currentFiscalYear]);

const stackedExpenseRawSeries = useMemo(() => {
  return Object.entries(
    maintenanceExpenseByFiscalYear,
  )
    .sort(([fyA], [fyB]) => {
      const startA = Number(fyA.slice(3, 7));
      const startB = Number(fyB.slice(3, 7));

      return startA - startB;
    })
    .flatMap(([fiscalYear, data]) => {
      const actualForGraph = data.actual.map(
        (actualAmount) => {
          if (
            hiddenMaintenanceExpenseSeries.actual
          ) {
            return 0;
          }

          return Number(actualAmount || 0);
        },
      );

      const projectedForGraph =
        data.projected.map(
          (projectedAmount, monthIndex) => {
           
            if (
              hiddenMaintenanceExpenseSeries.projected
            ) {
              return 0;
            }

           
            if (
              hiddenMaintenanceExpenseSeries.actual
            ) {
              return Number(projectedAmount || 0);
            }

           
            const actualAmount = Number(
              data.actual?.[monthIndex] || 0,
            );

            return actualAmount > 0
              ? 0
              : Number(projectedAmount || 0);
          },
        );

      return [
        {
          name: "Actual Amount",
          group: fiscalYear,
          data: actualForGraph,
        },
        {
          name: "Projected Amount",
          group: fiscalYear,
          data: projectedForGraph,
        },
      ];
    });
}, [
  maintenanceExpenseByFiscalYear,
  hiddenMaintenanceExpenseSeries.actual,
  hiddenMaintenanceExpenseSeries.projected,
]);

const {
  stackedRoundedMax,
  stackedTickAmount,
} = useMemo(() => {
  const selectedYearSeries =
    stackedExpenseRawSeries.filter(
      (series) =>
        series.group === selectedFiscalYear,
    );

  const monthlyTotals = Array.from(
    { length: 12 },
    (_, monthIndex) =>
      selectedYearSeries.reduce(
        (total, series) =>
          total +
          Number(
            series?.data?.[monthIndex] || 0,
          ),
        0,
      ),
  );

  const maxExpenseValue = Math.max(
    ...monthlyTotals,
    0,
  );

  if (maxExpenseValue <= 0) {
    return {
      stackedRoundedMax: 10000,
      stackedTickAmount: 1,
    };
  }

  const bufferedMax = maxExpenseValue * 1.1;
  const roughStep = bufferedMax / 6;

  const magnitude =
    10 ** Math.floor(Math.log10(roughStep));

  const normalizedStep =
    roughStep / magnitude;

  let step;

  if (normalizedStep <= 1) {
    step = magnitude;
  } else if (normalizedStep <= 2) {
    step = 2 * magnitude;
  } else if (normalizedStep <= 5) {
    step = 5 * magnitude;
  } else {
    step = 10 * magnitude;
  }

  const safeRoundedMax =
    Math.ceil(bufferedMax / step) * step;

  return {
    stackedRoundedMax: safeRoundedMax,

    stackedTickAmount: Math.max(
      Math.round(safeRoundedMax / step),
      1,
    ),
  };
}, [
  stackedExpenseRawSeries,
  selectedFiscalYear,
]);

const selectedMaintenanceYearTotals =
  useMemo(() => {
    const selectedYearData =
      maintenanceExpenseByFiscalYear?.[
        selectedFiscalYear
      ];

    const actualAmounts =
      selectedYearData?.actual ||
      Array(12).fill(0);

    const projectedAmounts =
      selectedYearData?.projected ||
      Array(12).fill(0);

    return {
      actualTotal: actualAmounts.reduce(
        (sum, amount) =>
          sum + getAmount(amount),
        0,
      ),

      projectedTotal:
        projectedAmounts.reduce(
          (sum, amount) =>
            sum + getAmount(amount),
          0,
        ),
    };
  }, [
    maintenanceExpenseByFiscalYear,
    selectedFiscalYear,
  ]);

const stackedExpenseOptions = {
  chart: {
    type: "bar",

    toolbar: {
      show: false,
    },

    stacked: true,

    fontFamily:
      "Poppins-Regular, Arial, sans-serif",

    events: {
      legendClick: (
        _chartContext,
        seriesIndex,
      ) => {
        setHiddenMaintenanceExpenseSeries(
          (currentState) => {
            if (seriesIndex === 0) {
              return {
                ...currentState,
                actual:
                  !currentState.actual,
              };
            }

            if (seriesIndex === 1) {
              return {
                ...currentState,
                projected:
                  !currentState.projected,
              };
            }

            return currentState;
          },
        );
      },
    },
  },

  colors: ["#54C4A7", "#C4C4C4"],

  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "40%",
      borderRadius: 5,
      borderRadiusApplication: "end",

      dataLabels: {
        position: "top",

        total: {
          enabled: true,
          offsetY: -8,

          formatter: (_, config) => {
            const total = Number(
              config?.w?.globals
                ?.stackedSeriesTotals?.[
                config?.dataPointIndex
              ] || 0,
            );

            if (total <= 0) {
              return "";
            }

            return inrFormat(total);
          },

          style: {
            fontSize: "12px",
            fontWeight: 600,
            color: "#000000",
          },
        },
      },
    },
  },

  dataLabels: {
    enabled: false,
  },

  xaxis: {
    categories: fiscalMonths,

    
    crosshairs: {
      show: false,

      fill: {
        opacity: 0,
      },

      stroke: {
        opacity: 0,
      },
    },
  },

  yaxis: {
    min: 0,
    max: stackedRoundedMax,
    tickAmount: stackedTickAmount,
    forceNiceScale: false,

    title: {
      text: "Amount In Lakhs (INR)",
    },

    labels: {
      minWidth: 25,
      maxWidth: 35,

      formatter: (value) => {
        const axisValue =
          Number(value || 0) / 10000;

        if (
          Number.isInteger(axisValue)
        ) {
          return String(axisValue);
        }

        return Number(
          axisValue.toFixed(2),
        ).toString();
      },

      style: {
        fontFamily:
          "Poppins-Regular, Arial, sans-serif",
        fontSize: "11px",
      },
    },
  },

  fill: {
    opacity: 1,
  },

  states: {
    hover: {
      filter: {
        type: "none",
      },
    },

    active: {
      filter: {
        type: "none",
      },
    },
  },

  legend: {
    show: true,
    position: "top",

   
    onItemClick: {
      toggleDataSeries: false,
    },

    labels: {
      colors: [
        hiddenMaintenanceExpenseSeries.actual
          ? "#D5D5D5"
          : "#4B4B4B",

        hiddenMaintenanceExpenseSeries.projected
          ? "#D5D5D5"
          : "#4B4B4B",
      ],
    },

    markers: {
      fillColors: [
        hiddenMaintenanceExpenseSeries.actual
          ? "#E1F5EF"
          : "#54C4A7",

        hiddenMaintenanceExpenseSeries.projected
          ? "#E2E2E2"
          : "#C4C4C4",
      ],
    },
  },

  tooltip: {
    enabled: true,
    shared: true,
    intersect: false,

    custom: function ({
      dataPointIndex,
      w,
    }) {
      const selectedYearData =
        maintenanceExpenseByFiscalYear?.[
          selectedFiscalYear
        ];

      const actualAmount = Number(
        selectedYearData?.actual?.[
          dataPointIndex
        ] || 0,
      );

      const projectedAmount = Number(
        selectedYearData?.projected?.[
          dataPointIndex
        ] || 0,
      );

      const monthLabel =
        w?.globals?.labels?.[
          dataPointIndex
        ] ||
        `Month ${dataPointIndex + 1}`;

      return `
        <div
          class="apexcharts-tooltip-title"
          style="
            font-family: Poppins-Regular;
            font-size: 12px;
            padding: 6px 10px;
            margin-bottom: 0;
          "
        >
          ${monthLabel}
        </div>

        <div
          style="
            padding: 8px 10px;
            font-family: Poppins-Regular;
            font-size: 12px;
            background: #ffffff;
            min-width: 230px;
          "
        >
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 14px;
              margin-bottom: 7px;
              white-space: nowrap;
            "
          >
            <div
              style="
                display: flex;
                align-items: center;
                gap: 6px;
              "
            >
              <span
                style="
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background: #C4C4C4;
                  display: inline-block;
                  flex-shrink: 0;
                "
              ></span>

              <span>Projected Amount:</span>
            </div>

            <span style="font-weight: 600;">
              INR ${Math.round(
                projectedAmount,
              ).toLocaleString("en-IN")}
            </span>
          </div>

          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 14px;
              white-space: nowrap;
            "
          >
            <div
              style="
                display: flex;
                align-items: center;
                gap: 6px;
              "
            >
              <span
                style="
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background: #54C4A7;
                  display: inline-block;
                  flex-shrink: 0;
                "
              ></span>

              <span>Actual Amount:</span>
            </div>

            <span style="font-weight: 600;">
              INR ${Math.round(
                actualAmount,
              ).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      `;
    },
  },
};
  // BUDGET NEW END

  return (
    <div className="flex flex-col gap-8 p-4">
      {/* <YearlyGraph
        data={stackedExpenseRawSeries}
        options={stackedExpenseOptions}
        title={`BIZ Nest ${department?.name?.toUpperCase()} DEPARTMENT EXPENSE`}
        titleAmount={`INR ${inrFormat(stackedTotalUtilised)}`}
        currentYear={currentFiscalYear}
        onYearChange={setSelectedFiscalYear}
      /> */}

      <YearlyGraph
  data={stackedExpenseRawSeries}
  options={stackedExpenseOptions}
  title={`BIZ Nest ${department?.name?.toUpperCase()} DEPARTMENT EXPENSE`}
  TitleAmountTotal={`INR ${inrFormat(
    selectedMaintenanceYearTotals.projectedTotal,
  )}`}
  TitleAmountGreen={`INR ${inrFormat(
    selectedMaintenanceYearTotals.actualTotal,
  )}`}
  totalTitle="PROJECTED"
  greenTitle="ACTUAL"
  summaryChipVariant="budget"
  currentYear={currentFiscalYear}
  onYearChange={setSelectedFiscalYear}
/>

      {/* {!isTop && (
        <div className="flex justify-end">
          <PrimaryButton
            title={"Request Budget"}
            padding="px-5 py-2"
            fontSize="text-base"
            handleSubmit={() => setOpenModal(true)}
          />
        </div>
      )} */}

      <AllocatedBudget financialData={financialData} exportData />
      <MuiModal
        title="Request Budget"
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Expense Name */}
          <Controller
            name="expanseName"
            control={control}
            rules={{ required: "Expense name is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Expense Name"
                fullWidth
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Expense Type */}
          <Controller
            name="expanseType"
            control={control}
            rules={{ required: "Expense type is required" }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <Select {...field} size="small" displayEmpty>
                  <MenuItem value="" disabled>
                    Select Expense Type
                  </MenuItem>
                  <MenuItem value="Internal">Internal</MenuItem>
                  <MenuItem value="External">External</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          {/* Payment Type */}
          <Controller
            name="paymentType"
            control={control}
            rules={{ required: "Payment type is required" }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <Select {...field} size="small" displayEmpty>
                  <MenuItem value="" disabled>
                    Select Payment Type
                  </MenuItem>
                  <MenuItem value="One Time">One Time</MenuItem>
                  <MenuItem value="Recurring">Recurring</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          {/* Building */}
          <Controller
            name="building"
            control={control}
            rules={{ required: "Building is required" }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <Select {...field} size="small" displayEmpty>
                  <MenuItem value="" disabled>
                    Select Building
                  </MenuItem>
                  {locationsLoading
                    ? []
                    : uniqueBuildings.map((building) => (
                      <MenuItem key={building[0]} value={building[1]}>
                        {building[1]}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          />

          {/* Unit */}
          <Controller
            name="unitId"
            control={control}
            rules={{ required: "Unit is required" }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <Select {...field} size="small" displayEmpty>
                  <MenuItem value="" disabled>
                    Select Unit
                  </MenuItem>
                  {locationsLoading
                    ? []
                    : units.map((unit) =>
                      unit.building.buildingName === selectedBuilding ? (
                        <MenuItem key={unit._id} value={unit._id}>
                          {unit.unitNo}
                        </MenuItem>
                      ) : (
                        <></>
                      )
                    )}
                </Select>
              </FormControl>
            )}
          />

          {/* Amount */}
          <Controller
            name="projectedAmount"
            control={control}
            rules={{
              required: "Amount is required",
              pattern: {
                value: /^[0-9]+(\.[0-9]{1,2})?$/,
                message: "Enter a valid amount",
              },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Projected Amount"
                fullWidth
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Due Date */}
          <Controller
            name="dueDate"
            control={control}
            rules={{ required: "Due date is required" }}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  {...field}
                  label="Due Date"
                  format="DD-MM-YYYY"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : null)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />
          <div className="flex justify-center items-center">
            {/* Submit Button */}
            <PrimaryButton type={"submit"} title={"Submit"} />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default MaintenanceExpenses;

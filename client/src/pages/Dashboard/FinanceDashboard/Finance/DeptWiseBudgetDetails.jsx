import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import WidgetSection from "../../../../components/WidgetSection";
import PrimaryButton from "../../../../components/PrimaryButton";
import DataCard from "../../../../components/DataCard";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { inrFormat } from "../../../../utils/currencyFormat";
import { transformBudgetData } from "../../../../utils/transformBudgetData";
import YearlyGraph from "../../../../components/graphs/YearlyGraph";

const DeptWiseBudgetDetails = () => {
  const axios = useAxiosPrivate();
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      expanseName: "",
      expanseType: "",
      projectedAmount: null,
      dueDate: "",
    },
  });
  const deptId = location.state?.deptId;
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

const getRoundedAxisMax = (value) => {
  if (!value || value <= 0) return 500000;

  const axisStep = 500000;
  return Math.ceil((value * 1.1) / axisStep) * axisStep;
};

const [selectedFiscalYear, setSelectedFiscalYear] = useState(() =>
  formatFiscalYear(getFiscalYearStart())
);
  const deptName = location.state?.deptName;
  const { data: departmentBudget = [], isPending: isBudgetLoading } = useQuery({
    queryKey: ["departmentBudget"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=${deptId}`
        );
        const budgets = response.data.allBudgets;
        return Array.isArray(budgets) ? budgets : [];
      } catch (error) {
        console.error("Error fetching budget:", error);
        return [];
      }
    },
  });

  // Transform data into the required format
  const groupedData = departmentBudget.reduce((acc, item) => {
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
            // { field: "department", headerName: "Department", flex: 200 },
            { field: "expanseType", headerName: "Expense Type", flex: 1 },
            { field: "projectedAmount", headerName: "Projected Amount (INR)", flex: 1 },
            { field: "actualAmount", headerName: "Actual Amount (INR)", flex: 1 },
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
      projectedAmount: item.projectedAmount,
      actualAmount: inrFormat(item?.actualAmount || 0),
      dueDate: dayjs(item.dueDate).format("DD-MM-YYYY"),
      status: item.status,
    });

    return acc;
  }, {});

  // Data array for rendering the Accordion
  const financialData = Object.values(groupedData)
    .map((data, index) => {
      const transoformedRows = data.tableData.rows.map((row, index) => ({
        ...row,
        srNo: index + 1,
        projectedAmount: Number(row.projectedAmount).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        }),
      }));
      const transformedCols = [
        { field: "srNo", headerName: "SR NO", flex: 1 },
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
    setOpenModal(false);
    toast.success("Budget Requested succesfully");
    reset();
  };

  // BUDGET NEW START

  const [isReady, setIsReady] = useState(false);

  // const [openModal, setOpenModal] = useState(false);

  const budgetBar = useMemo(() => {
    if (isBudgetLoading || !Array.isArray(departmentBudget)) return null;
    return transformBudgetData(departmentBudget);
  }, [isBudgetLoading, departmentBudget]);

  useEffect(() => {
    if (!isBudgetLoading) {
      const timer = setTimeout(() => setIsReady(true), 1000);
      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [isBudgetLoading]);

  const expenseRawSeries = useMemo(() => {
  const fyData = {};

  departmentBudget.forEach((item) => {
    if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

    const fiscalYearStart = getFiscalYearStart(item.dueDate);
    const fiscalYearLabel = formatFiscalYear(fiscalYearStart);
    const monthIndex = getFiscalMonthIndex(item.dueDate);

    if (!fyData[fiscalYearLabel]) {
      fyData[fiscalYearLabel] = {
        actual: Array(12).fill(0),
        projectedTotal: Array(12).fill(0),
      };
    }

    const actualAmount = getAmount(item.actualAmount);
    const projectedAmount = getAmount(item.projectedAmount);

    fyData[fiscalYearLabel].actual[monthIndex] += actualAmount;
    fyData[fiscalYearLabel].projectedTotal[monthIndex] += projectedAmount;
  });

  const currentFiscalYear = formatFiscalYear(getFiscalYearStart());

  if (!fyData[currentFiscalYear]) {
    fyData[currentFiscalYear] = {
      actual: Array(12).fill(0),
      projectedTotal: Array(12).fill(0),
    };
  }

  return Object.entries(fyData)
    .sort(([fyA], [fyB]) => {
      const startA = Number(fyA.slice(3, 7));
      const startB = Number(fyB.slice(3, 7));
      return startA - startB;
    })
    .flatMap(([fiscalYear, data]) => {
      const projectedBalance = data.projectedTotal.map((projected, index) => {
        const actual = data.actual[index] || 0;

        // Gray part should show remaining projected amount above actual.
        // If actual is 0, full projected amount shows as gray.
        return Math.max(projected - actual, 0);
      });

      return [
        {
          name: "Actual Amount",
          group: fiscalYear,
          data: data.actual,
        },
        {
          name: "Projected Amount",
          group: fiscalYear,
          data: projectedBalance,
        },
      ];
    });
}, [departmentBudget]);

  const selectedActualSeries =
    expenseRawSeries.find(
      (item) =>
        item.group === selectedFiscalYear && item.name === "Actual Amount"
    )?.data || [];

  const selectedProjectedSeries =
    expenseRawSeries.find(
      (item) =>
        item.group === selectedFiscalYear && item.name === "Projected Amount"
    )?.data || [];

  const selectedYearAxisMax = getRoundedAxisMax(
    selectedActualSeries.reduce((maxValue, actualAmount, index) => {
      const stackedTotal =
        actualAmount + (selectedProjectedSeries[index] || 0);
      return Math.max(maxValue, stackedTotal);
    }, 0)
  );

  const expenseOptions = {
  chart: {
    type: "bar",
    toolbar: { show: false },
    stacked: true,
    fontFamily: "Poppins-Regular, Arial, sans-serif",
  },
  colors: ["#54C4A7", "#c4c4c4"],
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
          formatter: (_, config) => {
            const total =
              config?.w?.globals?.stackedSeriesTotals?.[config?.dataPointIndex] ||
              0;

            return total ? inrFormat(Number(total)) : "";
          },
          style: {
            fontSize: "12px",
            fontWeight: 600,
            color: "#000",
          },
          offsetY: -8,
        },
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  yaxis: {
    max: selectedYearAxisMax,
    title: { text: "Amount In Lakhs (INR)" },
    labels: {
      formatter: (val) => `${val / 100000}`,
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
  },
  tooltip: {
    enabled: true,
    custom: function ({ seriesIndex, dataPointIndex, w }) {
      const seriesName = w.globals.seriesNames?.[seriesIndex];

      const actualSeries = w.globals.initialSeries.find(
        (item) => item.name === "Actual Amount"
      );

      const projectedSeries = w.globals.initialSeries.find(
        (item) => item.name === "Projected Amount"
      );

      const actualAmount = actualSeries?.data?.[dataPointIndex] || 0;
      const projectedBalance = projectedSeries?.data?.[dataPointIndex] || 0;
      const projectedTotal = actualAmount + projectedBalance;

      const monthLabel =
        w.globals.labels && w.globals.labels[dataPointIndex]
          ? w.globals.labels[dataPointIndex]
          : `Month ${dataPointIndex + 1}`;

      const isActual = seriesName === "Actual Amount";

      const label = isActual ? "Actual Amount" : "Projected Amount";
      const amount = isActual ? actualAmount : projectedTotal;
      const color = isActual ? "#54C4A7" : "#c4c4c4";

      return `
        <div class="apexcharts-tooltip-title" style="
          font-family: Poppins-Regular;
          font-size: 12px;
          padding: 6px 10px;
          margin-bottom: 0;
        ">
          ${monthLabel}
        </div>

        <div style="
          padding: 8px 10px;
          font-family: Poppins-Regular;
          font-size: 12px;
          background: #fff;
          min-width: 230px;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          ">
            <span style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: ${color};
              display: inline-block;
            "></span>

            <span>${label}:</span>

            <span style="font-weight: 600;">
              INR ${Math.round(amount).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      `;
    },
  },
};

 const totalUtilised =
  expenseRawSeries
    .find(
      (item) =>
        item.group === selectedFiscalYear && item.name === "Actual Amount"
    )
    ?.data?.reduce((acc, val) => acc + val, 0) || 0;
  //const navigate = useNavigate();
  // BUDGET NEW END

  return (
    // <div className="flex flex-col gap-8">
      <div className="p-4 flex flex-col gap-8">
      <YearlyGraph
        data={expenseRawSeries}
        options={expenseOptions}
        title={`BIZ Nest ${deptName.toUpperCase()} DEPARTMENT EXPENSE`}
        titleAmount={`INR ${Math.round(totalUtilised).toLocaleString("en-IN")}`}
        onYearChange={setSelectedFiscalYear}
      />

      {/* <div>
        <WidgetSection layout={3} padding>
          <DataCard
            data={"INR 50,00,000"}
            title={"Projected"}
            description={`Current Month: ${new Date().toLocaleString(
              "default",
              {
                month: "short",
              }
            )}-25`}
          />
          <DataCard
            data={"INR 45,00,000"}
            title={"Actual"}
            description={`Current Month: ${new Date().toLocaleString(
              "default",
              {
                month: "short",
              }
            )}-25`}
          />
          <DataCard
            data={"INR 12,000"}
            title={"Requested"}
            description={`Current Month: ${new Date().toLocaleString(
              "default",
              {
                month: "short",
              }
            )}-25`}
          />
        </WidgetSection>
      </div>

      <div className="flex justify-end">
        <PrimaryButton
          title={"Request Budget"}
          padding="px-5 py-2"
          fontSize="text-base"
        />
      </div> */}

      <AllocatedBudget financialData={financialData} noInvoice exportData />
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

export default DeptWiseBudgetDetails;

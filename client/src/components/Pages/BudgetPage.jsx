import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import PrimaryButton from "../../components/PrimaryButton";
import AllocatedBudget from "../../components/Tables/AllocatedBudget";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MuiModal from "../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { inrFormat } from "../../utils/currencyFormat";
import { transformBudgetData } from "../../utils/transformBudgetData";
import YearlyGraph from "../../components/graphs/YearlyGraph";
import useAuth from "../../hooks/useAuth";
import usePageDepartment from "../../hooks/usePageDepartment";
import FyBarGraph from "../graphs/FyBarGraph";
import { PERMISSIONS } from "../../constants/permissions";
import useUserPermissions from "../../hooks/useUserPermissions";

const getCurrentFinancialYearLabel = () => {
  const today = dayjs();
  const startYear = today.month() < 3 ? today.year() - 1 : today.year();
  return `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};

const BudgetPage = () => {
  const axios = useAxiosPrivate();
  const { hasPermission } = useUserPermissions();
  const { auth } = useAuth();
  const location = useLocation();
  const department = usePageDepartment();
  const queryClient = useQueryClient();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(
    getCurrentFinancialYearLabel(),
  );
 
  const requestBudgetPermissionByDepartment = {
    "6798bab0e469e809084e249a": PERMISSIONS.FINANCE_REQUEST_BUDGET_BUTTON.value,
    "6798bab9e469e809084e249e": PERMISSIONS.HR_REQUEST_BUDGET_BUTTON.value,
    "6798bacce469e809084e24a1": PERMISSIONS.SALES_REQUEST_BUDGET_BUTTON.value,
    "6798bae6e469e809084e24a4": PERMISSIONS.ADMIN_REQUEST_BUDGET_BUTTON.value,
    "6798bafbe469e809084e24a7":
      PERMISSIONS.MAINTENANCE_REQUEST_BUDGET_BUTTON.value,
    "6798baa8e469e809084e2497": PERMISSIONS.IT_REQUEST_BUDGET_BUTTON.value,
    "6798ba9de469e809084e2494":
      PERMISSIONS.FRONTEND_REQUEST_BUDGET_BUTTON.value,
  };

  const requestBudgetPermission =
    requestBudgetPermissionByDepartment[department?._id];
  const canRequestBudget = requestBudgetPermission
    ? hasPermission(requestBudgetPermission)
    : true;

  const [openModal, setOpenModal] = useState(false);
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      expanseName: "",
      expanseType: "",
      paymentType: "",
      building: "",
      unitId: "",
      // projectedAmount: null,
      actualAmount: null,
      dueDate: "",
      typeOfBudget: "Direct Budget",
    },
  });

  const selectedBuilding = watch("building");

  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["departmentBudget", department?._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/budget/company-budget?departmentId=${department._id}`,
      );
      const budgets = response.data.allBudgets;
      return Array.isArray(budgets) ? budgets : [];
    },
    enabled: !!department?._id,
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
        : [],
    ).entries(),
  );

  const { mutate: requestBudget, isPending: requestBudgetPending } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.post(
          `/api/budget/request-budget/${department._id}`,
          {
            ...data,
          },
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
        // projectedAmount: 0,
        actualAmount: 0,
        amount: 0,
        tableData: {
          rows: [],
          columns: [
            { field: "expanseName", headerName: "Expense Name", flex: 1 },
            // { field: "department", headerName: "Department", flex: 200 },
            { field: "expanseType", headerName: "Expense Type", flex: 1 },
           // { field: "projectedAmount", headerName: "Projected Amount (INR)", flex: 1 },
             { field: "projectedAmount", headerName: "Projected Amount(INR)",  flex: 1,valueFormatter: (params) => inrFormat(params.value), },
            {
              field: "actualAmount",
              headerName: "Actual Amount (INR)",
              flex: 1,
            },
            { field: "dueDate", headerName: "Due Date", flex: 1 },
            { field: "status", headerName: "Approval Status", flex: 1 },
          ],
        },
      };
    }

    // acc[month].projectedAmount += item.projectedAmount; // Summing the total projected amount per month
    acc[month].actualAmount += item.actualAmount; // Summing the total actual amount per month
    acc[month].amount += item?.actualAmount; // Summing the total amount per month
    acc[month].tableData.rows.push({
      id: item._id,
      expanseName: item.expanseName,
      department: item.department,
      expanseType: item.expanseType,
      paymentType: item.paymentType || "",
      building: item?.unit?.building?.buildingName || item.building || "",
      unit: item?.unit?.unitNo || "",
      projectedAmountRaw: item?.projectedAmount || 0,
      projectedAmount: item?.projectedAmount?.toFixed(2),
      actualAmount: Number(item?.actualAmount || 0).toFixed(2),
      actualAmountRaw: item?.actualAmount || "",
      dueDate: dayjs(item.dueDate).format("DD-MM-YYYY"),
      dueDateRaw: item?.dueDate,
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
        // projectedAmount: Number(
        //   row.projectedAmount?.toLocaleString("en-IN").replace(/,/g, "")
        // ).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
        actualAmount: Number(
          row.actualAmount?.toLocaleString("en-IN").replace(/,/g, ""),
        ).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      }));
      const transformedCols = [
        { field: "srNo", headerName: "Sr No", width: 100 },
        ...data.tableData.columns,
      ];

      return {
        ...data,
        // projectedAmount: data.projectedAmount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
        actualAmount: data.actualAmount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
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
    const getFiscalYearStart = (date) =>
      date.month() < 3 ? date.year() - 1 : date.year();

    const getFiscalYearLabel = (startYear) =>
      `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;

    const fyData = {};

    hrFinance.forEach((item) => {
      const date = dayjs(item.dueDate);
      if (!date.isValid()) {
        return;
      }

      const fiscalYearStart = getFiscalYearStart(date);
      const fiscalYearLabel = getFiscalYearLabel(fiscalYearStart);
      const bucketIndex = date.month() >= 3 ? date.month() - 3 : date.month() + 9;

      if (!fyData[fiscalYearLabel]) {
        fyData[fiscalYearLabel] = Array(12).fill(0);
      }

      fyData[fiscalYearLabel][bucketIndex] += item.actualAmount || 0;
    });

    return Object.keys(fyData)
      .sort()
      .map((financialYear) => ({
        name: "total",
        group: financialYear,
        data: fyData[financialYear],
      }));
  }, [hrFinance]);

  const budgetGraphData = useMemo(() => {
    return (hrFinance || []).flatMap((item) => {
      const dueDate = item?.dueDate;
      const projectedAmount = Number(item?.projectedAmount || 0);
      const actualAmount = Number(item?.actualAmount || 0);
      const remainingProjectedAmount = Math.max(projectedAmount - actualAmount, 0);

      const series = [
        {
          dueDate,
          amount: actualAmount,
          vertical: "Actual Amount",
        },
      ];

      const shouldShowProjectedAmount = remainingProjectedAmount > 0;

      if (shouldShowProjectedAmount) {
        series.push({
          dueDate,
          amount: remainingProjectedAmount,
          vertical: "Projected Amount",
        });
      }

      return series;
    });
  }, [hrFinance]);

  const { roundedMax, tickAmount } = useMemo(() => {
    const monthlyTotals = budgetGraphData.reduce((acc, item) => {
      const dueDate = item?.dueDate;
      if (!dueDate) return acc;

      const monthKey = dayjs(dueDate).format("YYYY-MM");
      acc[monthKey] = (acc[monthKey] || 0) + Number(item?.amount || 0);
      return acc;
    }, {});

    const maxExpenseValue = Math.max(...Object.values(monthlyTotals), 0);
    if (maxExpenseValue <= 0) {
      return { roundedMax: 10000, tickAmount: 5 };
    }

    const bufferedMax = maxExpenseValue * 1.1;
    const roughStep = bufferedMax / 6;
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const normalizedStep = roughStep / magnitude;

    let step = magnitude;
    if (normalizedStep <= 1) step = magnitude;
    else if (normalizedStep <= 2) step = 2 * magnitude;
    else if (normalizedStep <= 5) step = 5 * magnitude;
    else step = 10 * magnitude;

    const safeRoundedMax = Math.ceil(bufferedMax / step) * step;

    return {
      roundedMax: safeRoundedMax,
      tickAmount: Math.max(Math.round(safeRoundedMax / step), 1),
    };
  }, [budgetGraphData]);

  const expenseOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },

      stacked: true,
      fontFamily: "Poppins-Regular, Arial, sans-serif",
    },
    colors: ["#54C4A7", "#C4C4C4"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "48%",
        borderRadius: 5,
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
        dataLabels: {
          position: "top",
          total: {
            enabled: true,
            offsetY: -3,
            style: {
              fontSize: "12px",
              fontWeight: 600,
              color: "#000000",
            },
            formatter: (_, config) => {
              const currentMonthLabel = dayjs().format("MMM-YY");
              const monthLabel =
                config?.w?.globals?.labels?.[config?.dataPointIndex];

              if (monthLabel === currentMonthLabel) {
                return "";
              }

              const total =
                config?.w?.globals?.stackedSeriesTotals?.[
                  config?.dataPointIndex
                ] || 0;
              return inrFormat(Number(total || 0));
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },

    yaxis: {
      min: 0,
      max: roundedMax,
      title: { text: "Amount In Lakhs (INR)" },
      tickAmount,
      labels: {
        formatter: (val) => `${val / 10000}`,
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
      shared: false,
      intersect: true,
      y: {
        formatter: (value) => `INR ${inrFormat(Number(value || 0))}`,
      },
    },
  };

  const totalUtilised =
    budgetBar?.[selectedFiscalYear]?.utilisedBudget?.reduce(
      (acc, val) => acc + val,
      0,
    ) || 0;

  const navigate = useNavigate();
  // BUDGET NEW END

  return (
    <div className="flex flex-col gap-8">
      <FyBarGraph
        data={budgetGraphData}
        dateKey="dueDate"
        valueKey="amount"
        chartOptions={expenseOptions}
        graphTitle={`BIZ Nest ${department?.name?.toUpperCase()} DEPARTMENT EXPENSE`}
        titleAmount={`INR ${inrFormat(totalUtilised)}`}
      />

      {canRequestBudget && (
        <div className="flex justify-end">
          <PrimaryButton
            title={"Request Budget"}
            padding="px-5 py-2"
            fontSize="text-base"
            handleSubmit={() => setOpenModal(true)}
          />
        </div>
      )}

       <AllocatedBudget
        financialData={financialData}
        noInvoice={false}
        enableActionMenu
        filterApprovedAndPendingOnly
        newTitle="BIZ Nest EXPENSE DETAILS"
        exportData
      />
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
                  {isHrLoading
                    ? []
                    : [
                        ...new Map(
                          hrFinance.map((item) => [item.expanseType, item]),
                        ).values(),
                      ].map((item) => (
                        <MenuItem key={item._id} value={item.expanseType}>
                          {item.expanseType}
                        </MenuItem>
                      ))}
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
                        ),
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

          {/* <Controller
            name="actualAmount"
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
                label="Actual Amount"
                fullWidth
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          /> */}

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
                  disablePast
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

export default BudgetPage;

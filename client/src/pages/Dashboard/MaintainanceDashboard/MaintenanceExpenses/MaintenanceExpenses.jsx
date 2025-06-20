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

const MaintenanceExpenses = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const location = useLocation();
  const department = usePageDepartment();
  const queryClient = useQueryClient();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("FY 2024-25");
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
    queryKey: ["departmentBudget", department?._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/budget/company-budget?departmentId=${department._id}`
      );
      const budgets = response.data.allBudgets;
      return Array.isArray(budgets) ? budgets : [];
    },
    enabled: !!department?._id, // <- ✅ prevents firing until department is ready
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
          `/api/budget/request-budget/${department._id}`,
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
            // { field: "department", headerName: "Department", flex: 200 },
            { field: "expanseType", headerName: "Expense Type", flex: 1 },
            { field: "projectedAmount", headerName: "Amount (INR)", flex: 1 },
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

  const navigate = useNavigate();
  // BUDGET NEW END

  return (
    <div className="flex flex-col gap-8 p-4">
      <YearlyGraph
        data={expenseRawSeries}
        options={expenseOptions}
        title={`BIZ Nest ${department?.name} DEPARTMENT EXPENSE`}
        titleAmount={`INR ${inrFormat(totalUtilised)}`}
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

      <AllocatedBudget financialData={financialData} />
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
